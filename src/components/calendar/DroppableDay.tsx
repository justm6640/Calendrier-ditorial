'use client'

import { useDroppable } from '@dnd-kit/core'
import { format, isSameDay, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Copy } from 'lucide-react'

interface DroppableDayProps {
    date: Date
    posts?: any[]
    onPostClick?: (post: any) => void
}

export function DroppableDay({ date, posts = [], onPostClick }: DroppableDayProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: `day-${date.toISOString()}`,
        data: { date }
    })

    // To display posts visually later, we would pass them as props here
    return (
        <div
            ref={setNodeRef}
            className={cn(
                "min-h-[120px] p-2 border border-border/50 transition-colors bg-card",
                isOver && "bg-primary/10 border-primary",
                isToday(date) && "border-primary/50 bg-primary/5"
            )}
        >
            <div className="flex justify-between items-start">
                <span className={cn(
                    "text-sm font-medium",
                    isToday(date) ? "text-primary" : "text-muted-foreground"
                )}>
                    {format(date, 'd', { locale: fr })}
                </span>
            </div>
            <div className="mt-2 space-y-1">
                {posts.map(post => {
                    const imageUrl = post.media_urls?.[0]; // Get first media if available
                    return (
                        <div
                            key={post.id}
                            onClick={(e) => {
                                e.stopPropagation() // Prevent day click from triggering
                                if (onPostClick) onPostClick(post)
                            }}
                            className="text-xs bg-muted/30 border border-border/50 rounded-md p-1.5 flex items-center gap-2 overflow-hidden shadow-sm hover:bg-muted/50 transition-colors cursor-pointer group"
                        >
                            {imageUrl && (
                                <div className="w-6 h-6 rounded flex-shrink-0 bg-muted overflow-hidden relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={imageUrl} alt="" className="object-cover w-full h-full opacity-90 group-hover:opacity-100" />
                                    {post.media_urls?.length > 1 && (
                                        <div className="absolute top-0.5 right-0.5" title="Carrousel">
                                            <Copy className="h-2.5 w-2.5 text-white drop-shadow-md" />
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="flex-1 truncate font-medium text-foreground/80">
                                {post.caption || 'Post prévu'}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
