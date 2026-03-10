'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar, Image as ImageIcon } from 'lucide-react'

interface DayDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    date: Date | null
    posts: any[]
    onPostClick: (post: any) => void
}

export function DayDetailsModal({ isOpen, onClose, date, posts, onPostClick }: DayDetailsModalProps) {
    if (!date) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
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

                <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
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
            </DialogContent>
        </Dialog>
    )
}
