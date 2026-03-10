'use client'

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Instagram, Copy, Heart, MessageCircle } from "lucide-react"

interface PublicFeedViewProps {
    agencyName: string
    posts: any[]
}

export function PublicFeedView({ agencyName, posts = [] }: PublicFeedViewProps) {
    const sortedPosts = [...posts].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

    return (
        <div className="max-w-md mx-auto bg-background min-h-screen flex flex-col border-x">
            {/* Header style Instagram */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px]">
                        <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden border border-background">
                            <span className="text-[10px] font-bold">{agencyName.substring(0, 2).toUpperCase()}</span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold leading-none">{agencyName}</span>
                        <span className="text-[10px] text-muted-foreground">Calendrier Éditorial</span>
                    </div>
                </div>
                <Instagram className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="flex-1 p-1">
                {sortedPosts.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        Aucun post planifié pour le moment.
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-[2px]">
                        {sortedPosts.map(post => {
                            const imageUrl = post.media_urls?.[0];
                            return (
                                <div
                                    key={post.id}
                                    className="aspect-square bg-muted relative group overflow-hidden"
                                >
                                    {imageUrl ? (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={imageUrl}
                                                alt="Post preview"
                                                className="w-full h-full object-cover"
                                            />
                                            {post.media_urls?.length > 1 && (
                                                <div className="absolute top-2 right-2 z-10">
                                                    <Copy className="h-3.5 w-3.5 text-white drop-shadow-md" />
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground p-2 text-center break-words bg-background border">
                                            {post.caption?.substring(0, 30) || 'Texte'}...
                                        </div>
                                    )}

                                    {/* Info Overlay (Visible on tap/hover or always subtle?) */}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white px-1">
                                        <div className="flex gap-2 font-semibold text-[10px]">
                                            <div className="flex items-center gap-0.5"><Heart className="h-3 w-3 fill-white" /></div>
                                            <div className="flex items-center gap-0.5"><MessageCircle className="h-3 w-3 fill-white" /></div>
                                        </div>
                                        <div className="mt-1 text-[9px] font-medium text-center bg-black/40 px-1 rounded">
                                            {format(new Date(post.scheduled_at), 'dd MMM', { locale: fr })}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="p-8 text-center border-t bg-muted/5">
                <p className="text-xs text-muted-foreground">
                    Ceci est une prévisualisation privée du calendrier éditorial de <strong>{agencyName}</strong>.
                </p>
            </div>
        </div>
    )
}
