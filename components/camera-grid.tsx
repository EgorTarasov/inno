"use client"

import { useState } from "react"
import type { CameraStream } from "@/lib/types"
import CameraCard from "./camera-card"
import CameraDetailDialog from "./camera-detail-dialog"

interface CameraGridProps {
  cameraStreams: CameraStream[]
}

export default function CameraGrid({ cameraStreams }: CameraGridProps) {
  const [selectedCamera, setSelectedCamera] = useState<CameraStream | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cameraStreams.map((camera) => (
          <CameraCard
            key={camera.id}
            camera={camera}
            onSelect={setSelectedCamera}
          />
        ))}
      </div>

      <CameraDetailDialog
        camera={selectedCamera}
        open={!!selectedCamera}
        onOpenChange={(open) => !open && setSelectedCamera(null)}
      />
    </>
  )
}