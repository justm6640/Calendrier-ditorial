'use client'

import { Calendar, Image as ImageIcon, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function Sidebar() {
    const pathname = usePathname()

    const navItems = [
        { href: '/dashboard', label: 'Calendrier', icon: Calendar },
        { href: '/dashboard/library', label: 'Bibliothèque', icon: ImageIcon },
        { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
    ]

    return (
        <aside className="w-64 border-r border-border/40 bg-card/60 backdrop-blur-xl hidden md:flex flex-col flex-shrink-0 relative overflow-hidden shadow-2xl shadow-primary/5">
            {/* Subtle decorative glow */}
            <div className="absolute top-0 left-[-20%] w-[150%] h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent blur-2xl pointer-events-none" />

            <div className="h-20 flex items-center px-6 border-b border-border/40 relative z-10">
                <div className="flex items-center gap-2.5 text-primary">
                    <Calendar className="h-6 w-6" />
                    <span className="font-bold text-xl tracking-tight text-foreground">Editorial Hub</span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1.5 relative z-10 mt-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-all ${isActive
                                    ? 'text-primary bg-primary/10 shadow-sm ring-1 ring-primary/20'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-border/40 relative z-10 bg-muted/10">
                <form action="/auth/signout" method="post">
                    <Button variant="ghost" className="w-full flex justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                    </Button>
                </form>
            </div>
        </aside>
    )
}
