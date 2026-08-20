import { NextResponse } from 'next/server';
import { getFromSheet, saveToSheet } from '@/lib/googleSheet';

export async function GET() {
    try {
        const data = await getFromSheet('pertemuan');
        return NextResponse.json({ status: 'success', data });
    } catch (error) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        await saveToSheet('pertemuan', body.data || body);
        return NextResponse.json({ status: 'success' });
    } catch (error) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
