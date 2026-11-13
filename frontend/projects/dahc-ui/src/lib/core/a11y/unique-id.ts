let nextId = 0;

/** Returns a document-unique id, used to link labels, descriptions and errors to their controls. */
export function dahcUniqueId(prefix: string): string {
  nextId += 1;

  return `${prefix}-${nextId}`;
}
