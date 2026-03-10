'use client'

import { useDraggable } from '@dnd-kit/core'
import { Card, CardContent } from '@/components/ui/card'

interface DraggableAssetProps {
    id: string
    url: string
    name: string
}

export function DraggableAsset({ id, url, name }: DraggableAssetProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: id,
        data: { name, url }
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
    } : undefined

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
            <Card className="overflow-hidden group relative w-full aspect-square">
                <CardContent className="p-0 w-full h-full relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={url}
                        alt={name}
                        className="object-cover w-full h-full pointer-events-none"
                    />
                </CardContent>
            </Card>
        </div>
    )
}
