'use client';

import { useState, useEffect } from 'react';
import { formatTanggal } from '@/lib/utils';

export default function RekapPage() {
    const [wargaList, setWargaList] = useState([]);
    const [pertemuanList, setPertemuanList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Default: awal bulan ini sampai hari ini
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];

    const [tglDari, setTglDari] = useState(firstDay);
    const [tglSampai, setTglSampai] = useState(today);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resW, resP] = await Promise.all([fetch('/api/warga'), fetch('/api/pertemuan')]);
            const jsonW = await resW.json();
            const jsonP = await resP.json();

            const wList = (jsonW.data || []).sort((a, b) => a.nama.localeCompare(b.nama));
            const pList = jsonP.data || [];

            setWargaList(wList);
            setPertemuanList(pList);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    // Filter pertemuan by date range
    const filtered = pertemuanList
        .filter(p => {
            if (!p.tanggal) return false;
            const tgl = p.tanggal.substring(0, 10);
            return tgl >= tglDari && tgl <= tglSampai;
        })
        .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

    // Build stats per warga
    const getHadir = (wargaId, pertemuan) => {
        return pertemuan.presensiData?.[wargaId]?.hadir === 1;
    };

    const statsPerWarga = wargaList.map(w => {
        const total = filtered.length;
        const hadir = filtered.filter(p => getHadir(w.id, p)).length;
        const pct = total > 0 ? Math.round((hadir / total) * 100) : 0;
        return { ...w, hadir, total, pct };
    });

    const totalPertemuan = filtered.length;
    const rataHadir = wargaList.length > 0
        ? Math.round(filtered.reduce((s, p) => {
            const hadirCount = wargaList.filter(w => getHadir(w.id, p)).length;
            return s + hadirCount;
        }, 0) / (filtered.length * wargaList.length || 1) * 100)
        : 0;

    const pctColor = (pct) => {
        if (pct >= 80) return 'text-emerald-600';
        if (pct >= 50) return 'text-amber-600';
        return 'text-rose-600';
    };

    const pctBadge = (pct) => {
        if (pct >= 80) return 'bg-emerald-100 text-emerald-700';
        if (pct >= 50) return 'bg-amber-100 text-amber-700';
        return 'bg-rose-100 text-rose-700';
    };

    return (
        <div className="space-y-8">
            {/* Header + Filter */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <i className="fa-solid fa-chart-bar text-indigo-500"></i> Rekap Presensi
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Filter berdasarkan rentang tanggal pertemuan.</p>
                    </div>
                    <div className="flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Dari Tanggal</label>
                            <input type="date" value={tglDari} onChange={e => setTglDari(e.target.value)}
                                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Sampai Tanggal</label>
                            <input type="date" value={tglSampai} onChange={e => setTglSampai(e.target.value)}
                                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all" />
                        </div>
                    </div>
                </div>

                {/* Summary chips */}
                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold">
                        <i className="fa-solid fa-calendar-check"></i>
                        {totalPertemuan} Pertemuan dalam periode
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-semibold">
                        <i className="fa-solid fa-users"></i>
                        {wargaList.length} Warga
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${pctBadge(rataHadir)}`}>
                        <i className="fa-solid fa-percent"></i>
                        Rata-rata Kehadiran: {rataHadir}%
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                    <i className="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-400"></i>
                    <p className="text-sm font-medium">Memuat data rekap...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                    <i className="fa-solid fa-calendar-xmark text-4xl text-slate-300 mb-4"></i>
                    <p className="text-slate-500 font-medium">Tidak ada pertemuan dalam periode ini.</p>
                    <p className="text-sm text-slate-400 mt-1">Coba ubah rentang tanggal di atas.</p>
                </div>
            ) : (
                <>
                    {/* Ringkasan per Warga */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
                        <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                            <i className="fa-solid fa-ranking-star text-indigo-400"></i>
                            Ringkasan Kehadiran per Warga
                        </h3>
                        <div className="space-y-3">
                            {statsPerWarga
                                .sort((a, b) => b.pct - a.pct)
                                .map((w) => (
                                    <div key={w.id} className="flex items-center gap-4">
                                        <div className="w-36 shrink-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate">{w.nama}</p>
                                            <p className="text-xs text-slate-400">{w.hadir}/{w.total} pertemuan</p>
                                        </div>
                                        <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className={`h-2.5 rounded-full transition-all duration-500 ${w.pct >= 80 ? 'bg-emerald-500' : w.pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                style={{ width: `${w.pct}%` }}
                                            ></div>
                                        </div>
                                        <div className={`shrink-0 w-12 text-right text-sm font-bold ${pctColor(w.pct)}`}>
                                            {w.pct}%
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Tabel Matrix Presensi */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
                        <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                            <i className="fa-solid fa-table text-indigo-400"></i>
                            Detail Presensi per Pertemuan
                        </h3>
                        <div className="w-full overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider sticky left-0 bg-slate-50 z-10 min-w-[160px]">
                                            Nama Warga
                                        </th>
                                        {filtered.map(p => (
                                            <th key={p.id} className="px-3 py-3 font-semibold text-slate-500 text-xs text-center whitespace-nowrap min-w-[110px]">
                                                <div>{p.nama_pertemuan}</div>
                                                <div className="text-indigo-400 font-medium mt-0.5">{formatTanggal(p.tanggal)}</div>
                                            </th>
                                        ))}
                                        <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider text-center bg-slate-50">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {wargaList.map((w, i) => {
                                        const stat = statsPerWarga.find(s => s.id === w.id);
                                        return (
                                            <tr key={w.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                                <td className={`px-5 py-3 font-semibold text-slate-800 sticky left-0 z-10 border-r border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                                    {w.nama}
                                                    <div className="text-xs font-normal text-slate-400">{w.blok ? `${w.blok} / ` : ''}{w.no_rumah}</div>
                                                </td>
                                                {filtered.map(p => {
                                                    const hadir = getHadir(w.id, p);
                                                    return (
                                                        <td key={p.id} className="px-3 py-3 text-center">
                                                            {hadir ? (
                                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-600" title="Hadir">
                                                                    <i className="fa-solid fa-check text-xs"></i>
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-50 text-rose-400" title="Tidak Hadir">
                                                                    <i className="fa-solid fa-xmark text-xs"></i>
                                                                </span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${pctBadge(stat?.pct || 0)}`}>
                                                        {stat?.hadir}/{stat?.total}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-100 border-t-2 border-slate-200">
                                        <td className="px-5 py-3 font-bold text-slate-700 text-xs sticky left-0 bg-slate-100 z-10">
                                            Total Hadir
                                        </td>
                                        {filtered.map(p => {
                                            const hadirCount = wargaList.filter(w => getHadir(w.id, p)).length;
                                            const pct2 = wargaList.length > 0 ? Math.round(hadirCount / wargaList.length * 100) : 0;
                                            return (
                                                <td key={p.id} className="px-3 py-3 text-center">
                                                    <div className="text-xs font-bold text-slate-700">{hadirCount}/{wargaList.length}</div>
                                                    <div className={`text-xs font-semibold ${pctColor(pct2)}`}>{pct2}%</div>
                                                </td>
                                            );
                                        })}
                                        <td className={`px-4 py-3 text-center font-extrabold text-sm ${pctColor(rataHadir)}`}>
                                            {rataHadir}%
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
