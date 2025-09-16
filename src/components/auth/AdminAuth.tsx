"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { initializeAuth } from "@/lib/features/auth";
import { useRouter, usePathname } from "next/navigation";
import { FullScreenLoading } from "@/components/ui/loading-spinner";

interface AdminAuthProps {
  children: React.ReactNode;
}

export default function AdminAuth({ children }: AdminAuthProps) {
  const dispatch = useAppDispatch();
  const { admin, isAdminAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  // Don't apply auth protection to login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    // Only redirect to login if we're not on the login page and not authenticated
    if (!isLoading && !isAdminAuthenticated && !isLoginPage) {
      console.log("AdminAuth: Redirecting to login - not authenticated");
      router.replace("/admin/login");
    }
  }, [isAdminAuthenticated, isLoading, router, isLoginPage]);

  // Debug logging
  useEffect(() => {
    console.log("AdminAuth Debug:", {
      isAdminAuthenticated,
      isLoading,
      isLoginPage,
      admin: admin ? "exists" : "null"
    });
  }, [isAdminAuthenticated, isLoading, isLoginPage, admin]);

  // For login page, just render children without any auth checks
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <FullScreenLoading text="Authenticating..." />;
  }

  if (!isAdminAuthenticated || !admin) {
    return null;
  }

  return <>{children}</>;
}
