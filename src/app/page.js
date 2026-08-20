import Link from 'next/link';
import { getFromSheet } from '@/lib/googleSheet';

export const revalidate = 0;

export default async function Dashboard() {
  const [warga, pertemuan, jimpitanKeluar] = await Promise.all([
    getFromSheet('warga'),
    getFromSheet('pertemuan'),
    getFromSheet('jimpitan'),
  ]);

  const totalWarga = warga.length || 0;
  const totalPertemuan = pertemuan.length || 0;
  let totalMasuk = 0;
  pertemuan.forEach(p => {
    totalMasuk += parseInt(p.total_jimpitan) || 0;
  });
  const totalKeluar = jimpitanKeluar.reduce((s, j) => s + (parseInt(j.jumlah) || 0), 0);
  const saldoKas = totalMasuk - totalKeluar;

  const recent = [...pertemuan].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).slice(0, 5);

  const formatRupiah = (angka) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

  const formatTanggal = (tgl) => {
    if (!tgl) return '-';
    return new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-emerald-500/10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <i className="fa-solid fa-rupiah-sign text-xl"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Kas / Jimpitan</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{formatRupiah(saldoKas)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-indigo-500/10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <i className="fa-solid fa-house-chimney-user text-xl"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Jumlah Warga</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{totalWarga} <span className="text-sm font-medium text-slate-400">KK</span></h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-orange-500/10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <i className="fa-regular fa-calendar-check text-xl"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Pertemuan</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{totalPertemuan} <span className="text-sm font-medium text-slate-400">Kali</span></h3>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8 bg-indigo-50/50 border-indigo-100/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
            <i className="fa-solid fa-cloud text-indigo-500"></i> Cloud Sync Aktif
          </h2>
          <p className="text-sm text-slate-600">Sistem terhubung langsung ke Google Sheets secara real-time. Semua data warga dan jimpitan Anda aman.</p>
        </div>
        <Link href="https://docs.google.com/spreadsheets" target="_blank" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all duration-200 rounded-xl outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-200 text-sm whitespace-nowrap">
          <i className="fa-solid fa-table"></i> Buka Spreadsheet
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Riwayat Pertemuan Terakhir</h2>
            <p className="text-sm text-slate-500 mt-1">Daftar 5 aktivitas perkumpulan RT 05 terbaru.</p>
          </div>
          <Link href="/pertemuan" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all whitespace-nowrap">
            <i className="fa-solid fa-plus"></i> Tambah Pertemuan
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <i className="fa-solid fa-inbox text-3xl mb-3 opacity-50"></i>
            <p className="text-sm">Belum ada rekaman pertemuan.</p>
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="sm:hidden space-y-3">
              {recent.map((r, idx) => (
                <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{r.nama_pertemuan}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatTanggal(r.tanggal)}</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 shrink-0">
                      {formatRupiah(r.total_jimpitan || 0)}
                    </span>
                  </div>
                  {r.catatan && <p className="text-xs text-slate-500 line-clamp-2">{r.catatan}</p>}
                  <Link href={`/presensi?id=${r.id}`} className="mt-1 inline-flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg border border-indigo-200 bg-white text-indigo-600">
                    <i className="fa-solid fa-clipboard-check"></i> Buka Presensi
                  </Link>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block w-full overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left whitespace-nowrap custom-table-inlined">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Kegiatan</th>
                    <th>Deskripsi Singkat</th>
                    <th>Jimpitan Terkumpul</th>
                    <th className="text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r, idx) => (
                    <tr key={idx}>
                      <td className="font-medium text-slate-600">{formatTanggal(r.tanggal)}</td>
                      <td><span className="font-semibold text-slate-800">{r.nama_pertemuan}</span></td>
                      <td><span className="text-slate-500 truncate max-w-[200px] inline-block">{r.catatan || '-'}</span></td>
                      <td>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {formatRupiah(r.total_jimpitan || 0)}
                        </span>
                      </td>
                      <td className="text-right">
                        <Link href={`/presensi?id=${r.id}`} className="inline-flex items-center gap-2 py-1.5 px-3 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all">
                          <i className="fa-solid fa-clipboard-check text-indigo-500"></i> Buka Presensi
                        </Link>
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
