"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { logout } from "@/lib/features/auth/authSlice";
import { useLogoutMutation } from "@/lib/features/auth/authApi";
import { clearAuthCookie } from "@/lib/features/auth/authActions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/lib/features/auth/authApi";

interface UserDropdownProps {
  user: User | null;
  isAuthenticated: boolean;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user, isAuthenticated }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      // Call the logout API mutation
      await logoutMutation().unwrap();
      
      // Dispatch the logout action to clear Redux state
      dispatch(logout());
      
      // Clear localStorage items
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user-preferences');
        localStorage.removeItem('user-token');
        localStorage.removeItem('client');
        // localStorage.removeItem('cart-data');
      }
      
      // Clear cookies
      try {
        await clearAuthCookie();
        console.log("✅ Cookie cleared successfully");
      } catch (cookieError) {
        console.error("❌ Failed to clear cookie:", cookieError);
      }
      
      // Redirect to login page
      router.push('/signin');
      
      console.log("✅ User logged out successfully");
    } catch (error) {
      console.error("❌ Logout failed:", error);
      // Even if API call fails, clear local state and redirect
      dispatch(logout());
      
      // Clear localStorage items
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user-preferences');
        localStorage.removeItem('user-token');
        localStorage.removeItem('client');
      }
      
      // Clear cookies
      try {
        await clearAuthCookie();
      } catch (cookieError) {
        console.error("❌ Failed to clear cookie:", cookieError);
      }
      
      // Redirect to login page
      router.push('/signin');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <Link href="/signin" className="p-1">
        <Image
          priority
          src="/icons/user.svg"
          height={100}
          width={100}
          alt="user"
          className="max-w-[22px] max-h-[22px]"
        />
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 hover:opacity-70 transition-opacity">
          <Image
            priority
            src="/icons/user.svg"
            height={100}
            width={100}
            alt="user"
            className="max-w-[22px] max-h-[22px]"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account" className="cursor-pointer">
            <Image
              src="/icons/user.svg"
              height={16}
              width={16}
              alt="account"
              className="mr-2"
            />
            My Account
          </Link>
        </DropdownMenuItem>
   
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <Image
            src="/icons/times.svg"
            height={16}
            width={16}
            alt="logout"
            className="mr-2"
          />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
