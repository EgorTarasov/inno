"use client"

import { AlertTriangle } from "lucide-react"
import type { Alert } from "@/lib/types"
import { AlertBadges } from "./alert-badges"

interface AlertsCompactViewProps {
    alerts: Alert[]
    onSelect: (alert: Alert) => void
}

export function AlertsCompactView({ alerts, onSelect }: AlertsCompactViewProps) {
    if (alerts.length === 0) {
        return (
            <div className="py-6 text-center text-sm text-muted-foreground">
                Оповещения не найдены.
            </div>
        )
    }

    return (
        <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2">
            {alerts.map((alert) => (
                <div
                    key={alert.id}
                    className="flex cursor-pointer items-center justify-between rounded-lg border p-2 hover:bg-muted/50"
                    onClick={() => onSelect(alert)}
                >
                    <div className="flex items-center gap-2">
                        <AlertTriangle
                            className={`h-4 w-4 ${alert.priority === "high" ? "text-destructive" : "text-muted-foreground"}`}
                        />
                        <div>
                            <p className="text-sm font-medium">{alert.title}</p>
                            <p className="text-xs text-muted-foreground">{alert.lawReference}</p>
                        </div>
                    </div>
                    <AlertBadges.Status status={alert.status} />
                </div>
            ))}
        </div>
    )
}