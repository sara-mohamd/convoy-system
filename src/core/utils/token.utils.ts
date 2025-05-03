import jwt from 'jsonwebtoken'
// import { User } from '../../src/generated';
import {User} from '@prisma/client'
import { Request, Response, NextFunction } from 'express'

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const createJWT = (user: User) => {
  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h'}
  )
  return token;
}

export const  protect= (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization

  if (!bearer)
    res.status(401).json({ error: "not autherized" })

  // Can not be assiend directly to token
  //  as bearer could return undefined, and undefined can not be destructed.
  const parts = bearer?.split(' ');
  const token = parts?.length === 2 ? parts[1] : null;

  if (!token)
    res.status(401).json({ error: "not autherized" })

  try {

    const user = jwt.verify(token as string, process.env.JWT_SECRET as string)
    req.user = user
    next()

  } catch (error){
    console.log(error)
    res.status(401).json({ message: 'not valid token' })
  }
}