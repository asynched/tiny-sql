/**
 * A helper function to iterate over many collections.
 *
 * @example
 *
 * const a = [1, 2, 3, 4, 5];
 * const b = [2, 4];
 *
 * for (const [valueA, valueB] of zip(a, b)) {
 *   console.log(valueA, valueB);
 * }
 *
 * @param  {...unknown} iterables
 * @returns { unknown[] } An array of the current values of each iterable.
 */
export function* zip(...iterables) {
  const min = Math.min(...iterables.map((i) => i.length))

  for (let i = 0; i < min; i++) {
    yield iterables.map((iterable) => iterable[i])
  }
}

/**
 * Helper function to enumerate over an iterable.
 *
 * @example
 *
 * const a = [1, 2, 3, 4, 5];
 *
 * for (const [index, value] of enumerate(a)) {
 *   console.log(index, value);
 * }
 *
 * @template T Type of the array
 * @param { T[] } source Source array to enumerate over.
 * @returns { Generator<[number, T]> } An array containing the index and the value.
 */
export function* enumerate(source) {
  let i = 0

  for (const item of source) {
    yield [i++, item]
  }
}
