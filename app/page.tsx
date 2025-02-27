import { Suspense } from "react"
import Dashboard from "@/components/dashboard"
import Loading from "@/components/loading"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<Loading />}>
        <Dashboard />
      </Suspense>
    </main>
  )
}

