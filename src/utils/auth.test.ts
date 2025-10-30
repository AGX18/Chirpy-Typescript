import { describe, it, expect, beforeAll } from "vitest";
import { makeJWT, validateJWT, hashPassword, checkPasswordHash } from "./auth";
import { before } from "node:test";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });
});

describe("JWT", () => {
  const jwt_secret = "shhhhh";
  const user_id = "123456";
  const wrong_secret = "wrong-secret";
  const token1 = makeJWT(user_id, 60, jwt_secret);

  it("should equal the user_id for the correct secret", async () => {
    const result = validateJWT(token1, jwt_secret);
    expect(result).to.equal(user_id);
  });

  it("should throw an error for the wrong secret", async () => {
    let result;
    try {
      result = validateJWT(token1, wrong_secret);
    } catch (e: any) {
      // do nothing this is expected
    }

    expect(result).to.equal(undefined);
  });
});
