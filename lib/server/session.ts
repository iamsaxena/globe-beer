import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { findManualUserByUsername } from "@/lib/server/store";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  username: string;
  profile_pic?: string;
  role: string;
};

const cookieName = "globe_session";
const maxAge = 60 * 60 * 12;

function secret() {
  return process.env.NEXTAUTH_SECRET ?? "local-dev-session-secret";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(user: SessionUser) {
  const payload = Buffer.from(JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + maxAge })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function setSession(user: SessionUser) {
  cookies().set(cookieName, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge,
    path: "/"
  });
}

export function clearSession() {
  cookies().set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}

function parseSessionToken(token?: string) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionUser & { exp: number };
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function currentSessionUser() {
  const session = parseSessionToken(cookies().get(cookieName)?.value);
  if (!session) return null;
  const user = await findManualUserByUsername(session.username);
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    username: user.username,
    profile_pic: user.profile_pic ?? "",
    role: user.role
  };
}
