/**
 * Ported from dubai-health-ui (packages/components/src/internal/qr.ts).
 *
 * Minimal QR Code encoder (ISO/IEC 18004): byte mode (UTF-8), versions 1–40, error correction
 * L/M/Q/H, automatic mask selection. Structure follows Project Nayuki's reference
 * implementation (MIT). No dependencies.
 */

export type DahcQrEcl = 'L' | 'M' | 'Q' | 'H';

const ECL_INDEX: Record<DahcQrEcl, number> = { L: 0, M: 1, Q: 2, H: 3 };
const FORMAT_BITS: Record<DahcQrEcl, number> = { L: 1, M: 0, Q: 3, H: 2 };

// prettier-ignore
const ECC_CODEWORDS_PER_BLOCK = [
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
];
// prettier-ignore
const NUM_ERROR_CORRECTION_BLOCKS = [
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
];

const table = (t: number[][], ecl: DahcQrEcl, ver: number): number => t[ECL_INDEX[ecl]]?.[ver] ?? 0;
const bit = (x: number, i: number): boolean => ((x >>> i) & 1) !== 0;

function rawDataModules(ver: number): number {
  let result = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const numAlign = Math.floor(ver / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (ver >= 7) result -= 36;
  }
  return result;
}

const dataCodewords = (ver: number, ecl: DahcQrEcl) =>
  Math.floor(rawDataModules(ver) / 8) -
  table(ECC_CODEWORDS_PER_BLOCK, ecl, ver) * table(NUM_ERROR_CORRECTION_BLOCKS, ecl, ver);

function gfMul(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}

function rsDivisor(degree: number): number[] {
  const result: number[] = new Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = gfMul(result[j] ?? 0, root);
      if (j + 1 < result.length) result[j] = (result[j] ?? 0) ^ (result[j + 1] ?? 0);
    }
    root = gfMul(root, 0x02);
  }
  return result;
}

function rsRemainder(data: number[], divisor: number[]): number[] {
  const result: number[] = divisor.map(() => 0);
  for (const b of data) {
    const factor = b ^ (result.shift() ?? 0);
    result.push(0);
    divisor.forEach((coef, i) => (result[i] = (result[i] ?? 0) ^ gfMul(coef, factor)));
  }
  return result;
}

function addEccAndInterleave(data: number[], ver: number, ecl: DahcQrEcl): number[] {
  const numBlocks = table(NUM_ERROR_CORRECTION_BLOCKS, ecl, ver);
  const blockEccLen = table(ECC_CODEWORDS_PER_BLOCK, ecl, ver);
  const rawCodewords = Math.floor(rawDataModules(ver) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);
  const divisor = rsDivisor(blockEccLen);
  const blocks: number[][] = [];
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
    k += dat.length;
    const ecc = rsRemainder(dat, divisor);
    if (i < numShortBlocks) dat.push(0);
    blocks.push(dat.concat(ecc));
  }
  const result: number[] = [];
  const width = blocks[0]?.length ?? 0;
  for (let i = 0; i < width; i++)
    blocks.forEach((block, j) => {
      if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) result.push(block[i] ?? 0);
    });
  return result;
}

class Matrix {
  readonly ver: number;
  readonly size: number;
  readonly modules: boolean[][];
  readonly fn: boolean[][];

  constructor(ver: number) {
    this.ver = ver;
    this.size = ver * 4 + 17;
    this.modules = Array.from({ length: this.size }, () =>
      new Array<boolean>(this.size).fill(false),
    );
    this.fn = Array.from({ length: this.size }, () => new Array<boolean>(this.size).fill(false));
  }

  get(x: number, y: number): boolean {
    return this.modules[y]?.[x] ?? false;
  }

  setFn(x: number, y: number, dark: boolean): void {
    const row = this.modules[y];
    const fnRow = this.fn[y];
    if (!row || !fnRow) return;
    row[x] = dark;
    fnRow[x] = true;
  }

  alignmentPositions(): number[] {
    if (this.ver === 1) return [];
    const numAlign = Math.floor(this.ver / 7) + 2;
    const step = Math.floor((this.ver * 8 + numAlign * 3 + 5) / (numAlign * 4 - 4)) * 2;
    const result = [6];
    for (let pos = this.size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
    return result;
  }

  drawFunctionPatterns(ecl: DahcQrEcl): void {
    for (let i = 0; i < this.size; i++) {
      this.setFn(6, i, i % 2 === 0);
      this.setFn(i, 6, i % 2 === 0);
    }
    const finder = (x: number, y: number) => {
      for (let dy = -4; dy <= 4; dy++)
        for (let dx = -4; dx <= 4; dx++) {
          const dist = Math.max(Math.abs(dx), Math.abs(dy));
          const xx = x + dx;
          const yy = y + dy;
          if (xx >= 0 && xx < this.size && yy >= 0 && yy < this.size)
            this.setFn(xx, yy, dist !== 2 && dist !== 4);
        }
    };
    finder(3, 3);
    finder(this.size - 4, 3);
    finder(3, this.size - 4);
    const pos = this.alignmentPositions();
    const n = pos.length;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue;
        const cx = pos[i] ?? 0;
        const cy = pos[j] ?? 0;
        for (let dy = -2; dy <= 2; dy++)
          for (let dx = -2; dx <= 2; dx++)
            this.setFn(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    this.drawFormatBits(ecl, 0);
    this.drawVersion();
  }

  drawFormatBits(ecl: DahcQrEcl, mask: number): void {
    const data = (FORMAT_BITS[ecl] << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;
    for (let i = 0; i <= 5; i++) this.setFn(8, i, bit(bits, i));
    this.setFn(8, 7, bit(bits, 6));
    this.setFn(8, 8, bit(bits, 7));
    this.setFn(7, 8, bit(bits, 8));
    for (let i = 9; i < 15; i++) this.setFn(14 - i, 8, bit(bits, i));
    for (let i = 0; i < 8; i++) this.setFn(this.size - 1 - i, 8, bit(bits, i));
    for (let i = 8; i < 15; i++) this.setFn(8, this.size - 15 + i, bit(bits, i));
    this.setFn(8, this.size - 8, true);
  }

  drawVersion(): void {
    if (this.ver < 7) return;
    let rem = this.ver;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (this.ver << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const b = bit(bits, i);
      const a = this.size - 11 + (i % 3);
      const c = Math.floor(i / 3);
      this.setFn(a, c, b);
      this.setFn(c, a, b);
    }
  }

  drawCodewords(data: number[]): void {
    let i = 0;
    for (let right = this.size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < this.size; vert++)
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? this.size - 1 - vert : vert;
          const row = this.modules[y];
          if (row && !this.fn[y]?.[x] && i < data.length * 8) {
            row[x] = bit(data[i >>> 3] ?? 0, 7 - (i & 7));
            i++;
          }
        }
    }
  }

  applyMask(mask: number): void {
    for (let y = 0; y < this.size; y++)
      for (let x = 0; x < this.size; x++) {
        let invert: boolean;
        switch (mask) {
          case 0: invert = (x + y) % 2 === 0; break; // prettier-ignore
          case 1: invert = y % 2 === 0; break; // prettier-ignore
          case 2: invert = x % 3 === 0; break; // prettier-ignore
          case 3: invert = (x + y) % 3 === 0; break; // prettier-ignore
          case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break; // prettier-ignore
          case 5: invert = ((x * y) % 2) + ((x * y) % 3) === 0; break; // prettier-ignore
          case 6: invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break; // prettier-ignore
          default: invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0; // prettier-ignore
        }
        const row = this.modules[y];
        if (row && invert && !this.fn[y]?.[x]) row[x] = !row[x];
      }
  }

  /** ISO penalty rules N1–N4 (lower is better). */
  penalty(): number {
    const n = this.size;
    let score = 0;
    const line = (get: (i: number, j: number) => boolean) => {
      for (let i = 0; i < n; i++) {
        let run = 1;
        for (let j = 1; j <= n; j++) {
          if (j < n && get(i, j) === get(i, j - 1)) run++;
          else {
            if (run >= 5) score += 3 + (run - 5);
            run = 1;
          }
        }
        // N3: 1:1:3:1:1 finder-like pattern with 4 light modules on one side.
        for (let j = 0; j + 10 < n + 4; j++) {
          const at = (k: number) => (k >= 0 && k < n ? get(i, k) : false);
          const core =
            at(j + 4) &&
            !at(j + 5) &&
            at(j + 6) &&
            at(j + 7) &&
            at(j + 8) &&
            !at(j + 9) &&
            at(j + 10);
          if (!core) continue;
          const before = !at(j) && !at(j + 1) && !at(j + 2) && !at(j + 3);
          const after = !at(j + 11) && !at(j + 12) && !at(j + 13) && !at(j + 14);
          if (before || after) score += 40;
        }
      }
    };
    line((i, j) => this.get(j, i));
    line((i, j) => this.get(i, j));
    for (let y = 0; y < n - 1; y++)
      for (let x = 0; x < n - 1; x++) {
        const c = this.get(x, y);
        if (c === this.get(x + 1, y) && c === this.get(x, y + 1) && c === this.get(x + 1, y + 1))
          score += 3;
      }
    let dark = 0;
    for (const row of this.modules) for (const m of row) if (m) dark++;
    const k = Math.ceil(Math.abs(dark * 20 - n * n * 10) / (n * n)) - 1;
    score += Math.max(0, k) * 10;
    return score;
  }
}

/** Encodes text as a QR matrix (`true` = dark), without the quiet zone. */
export function dahcEncodeQr(text: string, ecl: DahcQrEcl = 'M'): boolean[][] {
  const bytes = [...new TextEncoder().encode(text)];
  let ver = 0;
  for (let v = 1; v <= 40; v++) {
    const countBits = v <= 9 ? 8 : 16;
    if (4 + countBits + bytes.length * 8 <= dataCodewords(v, ecl) * 8) {
      ver = v;
      break;
    }
  }
  if (!ver) throw new RangeError('Text too long for a QR code');

  const bits: number[] = [];
  const push = (value: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };
  push(0b0100, 4);
  push(bytes.length, ver <= 9 ? 8 : 16);
  bytes.forEach((b) => push(b, 8));
  const capacity = dataCodewords(ver, ecl) * 8;
  push(0, Math.min(4, capacity - bits.length));
  push(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) push(pad, 8);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8)
    data.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));

  const m = new Matrix(ver);
  m.drawFunctionPatterns(ecl);
  m.drawCodewords(addEccAndInterleave(data, ver, ecl));
  let best = 0;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    m.applyMask(mask);
    m.drawFormatBits(ecl, mask);
    const score = m.penalty();
    if (score < bestScore) {
      best = mask;
      bestScore = score;
    }
    m.applyMask(mask); // undo (XOR)
  }
  m.applyMask(best);
  m.drawFormatBits(ecl, best);
  return m.modules;
}
