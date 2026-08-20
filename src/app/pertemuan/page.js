'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { generateId, formatRupiah, formatTanggal } from '@/lib/utils';
import { useAdminSession } from '@/lib/auth';

export default function PertemuanPage() {
    const [pertemuanList, setPertemuanList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState(null);
    const { isAdmin, loading: authLoading } = useAdminSession();

    const [editId, setEditId] = useState('');
    const [formData, setFormData] = useState({ tanggal: new Date().toISOString().split('T')[0], nama_pertemuan: '', catatan: '' });

    useEffect(() => {
        fetchPertemuan();
    }, []);

    const fetchPertemuan = async () => {
        try {
            const res = await fetch('/api/pertemuan');
            const json = await res.json();
            if (json.status === 'success') {
                const sorted = json.data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
                setPertemuanList(sorted);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const showMessage = (text) => {
        setMsg(text);
        setTimeout(() => setMsg(null), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let newList = [...pertemuanList];
        if (editId) {
            const idx = newList.findIndex(p => p.id === editId);
            if (idx > -1) {
                newList[idx] = { ...newList[idx], ...formData };
            }
        } else {
            newList.push({
                id: generateId(),
                ...formData,
                presensiData: {},
                total_jimpitan: 0
            });
        }

        setPertemuanList(newList.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)));
        cancelEdit();
        showMessage(editId ? "Pertemuan berhasil diupdate!" : "Pertemuan berhasil dijadwalkan!");

        await fetch('/api/pertemuan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newList)
        });
    };

    const hapusPertemuan = async (id) => {
        if (confirm("Yakin ingin menghapus agenda pertemuan ini? Data presensi di dalamnya juga akan terhapus secara permanen.")) {
            const newList = pertemuanList.filter(p => p.id !== id);
            setPertemuanList(newList);
            showMessage("Pertemuan berhasil dihapus!");
            await fetch('/api/pertemuan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newList)
            });
        }
    };

    const cancelEdit = () => {
        setEditId('');
        setFormData({ tanggal: new Date().toISOString().split('T')[0], nama_pertemuan: '', catatan: '' });
    };

    const editPertemuan = (id) => {
        const p = pertemuanList.find(x => x.id === id);
        if (!p) return;
        setEditId(p.id);
        setFormData({ tanggal: p.tanggal, nama_pertemuan: p.nama_pertemuan, catatan: p.catatan });
    };

    return (
        <div className="space-y-8">
            {msg && (
                <div className="animate-fade-in flex items-center justify-between p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-3">
                        <i className="fa-solid fa-circle-check text-emerald-500 text-lg"></i>
                        <span className="font-medium text-sm">{msg}</span>
                    </div>
                    <button onClick={() => setMsg(null)} className="text-emerald-400 hover:text-emerald-600">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            )}

            {/* Banner mode tamu */}
            {!authLoading && !isAdmin && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                    <i className="fa-solid fa-eye text-amber-500 text-lg shrink-0"></i>
                    <p>Anda dalam <strong>Mode Tamu</strong>. Hanya dapat melihat data. <a href="/login" className="font-semibold underline hover:text-amber-900">Login sebagai Admin</a> untuk mengedit.</p>
                </div>
            )}

            {/* Form Card — hanya admin */}
            {!authLoading && isAdmin && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <i className={`fa-solid ${editId ? 'fa-pen text-indigo-500' : 'fa-calendar-plus text-emerald-500'}`}></i>
                        {editId ? 'Update Detail Pertemuan' : 'Jadwalkan Pertemuan Baru'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Pelaksanaan</label>
                                <input type="date" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50" required
                                    value={formData.tanggal} onChange={e => setFormData({ ...formData, tanggal: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama / Agenda Acara</label>
                                <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50" required placeholder="Cth: Rapat Bulanan RT"
                                    value={formData.nama_pertemuan} onChange={e => setFormData({ ...formData, nama_pertemuan: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Keterangan Tambahan <span className="text-slate-400 font-normal">(Opsional)</span></label>
                                <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50" placeholder="Cth: Membahas laporan kas"
                                    value={formData.catatan} onChange={e => setFormData({ ...formData, catatan: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                            {editId && (
                                <button type="button" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all duration-200 rounded-xl outline-none bg-white text-slate-700 border border-slate-200 hover:bg-slate-50" onClick={cancelEdit}>
                                    Batal
                                </button>
                            )}
                            <button type="submit" className="inline-flex items-center justify-center gap-2 px-8 py-2.5 text-sm font-semibold transition-all duration-200 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-200 focus:ring-indigo-500">
                                <i className="fa-solid fa-cloud-arrow-up"></i> <span>{editId ? 'Simpan Perubahan' : 'Publish Agenda'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Arsip Pertemuan RT</h2>
                        <p className="text-sm text-slate-500 mt-1">Daftar semua agenda pertemuan yang pernah dilaksanakan.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-slate-400">
                        <i className="fa-solid fa-circle-notch fa-spin text-2xl text-indigo-400 mb-3"></i>
                        <p className="text-sm">Memuat data cloud...</p>
                    </div>
                ) : pertemuanList.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <i className="fa-regular fa-folder-open text-3xl opacity-50 mb-3"></i>
                        <p className="text-sm">Belum ada agenda pertemuan apa pun.</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile: card list */}
                        <div className="sm:hidden space-y-3">
                            {pertemuanList.map(p => (
                                <div key={p.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <p className="font-bold text-slate-800">{p.nama_pertemuan}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                <i className="fa-regular fa-calendar mr-1"></i>{formatTanggal(p.tanggal)}
                                            </p>
                                            {p.catatan && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.catatan}</p>}
                                        </div>
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700 shrink-0">
                                            {formatRupiah(p.total_jimpitan || 0)}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/presensi?id=${p.id}`} className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white">
                                            <i className="fa-solid fa-list-check"></i> Absensi
                                        </Link>
                                        {isAdmin && (
                                            <>
                                                <button className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-600" onClick={() => editPertemuan(p.id)}>
                                                    <i className="fa-solid fa-pen"></i>
                                                </button>
                                                <button className="px-3 py-2 text-xs rounded-lg border border-rose-100 bg-white text-rose-500" onClick={() => hapusPertemuan(p.id)}>
                                                    <i className="fa-solid fa-trash-can"></i>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop: table */}
                        <div className="hidden sm:block w-full overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-left whitespace-nowrap custom-table-inlined">
                                <thead>
                                    <tr>
                                        <th>Tanggal</th>
                                        <th>Detail Agenda</th>
                                        <th>Kas/Jimpitan</th>
                                        <th className="text-right">Manajemen</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pertemuanList.map(p => (
                                        <tr key={p.id}>
                                            <td>
                                                <span className="inline-block px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 font-medium text-slate-600">
                                                    <i className="fa-regular fa-calendar text-slate-400 mr-1.5"></i>
                                                    {formatTanggal(p.tanggal)}
                                                </span>
                                            </td>
                                            <td>
                                                <p className="font-bold text-slate-800 mb-0.5">{p.nama_pertemuan}</p>
                                                <p className="text-sm text-slate-500 max-w-[250px] truncate">{p.catatan || 'Tidak ada deskripsi.'}</p>
                                            </td>
                                            <td>
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700">
                                                    {formatRupiah(p.total_jimpitan || 0)}
                                                </span>
                                            </td>
                                            <td className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/presensi?id=${p.id}`} className="inline-flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all w-[110px] justify-center">
                                                        <i className="fa-solid fa-list-check"></i> Absensi
                                                    </Link>
                                                    {isAdmin && (
                                                        <>
                                                            <button className="py-1.5 px-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" onClick={() => editPertemuan(p.id)}>
                                                                <i className="fa-solid fa-pen"></i>
                                                            </button>
                                                            <button className="py-1.5 px-2.5 text-xs rounded-xl border border-slate-200 bg-white text-rose-500 hover:bg-rose-50 hover:border-rose-200" onClick={() => hapusPertemuan(p.id)}>
                                                                <i className="fa-solid fa-trash-can"></i>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
