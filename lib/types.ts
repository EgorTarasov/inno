export interface CameraStream {
  id: string
  name: string
  location: string
  streamUrl: string
  status: "normal" | "alert" | "offline"
  lastUpdated: string
}

export interface Alert {
  id: string
  title: string
  description: string
  location: string
  timestamp: string
  status: "new" | "in-progress" | "resolved"
  priority: "low" | "medium" | "high"
  lawReference: string
  source: "Camera" | "Citizen"
  imageUrl: string | null
}

