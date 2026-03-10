'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const agencyName = formData.get('agencyName') as string

    if (!email || !password || !fullName || !agencyName) {
        return { error: 'Tous les champs sont requis.' }
    }

    const supabase = await createClient()

    const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                agency_name: agencyName,
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    // Since we are likely using a remote project, email confirmations might be turned on.
    // If a session gets returned, it means confirmation is off, and we can login.
    // If not, we might need to inform the user.
    if (!data.session) {
        return {
            error: "Veuillez vérifier votre boîte de réception pour confirmer votre email.",
            success: true
        }
    }

    redirect('/dashboard')
}
