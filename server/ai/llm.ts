import OpenAI from 'openai'

export const client = new OpenAI({
  apiKey: 'sk-3bfffbd0b70b4eaea5ce4e3e26cbc2b3',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
})