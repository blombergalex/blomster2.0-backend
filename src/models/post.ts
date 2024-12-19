import { type Document, model, Schema, type Types } from "mongoose";

type TComment = Document & {
  content: string;
  author: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  id: string; //add bc needed to get comment in post route
};

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User", // the reference tells what model the author refers to
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

type TPost = Document & {
  title: string;
  content: string;
  author: Types.ObjectId;
  comments: TComment[];
  upvotes: Types.ObjectId[];
  downvotes: Types.ObjectId[];
  score: number;
  createdAt: Date;
  updatedAt: Date;
};

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: false,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User", // the reference tells what model the author refers to
      required: true,
    },
    comments: [commentSchema], //en array med kommentarer
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Post = model<TPost>("Post", postSchema);
export const Comment = model<TComment>("Comment", commentSchema);
