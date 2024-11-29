import { type Document, model, MongooseError, Schema } from "mongoose";
import bcrypt from 'bcrypt'

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

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {   // om lösen ej ändrats behöver det inte hashas, gå vidare
    next();
  }

  try {

    const hashedPassword = await bcrypt.hash(this.password, 10) // hashas 10 gånger (antal salt)
    this.password = hashedPassword
    next()

  } catch (error) {

    if (error instanceof MongooseError) {
      next(error) // skicka vidare error till auth
    }

    throw error
  }
});

export const User = model<TUser>("User", UserSchema);
