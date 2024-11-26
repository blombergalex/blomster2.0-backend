import { Request, Response, Router } from "express"

const getPosts = async (req: Request, res: Response) => {
  // TODO: get posts from database
  
  res.status(200).json([{title: 'hello world'}, {title: 'hello again'}])
}

const getPost = async (req: Request, res: Response) => {
  const {id} = req.params

  //TODO: get post from database by id

  res.status(200).json({title: 'hello world', id})
}

export const postRouter = Router()

postRouter.get('/posts', getPosts)
postRouter.get('/posts/:id', getPost)