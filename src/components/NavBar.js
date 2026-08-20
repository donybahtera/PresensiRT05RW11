'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminSession } from '@/lib/auth';

const navLinks = [
    { href: '/', label: 'Beranda', icon: 'fa-chart-pie' },
    { href: '/warga', label: 'Warga', icon: 'fa-house-user' },
    { href: '/pertemuan', label: 'Pertemuan', icon: 'fa-calendar-check' },
    { href: '/rekap', label: 'Rekap', icon: 'fa-chart-bar' },
    { href: '/jimpitan', label: 'Kas', icon: 'fa-book-open' },
];

export default function NavBar() {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const { isAdmin, loading, logout } = useAdminSession();

    const isActive = (href) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    const handleLogout = async () => {
        setOpen(false);
        await logout();
    };

    return (
        <>
            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-slate-100/50 border border-slate-200 rounded-full">
                    {navLinks.map(({ href, label, icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={
                                isActive(href)
                                    ? 'px-4 py-2 text-sm font-semibold rounded-full transition-all bg-white text-indigo-600 shadow-sm border border-slate-200'
                                    : 'px-4 py-2 text-sm font-medium rounded-full transition-all text-slate-500 hover:text-indigo-600 hover:bg-white/60'
                            }
                        >
                            <i className={`fa-solid ${icon} mr-1.5 opacity-70`}></i>
                            {label}
                        </Link>
                    ))}
                </div>

                {/* Login / Logout button */}
                {!loading && (
                    isAdmin ? (
                        <div className="flex items-center gap-2 ml-1">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                                <i className="fa-solid fa-shield-halved text-indigo-500"></i>
                                Admin
                            </span>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                                title="Logout"
                            >
                                <i className="fa-solid fa-right-from-bracket mr-1"></i>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="ml-1 px-4 py-2 text-sm font-semibold rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
                        >
                            <i className="fa-solid fa-right-to-bracket mr-1.5"></i>
                            Login Admin
                        </Link>
                    )
                )}
            </div>

            {/* Mobile: hamburger button */}
            <button
                className="sm:hidden p-2 rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm"
                onClick={() => setOpen(!open)}
                aria-label="Menu"
            >
                <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
            </button>

            {/* Mobile dropdown menu */}
            {open && (
                <div className="sm:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-50 py-2">
                    {navLinks.map(({ href, label, icon }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all
                                ${isActive(href)
                                    ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-500'
                                    : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <i className={`fa-solid ${icon} w-4`}></i>
                            {label}
                        </Link>
                    ))}

                    {/* Auth row */}
                    <div className="mx-5 my-2 pt-2 border-t border-slate-100">
                        {!loading && (
                            isAdmin ? (
                                <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
                                        <i className="fa-solid fa-shield-halved"></i> Mode Admin Aktif
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="text-xs font-semibold text-rose-500 hover:text-rose-700"
                                    >
                                        <i className="fa-solid fa-right-from-bracket mr-1"></i>Logout
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 text-white"
                                >
                                    <i className="fa-solid fa-right-to-bracket"></i>
                                    Login Admin
                                </Link>
                            )
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
