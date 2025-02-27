import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cameraStreams } from '@/lib/db/schema';

export async function GET() {
    try {
        const cameras = await db.select().from(cameraStreams);
        return NextResponse.json(cameras);
    } catch (error) {
        console.error('Error fetching cameras:', error);
        return NextResponse.json({ error: 'Failed to fetch cameras' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newCamera = await db.insert(cameraStreams).values(body).returning();
        return NextResponse.json(newCamera[0]);
    } catch (error) {
        console.error('Error creating camera:', error);
        return NextResponse.json({ error: 'Failed to create camera' }, { status: 500 });
    }
}