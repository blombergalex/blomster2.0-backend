import { type Request, type Response, Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { User } from "../models/user";

const signUp = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ message: "Username or password is missing" });
      return;
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400).json({ message: "Username already taken" });
      return;
    }

    const user = new User({ username, password }); 
    await user.save(); 
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error(error);
    res.status(500).send(); 
  }
};

const logIn = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ message: "Username or password is missing" });
      return;
    }

    const user = await User.findOne({ username }, "+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(400).json({ message: "Wrong username or password" });
      return;
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ accessToken, userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
};

export const authRouter = Router();

authRouter.post("/sign-up", signUp); // när vi gör en post request på denna route, kör signUp
authRouter.post("/log-in", logIn); // vid post request på /log-in, kör logIn.

