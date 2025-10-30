import { createUser, getUserByEmail } from "src/database/queries/users.js";
import { Response, Request } from "express";
import { hashPassword, checkPasswordHash } from "../utils/auth.js";
import { UnauthorizedError } from "../errors.js";
import { UserResponse } from "../database/schema";
export async function createUserHandler(req: Request, res: Response) {
  const hashed_passoword = await hashPassword(req.body.password);
  const newUser = await createUser({
    email: req.body.email,
    hashed_password: hashed_passoword,
  });
  console.log(newUser);
  res.status(201).json(newUser);
}

export async function loginHandler(req: Request, res: Response) {
  const user = await getUserByEmail(req.body.email);
  if (!user) {
    throw new UnauthorizedError("Incorrect email or password");
  }
  const isPasswordLegit = await checkPasswordHash(
    req.body.password,
    user.hashed_password,
  );

  if (!isPasswordLegit) {
    throw new UnauthorizedError("Incorrect email or password");
  }
  const returnedUser: UserResponse = {
    email: user.email,
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  res.json(returnedUser);
}
