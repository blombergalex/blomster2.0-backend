import { Request, response, Response, Router } from "express";
import { ObjectId, isValidObjectId } from "mongoose";
import { Post, Comment } from "../models/post";
import { authenticate } from "../middlewares/authenticate";

type AuthorWithUsername = {
  _id: ObjectId;
  username: string;
};

const getPosts = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit?.toString() || "10");
    const page = parseInt(req.query.page?.toString() || "1");

    if (isNaN(page) || isNaN(limit)) {
      res.status(400).json({
        message: "Limit and page has to be valid numbers",
      });
      return;
    }

    // const posts = await Post.find()
    //   .populate("author", "username")
    //   .skip(limit * (page - 1))
    //   .limit(limit);

    const posts = await Post.aggregate([
      {
        $addFields: {
          sortValue: {
            $divide: [
              // value 1: score
              // add 1 to view 0 as positive score
              {
                $add: ["$score", 1],
              },
              // value 2: age
              {
                $pow: [
                  {
                    $add: [
                      {
                        $divide: [
                          { $subtract: [new Date(), "$createdAt"] },
                          1000 * 60 * 60, // convert age to hours
                        ],
                      },
                      // add 1 to avoid division with 0
                      1,
                    ],
                  },
                  // recency weight
                  // the higher the number, the faster old posts will loose ranking
                  1.5,
                ],
              },
            ],
          },
        },
      },
      // sort in descending order by sort value
      { $sort: {sortValue: -1}},
      { $skip: limit * (page - 1) },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                username: 1,
              },
            },
          ],
          as: "author",
        },
      },
      { $unwind: "$author" },
    ]);

    console.log(posts.map((post) => post.sortValue))

    const responsePosts = posts.map((post) => {
      const author = post.author as unknown as AuthorWithUsername;

      return {
        id: post._id,
        title: post.title,
        content: post.content, // om jag vill visa content på startsidan
        author: {
          username: author.username,
        },
        score: post.score,
        upvotes: post.upvotes,
        downvotes: post.downvotes,
      };
    });

    const totalCount = await Post.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      posts: responsePosts,
      nextPage: page + 1 <= totalPages ? page + 1 : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
};

const getPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid post id" });
      return;
    }

    const post = await Post.findById(id).populate("author", "username");

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    //kommer säkert dyka upp fler fel att hantera

    const author = post.author as unknown as AuthorWithUsername;

    res.status(200).json({
      id: post._id,
      title: post.title,
      content: post.content,
      author: {
        id: author._id,
        username: author.username,
      },
      comments: post.comments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
};

const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;

    if (!title || typeof title !== "string") {
      res.status(400).json({ message: "Malformed title" });
      return;
    }

    if (content !== undefined && typeof content !== "string") {
      res.status(400).json({ message: "Malformed content" });
      return;
    }

    const post = await Post.create({
      title,
      content,
      author: req.userId, // vi har tillgång till userId genom authenticate middleware
    });

    res.status(201).json({ id: post._id });
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
};

const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid post id" });
      return;
    }

    const post = await Post.findById(id);

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    if (post.author.toString() !== req.userId) {
      res
        .status(403)
        .json({ message: "You are not allowed to delete this post" });
      return;
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send;
  }
};

const editPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid post id" });
      return;
    }

    const post = await Post.findById(id);

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    if (post.author.toString() !== req.userId) {
      res
        .status(403)
        .json({ message: "You are not allowed to edit this post" });
      return;
    }

    const { title, content } = req.body;

    if (title !== undefined && typeof title !== "string") {
      res.status(400).json({ message: "Malformed title" });
    }

    if (content !== undefined && typeof content !== "string") {
      res.status(400).json({ message: "Malformed content" });
    }

    await post.updateOne({
      title,
      content,
    });
    res.status(200).json({ message: "Post updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send;
  }
};

const createComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== "string") {
      res.status(400).json({ message: "Malformed comment content" });
    }

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid post id" });
      return;
    }

    const post = await Post.findById(id);

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const comment = await Comment.create({
      content,
      author: req.userId,
    });

    post.comments.push(comment);
    await post.save();

    res.status(201).json({ id: comment._id });
  } catch (error) {
    console.error(error);
    res.status(500).send;
  }
};

export const postRouter = Router();

postRouter.get("/posts", getPosts);
postRouter.get("/posts/:id", getPost);
postRouter.post("/posts/:id", authenticate, createComment);
postRouter.post("/posts", authenticate, createPost);
postRouter.delete("/posts/:id", authenticate, deletePost);
postRouter.put("/posts/:id", authenticate, editPost);
