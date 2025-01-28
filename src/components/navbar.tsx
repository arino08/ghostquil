'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Updated import for Next.js 13+
import Link from 'next/link'; // Use Link from 'next/link' for client-side navigation
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'; // Adjust import paths as needed
import { Button } from '@/components/ui/button'; // Adjust import paths as needed
import { LogOut, UserIcon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State for Mobile Menu Toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  return (
    <nav className="bg-zinc-900 text-zinc-100 shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <UserIcon className="h-8 w-8 text-emerald-400 mr-2" />
            <Link href="/dashboard">
              <span className="font-bold text-xl cursor-pointer hover:text-emerald-300 transition-colors duration-300">
                GhostQuil
              </span>
            </Link>
          </div>

          {/* User Profile / Sign In */}
          <div className="hidden md:flex items-center">
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 bg-zinc-800/60 hover:bg-zinc-800/80 px-3 py-2 rounded-md transition-colors duration-300">
                    <UserIcon className="h-5 w-5 text-emerald-400" />
                    <span className="hidden sm:inline">{session.user.name}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-zinc-900 rounded-md shadow-lg mt-2">
                  <DropdownMenuItem
                    onClick={() => {
                      signOut();
                      router.push('/'); // Redirect to home or login page after sign out
                    }}
                    className="flex items-center px-4 py-2 text-red-400 hover:text-red-300 hover:bg-zinc-800 transition-colors duration-300 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => router.push('/sign-in')}
                className="bg-violet-500/15 hover:bg-violet-500/25 text-violet-200 hover:text-violet-100 transition-colors rounded-md px-4 py-2 text-sm flex items-center"
              >
                Sign in
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-zinc-200 hover:text-emerald-400 focus:outline-none transition-colors duration-300"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden bg-zinc-900/90 px-2 pt-2 pb-3 space-y-1 sm:px-3"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* User Profile / Sign In in Mobile Menu */}
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-zinc-800 transition-colors duration-300 flex items-center">
                    <UserIcon className="h-5 w-5 text-emerald-400 mr-2" />
                    {session.user.name}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-zinc-900 rounded-md shadow-lg mt-2">
                  <DropdownMenuItem
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                      router.push('/'); // Redirect to home or login page after sign out
                    }}
                    className="flex items-center px-4 py-2 text-red-400 hover:text-red-300 hover:bg-zinc-800 transition-colors duration-300 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => {
                  router.push('/sign-in');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left bg-violet-500/15 hover:bg-violet-500/25 text-violet-200 hover:text-violet-100 transition-colors rounded-md px-4 py-2 text-base flex items-center"
              >
                Sign in
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;