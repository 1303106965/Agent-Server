import { Tool } from '../types'
import { db } from '../db/sqlite'

export const sqliteTool: Tool = {
  name: 'sqlite_query',

  run: async ({ sql }) => {
    try {
      return db.prepare(sql).all()
    } catch (e) {
      return { error: String(e) }
    }
  }
}