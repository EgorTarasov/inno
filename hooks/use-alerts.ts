// hooks/use-alerts.ts
import { useAlertsContext } from '@/lib/context/alerts-context'

export function useAlerts() {
    return useAlertsContext()
}