'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createPost } from '@/app/actions/post'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'

interface CreatePostModalProps {
    isOpen: boolean
    onClose: () => void
    selectedDate: Date | null
    asset: { name: string; url: string; id: string } | null
    recentAssets: { name: string; url: string; id: string }[]
}

export function CreatePostModal({ isOpen, onClose, selectedDate, asset, recentAssets }: CreatePostModalProps) {
    const [caption, setCaption] = useState('')
    const [platform, setPlatform] = useState('instagram')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedAssets, setSelectedAssets] = useState<{ name: string; url: string; id: string }[]>([])

    // Update selected assets when the initial dropped asset changes
    import('react').then(React => {
        React.useEffect(() => {
            if (asset && selectedAssets.length === 0 && isOpen) {
                setSelectedAssets([asset])
            }
            if (!isOpen) {
                // Reset on close
                setTimeout(() => setSelectedAssets([]), 300)
            }
        }, [asset, isOpen])
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData()
        formData.append('caption', caption)
        formData.append('platform', platform)
        if (selectedDate) formData.append('date', selectedDate.toISOString())

        // Use all selected assets
        const mediaUrls = selectedAssets.map(a => a.url)
        formData.append('mediaUrls', JSON.stringify(mediaUrls))

        const result = await createPost(formData)

        setIsSubmitting(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success('Post planifié !')
            setCaption('')
            onClose()
        }
    }

    if (!selectedDate || !asset) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Planifier un Post</DialogTitle>
                        <DialogDescription>
                            Programmé pour le {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">

                        {/* Asset Preview & Selection */}
                        <div className="space-y-3">
                            <Label>Médias du Post (Carrousel)</Label>

                            {/* Selected Assets row */}
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {selectedAssets.map((selAsset, idx) => (
                                    <div key={idx} className="w-20 h-20 flex-shrink-0 relative rounded-md overflow-hidden border-2 border-primary group">
                                        <img src={selAsset.url} alt={`Selected ${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setSelectedAssets(prev => prev.filter(a => a.id !== selAsset.id))}
                                            className="absolute top-1 right-1 bg-black/50 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}

                                {selectedAssets.length < 10 && (
                                    <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center border-2 border-dashed rounded-md bg-muted text-muted-foreground">
                                        <Plus className="h-6 w-6 opacity-50" />
                                    </div>
                                )}
                            </div>

                            {/* Recent Assets to pick from */}
                            <div className="pt-2 border-t">
                                <Label className="text-xs text-muted-foreground mb-2 block">Ajouter depuis les médias récents :</Label>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {recentAssets.filter(ra => !selectedAssets.find(sa => sa.id === ra.id)).map(ra => (
                                        <button
                                            key={ra.id}
                                            type="button"
                                            onClick={() => setSelectedAssets(prev => [...prev, ra])}
                                            className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden border border-border hover:border-primary transition-colors"
                                        >
                                            <img src={ra.url} alt={ra.name} className="w-full h-full object-cover opacity-70 hover:opacity-100" />
                                        </button>
                                    ))}
                                </div>
                            </div>
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
                                className="h-24 resize-none"
                                required
                            />
                        </div>

                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Planification...' : 'Planifier'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
