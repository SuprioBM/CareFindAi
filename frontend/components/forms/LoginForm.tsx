"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/authContext/authContext";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // ✅ If backend blocks unverified users, send them to verify page
        if (data?.code === "EMAIL_NOT_VERIFIED") {
          const targetEmail = data.email || email;
          router.push(`/verify-email?email=${encodeURIComponent(targetEmail)}`);
          return;
        }

        setError(data?.message || "Login failed");
        return;
      }

      // ✅ Success: store user + access token in context/memory
      login(data.user, data.accessToken);

      router.replace("/");
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <Card className="w-full max-w-sm bg-stone-800">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Enter your email below to login</CardDescription>

          <CardAction>
            <Button variant="link" onClick={() => router.push("/register")}>
              Sign Up
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          {/* ✅ real submit (Enter key works) */}
          <form autoComplete="off" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>

                  {/* Optional: wire this later */}
                  <button
                    type="button"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-white/80"
                    onClick={() => router.push("/forgot-password")}
                  >
                    Forgot your password?
                  </button>
                </div>

                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-red-500 mt-2">{error}</p>}

              <Button
                type="submit"
                className="w-full border bg-primary"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() =>
                  router.push(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`)
                }
              >
                Login with Google
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2" />
      </Card>
    </div>
  );
}
