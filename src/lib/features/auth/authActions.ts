"use server";

import { cookies } from "next/headers";

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  
  cookieStore.set({
    name: "user-token",
    value: token,
    maxAge: 7200, // 2 hours
    path: "/",
    httpOnly: false, // Allow JS access for Redux
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  
  console.log("✅ [Auth Actions] Cookie set successfully");
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  
  cookieStore.delete("user-token");
  
  console.log("✅ [Auth Actions] Cookie cleared successfully");
}
