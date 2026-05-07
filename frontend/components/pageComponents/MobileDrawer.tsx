"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAuth } from "@/authContext/authContext";
import useLockBodyScroll from "../hooks/useLockBodyScroll";

type NavLink = { name: string; href: string };

export default function MobileDrawer({
  open,
  onClose,
  navLinks,
  currentPath,
}: {
  open: boolean;
  onClose: () => void;
  navLinks: NavLink[];
  currentPath?: string | null;
}) {
  const { user, logout, loading } = useAuth();
  useLockBodyScroll(open);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      // focus first link for keyboard users using DOM query (avoids element.ref access warnings)
      setTimeout(() => {
        const first = document.querySelector<HTMLAnchorElement>("#mobile-drawer nav a");
        first?.focus();
      }, 120);
    }
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    // keep mounted for CSS transitions; pointer-events toggled
    <div className={`fixed inset-0 z-60 md:hidden ${open ? "" : "pointer-events-none"}`}>

      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        aria-hidden={!open}
      />

      {/* Drawer */}
      <aside
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`absolute right-0 z-10 h-full bg-surface shadow-xl w-64 sm:w-72 transform transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">medical_services</span>
            <h3 className="text-lg font-bold tracking-tight">CareFind</h3>
          </div>
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="p-2 rounded-md hover:bg-primary/10 transition"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="px-4 py-6 flex flex-col gap-3" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={onClose}
              className={`text-sm font-semibold py-2 rounded-md ${currentPath === link.href ? "text-primary" : "text-text-sub hover:text-primary"}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="px-4 mt-auto pb-8">
          {!loading && (
            <div className="flex flex-col gap-3">
              {!user ? (
                <Link
                  href={`/login?redirect=${encodeURIComponent(currentPath || "/")}`}
                  onClick={onClose}
                  className="flex items-center justify-center rounded-xl h-10 px-6 bg-primary text-white text-sm font-bold shadow-md hover:bg-primary-hover transition-colors"
                >
                  Sign In
                </Link>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/dashboard" onClick={onClose} className="text-sm font-semibold text-text-sub hover:text-primary transition">
                    Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      void logout();
                      onClose();
                    }}
                    className="flex items-center justify-center rounded-xl h-10 px-4 border border-primary/20 text-sm font-semibold hover:bg-primary/10 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
