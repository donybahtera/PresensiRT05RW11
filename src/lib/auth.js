'use client';

import { useState, useEffect } from 'react';

/**
 * Hook untuk mengecek apakah user sudah login sebagai admin.
 * Dipakai di setiap halaman client untuk mengontrol visibilitas tombol/form.
 */
export function useAdminSession() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/auth')
            .then(r => r.json())
            .then(data => {
                setIsAdmin(data.isAdmin === true);
            })
            .catch(() => setIsAdmin(false))
            .finally(() => setLoading(false));
    }, []);

    const logout = async () => {
        await fetch('/api/auth', { method: 'DELETE' });
        setIsAdmin(false);
        window.location.reload();
    };

    return { isAdmin, loading, logout };
}
