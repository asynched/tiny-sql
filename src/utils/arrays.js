/**
 * Get the difference between two arrays
 *
 * @example
 *
 * const a = [1, 2, 3, 4, 5];
 * const b = [2, 4];
 *
 * const difference = exclude(a, b);
 *
 * console.log(difference); // [1, 3, 5]
 *
 * @template T Array type
 * @param { T[] } source Source array to exclude the items from
 * @param { T[] } target Target array to exclude the items from.
 * @returns { T[] } An array containing only the difference between the two
 * items.
 */
export function exclude(source, target) {
  return source.filter((item) => !target.includes(item))
}
