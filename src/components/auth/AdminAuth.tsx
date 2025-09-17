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


  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);




  return <>{children}</>;
}
