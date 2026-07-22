const fs = require('fs');
const path = require('path');

const directory = './frontend/src';
const target1 = '`http://localhost:5000${';
const replace1 = '`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(\'/api\', \'\') : \'http://localhost:5000\'}${';

const target2 = '"http://localhost:5000${';
const replace2 = '"${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(\'/api\', \'\') : \'http://localhost:5000\'}${';

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walk(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

walk(directory, (filePath) => {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        if (content.includes(target1)) {
            content = content.split(target1).join(replace1);
            modified = true;
        }
        
        if (content.includes(target2)) {
            content = content.split(target2).join(replace2);
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Fixed:', filePath);
        }
    }
});
