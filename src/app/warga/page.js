'use client';

import { useState, useEffect } from 'react';
import { generateId } from '@/lib/utils';

export default function WargaPage() {
    const [wargaList, setWargaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState(null);

    const [editId, setEditId] = useState('');
    const [formData, setFormData] = useState({ nama: '', blok: '', no_rumah: '' });

    useEffect(() => {
        fetchWarga();
    }, []);

    const fetchWarga = async () => {
        try {
            const res = await fetch('/api/warga');
            const json = await res.json();
            if (json.status === 'success') {
                const sorted = json.data.sort((a, b) => a.nama.localeCompare(b.nama));
                setWargaList(sorted);
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
        let newList = [...wargaList];
        if (editId) {
            const idx = newList.findIndex(w => w.id === editId);
            if (idx > -1) {
                newList[idx] = { ...newList[idx], ...formData };
            }
        } else {
            newList.push({ id: generateId(), ...formData });
        }

        setWargaList(newList.sort((a, b) => a.nama.localeCompare(b.nama)));
        cancelEdit();
        showMessage(editId ? "Data berhasil diupdate!" : "Daftar warga berhasil ditambahkan!");

        await fetch('/api/warga', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newList)
        });
    };

    const hapusWarga = async (id) => {
        if (confirm("Yakin ingin menghapus warga ini dari daftar?")) {
            const newList = wargaList.filter(w => w.id !== id);
            setWargaList(newList);
            showMessage("Data berhasil dihapus!");
            await fetch('/api/warga', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newList)
            });
        }
    };

    const cancelEdit = () => {
        setEditId('');
        setFormData({ nama: '', blok: '', no_rumah: '' });
    };

    const editWarga = (id) => {
        const w = wargaList.find(x => x.id === id);
        if (!w) return;
        setEditId(w.id);
        setFormData({ nama: w.nama, blok: w.blok, no_rumah: w.no_rumah });
    };

    return (
        <div className="space-y-8">
            {msg && (
                <div className="animate-fade-in flex items-center justify-between p-4 mb-4 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-3">
                        <i className="fa-solid fa-circle-check text-emerald-500 text-lg"></i>
                        <span className="font-medium text-sm">{msg}</span>
                    </div>
                    <button onClick={() => setMsg(null)} className="text-emerald-400 hover:text-emerald-600">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            )}

            {/* Form Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <i className={`fa-solid ${editId ? 'fa-pen-to-square text-indigo-500' : 'fa-user-plus text-emerald-500'}`}></i>
                    {editId ? 'Edit Data Warga' : 'Registrasi Warga Baru'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Kepala Keluarga</label>
                            <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50" required placeholder="Cth: Budi Santoso"
                                value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Jalan / Komplek <span className="text-slate-400 font-normal">(Opsional)</span></label>
                            <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50" placeholder="Cth: Jl. Anggrek"
                                value={formData.blok} onChange={e => setFormData({ ...formData, blok: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Blok / Nomor Rumah</label>
                            <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50" required placeholder="Cth: A-12"
                                value={formData.no_rumah} onChange={e => setFormData({ ...formData, no_rumah: e.target.value })} />
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                        {editId && (
                            <button type="button" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all duration-200 rounded-xl outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-200" onClick={cancelEdit}>
                                Batal
                            </button>
                        )}
                        <button type="submit" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all duration-200 rounded-xl outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-200 focus:ring-indigo-500 active:bg-indigo-800 px-8">
                            <i className="fa-solid fa-save"></i> <span>{editId ? 'Simpan Perubahan' : 'Tambahkan'}</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Daftar Warga RT 05 RW 11</h2>
                        <p className="text-sm text-slate-500 mt-1">Total {wargaList.length} KK terdaftar dalam sistem.</p>
                    </div>
                </div>

                <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-left whitespace-nowrap custom-table-inlined">
                        <thead>
                            <tr>
                                <th className="w-16 text-center">No</th>
                                <th>Nama KK</th>
                                <th>Alamat Domisili</th>
                                <th className="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3 text-slate-400">
                                            <i className="fa-solid fa-circle-notch fa-spin text-2xl text-indigo-400"></i>
                                            <p className="text-sm">Menyinkronkan data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : wargaList.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3 text-slate-400">
                                            <i className="fa-solid fa-users-slash text-3xl opacity-50"></i>
                                            <p className="text-sm">Silakan mulai dengan mendaftarkan warga pertama.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                wargaList.map((w, i) => (
                                    <tr key={w.id}>
                                        <td className="text-center font-medium text-slate-400">{i + 1}</td>
                                        <td><strong className="text-slate-800 font-semibold">{w.nama}</strong></td>
                                        <td>
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 text-sm border border-slate-100">
                                                <i className="fa-solid fa-location-dot text-slate-400 text-xs"></i>
                                                {w.blok ? `${w.blok} / ` : ''}{w.no_rumah}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all duration-200 rounded-xl outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-200 py-1.5 px-3 text-xs" onClick={() => editWarga(w.id)}>
                                                    <i className="fa-solid fa-pen text-indigo-500"></i> Edit
                                                </button>
                                                <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all duration-200 rounded-xl outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-200 py-1.5 px-3 text-xs text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200" onClick={() => hapusWarga(w.id)}>
                                                    <i className="fa-regular fa-trash-can"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
