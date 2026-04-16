"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "../Themes/ThemeToggle";
import { useAuth } from "@/authContext/authContext";
import { usePathname } from "next/navigation";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Dashboard", href: "/dashboard" },
];

export default function Header() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [fullPath, setFullPath] = useState(pathname);

  useEffect(() => {
    setFullPath(`${window.location.pathname}${window.location.search}`);
  }, [pathname]);


  return (
    <header className="w-full border-b border-primary/10 px-8 py-4 bg-surface fixed top-0 z-50">
      
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* LEFT — Logo */}
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">
            medical_services
          </span>
          <h2 className="text-xl font-bold tracking-tight">CareFind</h2>
        </div>

        {/* CENTER — Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-semibold text-text-sub hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* RIGHT — Auth + Theme */}
        <div className="flex items-center gap-6">

          <ThemeToggle />

          {!loading && (
            <>
              {!user ? (
                <Link
                  href={`/login?redirect=${encodeURIComponent(fullPath)}`}
                  className="flex items-center justify-center rounded-xl h-10 px-6 bg-primary text-white text-sm font-bold shadow-md hover:bg-primary-hover transition-colors"
                >
                  Sign In
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-text-sub">
                    {user.name || user.email}
                  </span>

                  <button
                    onClick={() => {
                      void logout();
                    }}
                    className="flex items-center justify-center rounded-xl h-10 px-4 border border-primary/20 text-sm font-semibold hover:bg-primary/10 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </header>
  );
}