'use client'

import { useActionState, useEffect } from 'react'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Sparkles, CalendarDays } from 'lucide-react'
import Link from 'next/link'

const initialState = {
    error: null as string | null,
}

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(
        async (prevState: any, formData: FormData) => {
            const result = await login(formData)
            if (result?.error) {
                return { error: result.error }
            }
            return { error: null }
        },
        initialState
    )

    // Notify on error state change
    useEffect(() => {
        if (state?.error) {
            toast.error(state.error)
        }
    }, [state?.error])

    return (
        <div className="flex min-h-svh w-full bg-background dark:bg-background">
            {/* Left side: Premium branding area */}
            <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-primary">
                {/* Decorative circles */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-black/20 blur-3xl" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 text-primary-foreground">
                        <CalendarDays className="h-8 w-8" />
                        <span className="text-2xl font-bold tracking-tight">Editorial Hub</span>
                    </div>
                </div>

                <div className="relative z-10 space-y-6 max-w-lg">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-primary-foreground leading-tight">
                        Organisez vos réseaux avec élégance.
                    </h1>
                    <p className="text-primary-foreground/80 text-lg">
                        Collaborez, planifiez et validez vos contenus sociaux avec une interface pensée pour les agences et leurs clients.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-2 text-primary-foreground/70 text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Propulsé par Dockploy & Supabase</span>
                </div>
            </div>

            {/* Right side: Login Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 relative">
                {/* Subtle gradient background for the form side on light mode */}
                <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background dark:from-background dark:to-background pointer-events-none" />

                <div className="w-full max-w-sm relative z-10">
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-8 text-primary">
                        <CalendarDays className="h-8 w-8" />
                        <span className="text-2xl font-bold tracking-tight">Editorial Hub</span>
                    </div>

                    <form action={formAction}>
                        <Card className="border-border/50 shadow-2xl shadow-primary/5 dark:shadow-none backdrop-blur-sm bg-card/95">
                            <CardHeader className="space-y-2 pb-6">
                                <CardTitle className="text-3xl font-bold tracking-tight">Bienvenue</CardTitle>
                                <CardDescription className="text-base">
                                    Saisissez vos identifiants pour accéder à votre espace
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="font-medium text-foreground/80">Email Agence</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="nom@agence.com"
                                        required
                                        className="h-11 bg-background/50 focus:bg-background transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="font-medium text-foreground/80">Mot de passe</Label>
                                        <span className="text-xs font-medium text-primary cursor-pointer hover:underline">Oublié ?</span>
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="h-11 bg-background/50 focus:bg-background transition-colors"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                                <Button type="submit" className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow" disabled={isPending}>
                                    {isPending ? 'Chargement...' : 'Se connecter'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>

                    <p className="text-center text-sm text-foreground/60 mt-8">
                        Vous n'avez pas de compte ? <Link href="/signup" className="text-primary font-medium cursor-pointer hover:underline">S'inscrire</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
