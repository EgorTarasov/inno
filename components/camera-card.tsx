"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Expand, MapPin } from "lucide-react"
import type { CameraStream } from "@/lib/types"
import dynamic from "next/dynamic"

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false })

interface CameraCardProps {
    camera: CameraStream
    onSelect: (camera: CameraStream) => void
}

export default function CameraCard({ camera, onSelect }: CameraCardProps) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0 relative">
                <div className="relative aspect-video bg-muted">
                    {camera.streamUrl.endsWith('.m3u8') ? (
                        <ReactPlayer
                            url={camera.streamUrl}
                            width="100%"
                            height="100%"
                            playing={false}
                            controls={true}
                            config={{
                                file: {
                                    forceHLS: true,
                                }
                            }}
                        />
                    ) : (
                        <img
                            src={camera.streamUrl || "/placeholder.svg"}
                            alt={`Camera feed from ${camera.location}`}
                            className="h-full w-full object-cover"
                        />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-white">{camera.name}</h3>
                                <div className="flex items-center text-xs text-white/80">
                                    <MapPin className="mr-1 h-3 w-3" />
                                    {camera.location}
                                </div>
                            </div>
                            {camera.status === "alert" && <Badge variant="destructive">Alert</Badge>}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 bg-black/30 text-white hover:bg-black/50"
                        onClick={() => onSelect(camera)}
                    >
                        <Expand className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}