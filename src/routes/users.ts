import { Request, Response, Router } from "express"

const getUser = async (req: Request, res: Response) => {
  const {id} = req.params
  // TODO: get user by id
  
  res.status(200).json([{title: 'user profile'}])
}

const editUser = async (req: Request, res: Response) => {
  // TODO: edit user page
  
  res.status(200).json([{title: 'edit user profile'}])
}

export const userRouter = Router()

userRouter.get('/user/:id/edit', editUser) //edit user profile
userRouter.get('/user/:id', getUser) // view profile


// ELLER nåt sånt här enligt web dev simplified ?

// userRouter
//   .route('/user/:id')
//   .get(getUser)
//   .put(editUser) 
  // .delete(deleteUser)


