import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewChirp, chirps, Chirp } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getAllChirps(authorID?: string): Promise<Chirp[]> {
  if (authorID) {
    const results = await db
      .select()
      .from(chirps)
      .where(eq(chirps.user_id, authorID));
    return results;
  }
  const results = await db.select().from(chirps);
  return results;
}

export async function getChirp(id: string): Promise<Chirp> {
  const [result] = await await db
    .select()
    .from(chirps)
    .where(eq(chirps.id, id));
  return result;
}

export async function deleteChirp(id: string) {
  const [result] = await db.delete(chirps).where(eq(chirps.id, id)).returning();
  return result;
}
