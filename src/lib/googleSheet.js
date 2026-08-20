import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
    ],
});

export async function getDoc() {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    return doc;
}

async function getOrInitSheet(doc, title, headers) {
    // Case-insensitive lookup
    let matchedTitle = Object.keys(doc.sheetsByTitle).find(k => k.toLowerCase() === title.toLowerCase());
    let sheet = matchedTitle ? doc.sheetsByTitle[matchedTitle] : null;

    if (!sheet) {
        try {
            sheet = await doc.addSheet({ title, headerValues: headers });
        } catch (err) {
            // Sheet may have been created by a concurrent request — reload and retry lookup
            if (err.message && err.message.includes('already exists')) {
                await doc.loadInfo();
                matchedTitle = Object.keys(doc.sheetsByTitle).find(k => k.toLowerCase() === title.toLowerCase());
                sheet = matchedTitle ? doc.sheetsByTitle[matchedTitle] : null;
                if (!sheet) throw err;
            } else {
                throw err;
            }
        }
    }

    try {
        await sheet.loadHeaderRow();
        if (!sheet.headerValues || sheet.headerValues.length === 0) {
            await sheet.setHeaderRow(headers);
        }
    } catch (e) {
        await sheet.setHeaderRow(headers);
    }

    return sheet;
}

export async function getFromSheet(type) {
    const doc = await getDoc();

    if (type === 'warga') {
        const sheet = await getOrInitSheet(doc, 'data warga', ['id', 'nama', 'blok', 'no_rumah']);
        const rows = await sheet.getRows();
        return rows.map(r => ({
            id: r.get('id'),
            nama: r.get('nama'),
            blok: r.get('blok') || '',
            no_rumah: r.get('no_rumah')
        }));
    }

    if (type === 'pertemuan') {
        const sheetP = await getOrInitSheet(doc, 'data pertemuan', ['id', 'tanggal', 'nama_pertemuan', 'catatan', 'total_jimpitan']);
        const sheetPresensi = await getOrInitSheet(doc, 'data presensi', ['pertemuan_id', 'warga_id', 'hadir']);

        const pRows = await sheetP.getRows();
        const pList = pRows.map(r => ({
            id: r.get('id'),
            tanggal: r.get('tanggal'),
            nama_pertemuan: r.get('nama_pertemuan'),
            catatan: r.get('catatan') || '',
            total_jimpitan: r.get('total_jimpitan') ? parseInt(r.get('total_jimpitan')) : 0,
            presensiData: {}
        }));

        const presensiRows = await sheetPresensi.getRows();
        presensiRows.forEach(r => {
            const pId = r.get('pertemuan_id');
            const wId = r.get('warga_id');
            const hadir = parseInt(r.get('hadir')) || 0;

            const meet = pList.find(p => p.id === pId);
            if (meet) {
                meet.presensiData[wId] = { hadir };
            }
        });
        return pList;
    }

    if (type === 'jimpitan') {
        const sheet = await getOrInitSheet(doc, 'data jimpitan', ['id', 'tanggal', 'keterangan', 'jenis', 'jumlah']);
        const rows = await sheet.getRows();
        return rows.map(r => ({
            id: r.get('id'),
            tanggal: r.get('tanggal'),
            keterangan: r.get('keterangan') || '',
            jenis: r.get('jenis') || 'pengeluaran',
            jumlah: parseInt(r.get('jumlah')) || 0,
        }));
    }

    return [];
}

export async function saveToSheet(type, valueList) {
    const doc = await getDoc();

    if (type === 'warga') {
        const sheet = await getOrInitSheet(doc, 'data warga', ['id', 'nama', 'blok', 'no_rumah']);
        await sheet.clearRows();

        const rowsToAdd = valueList.map(w => ({
            id: w.id,
            nama: w.nama,
            blok: w.blok,
            no_rumah: w.no_rumah
        }));
        if (rowsToAdd.length > 0) {
            await sheet.addRows(rowsToAdd);
        }
    }

    if (type === 'pertemuan') {
        const sheetP = await getOrInitSheet(doc, 'data pertemuan', ['id', 'tanggal', 'nama_pertemuan', 'catatan', 'total_jimpitan']);
        const sheetPresensi = await getOrInitSheet(doc, 'data presensi', ['pertemuan_id', 'warga_id', 'hadir']);

        await sheetP.clearRows();
        await sheetPresensi.clearRows();

        const pRowsToAdd = [];
        const presensiRowsToAdd = [];

        valueList.forEach(p => {
            pRowsToAdd.push({
                id: p.id,
                tanggal: p.tanggal,
                nama_pertemuan: p.nama_pertemuan,
                catatan: p.catatan,
                total_jimpitan: p.total_jimpitan || 0
            });

            if (p.presensiData) {
                Object.keys(p.presensiData).forEach(warga_id => {
                    presensiRowsToAdd.push({
                        pertemuan_id: p.id,
                        warga_id: warga_id,
                        hadir: p.presensiData[warga_id].hadir
                    });
                });
            }
        });

        if (pRowsToAdd.length > 0) await sheetP.addRows(pRowsToAdd);
        if (presensiRowsToAdd.length > 0) await sheetPresensi.addRows(presensiRowsToAdd);
    }

    if (type === 'jimpitan') {
        const sheet = await getOrInitSheet(doc, 'data jimpitan', ['id', 'tanggal', 'keterangan', 'jenis', 'jumlah']);
        await sheet.clearRows();
        const rowsToAdd = valueList.map(j => ({
            id: j.id,
            tanggal: j.tanggal,
            keterangan: j.keterangan,
            jenis: j.jenis,
            jumlah: j.jumlah || 0
        }));
        if (rowsToAdd.length > 0) {
            await sheet.addRows(rowsToAdd);
        }
    }
}
