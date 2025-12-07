import { form, getRequestEvent, query } from "$app/server";
import * as auth from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { invalid, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { z } from "zod";

const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(31, "Username must be at most 31 characters")
  .regex(
    /^[a-z0-9_-]+$/,
    "Username can only contain lowercase letters, numbers, underscores, and hyphens",
  );

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(255, "Password must be at most 255 characters");

const authSchema = z.object({
  username: usernameSchema,
  _password: passwordSchema,
  register: z.boolean().optional(),
});

export const authenticate = form(authSchema, async (data, issue) => {
  const event = getRequestEvent();

  const existingUsers = await db
    .select()
    .from(table.user)
    .where(eq(table.user.username, data.username));

  const existingUser = existingUsers.at(0);

  if (!data.register) {
    if (!existingUser) {
      invalid(issue.username("Incorrect username or password"));
    }

    const validPassword = await Bun.password.verify(
      data._password,
      existingUser!.passwordHash,
    );
    if (!validPassword) {
      invalid(issue.username("Incorrect username or password"));
    }

    const sessionToken = auth.generateSessionToken();
    const session = await auth.createSession(sessionToken, existingUser!.id);
    auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
  } else {
    if (existingUser) {
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
  }

  redirect(303, "/");
});

export const signOut = form(async () => {
  const event = getRequestEvent();
  if (event.locals.session?.id) {
    await auth.invalidateSession(event?.locals.session.id);
  }
  auth.deleteSessionTokenCookie(event);

  redirect(307, "/auth");
});

export const getUser = query(async () => {
  const { locals } = getRequestEvent();
  if (!locals.user) {
    redirect(307, "/auth");
  }
  return locals.user;
});
