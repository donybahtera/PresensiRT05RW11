'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
    { href: '/', label: 'Beranda', icon: 'fa-chart-pie' },
    { href: '/warga', label: 'Warga', icon: 'fa-house-user' },
    { href: '/pertemuan', label: 'Pertemuan', icon: 'fa-calendar-check' },
    { href: '/rekap', label: 'Rekap', icon: 'fa-chart-bar' },
    { href: '/jimpitan', label: 'Kas', icon: 'fa-book-open' },
];

export default function NavBar() {
    const pathname = usePathname();

    const isActive = (href) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
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
    );
}
