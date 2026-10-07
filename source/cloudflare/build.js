// Builds src/worker.js: the Worker template with the admin page embedded.
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'src', 'admin_html.txt'), 'utf8').replace(/^const ADMIN_HTML = `/, '').replace(/`;\s*$/, '');
const tpl = fs.readFileSync(path.join(__dirname, 'src', 'worker.template.js'), 'utf8');
fs.writeFileSync(path.join(__dirname, 'src', 'worker.js'), tpl.replace('__ADMIN_HTML__', () => JSON.stringify(html)));
console.log('built src/worker.js');
