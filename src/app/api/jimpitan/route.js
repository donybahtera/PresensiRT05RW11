import { NextResponse } from 'next/server';
import { getFromSheet, saveToSheet } from '@/lib/googleSheet';

export async function GET() {
    try {
        const data = await getFromSheet('jimpitan');
        return NextResponse.json({ status: 'success', data });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        await saveToSheet('jimpitan', data);
        return NextResponse.json({ status: 'success' });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
    }
}
