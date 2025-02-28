import { Suspense } from "react"
import Dashboard from "@/components/dashboard"
import Loading from "@/components/loading"
import { SessionProvider } from "next-auth/react"

export default function Home() {
  return (
    <>
      <script defer data-domain="inno.larek.tech" src="https://plausible-iwgkwss80g8s0k40www0ok0g.larek.tech/js/script.file-downloads.hash.outbound-links.js"></script>
      <script dangerouslySetInnerHTML={{
        __html: `window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`
      }} />

      <main className="min-h-screen bg-background">
        <Suspense fallback={<Loading />}>
          <Dashboard />
        </Suspense>
      </main>
    </>
  )
}