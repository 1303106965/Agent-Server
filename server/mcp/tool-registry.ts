export const tools = [
  {
    name: "execute_sql",

    description: "执行SQL",

    inputSchema: {
      type: "object",

      properties: {
        sql: {
          type: "string",
        },
      },
    },

    handler: executeSQL,
  },
];
