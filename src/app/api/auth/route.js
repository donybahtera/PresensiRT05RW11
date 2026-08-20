import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getDoc } from '@/lib/googleSheet';

const SESSION_COOKIE = 'admin_session';
const SESSION_VALUE = 'authenticated_admin_rt05';

// Ambil daftar user dari sheet 'Data user'
async function getUsersFromSheet() {
    try {
        const doc = await getDoc();
        // Cari sheet 'Data user' (case-insensitive)
        const matchedTitle = Object.keys(doc.sheetsByTitle).find(
            k => k.toLowerCase() === 'data user'
        );
        if (!matchedTitle) return null;

        const sheet = doc.sheetsByTitle[matchedTitle];
        try {
            await sheet.loadHeaderRow();
        } catch {
            await sheet.setHeaderRow(['username', 'password', 'role']);
        }

        const rows = await sheet.getRows();
        return rows.map(r => ({
            username: r.get('username') || '',
            password: r.get('password') || '',
            role: r.get('role') || 'admin',
        }));
    } catch (err) {
        console.error('Error reading Data user sheet:', err);
        return null;
    }
}

// GET: Cek apakah user sudah login sebagai admin
export async function GET() {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE);
    const isAdmin = session?.value === SESSION_VALUE;
    return NextResponse.json({ isAdmin });
}

// POST: Login admin — cek credentials dari Google Sheets
export async function POST(req) {
    try {
        const { username, password } = await req.json();

        // Coba baca dari Google Sheets dulu
        const users = await getUsersFromSheet();

        let isValid = false;

        if (users && users.length > 0) {
            // Cocokkan dari sheet
            isValid = users.some(
                u => u.username === username && u.password === password
            );
        } else {
            // Fallback ke env variable jika sheet kosong/tidak tersedia
            const validUser = process.env.ADMIN_USERNAME || 'admin';
            const validPass = process.env.ADMIN_PASSWORD || 'rt05rw11admin';
            isValid = (username === validUser && password === validPass);
        }

        if (isValid) {
            const response = NextResponse.json({ success: true, message: 'Login berhasil!' });
            response.cookies.set(SESSION_COOKIE, SESSION_VALUE, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 hari
                path: '/',
            });
            return response;
        } else {
            return NextResponse.json(
                { success: false, message: 'Username atau password salah.' },
                { status: 401 }
            );
        }
    } catch (err) {
        console.error('Login error:', err);
        return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
    }
}

// DELETE: Logout admin
export async function DELETE() {
    const response = NextResponse.json({ success: true, message: 'Logout berhasil.' });
    response.cookies.set(SESSION_COOKIE, '', {
        httpOnly: true,
        maxAge: 0,
        path: '/',
    });
    return response;
}
