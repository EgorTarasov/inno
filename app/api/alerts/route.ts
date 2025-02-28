import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { alerts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

// Get a single alert
export async function GET(
    request: Request,
    { params }: { params: { id: number } }
) {
    try {
        const id = params.id;
        const alert = await db.query.alerts.findFirst({
            where: eq(alerts.id, id)
        });

        if (!alert) {
            return NextResponse.json(
                { error: 'Alert not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(alert);
    } catch (error) {
        console.error('Error fetching alert:', error);
        return NextResponse.json(
            { error: 'Failed to fetch alert' },
            { status: 500 }
        );
    }
}

// Update a single alert
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();

        const updatedAlert = await db
            .update(alerts)
            .set(body)
            .where(eq(alerts.id, id))
            .returning();

        if (!updatedAlert.length) {
            return NextResponse.json(
                { error: 'Alert not found' },
                { status: 404 }
            );
        }

        // Notify WebSocket server about the update
        await notifyAlertsUpdate();

        return NextResponse.json(updatedAlert[0]);
    } catch (error) {
        console.error('Error updating alert:', error);
        return NextResponse.json(
            { error: 'Failed to update alert' },
            { status: 500 }
        );
    }
}

// Delete a single alert
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        const deletedAlert = await db
            .delete(alerts)
            .where(eq(alerts.id, id))
            .returning();

        if (!deletedAlert.length) {
            return NextResponse.json(
                { error: 'Alert not found' },
                { status: 404 }
            );
        }

        // Notify WebSocket server about the update
        await notifyAlertsUpdate();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting alert:', error);
        return NextResponse.json(
            { error: 'Failed to delete alert' },
            { status: 500 }
        );
    }
}