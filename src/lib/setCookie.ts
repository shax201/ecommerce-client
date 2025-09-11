"use server";

import { cookies } from "next/headers";

export async function setCookie(
  name: string,
  value: string,
  maxAgeSeconds = 3600
) {
  const cookieStore = await cookies(); // ⬅ await here
  cookieStore.set({
    name,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
    sameSite: "strict",
  });
}
