import React from 'react';
import { ToastContainer } from 'react-toastify'; // Ensure react-toastify is installed
import 'react-toastify/dist/ReactToastify.css'; // Import react-toastify styles

import Navbar from '@/components/navbar'; // Client component
import {Providers} from '@/app/(app)/providers'; // Ensure you have a Providers component handling context
import { Geist, Geist_Mono } from 'next/font/google'; // Correct font import
import { cn } from '@/lib/utils'; // Utility function for conditional classNames

import '@/app/globals.css'; // Import global styles if any

// Define metadata for Next.js App Router
export const metadata = {
  title: 'GhostQuil',
  description: 'Anonymous remarks platform',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

// Initialize fonts correctly
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en" className={cn(geistSans.variable, geistMono.variable)}>
      <body className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1 pt-16"> {/* Adjust padding based on Navbar height */}
            {children}
          </main>
          <ToastContainer position="top-right" autoClose={3000} />
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;