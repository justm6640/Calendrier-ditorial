'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar, Image as ImageIcon, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface DayDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    date: Date | null
    posts: any[]
    onPostClick: (post: any) => void
    onAddPost: (date: Date) => void
}

export function DayDetailsModal({ isOpen, onClose, date, posts, onPostClick, onAddPost }: DayDetailsModalProps) {
    if (!date) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] sm:max-w-md p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50">
                <div className="flex flex-col max-h-[85vh]">
                    <DialogHeader className="p-6 pb-4 border-b border-border/40">
                        <DialogTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            {format(date, 'EEEE d MMMM yyyy', { locale: fr })}
                        </DialogTitle>
                        <DialogDescription>
                            {posts.length === 0
                                ? "Aucune publication planifiée pour ce jour."
                                : `${posts.length} publication${posts.length > 1 ? 's' : ''} planifiée${posts.length > 1 ? 's' : ''}`}
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="flex-1 px-1">
                        <div className="p-6 space-y-6">
                            <Button
                                onClick={() => date && onAddPost(date)}
                                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Programmer un post
                            </Button>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                                    <span>Publications</span>
                                    <span className="bg-muted px-2 py-0.5 rounded-full lowercase font-medium">
                                        {posts.length === 0 ? "Aucune" : `${posts.length} planifiée${posts.length > 1 ? 's' : ''}`}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {posts.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                                            <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                                            <p className="text-sm">Votre planning est vide.</p>
                                            <p className="text-xs text-center mt-1">Glissez-déposez un média sur ce jour pour créer un post.</p>
                                        </div>
                                    ) : (
                                        posts.map(post => {
                                            const imageUrl = post.media_urls?.[0]
                                            return (
                                                <div
                                                    key={post.id}
                                                    onClick={() => onPostClick(post)}
                                                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors group"
                                                >
                                                    <div className="w-12 h-12 rounded bg-muted flex-shrink-0 overflow-hidden relative">
                                                        {imageUrl ? (
                                                            /* eslint-disable-next-line @next/next/no-img-element */
                                                            <img src={imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                        ) : (
                                                            <div className="w-full h-full flex justify-center items-center bg-muted">
                                                                <ImageIcon className="h-4 w-4 opacity-50" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-semibold capitalize bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                                {post.platform}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {format(new Date(post.scheduled_at), 'HH:mm', { locale: fr })}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-foreground/80 truncate font-medium">
                                                            {post.caption || <span className="italic opacity-50">Sans légende</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <div className="p-4 bg-muted/30 border-t border-border/40 sm:hidden">
                        <Button variant="ghost" className="w-full" onClick={onClose}>
                            Fermer
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
