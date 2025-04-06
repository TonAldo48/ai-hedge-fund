'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, CandlestickChart, Home, LineChart, Settings, User } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: '/',
      label: 'Dashboard',
      icon: Home,
      active: pathname === '/',
    },
    {
      href: '/simulation',
      label: 'Simulation',
      icon: LineChart,
      active: pathname === '/simulation',
    },
    {
      href: '/stocks',
      label: 'Stocks',
      icon: CandlestickChart,
      active: pathname === '/stocks' || pathname.startsWith('/stocks/'),
    },
    {
      href: '/portfolio',
      label: 'Portfolio',
      icon: BarChart3,
      active: pathname === '/portfolio',
    },
    {
      href: '/agents',
      label: 'Agents',
      icon: User,
      active: pathname === '/agents',
    },
  ]

  return (
    <div className="flex items-center space-x-1 lg:space-x-4">
      <div className="hidden md:flex">
        {routes.map((route) => (
          <Button
            key={route.href}
            variant={route.active ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              'h-9 justify-start',
              route.active && 'bg-primary text-primary-foreground'
            )}
            asChild
          >
            <Link href={route.href} className="flex items-center space-x-2">
              <route.icon className="h-5 w-5" />
              <span>{route.label}</span>
            </Link>
          </Button>
        ))}
      </div>
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Navigation</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {routes.map((route) => (
              <DropdownMenuItem key={route.href} asChild>
                <Link href={route.href} className="flex items-center space-x-2">
                  <route.icon className="h-5 w-5" />
                  <span>{route.label}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
} 