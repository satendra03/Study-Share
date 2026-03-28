"use client";
import { useEffect } from "react";
import { useAdminAuthStore } from "@/store/adminAuthStore";

export function AdminAuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAdminAuthStore((s) => s.initialize);

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  return <>{children}</>;
}
