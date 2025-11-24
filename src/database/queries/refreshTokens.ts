import { db } from "../index.js";
import { refreshTokens, RefreshTokenType } from "../schema.js";
import { eq } from "drizzle-orm";
import { env } from "../../env.js";
import { UnauthorizedError } from "../../errors.js";
// Create and store a new refresh token
export async function createRefreshToken(token: string, userId: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRES_IN);

  await db.insert(refreshTokens).values({
    token,
    user_id: userId,
    expiresAt,
  });

  return token;
}

export async function getRefreshToken(
  tokenString: string,
): Promise<RefreshTokenType> {
  const [token] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, tokenString));
  return token;
}

export async function revokeRefreshToken(
  tokenString: string,
): Promise<RefreshTokenType> {
  const [token] = await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.token, tokenString))
    .returning();
  return token;
}
