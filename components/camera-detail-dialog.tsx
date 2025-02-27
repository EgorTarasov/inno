"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import type { CameraStream } from "@/lib/types"
import VideoDetection from "@/components/video-detection"

interface CameraDetailDialogProps {
    camera: CameraStream | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function CameraDetailDialog({ camera, open, onOpenChange }: CameraDetailDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{camera?.name}</DialogTitle>
                </DialogHeader>
                <div className="relative aspect-video bg-muted">
                    {camera?.streamUrl.endsWith('.m3u8') ? (
                        <VideoDetection
                            url={camera.streamUrl}
                            width="100%"
                            height="100%"
                            playing={true}
                            controls={true}
                        />
                    ) : (
                        <img
                            src={camera?.streamUrl || "/placeholder.svg"}
                            alt={`Camera feed from ${camera?.location}`}
                            className="h-full w-full object-cover"
                        />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-medium text-white">{camera?.name}</h3>
                                <div className="flex items-center text-sm text-white/80">
                                    <MapPin className="mr-1 h-4 w-4" />
                                    {camera?.location}
                                </div>
                            </div>
                            {camera?.status === "alert" && (
                                <Badge variant="destructive" className="text-sm">
                                    Alert
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}