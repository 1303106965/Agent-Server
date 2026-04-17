export const aiTools = [
  {
    type: 'function' as const,
    function: {
      name: 'sqlite_query',
      description: '查询数据库',
      parameters: {
        type: 'object',
        properties: {
          sql: { type: 'string' }
        },
        required: ['sql']
      }
    }
  }
]