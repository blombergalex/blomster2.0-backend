import { Request, Response, Router } from 'express'
import { ObjectId, isValidObjectId } from 'mongoose'
import { Post } from '../models/post'
import { authenticate } from '../middlewares/authenticate'

type AuthorWithUsername = {
  _id: ObjectId
  username: string
}

const getPosts = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit?.toString() || '10')
    const page = parseInt(req.query.page?.toString() || '1')

    if (isNaN(page) || isNaN(limit)) {
      res.status(400).json({
        message: 'Limit and page has to be valid numbers',
      })
      return
    }

    const posts = await Post.find()
      .populate('author', 'username')
      .skip(limit * (page - 1))
      .limit(limit)

    const responsePosts = posts.map((post) => {
      const author = post.author as unknown as AuthorWithUsername

      return {
        id: post._id,
        title: post.title,
        content: post.content,
        author: {
          username: author.username,
        },
      }
    })

    const totalCount = await Post.countDocuments()
    const totalPages = Math.ceil(totalCount / limit)

    res.status(200).json({
      posts: responsePosts,
      nextPage: page + 1 <= totalPages ? page + 1 : null,
    })
  } catch (error) {
    console.error(error)
    res.status(500).send()
  }
}

const getPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid post id' })
      return
    }

    const post = await Post.findById(id).populate('author', 'username')

    if (!post) {
      res.status(404).json({ message: 'Post not found' })
      return
    }

    const author = post.author as unknown as AuthorWithUsername

    res.status(200).json({
      id: post._id,
      title: post.title,
      content: post.content,
      author: {
        id: author._id,
        username: author.username,
      },
      comments: post.comments,
    })
  } catch (error) {
    console.error(error)
    res.status(500).send()
  }
}

const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body

    if (!title || typeof title !== 'string') {
      res.status(400).json({ message: 'Malformed title' })
      return
    }

    if (content !== undefined && typeof content !== 'string') {
      res.status(400).json({ message: 'Malformed content' })
      return
    }

    const post = await Post.create({
      title,
      content,
      author: req.userId, // vi har tillgång till userId genom authenticate middleware
    })

    res.status(201).json({ id: post._id })
  } catch (error) {
    console.error(error)
    res.status(500).send()
  }
}

const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid post id' })
      return
    }

    const post = await Post.findById(id)

    if (!post) {
      res.status(404).json({ message: 'Post not found' })
      return
    }

    if (post.author.toString() !== req.userId) {
      res
        .status(403)
        .json({ message: 'You are not allowed to delete this post' })
      return
    }

    await post.deleteOne()
    res.status(200).json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).send
  }
}

const editPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid post id' })
      return
    }

    const post = await Post.findById(id)

    if (!post) {
      res.status(404).json({ message: 'Post not found' })
      return
    }

    if (post.author.toString() !== req.userId) {
      res.status(403).json({ message: 'You are not allowed to edit this post' })
      return
    }

    const { title, content } = req.body

    if (title !== undefined && typeof title !== 'string') {
      res.status(400).json({ message: 'Malformed title' })
    }

    if (content !== undefined && typeof content !== 'string') {
      res.status(400).json({ message: 'Malformed content' })
    }

    await post.updateOne({
      title,
      content,
    })
    res.status(200).json({ message: 'Post updated successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).send
  }
}

const createComment = async (req: Request, res: Response) => {
  try {
    const { content } = req.body

    if (!content || typeof content !== 'string') {
      res.status(400).json({ message: 'Malformed comment content' })
    }

    if (!isValidObjectId(req.body.post_id)) {
      res.status(400).json({ message: 'Invalid post id' })
      return
    }

    const post = await Post.findById(req.body.post_id)

    if (!post) {
      res.status(404).json({ message: 'Post not found' })
      return
    }

    post.comments.push({
      content,
      author: req.userId,
    })
    await post.save()

    console.log('Comment created successfully')

    const newComment = post.comments[post.comments.length - 1]
    console.log('New Comment ID:', newComment._id)

    res.status(201).json({ id: newComment._id })
  } catch (error) {
    console.error('Unexpected error in createComment:', error)
    res.status(500).send
  }
}

const deleteComment = async (req: Request, res: Response) => {
  try {
    if (!isValidObjectId(req.params.commentId)) {
      res.status(400).json({ message: 'Invalid comment id' })
      return
    }

    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: 'Invalid post id' })
      return
    }

    const post = await Post.findById(req.params.id)

    if (!post) {
      res.status(404).json({ message: 'Post not found' })
      return
    }

    const comment = await post.comments.id(req.params.commentId)

    console.log('comment findById: ', comment)
    console.log('PostAuthorId: ', post.author.toString())

    if (!comment) {
      res.status(404).json({ message: 'Comment not found' })
      return
    }

    if (
      comment.author.toString() !== req.userId &&
      post.author.toString() !== req.userId
    ) {
      res
        .status(403)
        .json({ message: 'You are not allowed to delete this comment' })
      return
    }

    await comment.deleteOne()
    await post.save()
    res.status(200).json({ message: 'Comment deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).send
  }
}

export const postRouter = Router()

postRouter.get('/posts', getPosts)
postRouter.get('/posts/:id', getPost)
postRouter.post('/post/:id', authenticate, createComment)
postRouter.post('/posts', authenticate, createPost)
postRouter.delete('/posts/:id', authenticate, deletePost)
postRouter.delete('/post/:id/:commentId', authenticate, deleteComment)
postRouter.put('/posts/:id', authenticate, editPost)
