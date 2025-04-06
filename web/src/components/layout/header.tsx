import Link from 'next/link'
import { MainNav } from './main-nav'
import { ModeToggle } from './mode-toggle'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M12 22V8" />
              <path d="m5 12 7-4 7 4" />
              <path d="M5 16l7-4 7 4" />
              <path d="M5 20l7-4 7 4" />
            </svg>
            <span className="font-bold">AI Hedge Fund</span>
          </Link>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <MainNav />
          <div className="flex items-center space-x-1">
            <ModeToggle />
            <Avatar className="h-8 w-8">
              <AvatarFallback>US</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  )
} 