import sys
import re

path = 'frontend/src/pages/public/LandingPage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure we add fullScreen: { enable: false } to the options
old_options = '              background: { color: { value: "transparent" } },'
new_options = '              fullScreen: { enable: false },\n              background: { color: { value: "transparent" } },'

if 'fullScreen: { enable: false }' not in content:
    content = content.replace(old_options, new_options)

# Make sure the container has full width/height
old_wrapper = '<div className="absolute inset-0 -z-10">'
new_wrapper = '<div className="absolute inset-0 -z-10" style={{ width: "100%", height: "100%" }}>'

if new_wrapper not in content:
    content = content.replace(old_wrapper, new_wrapper)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Particles config updated.')
