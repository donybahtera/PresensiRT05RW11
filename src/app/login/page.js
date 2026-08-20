'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [checking, setChecking] = useState(true);

    // Kalau sudah login, langsung redirect ke dashboard
    useEffect(() => {
        fetch('/api/auth')
            .then(r => r.json())
            .then(data => {
                if (data.isAdmin) router.replace('/');
                else setChecking(false);
            })
            .catch(() => setChecking(false));
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                router.replace('/');
                router.refresh();
            } else {
                setError(data.message || 'Login gagal.');
            }
        } catch {
            setError('Terjadi kesalahan jaringan. Coba lagi.');
        }
        setLoading(false);
    };

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <i className="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-400"></i>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 flex items-center justify-center p-4">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100 p-8 md:p-10">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 mb-4">
                            <i className="fa-solid fa-shield-halved text-2xl"></i>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Login Admin</h1>
                        <p className="text-sm text-slate-500 mt-1.5">Masuk untuk mengelola data RT 05 RW 11</p>
                    </div>

                    {/* Info Banner */}
                    <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl mb-6 text-sm text-indigo-700">
                        <i className="fa-solid fa-circle-info text-indigo-400 mt-0.5 shrink-0"></i>
                        <p>
                            Tamu dan warga dapat mengunjungi website tanpa login untuk
                            <strong> melihat</strong> data. Hanya admin yang bisa mengedit.
                        </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="flex items-center gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl mb-5 text-sm text-rose-700 animate-fade-in">
                            <i className="fa-solid fa-circle-exclamation text-rose-500 shrink-0"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i className="fa-solid fa-user text-slate-400 text-sm"></i>
                                </div>
                                <input
                                    type="text"
                                    required
                                    autoComplete="username"
                                    placeholder="Masukkan username"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                    value={form.username}
                                    onChange={e => setForm({ ...form, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i className="fa-solid fa-lock text-slate-400 text-sm"></i>
                                </div>
                                <input
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    placeholder="Masukkan password"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2.5 py-3 px-6 mt-2 text-sm font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 active:bg-indigo-800 transition-all duration-200 focus:ring-4 focus:ring-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-right-to-bracket"></i>
                                    Masuk sebagai Admin
                                </>
                            )}
                        </button>
                    </form>

                    {/* Back link */}
                    <div className="text-center mt-6">
                        <a
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                        >
                            <i className="fa-solid fa-arrow-left text-xs"></i>
                            Kembali ke Dashboard (Mode Tamu)
                        </a>
                    </div>
                </div>

                {/* Bottom label */}
                <p className="text-center text-xs text-slate-400 mt-5">
                    Presensi RT 05 RW 11 &mdash; Sistem Manajemen Warga
                </p>
            </div>
        </div>
    );
}
