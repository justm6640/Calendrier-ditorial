import { createClient } from '@/lib/supabase/server'
import { PublicFeedView } from '@/components/feed/PublicFeedView'
import { notFound } from 'next/navigation'

export default async function SharePage({ params }: { params: { agencyId: string } }) {
    const { agencyId } = await params
    const supabase = await createClient()

    // Fetch agency info
    const { data: agency } = await supabase
        .from('agencies')
        .select('name')
        .eq('id', agencyId)
        .single()

    if (!agency) {
        return notFound()
    }

    // Fetch posts for this agency
    const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('agency_id', agencyId)
        .order('scheduled_at', { ascending: true })

    return (
        <div className="min-h-screen bg-muted/30">
            <PublicFeedView
                agencyName={agency.name}
                posts={posts || []}
            />
        </div>
    )
}
