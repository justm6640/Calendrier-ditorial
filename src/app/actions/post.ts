'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
    const supabase = await createClient()

    const caption = formData.get('caption') as string
    const platform = formData.get('platform') as string
    const dateStr = formData.get('date') as string
    const mediaUrlsStr = formData.get('mediaUrls') as string

    if (!caption || !platform || !dateStr || !mediaUrlsStr) {
        return { error: 'Veuillez remplir tous les champs requis.' }
    }

    let mediaUrls: string[] = []
    try {
        mediaUrls = JSON.parse(mediaUrlsStr)
    } catch (e) {
        return { error: 'Format invalide pour les médias.' }
    }

    const scheduledDate = new Date(dateStr)

    // Get the current user to find their agency
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non autorisé.' }

    // Get user's agency ID
    const { data: userData } = await supabase
        .from('users')
        .select('agency_id')
        .eq('id', user.id)
        .single()

    if (!userData?.agency_id) return { error: 'Aucune agence associée.' }

    // Insert post into database
    const { error } = await supabase
        .from('posts')
        .insert({
            agency_id: userData.agency_id,
            platform,
            caption,
            media_urls: mediaUrls,
            scheduled_at: scheduledDate.toISOString(),
            status: 'draft' // Initial status
        })

    if (error) {
        console.error('Create Post Error:', error)
        return { error: 'Erreur lors de la création du post.' }
    }

    // Revalidate dashboard to reflect new data
    revalidatePath('/dashboard')
    return { success: true }
}

export async function updatePost(postId: string, formData: FormData) {
    const supabase = await createClient()

    const caption = formData.get('caption') as string
    const platform = formData.get('platform') as string
    const dateStr = formData.get('date') as string

    if (!caption || !platform || !dateStr) {
        return { error: 'Veuillez remplir tous les champs requis.' }
    }

    const scheduledDate = new Date(dateStr)

    const { error } = await supabase
        .from('posts')
        .update({
            caption,
            platform,
            scheduled_at: scheduledDate.toISOString()
        })
        .eq('id', postId)

    if (error) {
        console.error('Update Post Error:', error)
        return { error: 'Erreur lors de la mise à jour du post.' }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function deletePost(postId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

    if (error) {
        console.error('Delete Post Error:', error)
        return { error: 'Erreur lors de la suppression du post.' }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
