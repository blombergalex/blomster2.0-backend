import express from 'express'
import { postRouter } from './routes/post'
import mongoose from 'mongoose'
import 'dotenv/config'

const app = express()

app.use(postRouter)

mongoose.connect(process.env.DB_URL!).then(() => {
  const port = process.env.PORT || '8080'
  app.listen(port, () => {
    console.log(`listening on http://localhost:${port}/`)
  }) 
})



