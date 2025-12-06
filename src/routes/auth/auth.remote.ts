import { z } from "zod";
import { form, getRequestEvent } from "$app/server";
import { redirect, invalid } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import * as auth from "$lib/server/auth";
import { eq } from "drizzle-orm";

const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(31, "Username must be at most 31 characters")
  .regex(
    /^[a-z0-9_-]+$/,
    "Username can only contain lowercase letters, numbers, underscores, and hyphens"
  );

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(255, "Password must be at most 255 characters");

const loginSchema = z.object({
  username: usernameSchema,
  _password: passwordSchema,
});

const registerSchema = z.object({
  username: usernameSchema,
  _password: passwordSchema,
});

export const login = form(loginSchema, async (data, issue) => {
  const event = getRequestEvent();

  const results = await db
    .select()
    .from(table.user)
    .where(eq(table.user.username, data.username));

  const existingUser = results.at(0);
  if (!existingUser) {
    invalid(issue.username("Incorrect username or password"));
  }

  const validPassword = await Bun.password.verify(
    data._password,
    existingUser!.passwordHash
  );
  if (!validPassword) {
    invalid(issue.username("Incorrect username or password"));
  }

  const sessionToken = auth.generateSessionToken();
  const session = await auth.createSession(sessionToken, existingUser!.id);
  auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

  redirect(303, "/");
});

export const register = form(registerSchema, async (data, issue) => {
  const event = getRequestEvent();

  // Check if username already exists
  const existingUsers = await db
    .select()
    .from(table.user)
    .where(eq(table.user.username, data.username));

  if (existingUsers.length > 0) {
    invalid(issue.username("Username already taken"));
  }

  const userId = Bun.randomUUIDv7();
  const passwordHash = await Bun.password.hash(data._password);

  try {
    await db
      .insert(table.user)
      .values({ id: userId, username: data.username, passwordHash });

    const sessionToken = auth.generateSessionToken();
    const session = await auth.createSession(sessionToken, userId);
    auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
  } catch {
    invalid("An error occurred during registration");
  }

  redirect(303, "/");
});
