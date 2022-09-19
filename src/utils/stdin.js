import rl from 'readline'

/**
 * Helper function to read from stdin.
 *
 * @example
 * const name = await read('What is your name?');
 *
 * @param { string } message Message to display to the user.
 * @returns { Promise<string> } Returns the user input.
 */
export function input(message) {
  const rlInterface = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rlInterface.question(message, (line) => {
      resolve(line)
      rlInterface.close()
    })
  })
}
