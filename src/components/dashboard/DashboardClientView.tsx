'use client'

import { useState, useEffect } from 'react'
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { CalendarView } from '@/components/calendar/CalendarView'
import { FeedView } from '@/components/calendar/FeedView'
import { DraggableAsset } from '@/components/library/DraggableAsset'
import { CreatePostModal } from '@/components/posts/CreatePostModal'
import { PostDetailsModal } from '@/components/posts/PostDetailsModal'
import { DayDetailsModal } from '@/components/posts/DayDetailsModal'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Calendar, Grid3X3 } from 'lucide-react'

interface MediaAsset {
    id: string
    name: string
    url: string
}

export function DashboardClientView({ userId, agencyName, initialPosts = [] }: { userId: string, agencyName: string, initialPosts?: any[] }) {
    const [assets, setAssets] = useState<MediaAsset[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeAsset, setActiveAsset] = useState<MediaAsset | null>(null)
    const [viewMode, setViewMode] = useState<'calendar' | 'feed'>('calendar')

    // Modals State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [createSelectedDate, setCreateSelectedDate] = useState<Date | null>(null)

    const [isDayModalOpen, setIsDayModalOpen] = useState(false)
    const [selectedDayContext, setSelectedDayContext] = useState<Date | null>(null)

    const [isPostModalOpen, setIsPostModalOpen] = useState(false)
    const [selectedPostContext, setSelectedPostContext] = useState<any | null>(null)

    const supabase = createClient()

    useEffect(() => {
        async function fetchRecentMedia() {
            const { data, error } = await supabase.storage.from('media').list(userId, {
                limit: 10,
                sortBy: { column: 'created_at', order: 'desc' }
            })

            if (!error && data) {
                const fetchedAssets = data
                    .filter(f => f.name !== '.emptyFolderPlaceholder')
                    .map(f => ({
                        id: f.id || crypto.randomUUID(),
                        name: f.name,
                        url: supabase.storage.from('media').getPublicUrl(`${userId}/${f.name}`).data.publicUrl
                    }))
                setAssets(fetchedAssets)
            }
            setIsLoading(false)
        }
        fetchRecentMedia()
    }, [userId, supabase])

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string)
        const asset = assets.find(a => a.id === event.active.id)
        if (asset) setActiveAsset(asset)
    }

    function handleDragEnd(event: DragEndEvent) {
        setActiveId(null)
        setActiveAsset(null)

        const { over, active } = event

        if (over && over.id.toString().startsWith('day-')) {
            // Extract date from id "day-2026-03-09T00:00:00.000Z"
            const dateStr = over.id.toString().replace('day-', '')
            const droppedDate = new Date(dateStr)

            const droppedAsset = assets.find(a => a.id === active.id)

            if (droppedAsset) {
                setCreateSelectedDate(droppedDate)
                setActiveAsset(droppedAsset) // Reuse state for modal
                setIsCreateModalOpen(true)
            }
        }
    }

    // Handlers for interaction
    const handleDayClick = (date: Date) => {
        setSelectedDayContext(date)
        setIsDayModalOpen(true)
    }

    const handlePostClick = (post: any) => {
        setSelectedPostContext(post)
        setIsPostModalOpen(true)
        // If coming from Day Modal, don't close Day Modal automatically, 
        // they can overlap, or we can close it. We'll leave it up open underneath.
    }

    return (
        <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToWindowEdges]}
        >
            <div className="flex h-[calc(100vh-8rem)] gap-6">

                {/* Left Side: Mini Library */}
                <div className="w-64 flex-shrink-0 flex flex-col bg-muted/10 border rounded-xl overflow-hidden">
                    <div className="p-4 border-b bg-muted/20">
                        <h3 className="font-semibold text-sm">Récemment Ajoutés</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>
                        ) : assets.length === 0 ? (
                            <div className="text-center text-xs text-muted-foreground p-4">Bibliothèque vide.<br />Ajoutez des médias via l'onglet Bibliothèque.</div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {assets.map(asset => (
                                    <DraggableAsset key={asset.id} id={asset.id} name={asset.name} url={asset.url} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Calendar or Feed */}
                <div className="flex-1 min-w-0 flex flex-col gap-4">
                    {/* View Toggle */}
                    <div className="flex justify-end">
                        <div className="inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-auto">
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${viewMode === 'calendar' ? 'bg-background text-foreground shadow-sm' : 'hover:bg-muted-foreground/10'}`}
                            >
                                <Calendar className="w-4 h-4 mr-2" />
                                Calendrier
                            </button>
                            <button
                                onClick={() => setViewMode('feed')}
                                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${viewMode === 'feed' ? 'bg-background text-foreground shadow-sm' : 'hover:bg-muted-foreground/10'}`}
                            >
                                <Grid3X3 className="w-4 h-4 mr-2" />
                                Feed IG
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0">
                        {viewMode === 'calendar' ? (
                            <CalendarView
                                posts={initialPosts}
                                onDayClick={handleDayClick}
                                onPostClick={handlePostClick}
                            />
                        ) : (
                            <FeedView
                                posts={initialPosts}
                                onPostClick={handlePostClick}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Drag Overlay for smooth visuals */}
            <DragOverlay dropAnimation={{
                duration: 250,
                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}>
                {activeId && activeAsset ? (
                    <div className="w-24 h-24 rounded-md overflow-hidden shadow-xl border-2 border-primary rotate-6">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={activeAsset.url} alt="Drag preview" className="w-full h-full object-cover" />
                    </div>
                ) : null}
            </DragOverlay>

            <CreatePostModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                selectedDate={createSelectedDate}
                asset={activeAsset}
                recentAssets={assets}
            />

            <DayDetailsModal
                isOpen={isDayModalOpen}
                onClose={() => setIsDayModalOpen(false)}
                date={selectedDayContext}
                posts={initialPosts.filter(p => selectedDayContext && new Date(p.scheduled_at).toDateString() === selectedDayContext.toDateString())}
                onPostClick={handlePostClick}
            />

            <PostDetailsModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                post={selectedPostContext}
            />
        </DndContext>
    )
}
