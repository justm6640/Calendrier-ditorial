'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { updatePost, deletePost } from '@/app/actions/post'
import { toast } from 'sonner'
import { Pencil, Trash2, Calendar, Instagram, Phone as TikTok } from 'lucide-react'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel'

// Simple SVG for TikTok if needed, or use Lucide's icon. Let's use generic text/icon for now.

interface PostDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    post: any | null
}

export function PostDetailsModal({ isOpen, onClose, post }: PostDetailsModalProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [caption, setCaption] = useState('')
    const [platform, setPlatform] = useState('instagram')
    const [dateStr, setDateStr] = useState('')

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        if (post) {
            setCaption(post.caption || '')
            setPlatform(post.platform || 'instagram')

            // Format for local datetime-local input
            const date = new Date(post.scheduled_at)
            // datetime-local format: YYYY-MM-DDThh:mm
            const tzoffset = date.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
            setDateStr(localISOTime)
        }
    }, [post])

    if (!post) return null

    const handleClose = () => {
        setIsEditing(false)
        onClose()
    }

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData()
        formData.append('caption', caption)
        formData.append('platform', platform)
        formData.append('date', new Date(dateStr).toISOString()) // convert back to UTC

        const result = await updatePost(post.id, formData)

        setIsSubmitting(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success('Post mis à jour !')
            setIsEditing(false)
            onClose()
        }
    }

    async function handleDelete() {
        if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce post ?')) return

        setIsDeleting(true)
        const result = await deletePost(post.id)
        setIsDeleting(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success('Post supprimé !')
            onClose()
        }
    }

    const mediaUrls = post.media_urls || []

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] overflow-hidden p-0 gap-0">
                <div className="w-full h-64 bg-muted relative group">
                    {mediaUrls.length > 1 ? (
                        <Carousel className="w-full h-full">
                            <CarouselContent>
                                {mediaUrls.map((url: string, idx: number) => (
                                    <CarouselItem key={idx} className="w-full h-64 relative">
                                        <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CarouselNext className="right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Carousel>
                    ) : mediaUrls.length === 1 ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={mediaUrls[0]} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted">
                            <Calendar className="h-8 w-8 mb-2 opacity-50" />
                            <span>Aucun média</span>
                        </div>
                    )}

                    {!isEditing && (
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="secondary" onClick={() => setIsEditing(true)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="p-6">
                    {isEditing ? (
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date et heure de publication</Label>
                                <Input
                                    type="datetime-local"
                                    id="date"
                                    value={dateStr}
                                    onChange={(e) => setDateStr(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="platform">Plateforme cible</Label>
                                <Select value={platform} onValueChange={(val) => setPlatform(val as string)}>
                                    <SelectTrigger id="platform">
                                        <SelectValue placeholder="Sélectionnez une plateforme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="instagram">Instagram</SelectItem>
                                        <SelectItem value="tiktok">TikTok</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="caption">Légende (Texte du post)</Label>
                                <Textarea
                                    id="caption"
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="Écrivez votre texte ici..."
                                    className="h-32 resize-none"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-primary font-medium">
                                    {post.platform === 'instagram' ? <Instagram className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">TK</div>}
                                    <span className="capitalize">{post.platform}</span>
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {format(new Date(post.scheduled_at), 'd MMM yyyy, HH:mm', { locale: fr })}
                                </div>
                            </div>

                            <div className="pt-2 border-t">
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                    {post.caption || <span className="text-muted-foreground italic">Aucune légende</span>}
                                </p>
                            </div>

                            <div className="flex gap-2 pt-4 lg:hidden">
                                <Button className="flex-1" variant="outline" onClick={() => setIsEditing(true)}>Modifier</Button>
                                <Button className="flex-1" variant="destructive" onClick={handleDelete} disabled={isDeleting}>Supprimer</Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
