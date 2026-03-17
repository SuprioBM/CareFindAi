'use client';

import Header from '@/components/pageComponents/header';
import React from 'react';

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
        <Header />
 
      <main className='min-h-screen pt-[80px]' >
          {children}
      </main>
       
      </>

  );
}
