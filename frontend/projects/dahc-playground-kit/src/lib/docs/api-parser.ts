/** One input, model or output of a component or directive. */
export interface ApiMember {
  readonly name: string;
  readonly kind: 'input' | 'model' | 'output';
  readonly type: string;
  readonly defaultValue: string;
  readonly required: boolean;
  readonly description: string;
}

/** The public API of one component or directive class in a source file. */
export interface ComponentApi {
  readonly className: string;
  readonly selector: string;
  readonly description: string;
  readonly inputs: readonly ApiMember[];
  readonly outputs: readonly ApiMember[];
}

const SIGNAL_API = /readonly\s+(\w+)\s*=\s*(input|model|output)\b/g;

/**
 * Reads the signal-based API (input(), input.required(), model(), output()) of every @Component or
 * @Directive class in an Angular source file, with the doc comment above each member. A light
 * scanner, not a TypeScript parser: it relies on the DAHC-UI conventions (one member per
 * declaration, `readonly name = input<Type>(default)`).
 */
export function parseComponentApi(source: string): readonly ComponentApi[] {
  const classes: ComponentApi[] = [];
  // Matches @Component({ … }), @Directive({ … }) and a bare @Directive() (abstract bases such as DahcFormControl).
  const decorator = /@(Component|Directive)\((?:\{([\s\S]*?)\})?\)\s*export\s+(?:abstract\s+)?class\s+(\w+)/g;
  let match: RegExpExecArray | null;

  while ((match = decorator.exec(source)) !== null) {
    const selector = /selector:\s*'([^']+)'/.exec(match[2] ?? '')?.[1] ?? '';
    const className = match[3] ?? '';
    const classStart = match.index + match[0].length;
    const next = source.slice(classStart).search(/@(Component|Directive)\(/);
    const body = next === -1 ? source.slice(classStart) : source.slice(classStart, classStart + next);
    const members = parseMembers(body);

    classes.push({
      className,
      selector,
      description: docBefore(source, match.index),
      inputs: members.filter(member => member.kind !== 'output'),
      outputs: members.filter(member => member.kind === 'output'),
    });
  }

  return classes;
}

function parseMembers(body: string): ApiMember[] {
  const members: ApiMember[] = [];
  let match: RegExpExecArray | null;
  SIGNAL_API.lastIndex = 0;

  while ((match = SIGNAL_API.exec(body)) !== null) {
    const name = match[1] ?? '';
    const kind = match[2] as ApiMember['kind'];
    let index = match.index + match[0].length;
    let required = false;

    if (body.startsWith('.required', index)) {
      required = true;
      index += '.required'.length;
    }

    let type = '';

    if (body[index] === '<') {
      const end = matching(body, index, '<', '>');
      type = body.slice(index + 1, end).replace(/\s+/g, ' ').trim();
      index = end + 1;
    }

    if (body[index] !== '(') {
      continue;
    }

    const close = matching(body, index, '(', ')');
    const args = splitTopLevel(body.slice(index + 1, close));
    const alias = /alias:\s*'([^']+)'/.exec(args.slice(required ? 0 : 1).join(','))?.[1];
    const defaultValue = kind === 'output' || required ? '' : readableDefault(args[0] ?? '');

    members.push({
      name: alias ?? name,
      kind,
      type: type || (kind === 'output' ? 'void' : inferType(defaultValue)),
      defaultValue,
      required,
      description: docBefore(body, match.index),
    });
    SIGNAL_API.lastIndex = close;
  }

  return members;
}

/** The text of the JSDoc block directly above a position, flattened to one paragraph. */
function docBefore(text: string, position: number): string {
  const before = text.slice(0, position).replace(/\s+$/, '');

  if (!before.endsWith('*/')) {
    return '';
  }

  const start = before.lastIndexOf('/**');

  if (start === -1) {
    return '';
  }

  return before
    .slice(start + 3, -2)
    .split('\n')
    .map(line => line.replace(/^\s*\*\s?/, '').trim())
    .filter(line => line !== '')
    .join(' ');
}

/** Index of the bracket that closes the one at `start` (quotes skipped; the ">" of "=>" ignored). */
function matching(text: string, start: number, open: string, close: string): number {
  let depth = 0;
  let quote = '';

  for (let index = start; index < text.length; index++) {
    const character = text[index] ?? '';

    if (quote !== '') {
      if (character === '\\') {
        index++;
      } else if (character === quote) {
        quote = '';
      }
    } else if (character === "'" || character === '"' || character === '`') {
      quote = character;
    } else if (character === open) {
      depth++;
    } else if (character === close && !(close === '>' && text[index - 1] === '=')) {
      depth--;

      if (depth === 0) {
        return index;
      }
    }
  }

  return text.length;
}

function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote = '';
  let current = '';

  for (let index = 0; index < text.length; index++) {
    const character = text[index] ?? '';

    if (quote !== '') {
      current += character;

      if (character === '\\') {
        current += text[++index] ?? '';
      } else if (character === quote) {
        quote = '';
      }

      continue;
    }

    if (character === "'" || character === '"' || character === '`') {
      quote = character;
    } else if ('([{<'.includes(character)) {
      depth++;
    } else if (')]}>'.includes(character) && !(character === '>' && text[index - 1] === '=')) {
      depth--;
    } else if (character === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }

    current += character;
  }

  if (current.trim() !== '') {
    parts.push(current.trim());
  }

  return parts;
}

/** $localize`:@@id:Text` defaults show their English text. */
function readableDefault(value: string): string {
  const localized = /^\$localize`(?::[^:]*:)?([\s\S]*)`$/.exec(value);

  if (localized) {
    return `'${(localized[1] ?? '').replace(/\$\{[^}]*\}/g, '…')}'`;
  }

  return value.replace(/\s+/g, ' ');
}

function inferType(defaultValue: string): string {
  if (/^['`"]/.test(defaultValue)) {
    return 'string';
  }

  if (defaultValue === 'true' || defaultValue === 'false') {
    return 'boolean';
  }

  return /^-?\d/.test(defaultValue) ? 'number' : '';
}
