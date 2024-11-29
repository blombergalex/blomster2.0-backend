import express from 'express'
import { postRouter } from './routes/post'
import { authRouter } from './routes/auth'
import { userRouter } from './routes/users'
import mongoose from 'mongoose'
import 'dotenv/config'

const app = express()
app.use(express.json())

app.use(postRouter)
app.use(authRouter)
app.use(userRouter)

mongoose.connect(process.env.DB_URL!).then(() => {
  const port = process.env.PORT || '8080'
  app.listen(port, () => {
    console.log(`listening on http://localhost:${port}/`)
  }) 
})



