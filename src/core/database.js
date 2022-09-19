import fs from 'fs/promises'
import { performance } from 'perf_hooks'
import { Parser as SQLParser } from 'node-sql-parser'

import { validatorMap } from '@/core/validators'
import { parseWhereExpression } from '@/core/eval'
import {
  InvalidValueError,
  MissingValueError,
  TableDoesNotExistError,
} from '@/core/errors'
import { exclude } from '@/utils/arrays'
import { enumerate, zip } from '@/utils/iterators'
import { log } from '@/utils/logging'

export class Database {
  constructor({ debug = false, json = false } = {}) {
    this.parser = new SQLParser()
    this.tables = {}
    this.debug = debug
    this.json = json
  }

  /**
   * Executes a given SQL statement.
   *
   * @example
   * const db = new Database()
   *
   * db.execute('SELECT * FROM users;')
   *
   * @param { string } query Query to be executed.
   */
  execute(query) {
    for (const statement of this.parser.astify(query)) {
      if (this.debug) {
        log(statement)
      }

      const start = performance.now()

      switch (statement.type) {
        case 'create':
          this.createTable(statement)
          break
        case 'insert':
          this.insert(statement)
          break
        case 'select':
          this.select(statement)
          break
        case 'update':
          this.update(statement)
          break
        case 'delete':
          this.delete(statement)
          break
        default:
          console.log(`Unsupported statement: '${statement.type}'`)
      }

      const end = performance.now()

      console.log('Query ok. (%sms)', (end - start).toFixed(2))
    }
  }

  delete(statement) {
    const tableName = statement.from[0].table
    const table = this.tables[tableName]

    if (!table) {
      throw new TableDoesNotExistError(
        `Table named "${tableName}" does not exist`
      )
    }

    let fn = () => true

    if (statement.where) {
      fn = parseWhereExpression(statement.where)
    }

    table.records = table.records.filter((record) => !fn(record))
  }

  update(statement) {
    const tableName = statement.table[0].table
    const table = this.tables[tableName]

    if (!table) {
      throw new TableDoesNotExistError(
        `Table named "${tableName}" does not exist`
      )
    }

    let fn = () => true
    if (statement.where) {
      fn = parseWhereExpression(statement.where)
    }

    for (const record of table.records) {
      if (fn(record)) {
        for (const entry of statement.set) {
          record[entry.column] = entry.value.value
        }
      }
    }
  }

  select(statement) {
    const tableName = statement.from[0].table

    if (!this.tables[tableName]) {
      throw new TableDoesNotExistError(
        `Table named "${tableName}" does not exist`
      )
    }

    const table = this.tables[tableName]
    const columns = Array.isArray(statement.columns)
      ? statement.columns.map((column) => column.expr.column)
      : table.keys

    let records = []

    if (statement.where) {
      const whereFunction = parseWhereExpression(statement.where)

      records = table.records.filter((record) => whereFunction(record))
    } else {
      records = table.records
    }

    let limit = null
    let offset = null

    if (statement.limit) {
      const [limitValue, offsetValue] = statement.limit.value

      limit = limitValue.value
      offset = offsetValue?.value ?? 0
    }

    const result = records
      .slice(offset, limit ? offset + limit : undefined)
      .map((record) => {
        const row = {}

        for (const column of columns) {
          row[column] = record[column]
        }

        return row
      })

    if (result.length === 0) {
      return
    }

    if (statement.orderby) {
      const ordering = statement.orderby[0]
      const column = ordering.expr.column
      const direction = ordering.type
      const possibleToSort = ['string', 'number']

      if (!possibleToSort.includes(typeof result[0][column])) {
        throw new Error(
          `Cannot sort by column ${column} because it is not a string or a number`
        )
      }

      if (typeof result[0][column] === 'number') {
        if (direction === 'ASC') {
          result.sort((a, b) => a[column] - b[column])
        }

        if (direction === 'DESC') {
          result.sort((a, b) => b[column] - a[column])
        }
      } else {
        if (direction === 'ASC') {
          result.sort().reverse()
        }

        if (direction === 'DESC') {
          result.sort()
        }
      }
    }

    if (this.json) {
      return log(result)
    }

    console.table(result)
  }

  insert(statement) {
    const tableName = statement.table[0]?.table
    if (!this.tables[tableName]) {
      throw new TableDoesNotExistError(
        `Table named "${tableName}" does not exist`
      )
    }

    if (statement.columns?.length) {
      this.#insertWithColumns(statement)
    } else {
      this.#genericInsert(statement)
    }
  }

  #insertWithColumns(statement) {
    const tableName = statement.table[0].table
    const columns = statement.columns
    const table = this.tables[tableName]

    const items = statement.values.map((insertQuery) => {
      const values = insertQuery.value.map((val) => val.value)

      const record = {}

      for (const [column, value] of zip(columns, values)) {
        const { validator } = table.schema[column]

        if (!validator.validate(value)) {
          throw new InvalidValueError(`Invalid value for field ${column}`)
        }

        record[column] = value
      }

      for (const column of exclude(table.keys, columns)) {
        const schema = table.schema[column]

        if (schema.isPrimary && schema.isAutoIncrement) {
          record[column] = schema.autoIncrementValue++
          continue
        }

        if (schema.hasDefaultValue) {
          record[column] = schema.defaultValue
          continue
        }

        if (schema.allowNull) {
          record[column] = null
          continue
        }

        throw new MissingValueError(`Missing value for field ${column}`)
      }

      return record
    })

    table.records = table.records.concat(items)
  }

  #genericInsert(statement) {
    const tableName = statement.table[0].table

    const items = statement.values.map((insertQuery) => {
      const values = insertQuery.value.map((val) => val.value)

      const table = this.tables[tableName]
      const record = {}

      for (const [index, key] of enumerate(table.keys)) {
        const schema = table.schema[key]
        const column = table.keys[index]
        const value = values[index]
        const { validator } = schema

        if (!validator.validate(value)) {
          if (schema.isPrimary && schema.isAutoIncrement) {
            record[column] = schema.autoIncrementValue++
            continue
          }

          if (schema.hasDefaultValue) {
            record[column] = schema.defaultValue
            continue
          }

          if (schema.allowNull) {
            record[column] = null
            continue
          }

          throw new InvalidValueError(`Invalid value for field ${column}`)
        }

        record[column] = value
      }

      return record
    })

    table.records = table.records.concat(items)
  }

  createTable(statement) {
    const [table] = statement.table
    const schema = {}
    const keys = []

    for (const column of statement.create_definitions) {
      const name = column.column.column
      const type = column.definition.dataType
      const isPrimary = column.unique_or_primary === 'primary key'
      const isUnique = column.unique_or_primary === 'unique'
      const isAutoIncrement = !!column.auto_increment
      const hasDefaultValue = !!column.default_val
      const defaultValue = column.default_val?.value?.value ?? null
      const allowNull = column.nullable?.value !== 'not null'

      keys.push(name)
      schema[name] = {
        autoIncrementValue: isAutoIncrement ? 1 : null,
        name,
        type,
        isPrimary,
        isUnique,
        allowNull,
        isAutoIncrement,
        hasDefaultValue,
        defaultValue,
        validator: new validatorMap[type](),
      }
    }

    this.tables[table.table] = {
      keys,
      schema,
      records: [],
    }
  }

  async dump(filename) {
    return await fs.writeFile(filename, JSON.stringify(this))
  }

  async load(filename) {
    const data = await fs.readFile(filename)

    Object.assign(this, JSON.parse(data))

    this.parser = new SQLParser()

    for (const key in this.tables) {
      const table = this.tables[key]
      const schema = table.schema

      for (const column in schema) {
        const columnSchema = schema[column]

        columnSchema.validator = new validatorMap[columnSchema.type]()
      }
    }
  }
}
