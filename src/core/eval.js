// TODO: Fix node typing

/**
 * Function to evaluate a where expression to a function for record evaluation
 * at runtime.
 *
 * @example
 *
 * const parser = new SQLParser()
 * const statement = parser.parse('SELECT * FROM table WHERE a = 1')
 * const where = statement.where
 *
 * const evalFn = parseWhereExpression(where)
 *
 * console.log(evalFn({ a: 1 })) // True
 *
 * @param { object } node
 * @returns { (record: T) => boolean } A function to evaluate whether a record
 * matches a given where clause.
 */
export function parseWhereExpression(node) {
  switch (node.operator) {
    case '=':
      return (record) => record[node.left.column] === node.right.value
    case '>':
      return (record) => record[node.left.column] > node.right.value
    case '<':
      return (record) => record[node.left.column] < node.right.value
    case '>=':
      return (record) => record[node.left.column] >= node.right.value
    case '<=':
      return (record) => record[node.left.column] <= node.right.value
    case 'AND':
      return (record) =>
        parseWhereExpression(node.left)(record) &&
        parseWhereExpression(node.right)(record)
    case 'OR':
      return (record) =>
        parseWhereExpression(node.left)(record) ||
        parseWhereExpression(node.right)(record)
    case 'BETWEEN':
      return (record) => {
        if (typeof record[node.left.column] !== 'number') {
          throw new Error('BETWEEN operator can only be used with numbers')
        }

        return (
          record[node.left.column] >= node.right.value[0].value &&
          record[node.left.column] <= node.right.value[1].value
        )
      }
    default:
      throw new Error(`Unknown operator "${node.operator}"`)
  }
}
