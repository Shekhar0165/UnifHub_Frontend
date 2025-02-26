import React from 'react'
import { ModeToggle } from '../ModeToggle/ModeToggle'
import Profile from '../Profile/Profile'

export default function Header() {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Unifhub
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <Profile />
            </div>
          </div>
        </div>
      </header>
  )
}
