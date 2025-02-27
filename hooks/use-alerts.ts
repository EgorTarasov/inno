import { useState, useEffect } from 'react';
import type { Alert } from '@/lib/db';

export function useAlerts() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchAlerts() {
            try {
                const response = await fetch('/api/alerts');
                if (!response.ok) throw new Error('Failed to fetch alerts');
                const data = await response.json();
                setAlerts(data);
            } catch (err) {
                setError(err instanceof Error ? err : new Error(String(err)));
            } finally {
                setLoading(false);
            }
        }

        fetchAlerts();
    }, []);

    return { alerts, loading, error };
}