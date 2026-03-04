"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/authContext/authContext";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // ✅ Redirect to /login once we know auth state
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // ✅ Prevent UI flash while deciding
  if (loading) {
    return <p>Loading...</p>;
  }

  // ✅ If not logged in, we already triggered redirect
  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout(); // assuming your logout calls backend + clears tokens
    } finally {
      router.replace("/login"); // ✅ always land on login
    }
  };

  return (
    <main style={{ padding: 16 }}>
      <h1>CareFind</h1>
      <p>Welcome {user.name}</p>
      <button onClick={handleLogout}>Logout</button>
    </main>
  );
}
