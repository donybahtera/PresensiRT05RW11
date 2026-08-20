const fs = require('fs');
const path = require('path');

const cssMap = {
    'btn-primary': 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-200 focus:ring-indigo-500 active:bg-indigo-800',
    'btn-secondary': 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-200',
    'btn-danger': 'bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 focus:ring-rose-500',
    'btn-success': 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-md hover:shadow-emerald-200 focus:ring-emerald-500',
    'btn': 'inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all duration-200 rounded-xl outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',

    'card': 'bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8',
    'table-container': 'w-full overflow-x-auto rounded-xl border border-slate-200 bg-white',

    // Custom Table parts need more manual replacement since they are global, 
    // but let's replace custom-table wrapper
    'custom-table': 'w-full text-left whitespace-nowrap custom-table-inlined',

    'form-control': 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50',
    'form-label': 'block text-sm font-medium text-slate-700 mb-1.5'
};

const pages = [
    'src/app/page.js',
    'src/app/warga/page.js',
    'src/app/pertemuan/page.js',
    'src/app/presensi/page.js'
];

pages.forEach(p => {
    const fullPath = path.join(__dirname, p);
    if (!fs.existsSync(fullPath)) return;

    let content = fs.readFileSync(fullPath, 'utf8');

    // Regex to replace classNames
    for (const [key, value] of Object.entries(cssMap)) {
        // Match exact class word inside className="" or className={}
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        content = content.replace(regex, value);
    }

    // Also replace table elements directly since we can't easily globally apply standard CSS for pseudo td/th
    // Actually, we can keep the table CSS in globals.css, because ONLY @apply caused the error. Wait, if @apply causes error, I can just use plain CSS for the table!

    fs.writeFileSync(fullPath, content);
    console.log('Updated ' + p);
});
