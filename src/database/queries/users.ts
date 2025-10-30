import { db } from "../index.js";
import { NewUser, users, UserResponse } from "../schema.js";

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
    throw new Error("User already exists or could not be created.");
  }
  const { hashed_password, ...userResponse } = result;
  return userResponse;
}

export async function deleteAllUsers() {
  const [res] = await db.delete(users);
}
