import sys
import re

path = 'frontend/src/pages/public/LandingPage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add className to Particles
old_particles = '            id="tsparticles"\n            init={particlesInit}'
new_particles = '            id="tsparticles"\n            init={particlesInit}\n            className="absolute inset-0 w-full h-full"'

if 'className="absolute inset-0 w-full h-full"' not in content:
    content = content.replace(old_particles, new_particles)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Particles component styled.')
