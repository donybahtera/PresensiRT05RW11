/**
 * PANDUAN MENGGUNAKAN GOOGLE SHEETS SEBAGAI DATABASE:
 * 
 * 1. Buka browser dan pergi ke: https://sheets.new/ 
 *    (Ini akan membuat Spreadsheet kosong yang baru).
 * 2. Beri nama file Spreadsheet tersebut (misal: "Database Presensi RT 05").
 * 3. Di menu atas sebelah "Bantuan/Help", klik menu "Ekstensi" > "Apps Script".
 * 4. Akan terbuka tab baru "Apps Script". Hapus *semua* kode bawaan yang ada di situ.
 * 5. SALIN SELURUH KODE DI BAWAH INI, LALU TEMPELKAN ke dalam editor Apps Script tersebut.
 * 6. Klik tombol "Simpan" (ikon disket di bagian atas) atau tekan Ctrl+S.
 * 7. Klik tombol "Terapkan" (Deploy) berwarna biru di kanan atas -> "Deployment baru" (New deployment).
 * 8. Pada popup yang muncul:
 *    - Pilih jenis pengerahan (roda gigi) -> "Aplikasi web" (Web App).
 *    - Deskripsi: isi terserah, misal "API v1".
 *    - "Jalankan sebagai" (Execute as): "Saya" (Me).
 *    - "Siapa yang memiliki akses" (Who has access): "Siapa saja" (Anyone). !!!PENTING: Pilih Siapa Saja!!!
 * 9. Klik tombol "Terapkan" (Deploy).
 * 10. Jika muncul "Perlu Otorisasi" (Review Permissions), klik saja, pilih akun Google Anda,
 *     lalu klik "Advanced" (Lanjutan), lalu klik "Go to ... (unsafe)" atau "Buka ... (tidak aman)", dan klik "Izinkan" (Allow).
 * 11. Salin **"URL Aplikasi Web" (Web app URL)** yang didapatkan.
 * 12. Paste (Tempel) URL tersebut ke dalam file `assets/script.js` di baris yang ada tulisan `const API_URL = "..."`.
 * 13. Selesai! Saat ini Aplikasi Presensi RT 05 Anda sudah mempunyai Database online di Google Sheets!
 */

function doGet(e) {
  var action = e.parameter.action;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DatabaseJSON");
  
  // Jika sheet belum ada, buat otomatis
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("DatabaseJSON");
    sheet.appendRow(["Kunci", "Data Terakhir", "Waktu Update"]);
    sheet.getRange("A1:C1").setFontWeight("bold");
    sheet.autoResizeColumns(1, 3);
  }
  
  try {
    if (action === "getWarga") {
      var data = getFromSheet("warga", sheet);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", data: data }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "getPertemuan") {
      var data = getFromSheet("pertemuan", sheet);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", data: data }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: "Action tidak valid."}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
      return ContentService.createTextOutput(JSON.stringify({status: "error", message: err.toString()}))
        .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DatabaseJSON");
    // Jika sheet belum ada, buat otomatis
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("DatabaseJSON");
      sheet.appendRow(["Kunci", "Data Terakhir", "Waktu Update"]);
      sheet.getRange("A1:C1").setFontWeight("bold");
    }
    
    // Aplikasi client akan mengirim data sebagai plain text namun isinya JSON 
    // karena menghindari Preflight OPTIONS request yang ribet pada browser.
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var dataStr = typeof body.data === 'string' ? body.data : JSON.stringify(body.data);
    
    if (action === "saveWarga") {
      saveToSheet("warga", dataStr, sheet);
      return ContentService.createTextOutput(JSON.stringify({status: "success"}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "savePertemuan") {
      saveToSheet("pertemuan", dataStr, sheet);
      return ContentService.createTextOutput(JSON.stringify({status: "success"}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: "Action tidak divalidasi"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
      return ContentService.createTextOutput(JSON.stringify({status: "error", message: err.toString()}))
        .setMimeType(ContentService.MimeType.JSON);
  }
}

function getFromSheet(key, sheet) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      var jsonStr = data[i][1];
      if (jsonStr) return JSON.parse(jsonStr);
    }
  }
  return []; // Default balikan array kosong jika belum ada.
}

function saveToSheet(key, value, sheet) {
  var data = sheet.getDataRange().getValues();
  var found = false;
  var timestamp = new Date().toLocaleString("id-ID");
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      sheet.getRange(i + 1, 3).setValue(timestamp);
      found = true;
      break;
    }
  }
  
  if (!found) {
    sheet.appendRow([key, value, timestamp]);
  }
}
