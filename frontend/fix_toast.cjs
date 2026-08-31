
const fs = require('fs');
let content = fs.readFileSync('src/pages/manufacturer/ProductsPage.jsx', 'utf8');
content = content.replace(
  'toast.error(Failed to publish );',
  'toast.error(Failed to publish : );'
);
fs.writeFileSync('src/pages/manufacturer/ProductsPage.jsx', content);

