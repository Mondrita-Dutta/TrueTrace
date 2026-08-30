import sys
import re

path = 'frontend/src/pages/public/LandingPage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('<div className="container mx-auto px-4 text-center">', '<div className="container mx-auto px-4 text-center relative z-10">')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed stacking context.')
