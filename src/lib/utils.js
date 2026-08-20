export function generateId() {
    return Date.now().toString();
}

export function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
}

export function formatTanggal(tanggalStr) {
    if (!tanggalStr) return '-';
    return new Date(tanggalStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
