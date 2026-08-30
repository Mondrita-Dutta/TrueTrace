import sys

path = 'frontend/src/pages/public/LandingPage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

bad_imports = '''import { Link }
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim'; from 'react-router-dom';'''

good_imports = '''import { Link } from 'react-router-dom';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';'''

content = content.replace(bad_imports, good_imports)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Syntax error fixed.')
