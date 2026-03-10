import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Instagram, Grip, MessageCircle, Heart, Copy } from "lucide-react"

interface FeedViewProps {
    posts?: any[]
    onPostClick?: (post: any) => void
}

export function FeedView({ posts = [], onPostClick }: FeedViewProps) {
    // Sort posts from newest to oldest for a realistic feed
    // But since it's a planning tool, maybe we show upcoming on top?
    // Let's sort ascending by date (soonest first)
    const sortedPosts = [...posts].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

    return (
        <div className="flex flex-col h-full bg-background rounded-xl border overflow-hidden">
            <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
                <h2 className="text-xl font-bold">Prévisualisation Feed</h2>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Instagram className="h-4 w-4" />
                    <span>Aperçu Grille Instagram</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-muted/5">
                {/* Max width to limit the grid size like a phone screen */}
                <div className="w-full max-w-md">
                    {sortedPosts.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-background rounded-xl border border-dashed">
                            Aucun post planifié.
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-1">
                            {sortedPosts.map(post => {
                                const imageUrl = post.media_urls?.[0];
                                return (
                                    <div
                                        key={post.id}
                                        onClick={() => onPostClick && onPostClick(post)}
                                        className="aspect-square bg-muted relative group cursor-pointer overflow-hidden border border-border/10"
                                    >
                                        {imageUrl ? (
                                            <>
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={imageUrl} alt="Post preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                {post.media_urls?.length > 1 && (
                                                    <div className="absolute top-1.5 right-1.5 z-10" title="Carrousel">
                                                        <Copy className="h-4 w-4 text-white drop-shadow-md" />
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-2 text-center break-words bg-background">
                                                {post.caption?.substring(0, 30) || 'Texte'}...
                                            </div>
                                        )}

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2">
                                            <div className="flex gap-4 font-semibold text-sm">
                                                <div className="flex items-center gap-1"><Heart className="h-4 w-4 fill-white" /> -</div>
                                                <div className="flex items-center gap-1"><MessageCircle className="h-4 w-4 fill-white" /> -</div>
                                            </div>
                                            <div className="mt-2 text-[10px] text-center line-clamp-2 text-white/80">
                                                {format(new Date(post.scheduled_at), 'dd MMM', { locale: fr })}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
