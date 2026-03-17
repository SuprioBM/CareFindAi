'use client';

import { useAdminGuard } from '@/lib/useAdminGuard';

function NotFoundView() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-text-base">404</h1>
        <p className="mt-3 text-lg font-semibold text-text-base">
          Page not found
        </p>
        <p className="mt-2 text-sm text-text-muted">
          The page you are looking for does not exist.
        </p>
      </div>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-sm text-text-muted">Loading...</div>
    </div>
  );
}

export default function AdminPageGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isChecking, isAllowed, isDenied } = useAdminGuard();

  if (isChecking) {
    return <LoadingView />;
  }

  if (isDenied) {
    return <NotFoundView />;
  }

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}