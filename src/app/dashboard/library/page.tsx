import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LibraryView } from '@/components/library/LibraryView'

export default async function LibraryPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return <LibraryView userId={user.id} />
}
