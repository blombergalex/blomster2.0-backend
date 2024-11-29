import { type Request, type Response, Router } from "express";
import { User } from "../models/user";

const signUp = async (req: Request, res: Response) => { // has to be async because we await User further down
  // TODO: sign up user page
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({message: 'Username or password is missing'})
      return
    }

    const existingUser = await User.findOne({ username })    // to find user with specific username
    if (existingUser) {
      res.status(400).json({ message: 'Username already taken'})
      return
    }

    const user = new User({ username, password }) //creating user locally
    await user.save()                             // saving user to database
    res.status(201).json({ message: 'Registration successful'})

  } catch (error) {
    // to catch 500 errors
    console.error(error);
    res.status(500).send(); // if not use 'send' it will get stuck in loading state
  }

  res.status(200).json([{ title: "sign up" }]);
};

const logIn = async (req: Request, res: Response) => {
  // TODO: log in page

  res.status(200).json([{ title: "log in" }]);
};

export const authRouter = Router();

authRouter.post("/sign-up", signUp); // när vi gör en post request på denna route, kör signUp
authRouter.get("/log-in", logIn); // render login page
