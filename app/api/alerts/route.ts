import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { alerts } from '@/lib/db/schema';

// Function to notify WebSocket server
async function notifyAlertsUpdate() {
    try {
        await fetch(process.env.WEBSOCKET_NOTIFY_URL || 'http://localhost:3001/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'ALERTS_UPDATE' }),
        });
    } catch (error) {
        console.error('Failed to notify WebSocket server:', error);
    }
}

// Get all alerts
export async function GET() {
    try {
        const allAlerts = await db.query.alerts.findMany();
        return NextResponse.json(allAlerts);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch alerts' },
            { status: 500 }
        );
    }
}

// Create a new alert
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const newAlert = await db
            .insert(alerts)
            .values(body)
            .returning();

        // Notify WebSocket server about the update
        await notifyAlertsUpdate();

        return NextResponse.json(newAlert[0], { status: 201 });
    } catch (error) {
        console.error('Error creating alert:', error);
        return NextResponse.json(
            { error: 'Failed to create alert' },
            { status: 500 }
        );
    }
}