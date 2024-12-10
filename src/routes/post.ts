import { Request, Response, Router } from "express"
import { Post } from "../models/post"
import { authenticate } from "../middlewares/authenticate"

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
  try {
    const {title, content} = req.body

    if (!title || typeof title !== 'string') {
      res.status(400).json({message: 'Malformed title'})
    }

    if (content !== undefined && typeof content !== 'string') {
      res.status(400).json({message: 'Malformed content'})
    }

    const post = await Post.create({
      title,
      content,
      author: req.userId
    })

    res.status(201).json({ id: post._id })

  } catch (error) {
    console.error(error)
    res.status(500).send()
  }

}

export const postRouter = Router()

postRouter.get('/posts', getPosts) // show all posts
postRouter.get('/posts/:id', getPost) // get post by id
postRouter.post('/posts', authenticate, createPost)

postRouter.get('/create', createPost) // render create post page
postRouter.get('/posts/:id/edit', getPost) // get post by id for edit page, put method from frontend?
