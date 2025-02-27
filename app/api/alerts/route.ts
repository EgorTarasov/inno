import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { alerts } from '@/lib/db/schema';

export async function GET() {
    try {
        const allAlerts = await db.select().from(alerts).orderBy(alerts.timestamp);
        return NextResponse.json(allAlerts);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newAlert = await db.insert(alerts).values(body).returning();
        return NextResponse.json(newAlert[0]);
    } catch (error) {
        console.error('Error creating alert:', error);
        return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
    }
}