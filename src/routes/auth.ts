import { Request, Response, Router } from "express"

const signUp = (req: Request, res: Response) => {
  // TODO: sign up user page
  
  res.status(200).json([{title: 'sign up'}])
  
}

const logIn = async (req: Request, res: Response) => {
  // TODO: log in page
  
  res.status(200).json([{title: 'log in'}])
}

export const authRouter = Router()

authRouter.get('/signup', signUp) //render signup page
authRouter.get('/login', logIn) // render login page
