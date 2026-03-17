import AuthBackground from "@/components/Themes/AuthBackground";
import Header from "@/components/pageComponents/header";

export const metadata = {
  title: "CareFind — Account",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface text-text-base min-h-screen flex flex-col relative overflow-x-hidden antialiased">
      <AuthBackground />
      <Header />

      <main className="flex-1 flex items-center justify-center p-10 relative z-10">
        {children}
      </main>

      <footer className="w-full py-6 text-center text-sm text-text-muted border-t border-border">
        <p>© 2026 CareFind. All rights reserved.</p>
      </footer>
    </div>
  );
}
