import { parseArgs } from 'util'
import { Database } from '@/core/database'
import { DatabaseError } from '@/core/errors'

import { input } from '@/utils/stdin'
import { log } from '@/utils/logging'

const args = parseArgs({
  options: {
    file: {
      type: 'string',
      alias: 'f',
    },
    debug: {
      type: 'boolean',
      short: 'd',
    },
    json: {
      type: 'boolean',
      short: 'j',
    },
  },
})

const debug = args.values.debug
const json = args.values.json

const main = async () => {
  const database = new Database({
    debug,
    json,
  })

  if (args.values.file) {
    await database.load(args.values.file)
  }

  while (true) {
    const query = await input('tiny-sql?> ')

    if (query === '.clear') {
      process.stdout.write('\x1Bc')
      continue
    }

    if (query === '.exit') {
      process.exit(0)
    }

    if (query === '.debug') {
      log(database)
      continue
    }

    if (query === '.dump') {
      database.dump('.db_data.json')
      continue
    }

    if (query === '.load') {
      await database.load('.db_data.json')
      continue
    }

    if (query === '.tables') {
      for (const table of Object.keys(database.tables)) {
        console.log(table)
      }

      continue
    }

    if (query === '.help') {
      console.log('Commands:')
      console.log('\t.clear\t\tClear the screen')
      console.log('\t.exit\t\tExit the program')
      console.log('\t.debug\t\tPrint the database')
      console.log('\t.tables\t\tList all tables')
      console.log('\t.dump\t\tDump the database to a file')
      console.log('\t.load\t\tLoad the database from a file')
      continue
    }

    if (query.length === 0) {
      console.log('Empty query, skipping command.')
      continue
    }

    try {
      database.execute(query)
    } catch (err) {
      if (err instanceof DatabaseError) {
        console.log('Error:', err.message)
        continue
      }

      console.log('Parsing error:', err.message)

      if (debug) {
        console.error(err)
      }
    }
  }
}

main()
