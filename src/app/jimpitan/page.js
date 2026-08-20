'use client';

import { useState, useEffect } from 'react';
import { generateId, formatRupiah, formatTanggal } from '@/lib/utils';

export default function JimpitanPage() {
    const [pengeluaran, setPengeluaran] = useState([]);
    const [totalPemasukan, setTotalPemasukan] = useState(0);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState(null);
    const [editId, setEditId] = useState('');
    const [form, setForm] = useState({
        tanggal: new Date().toISOString().split('T')[0],
        keterangan: '',
        jumlah: '',
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resJ, resP] = await Promise.all([
                fetch('/api/jimpitan'),
                fetch('/api/pertemuan'),
            ]);
            const jsonJ = await resJ.json();
            const jsonP = await resP.json();

            if (jsonJ.status === 'success') {
                const sorted = (jsonJ.data || [])
                    .filter(j => j.jenis === 'pengeluaran' || !j.jenis) // hanya pengeluaran
                    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
                setPengeluaran(sorted);
            }

            if (jsonP.status === 'success') {
                const totalMasuk = (jsonP.data || []).reduce((s, p) => s + (parseInt(p.total_jimpitan) || 0), 0);
                setTotalPemasukan(totalMasuk);
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(null), 3000); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let newList = [...pengeluaran];
        const entry = { ...form, id: editId || generateId(), jenis: 'pengeluaran', jumlah: parseInt(form.jumlah) || 0 };
        if (editId) {
            const idx = newList.findIndex(j => j.id === editId);
            if (idx > -1) newList[idx] = entry;
        } else {
            newList.unshift(entry);
        }
        newList.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        setPengeluaran(newList);
        cancelEdit();
        showMsg(editId ? 'Pengeluaran berhasil diperbarui!' : 'Pengeluaran berhasil dicatat!');
        await fetch('/api/jimpitan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newList),
        });
    };

    const hapus = async (id) => {
        if (!confirm('Yakin ingin menghapus catatan pengeluaran ini?')) return;
        const newList = pengeluaran.filter(j => j.id !== id);
        setPengeluaran(newList);
        showMsg('Catatan berhasil dihapus!');
        await fetch('/api/jimpitan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newList),
        });
    };

    const edit = (id) => {
        const j = pengeluaran.find(x => x.id === id);
        if (!j) return;
        setEditId(j.id);
        setForm({ tanggal: j.tanggal, keterangan: j.keterangan, jumlah: j.jumlah });
    };

    const cancelEdit = () => {
        setEditId('');
        setForm({ tanggal: new Date().toISOString().split('T')[0], keterangan: '', jumlah: '' });
    };

    const totalKeluar = pengeluaran.reduce((s, j) => s + j.jumlah, 0);
    const saldo = totalPemasukan - totalKeluar;

    return (
        <div className="space-y-8">
            {msg && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl animate-fade-in">
                    <i className="fa-solid fa-circle-check text-emerald-500 text-lg"></i>
                    <span className="font-medium text-sm">{msg}</span>
                </div>
            )}

            {/* Ringkasan Saldo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className={`rounded-2xl p-6 border shadow-sm flex items-center gap-4 ${saldo >= 0 ? 'bg-white border-slate-100' : 'bg-rose-50 border-rose-100'}`}>
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl shrink-0 ${saldo >= 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-rose-100 text-rose-600'}`}>
                        <i className="fa-solid fa-wallet text-xl"></i>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-0.5">Saldo Kas RT</p>
                        <h3 className={`text-2xl font-bold tracking-tight ${saldo >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>{formatRupiah(saldo)}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
                        <i className="fa-solid fa-arrow-trend-up text-xl"></i>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-0.5">Pemasukan dari Jimpitan</p>
                        <h3 className="text-2xl font-bold text-emerald-600 tracking-tight">{formatRupiah(totalPemasukan)}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Akumulasi semua pertemuan</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-rose-100 text-rose-600 shrink-0">
                        <i className="fa-solid fa-arrow-trend-down text-xl"></i>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-0.5">Total Pengeluaran</p>
                        <h3 className="text-2xl font-bold text-rose-600 tracking-tight">{formatRupiah(totalKeluar)}</h3>
                    </div>
                </div>
            </div>

            {/* Info Pemasukan Otomatis */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 px-6 flex items-center gap-3 text-emerald-700 text-sm">
                <i className="fa-solid fa-circle-info text-emerald-500 text-lg shrink-0"></i>
                <p>
                    <strong>Pemasukan otomatis:</strong> Total kas masuk dihitung langsung dari total jimpitan yang dicatat di setiap pertemuan.
                    Halaman ini hanya digunakan untuk mencatat <strong>pengeluaran</strong> kas RT.
                </p>
            </div>

            {/* Form Catat Pengeluaran */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <i className={`fa-solid ${editId ? 'fa-pen text-indigo-500' : 'fa-minus-circle text-rose-500'}`}></i>
                    {editId ? 'Edit Catatan Pengeluaran' : 'Catat Pengeluaran Baru'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal</label>
                            <input type="date" required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all"
                                value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Keterangan Pengeluaran</label>
                            <input type="text" required placeholder="Cth: Beli konsumsi rapat"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all"
                                value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nominal (Rp)</label>
                            <input type="number" required min="0" step="500" placeholder="0"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all"
                                value={form.jumlah} onChange={e => setForm({ ...form, jumlah: e.target.value })} />
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                        {editId && (
                            <button type="button" onClick={cancelEdit}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all">
                                Batal
                            </button>
                        )}
                        <button type="submit"
                            className="inline-flex items-center gap-2 px-8 py-2.5 text-sm font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-sm shadow-rose-200">
                            <i className="fa-solid fa-cloud-arrow-up"></i>
                            {editId ? 'Simpan Perubahan' : 'Catat Pengeluaran'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Tabel Pengeluaran */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900">Riwayat Pengeluaran Kas</h2>
                    <p className="text-sm text-slate-500 mt-1">{pengeluaran.length} catatan pengeluaran tersimpan.</p>
                </div>

                <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-left whitespace-nowrap custom-table-inlined">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Keterangan</th>
                                <th className="text-right">Jumlah Pengeluaran</th>
                                <th className="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-12">
                                    <div className="flex flex-col items-center gap-3 text-slate-400">
                                        <i className="fa-solid fa-circle-notch fa-spin text-2xl text-indigo-400"></i>
                                        <p className="text-sm">Memuat data kas...</p>
                                    </div>
                                </td></tr>
                            ) : pengeluaran.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-12">
                                    <div className="flex flex-col items-center gap-3 text-slate-400">
                                        <i className="fa-solid fa-receipt text-3xl opacity-50"></i>
                                        <p className="text-sm">Belum ada catatan pengeluaran.</p>
                                    </div>
                                </td></tr>
                            ) : (
                                pengeluaran.map(j => (
                                    <tr key={j.id}>
                                        <td className="text-slate-500 font-medium">{formatTanggal(j.tanggal)}</td>
                                        <td className="font-semibold text-slate-800">{j.keterangan}</td>
                                        <td className="text-right font-bold text-rose-600 text-base">
                                            - {formatRupiah(j.jumlah)}
                                        </td>
                                        <td className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => edit(j.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-all">
                                                    <i className="fa-solid fa-pen text-indigo-500"></i> Edit
                                                </button>
                                                <button onClick={() => hapus(j.id)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-rose-500 bg-white hover:bg-rose-50 hover:border-rose-200 transition-all">
                                                    <i className="fa-solid fa-trash-can"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {pengeluaran.length > 0 && (
                            <tfoot>
                                <tr className="bg-slate-50 border-t border-slate-200">
                                    <td colSpan="2" className="px-5 py-4 font-bold text-sm text-slate-700">Saldo Akhir</td>
                                    <td className={`px-5 py-4 text-right font-extrabold text-base ${saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {formatRupiah(saldo)}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
}
