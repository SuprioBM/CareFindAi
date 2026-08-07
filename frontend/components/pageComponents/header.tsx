"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "../Themes/ThemeToggle";
import { useAuth } from "@/authContext/authContext";
import { usePathname } from "next/navigation";
import MobileDrawer from "./MobileDrawer";
import PrescriptionPollNotifier from "./PrescriptionPollNotifier";
import { HeartPulse } from "lucide-react";
import { apiFetch } from "@/lib/api";

const navLinks = [
  { name: "Prescription Analyzer", href: "/prescription-analyzer" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "Symptom Checker", href: "/analyze" },
  { name: "Find Doctors", href: "/find_nearby_doctors" },

];

export default function Header() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [fullPath, setFullPath] = useState(pathname);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unseenCount, setUnseenCount] = useState<number>(0);

  useEffect(() => {
    setFullPath(`${window.location.pathname}${window.location.search}`);
  }, [pathname]);

  useEffect(() => {
    if (!user) {
      setUnseenCount(0);
      return;
    }

    const fetchUnseenCount = async () => {
      try {
        const res = await apiFetch('/prescription/unseen');
        if (res.ok) {
          const data = await res.json();
          setUnseenCount(data.count || 0);
        }
      } catch (err) {
        console.error("Error fetching unseen count in header:", err);
      }
    };

    fetchUnseenCount();

    const interval = setInterval(fetchUnseenCount, 15000);
    return () => clearInterval(interval);
  }, [user, pathname]);

  return (
    <header className="w-full border-b border-border px-8 py-4 bg-surface fixed top-0 z-50 transition-colors duration-300">
      
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* LEFT — Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <HeartPulse className="w-6 h-6 text-primary shrink-0 animate-pulse" />
          <h2 className="text-lg font-black tracking-tight text-text-base">CareFind</h2>
        </Link>
       

        {/* CENTER — Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-semibold text-text-sub hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <span>{link.name}</span>
              {link.href === "/prescription-analyzer" && unseenCount > 0 && (
                <span className="bg-primary text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0 flex items-center justify-center animate-pulse" title={`${unseenCount} Reports Awaiting Review`}>
                  {unseenCount}
                </span>
              )}
            </Link>
          ))}
          {user && (
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-text-sub hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* RIGHT — Auth + Theme */}
        <div className="flex items-center gap-6">

          <ThemeToggle />
          <button
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            onClick={() => setDrawerOpen((s) => !s)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-primary/10 transition mr-2"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <MobileDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            navLinks={navLinks}
            currentPath={fullPath}
            unseenCount={unseenCount}
          />

          {!loading && (
            <div className="hidden md:flex items-center gap-4">
              {!user ? (
                <Link
                  href={`/login?redirect=${encodeURIComponent(fullPath)}`}
                  className="flex items-center justify-center rounded-xl h-10 px-6 bg-primary text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-primary-hover transition-all"
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
                    className="flex items-center justify-center rounded-xl h-10 px-4 border border-border text-xs font-bold uppercase tracking-wider text-text-sub hover:bg-card transition-all"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
      <PrescriptionPollNotifier />
    </header>
  );
}