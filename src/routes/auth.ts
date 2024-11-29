import { type Request, type Response, Router } from "express";
import bcrypt from 'bcrypt'

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
};

const logIn = async (req: Request, res: Response) => {
  try {
    const {username, password} = req.body
    if (!username || !password) {
      res.status(400).json({message: 'Username or password is missing'})
      return
    }

    const user = await User.findOne({ username }, '+password' )
    if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(400).json({ message: 'Wrong username or password'})
    return
    }

    
  } catch (error) {
    console.error(error)
    res.status(500).send()
  }

};

export const authRouter = Router();

authRouter.post("/sign-up", signUp); // när vi gör en post request på denna route, kör signUp
authRouter.get("/log-in", logIn); // render login page
