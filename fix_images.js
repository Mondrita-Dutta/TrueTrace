const fs = require('fs');
const path = require('path');

const directory = './frontend/src';

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

walk(directory, (filePath) => {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Ensure we don't double replace
        if (content.includes('http://localhost:5000')) {
            content = content.replace(/http:\/\/localhost:5000/g, "${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}");
            
            // There's one case that might break: <img src="http://localhost:5000..." /> without backticks.
            // Let's also fix double template literal strings
            content = content.replace(/"\${import\.meta\.env\.VITE_API_URL \? import\.meta\.env\.VITE_API_URL\.replace\('\/api', ''\) : 'http:\/\/localhost:5000'}(.*?)"/g, "{`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}$1`}");

            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Fixed:', filePath);
        }
    }
});
