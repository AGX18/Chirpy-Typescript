import { db } from "../index.js";
import { NewUser, users, UserResponse } from "../schema.js";
import { eq } from "drizzle-orm";
import { BadRequest } from "../../errors.js";
import { hash } from "crypto";
import { updateUserType } from "../../utils/validators.js";

export async function createUser(user: NewUser): Promise<UserResponse> {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();

  if (!result) {
    // You'll need to decide how to handle this.
    // Throw an error, return null, etc.
    // For this example, I'll throw an error.
    throw new BadRequest("User already exists or could not be created.");
  }
  const { hashed_password, ...userResponse } = result;
  return userResponse;
}

export async function deleteAllUsers() {
  const [res] = await db.delete(users);
}

export async function getUserByEmail(email: string) {
  const [result] = await db.select().from(users).where(eq(users.email, email));
  return result;
}

export async function getUserById(id: string) {
  const [result] = await db.select().from(users).where(eq(users.id, id));
  return result;
}

export async function updateUser(
  userID: string,
  hashedPassword: string,
  email: string,
) {
  const [result] = await db
    .update(users)
    .set({
      hashed_password: hashedPassword,
      email: email,
    })
    .where(eq(users.id, userID))
    .returning();
  return result;
}
