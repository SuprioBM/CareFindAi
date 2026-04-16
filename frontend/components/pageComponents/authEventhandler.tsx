'use client';

import { useEffect } from "react";
import { toast } from "sonner";
import { setLogoutHandler } from "@/lib/authBridge";
import { useAuth } from "../../authContext/authContext";

export default function AuthEventHandler() {
  const { logout } = useAuth();

  useEffect(() => {
    setLogoutHandler(() => {
      logout(true);
      toast.error("Session expired. You are now logged out.");
    });
  }, [logout]);

  return null;
}