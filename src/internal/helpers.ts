export function log2floor(i: number): number {
  let result = -1, step = 16, v = i;
  while (step > 0) {
    const next = v >>> step;
    if (next !== 0) result += step, v = next;
    step = step >> 1;
  }
  return result + v;
}

export function min(a: number, b: number): number {
  return a < b ? a : b;
}
