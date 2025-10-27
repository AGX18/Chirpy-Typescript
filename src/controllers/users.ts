import { NewUser } from "src/database/schema.js";
import { createUser } from "src/database/queries/users.js";
import { Response, Request } from "express";
export async function createUserHandler(req: Request, res: Response) {
  const newUser = await createUser({
    email: req.body.email,
  });
  res.status(201).json(newUser);
}
