'use client'

import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Menu } from 'lucide-react'


function Navbar() {
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user

  return (
    <nav className="fixed top-0 w-full z-50 bg-zinc-900/95 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <Link 
            href="/"
            className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-violet-200 bg-clip-text text-transparent hover:from-violet-300 hover:to-violet-100 transition-all"
          >
            Ghost Quil
          </Link>

          <div className="flex items-center gap-8">
            {session ? (
              <>
                <Link 
                  href="/dashboard"
                  className="text-sm font-medium text-zinc-200 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="h-9 w-9 rounded-full p-0 hover:bg-violet-500/10"
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-violet-500/15 hover:bg-violet-500/25 transition-colors">
                        <User className="h-4 w-4 text-violet-300" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-64 p-2 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl"
                  >
                    <div className="mb-2 p-2 rounded-md bg-white/10">
                      <p className="text-sm font-medium text-white">
                        {user?.name}
                      </p>
                      <p className="text-xs text-zinc-300">
                        @{user?.username}
                      </p>
                    </div>
                    
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="cursor-pointer text-sm font-medium text-red-400 hover:text-red-300 focus:text-red-300 hover:bg-zinc-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" /> 
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                onClick={() => router.push('/sign-in')}
                className="bg-violet-500/15 hover:bg-violet-500/25 text-violet-200 hover:text-violet-100 transition-colors"
              >
                Sign in
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar