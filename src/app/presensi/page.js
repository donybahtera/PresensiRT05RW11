'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatRupiah, formatTanggal } from '@/lib/utils';

function PresensiDetail() {
    const searchParams = useSearchParams();
    const meetingId = searchParams.get('id');

    const [pertemuanList, setPertemuanList] = useState([]);
    const [wargaList, setWargaList] = useState([]);
    const [currentMeeting, setCurrentMeeting] = useState(null);

    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState(null);
    const [totalJimpitan, setTotalJimpitan] = useState('');

    const [kehadiran, setKehadiran] = useState({});

    useEffect(() => {
        if (!meetingId) {
            window.location.href = '/pertemuan';
            return;
        }
        fetchData();
    }, [meetingId]);

    const fetchData = async () => {
        try {
            const [resP, resW] = await Promise.all([fetch('/api/pertemuan'), fetch('/api/warga')]);
            const jsonP = await resP.json();
            const jsonW = await resW.json();

            const pList = jsonP.data || [];
            const wList = jsonW.data || [];

            setPertemuanList(pList);
            setWargaList(wList.sort((a, b) => a.nama.localeCompare(b.nama)));

            const meeting = pList.find(x => x.id === meetingId);
            if (!meeting) {
                alert("ID Pertemuan tidak valid!");
                window.location.href = '/pertemuan';
                return;
            }

            if (!meeting.presensiData) meeting.presensiData = {};
            setCurrentMeeting(meeting);
            setTotalJimpitan(meeting.total_jimpitan || '');

            const initHadir = {};
            wList.forEach(w => {
                initHadir[w.id] = (meeting.presensiData[w.id]?.hadir === 1);
            });
            setKehadiran(initHadir);

            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const showMessage = (text) => {
        setMsg(text);
        setTimeout(() => setMsg(null), 3000);
    };

    const setItemHadir = (wargaId, val) => {
        setKehadiran(prev => ({ ...prev, [wargaId]: val }));
    };

    const simpanPresensi = async () => {
        let totalJimpitanBaru = parseInt(totalJimpitan, 10) || 0;
        let upMeeting = { ...currentMeeting };
        upMeeting.total_jimpitan = totalJimpitanBaru;

        let pData = {};
        wargaList.forEach(w => {
            pData[w.id] = { hadir: kehadiran[w.id] ? 1 : 0 };
        });
        upMeeting.presensiData = pData;

        let pList = [...pertemuanList];
        const idx = pList.findIndex(x => x.id === currentMeeting.id);
        if (idx > -1) pList[idx] = upMeeting;

        setCurrentMeeting(upMeeting);
        setPertemuanList(pList);

        await fetch('/api/pertemuan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pList)
        });

        showMessage("Presensi dan Kas Jimpitan sudah disinkronkan ke cloud!");
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center py-20 text-indigo-500">
                <i className="fa-solid fa-circle-notch fa-spin text-4xl mb-4"></i>
                <p className="text-slate-500 font-medium animate-pulse">Menyiapkan form absensi...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Link href="/pertemuan" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all duration-200 rounded-xl outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-200 px-3.5 rounded-full text-slate-500">
                    <i className="fa-solid fa-arrow-left"></i>
                </Link>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Presensi</h2>
                    <p className="text-sm text-slate-500">Pengaturan kehadiran dan kas perorangan.</p>
                </div>
            </div>

            {currentMeeting && (
                <div className="bg-indigo-600 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-600/20">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-5 rounded-full"></div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-widest text-indigo-100 mb-4">
                                <i className="fa-solid fa-calendar-day"></i> Info Pertemuan
                            </div>
                            <h3 className="text-3xl font-extrabold mb-2">{currentMeeting.nama_pertemuan}</h3>
                            <p className="text-indigo-100 text-sm leading-relaxed max-w-md">
                                {currentMeeting.catatan || 'Agenda reguler tanpa catatan khusus yang ditetapkan.'}
                            </p>
                        </div>

                        <div className="flex flex-row md:flex-col gap-8 md:gap-4 justify-start md:justify-center items-start md:items-end">
                            <div className="text-left md:text-right">
                                <p className="text-xs font-medium text-indigo-200 uppercase mb-1">Terlaksana pada</p>
                                <div className="font-semibold text-lg">{formatTanggal(currentMeeting.tanggal)}</div>
                            </div>
                            <div className="text-left md:text-right">
                                <p className="text-xs font-medium text-indigo-200 uppercase mb-1">Status Jimpitan (Total)</p>
                                <div className="inline-block px-4 py-1.5 bg-white text-indigo-600 rounded-xl font-bold text-xl shadow-inner">
                                    {formatRupiah(currentMeeting.total_jimpitan || 0)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {msg && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl">
                    <i className="fa-solid fa-circle-check text-emerald-500"></i>
                    <span className="font-medium text-sm">{msg}</span>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8 !p-0 overflow-hidden border-0 ring-1 ring-slate-200 bg-white shadow-md">

                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Ceklis Kehadiran Registran</h3>
                        <p className="text-xs text-slate-500 mt-1">Total {wargaList.length} warga yang dapat diabsen pada agenda ini.</p>
                    </div>

                    <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all duration-200 rounded-xl outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-200 focus:ring-indigo-500 active:bg-indigo-800" onClick={simpanPresensi}>
                        <i className="fa-solid fa-cloud-arrow-up"></i> Simpan Data Skrg
                    </button>
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap custom-table-inlined !border-0">
                        <thead className="bg-slate-100/80">
                            <tr>
                                <th className="w-16 text-center">No</th>
                                <th>Kepala Keluarga</th>
                                <th>Alamat Domisili</th>
                                <th className="text-center">Status Hadir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wargaList.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-slate-400 text-sm">
                                        Struktur data warga masih kosong. Silakan masuk menu Warga.
                                    </td>
                                </tr>
                            ) : (
                                wargaList.map((w, i) => (
                                    <tr key={w.id} className={kehadiran[w.id] ? "bg-indigo-50/20" : ""}>
                                        <td className="text-center font-medium text-slate-400">{i + 1}</td>
                                        <td><strong className="text-slate-800">{w.nama}</strong></td>
                                        <td className="text-slate-500 text-sm">{w.blok ? `${w.blok} / ` : ''}{w.no_rumah}</td>
                                        <td className="text-center align-middle">
                                            <label className="relative inline-flex items-center cursor-pointer justify-center">
                                                <input type="checkbox" className="sr-only peer" checked={kehadiran[w.id] || false} onChange={e => setItemHadir(w.id, e.target.checked)} />
                                                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                            </label>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 lg:p-8 bg-slate-50 border-t border-slate-200">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-full lg:w-1/2">
                            <label className="block text-sm font-bold text-slate-800 mb-2">Penyesuaian Total Kas (Jimpitan)</label>
                            <p className="text-xs text-slate-500 mb-4 max-w-sm">Masukkan hasil hitungan dana terkumpul manual. Nominal akan disimpan pada log riwayat pertemuan ini.</p>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-slate-400 font-semibold text-lg">Rp</span>
                                </div>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 pl-12 text-xl font-bold !bg-slate-50 !py-3 !rounded-xl text-indigo-700"
                                    placeholder="0"
                                    min="0"
                                    step="500"
                                    value={totalJimpitan}
                                    onChange={(e) => setTotalJimpitan(e.target.value)}
                                />
                            </div>
                        </div>

                        <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all duration-200 rounded-xl outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-200 focus:ring-indigo-500 active:bg-indigo-800 px-8 py-3 w-full lg:w-auto mt-2 lg:mt-0 shadow-lg shadow-indigo-600/30" onClick={simpanPresensi}>
                            <i className="fa-solid fa-shield-check text-lg"></i> Validasi & Simpan Semua
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function PresensiPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col justify-center items-center py-20 text-indigo-500">
                <i className="fa-solid fa-circle-notch fa-spin text-4xl mb-4"></i>
                <p className="text-slate-500 font-medium">Memuat halaman presensi...</p>
            </div>
        }>
            <PresensiDetail />
        </Suspense>
    );
}
