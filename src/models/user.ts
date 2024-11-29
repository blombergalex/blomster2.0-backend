import { type Document, model, Schema } from "mongoose";

type TUser = Document & {
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, //för att inte fetcha lösenordet varje gång vi hämtar användaren
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<TUser>("User", UserSchema);
