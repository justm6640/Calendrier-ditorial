'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, UploadCloud, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'

interface MediaAsset {
    name: string
    id: string
    url: string
}

export function LibraryView({ userId }: { userId: string }) {
    const [assets, setAssets] = useState<MediaAsset[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchMedia()
    }, [])

    async function fetchMedia() {
        setIsLoading(true)
        const { data, error } = await supabase.storage.from('media').list(userId, {
            sortBy: { column: 'created_at', order: 'desc' }
        })

        if (error) {
            toast.error('Erreur lors du chargement des médias.')
            setIsLoading(false)
            return
        }

        const fetchedAssets = data
            .filter((file) => file.name !== '.emptyFolderPlaceholder')
            .map((file) => ({
                name: file.name,
                id: file.id || crypto.randomUUID(),
                url: supabase.storage.from('media').getPublicUrl(`${userId}/${file.name}`).data.publicUrl
            }))

        setAssets(fetchedAssets)
        setIsLoading(false)
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)
        let hasError = false

        // Compression options
        const options = {
            maxSizeMB: 1.5,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        }

        for (let i = 0; i < files.length; i++) {
            let file = files[i]

            try {
                // Only compress images, ignore videos or other formats
                if (file.type.startsWith('image/')) {
                    toast.info(`Compression de ${file.name}...`)
                    const compressedFile = await imageCompression(file, options)
                    file = compressedFile // Replace original with compressed for upload
                }

                const filePath = `${userId}/${crypto.randomUUID()}-${file.name}`
                const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file)

                if (uploadError) {
                    toast.error(`Erreur lors de l'envoi de ${file.name}.`)
                    hasError = true
                }
            } catch (error) {
                console.error("Erreur de compression/upload:", error)
                toast.error(`Erreur lors du traitement de ${file.name}.`)
                hasError = true
            }
        }

        if (!hasError) {
            toast.success(`${files.length > 1 ? 'Fichiers envoyés' : 'Fichier envoyé'} avec succès !`)
        }

        e.target.value = ''

        fetchMedia()
        setIsUploading(false)
    }

    async function handleDelete(fileName: string) {
        const { error } = await supabase.storage.from('media').remove([`${userId}/${fileName}`])

        if (error) {
            toast.error('Erreur lors de la suppression.')
        } else {
            toast.success('Média supprimé.')
            fetchMedia()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Bibliothèque de Médias</h2>
                    <p className="text-muted-foreground">
                        Uploadez et gérez vos images et vidéos pour vos clients.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        className="hidden"
                        id="media-upload"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                    />
                    <label
                        htmlFor="media-upload"
                        className={buttonVariants({ variant: "default" }) + ` cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                        {isUploading ? 'Envoi...' : 'Uploader'}
                    </label>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : assets.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                    <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">Aucun média trouvé</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Commencez par uploader des images ou vidéos.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {assets.map((asset) => (
                        <Card key={asset.id} className="overflow-hidden group relative">
                            <CardContent className="p-0 aspect-square relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={asset.url}
                                    alt={asset.name}
                                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button variant="destructive" size="icon" onClick={() => handleDelete(asset.name)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
