// keys for localstorage
const DB_WARGA = 'rt05_wargaData';
const DB_PERTEMUAN = 'rt05_pertemuanData';

// MASUKKAN URL GOOGLE APPS SCRIPT DI BAWAH INI SETELAH MENG-COPY google_script.gs
const API_URL = "";

// Fetch / Save data
async function getWarga() {
    // Jika API belum diset, gunakan localStorage langsung
    if (!API_URL || API_URL.trim() === "") {
        return JSON.parse(localStorage.getItem(DB_WARGA) || '[]');
    }

    try {
        const res = await fetch(API_URL + "?action=getWarga");
        const json = await res.json();
        if (json.status === "success") {
            // Backup ke localStorage juga sebagai cadangan
            localStorage.setItem(DB_WARGA, JSON.stringify(json.data));
            return json.data;
        }
    } catch (err) {
        console.error("Gagal mendapat data warga dari Spreadsheet:", err);
    }
    // Fallback baca lokal
    return JSON.parse(localStorage.getItem(DB_WARGA) || '[]');
}

async function saveWarga(data) {
    // Selalu backup lokal juga
    localStorage.setItem(DB_WARGA, JSON.stringify(data));

    if (!API_URL || API_URL.trim() === "") return;

    try {
        await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "saveWarga", data: data })
        });
    } catch (err) {
        console.error("Gagal mennyimpan data warga ke Spreadsheet:", err);
    }
}

async function getPertemuan() {
    if (!API_URL || API_URL.trim() === "") {
        return JSON.parse(localStorage.getItem(DB_PERTEMUAN) || '[]');
    }

    try {
        const res = await fetch(API_URL + "?action=getPertemuan");
        const json = await res.json();
        if (json.status === "success") {
            // Backup ke localStorage juga sebagai cadangan
            localStorage.setItem(DB_PERTEMUAN, JSON.stringify(json.data));
            return json.data;
        }
    } catch (err) {
        console.error("Gagal mendapat data pertemuan dari Spreadsheet:", err);
    }
    return JSON.parse(localStorage.getItem(DB_PERTEMUAN) || '[]');
}

async function savePertemuan(data) {
    localStorage.setItem(DB_PERTEMUAN, JSON.stringify(data));

    if (!API_URL || API_URL.trim() === "") return;

    try {
        await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "savePertemuan", data: data })
        });
    } catch (err) {
        console.error("Gagal menyimpan data pertemuan ke Spreadsheet:", err);
    }
}

// Formatting helpers
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
}
function formatTanggal(tanggalStr) {
    if (!tanggalStr) return '-';
    return new Date(tanggalStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Reusable Components
function renderNavbar(activeMenu) {
    return `
        <header>
            <h1><i class="fa-solid fa-users-viewfinder"></i> Presensi RT 05</h1>
            <p>Sistem Manajemen Kehadiran & Jimpitan Warga RW 11</p>
            <div class="nav">
                <a href="index.html" class="${activeMenu === 'dashboard' ? 'active' : ''}"><i class="fa-solid fa-chart-pie"></i> Dashboard</a>
                <a href="warga.html" class="${activeMenu === 'warga' ? 'active' : ''}"><i class="fa-solid fa-house-user"></i> Data Warga</a>
                <a href="pertemuan.html" class="${activeMenu === 'pertemuan' ? 'active' : ''}"><i class="fa-solid fa-calendar-check"></i> Pertemuan & Presensi</a>
            </div>
        </header>
    `;
}

// Generate UI ID unique
function generateId() {
    return Date.now().toString();
}

function showMessage(msg) {
    const el = document.getElementById('msg-box');
    if (!el) return;
    el.innerHTML = `<div style="background: var(--success); color: white; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">${msg}</div>`;
    setTimeout(() => { el.innerHTML = ''; }, 3000);
}

// Backup & Restore
function downloadFile(filename, content) {
    const element = document.createElement('a');
    const blob = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(blob);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

async function exportCSV() {
    document.getElementById('msg-box').innerHTML = "Sedang generate CSV...";
    const warga = await getWarga();
    const pertemuan = await getPertemuan();

    // Export Warga
    let csvWarga = 'ID,Nama Warga,Status\n';
    warga.forEach(w => {
        csvWarga += `${w.id},"${w.nama}",${w.status || ''}\n`;
    });
    downloadFile('data_warga.csv', csvWarga);

    // Export Pertemuan
    let csvPertemuan = 'ID,Nama Pertemuan,Tanggal,Catatan,Total Jimpitan\n';
    pertemuan.forEach(p => {
        csvPertemuan += `${p.id},"${p.nama_pertemuan}",${p.tanggal},"${p.catatan || ''}",${p.total_jimpitan}\n`;
    });
    downloadFile('data_pertemuan.csv', csvPertemuan);

    showMessage("Data berhasil di-export ke CSV (Excel)!");
}

async function backupJSON() {
    document.getElementById('msg-box').innerHTML = "Sedang mengambil data backup...";
    const data = {
        warga: await getWarga(),
        pertemuan: await getPertemuan()
    };
    const json = JSON.stringify(data, null, 2);
    downloadFile('backup_rt05.json', json);
    showMessage("Backup data berhasil diunduh.");
}

async function restoreJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.warga && data.pertemuan) {
                if (confirm("Peringatan: Data saat ini akan ditimpa! Apakah Anda yakin ingin melanjutkan restore?")) {
                    await saveWarga(data.warga);
                    await savePertemuan(data.pertemuan);
                    alert('Restore data berhasil!');
                    location.reload();
                }
            } else {
                alert('Format file backup tidak valid!');
            }
        } catch (err) {
            alert('Gagal membaca file JSON!');
        }
    };
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
}
