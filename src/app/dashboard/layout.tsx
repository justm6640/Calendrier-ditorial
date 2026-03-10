import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    // Verify auth session specifically for the layout
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="flex min-h-screen bg-background dark:bg-background">
            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-20 border-b border-border/40 flex items-center justify-between px-8 bg-background/80 backdrop-blur-md sticky top-0 z-20 shrink-0">
                    <h1 className="text-2xl font-semibold tracking-tight">Tableau de Bord</h1>
                    <div className="flex items-center gap-4 bg-muted/40 px-4 py-2 rounded-full border border-border/50">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium text-muted-foreground truncate max-w-[200px]">{user.email}</span>
                    </div>
                </header>
                <div className="flex-1 p-8 relative">
                    {/* Background glow for main area */}
                    <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                    <div className="relative z-10 h-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
