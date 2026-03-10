'use client'

import { Calendar, Image as ImageIcon, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function MobileNav() {
    const pathname = usePathname()

    const navItems = [
        { href: '/dashboard', label: 'Calendrier', icon: Calendar },
        { href: '/dashboard/library', label: 'Bibliothèque', icon: ImageIcon },
        { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
    ]

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/40 pb-safe">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                            {isActive && (
                                <div className="absolute bottom-0 w-8 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                            )}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
