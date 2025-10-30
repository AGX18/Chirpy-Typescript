import { createUser } from "src/database/queries/users.js";
import { Response, Request } from "express";
import { hashPassword } from "../auth";

export async function createUserHandler(req: Request, res: Response) {
  const hashed_passoword = await hashPassword(req.body.password);
  const newUser = await createUser({
    email: req.body.email,
    hashed_password: hashed_passoword,
  });
  console.log(newUser);
  res.status(201).json(newUser);
}
