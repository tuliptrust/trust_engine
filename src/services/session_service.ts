import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import crypto from "crypto";
import type { Context } from "hono";

const SESSION_COOKIE_NAME = "admin_session";
const activeAdminSessions = new Set<string>();

function createSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function establishAdminSession(c: Context) {
  const token = createSessionToken();
  activeAdminSessions.add(token);

  setCookie(c, SESSION_COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

export function clearAdminSession(c: Context) {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (token) {
    activeAdminSessions.delete(token);
  }
  deleteCookie(c, SESSION_COOKIE_NAME, { path: "/" });
}

export function isAdminAuthenticated(c: Context): boolean {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  return !!token && activeAdminSessions.has(token);
}