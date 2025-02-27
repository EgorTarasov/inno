import { useState, useEffect } from 'react';
import type { CameraStream } from '@/lib/db';

export function useCameras() {
    const [cameras, setCameras] = useState<CameraStream[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchCameras() {
            try {
                const response = await fetch('/api/cameras');
                if (!response.ok) throw new Error('Failed to fetch cameras');
                const data = await response.json();
                setCameras(data);
            } catch (err) {
                setError(err instanceof Error ? err : new Error(String(err)));
            } finally {
                setLoading(false);
            }
        }

        fetchCameras();
    }, []);

    return { cameras, loading, error };
}