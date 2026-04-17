import express from 'express'
import { runAgent } from './agent/agent'

const app = express()
app.use(express.json())

app.post('/chat', async (req, res) => {
  const { message } = req.body

  const result = await runAgent(message)

  res.json(result)
})

app.listen(3000, () => {
  console.log('http://localhost:3000')
})