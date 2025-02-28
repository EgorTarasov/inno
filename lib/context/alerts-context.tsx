// lib/context/alerts-context.tsx (updated with WebSockets)
"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Alert } from '@/lib/db'

interface AlertsContextType {
    alerts: Alert[]
    loading: boolean
    error: Error | null
    refreshAlerts: () => Promise<void>
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined)

export function AlertsProvider({ children }: { children: React.ReactNode }) {
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [socket, setSocket] = useState<WebSocket | null>(null)

    const fetchAlerts = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/alerts')
            if (!response.ok) throw new Error('Failed to fetch alerts')
            const data = await response.json()
            setAlerts(data)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)))
        } finally {
            setLoading(false)
        }
    }

    // WebSocket setup
    useEffect(() => {
        // Replace with your WebSocket server URL
        const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001')

        ws.onopen = () => {
            console.log('Connected to WebSocket server')
        }

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                if (data.type === 'ALERTS_UPDATE') {
                    fetchAlerts() // Refetch when notified about updates
                }
            } catch (err) {
                console.error('Error parsing WebSocket message:', err)
            }
        }

        ws.onerror = (error) => {
            console.error('WebSocket error:', error)
        }

        setSocket(ws)

        return () => {
            ws.close()
        }
    }, [])

    // Initial fetch
    useEffect(() => {
        fetchAlerts()
    }, [])

    const refreshAlerts = async () => {
        return fetchAlerts()
    }

    return (
        <AlertsContext.Provider value={{ alerts, loading, error, refreshAlerts }}>
            {children}
        </AlertsContext.Provider>
    )
}

export function useAlertsContext() {
    const context = useContext(AlertsContext)
    if (context === undefined) {
        throw new Error('useAlertsContext must be used within an AlertsProvider')
    }
    return context
}