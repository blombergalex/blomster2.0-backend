import { Request, Response, Router } from "express"

const getPosts = async (req: Request, res: Response) => {
  // TODO: get posts from database
  
  res.status(200).json([{title: 'post one'}, {title: 'post two'}])
}

const getPost = async (req: Request, res: Response) => {
  const {id} = req.params
  //TODO: get post from database by id

  res.status(200).json({title: 'single post by id', id})
}

const createPost = async (req: Request, res: Response) => {
  // TODO: post post to database

  res.status(200).json([{title: 'create post'}])
}

export const postRouter = Router()

postRouter.get('/posts', getPosts) // show all posts
postRouter.get('/posts/:id', getPost) // get post by id
postRouter.get('/create', createPost) // render create post page
postRouter.get('/posts/:id/edit', getPost) // get post by id for edit page, put method from frontend?
