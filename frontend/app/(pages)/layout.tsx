'use client';
import { Suspense } from 'react'
import Footer from '@/components/pageComponents/footer';
import React from 'react';
import dynamic from "next/dynamic";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const Header = dynamic(() => import("@/components/pageComponents/header"), {
  ssr: false,
});
  return (
    <>
      <Suspense fallback={null}>
      <Header />
      </Suspense>
      <main className='min-h-screen pt-[80px]' >
          {children}
      </main>
      <Footer />
      </>

  );
}
