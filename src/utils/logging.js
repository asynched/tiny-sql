/**
 * Logs the JSON serialized version of the given object to the console.
 *
 * @example
 *
 * const a = { foo: 'bar' };
 *
 * log(a); // "{"foo":"bar"}"
 *
 * @template T Type of the object to log
 * @param { T } source Object to log.
 */
export function log(source) {
  console.log(JSON.stringify(source, null, 2))
}
