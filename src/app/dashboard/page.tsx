import { createClient } from '@/lib/supabase/server'
import { DashboardClientView } from '@/components/dashboard/DashboardClientView'

export default async function DashboardPage() {
    const supabase = await createClient()

    // We can fetch data securely here using RLS
    const { data: { user } } = await supabase.auth.getUser()

    // Basic query example, relying on RLS to only return this user's agency
    const { data: agencyData } = await supabase
        .from('users')
        .select('agency_id, agencies(name)')
        .eq('id', user?.id)
        .single()

    const agencyName = agencyData?.agencies
        ? Array.isArray(agencyData.agencies)
            ? agencyData.agencies[0]?.name
            : (agencyData.agencies as any).name
        : 'Agence par défaut'

    // Fetch scheduled posts
    const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('agency_id', agencyData?.agency_id)
        .order('scheduled_at', { ascending: true })

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">
                    Espace de Travail - {agencyName}
                </h2>
            </div>

            <DashboardClientView
                userId={user?.id || ''}
                agencyName={agencyName}
                initialPosts={posts || []}
            />
        </div>
    )
}
