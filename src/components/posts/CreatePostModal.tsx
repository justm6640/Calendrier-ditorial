'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState, useEffect } from 'react'
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
    useEffect(() => {
        if (asset && selectedAssets.length === 0 && isOpen) {
            setSelectedAssets([asset])
        }
        if (!isOpen) {
            // Reset on close
            const timer = setTimeout(() => setSelectedAssets([]), 300)
            return () => clearTimeout(timer)
        }
    }, [asset, isOpen])

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

    if (!selectedDate) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] sm:max-w-[500px] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50">
                <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>Planifier un Post</DialogTitle>
                        <DialogDescription>
                            Programmé pour le {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] px-1">
                        <div className="grid gap-6 py-4">

                            {/* Asset Preview & Selection */}
                            <div className="space-y-4">
                                <Label className="text-sm font-semibold">Médias du Post (Carrousel)</Label>

                                {/* Selected Assets row */}
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    {selectedAssets.map((selAsset, idx) => (
                                        <div key={idx} className="w-24 h-24 flex-shrink-0 relative rounded-xl overflow-hidden border-2 border-primary shadow-md group">
                                            <img src={selAsset.url} alt={`Selected ${idx}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setSelectedAssets(prev => prev.filter(a => a.id !== selAsset.id))}
                                                className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                            <div className="absolute bottom-1 left-1 bg-primary text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white">
                                                {idx + 1}
                                            </div>
                                        </div>
                                    ))}

                                    {selectedAssets.length < 10 && (
                                        <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center border-2 border-dashed rounded-xl bg-muted/30 text-muted-foreground hover:bg-muted/50 transition-colors cursor-default">
                                            <Plus className="h-8 w-8 opacity-20" />
                                        </div>
                                    )}
                                </div>

                                {/* Recent Assets to pick from */}
                                <div className="pt-4 border-t border-border/40">
                                    <Label className="text-xs font-medium text-muted-foreground mb-3 block uppercase tracking-wider">Ajouter depuis vos médias récents</Label>
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        {recentAssets.filter(ra => !selectedAssets.find(sa => sa.id === ra.id)).map(ra => (
                                            <button
                                                key={ra.id}
                                                type="button"
                                                onClick={() => setSelectedAssets(prev => [...prev, ra])}
                                                className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-border/50 hover:border-primary transition-all hover:scale-105 active:scale-95 shadow-sm"
                                            >
                                                <img src={ra.url} alt={ra.name} className="w-full h-full object-cover opacity-80 hover:opacity-100" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="platform" className="text-sm font-semibold">Plateforme cible</Label>
                                <Select value={platform} onValueChange={(val) => setPlatform(val as string)}>
                                    <SelectTrigger id="platform" className="h-11">
                                        <SelectValue placeholder="Sélectionnez une plateforme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="instagram">Instagram</SelectItem>
                                        <SelectItem value="tiktok">TikTok</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="caption" className="text-sm font-semibold">Légende (Texte du post)</Label>
                                <Textarea
                                    id="caption"
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="Écrivez votre texte ici..."
                                    className="min-h-[120px] resize-none focus-visible:ring-primary h-auto"
                                    required
                                />
                            </div>

                        </div>
                    </ScrollArea>
                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting} className="flex-1 sm:flex-none">
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none px-8">
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Planification...
                                </div>
                            ) : 'Planifier'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
