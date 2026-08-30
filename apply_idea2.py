import sys
import re

path = 'frontend/src/pages/public/LandingPage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports if they don't exist
if 'Particles' not in content:
    content = content.replace("import { Link }", "import { Link }\nimport Particles from 'react-tsparticles';\nimport { loadSlim } from 'tsparticles-slim';")

# Make sure useCallback is imported
if 'useCallback' not in content:
    content = content.replace("import React, { useState, useEffect }", "import React, { useState, useEffect, useCallback }")

# Insert particlesInit inside the component
if 'const particlesInit' not in content:
    init_code = '''
  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);
'''
    content = content.replace('const LandingPage = () => {', 'const LandingPage = () => {' + init_code)

# Replace the Orbs div with Particles
old_bg_pattern = r'        \{/\* Animated Orbs Background.*?</div>'

particles_jsx = '''        {/* Animated Particle Network Background (Idea 2) */}
        <div className="absolute inset-0 -z-10">
          <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
              background: { color: { value: "transparent" } },
              fpsLimit: 120,
              interactivity: {
                events: {
                  onClick: { enable: true, mode: "push" },
                  onHover: { enable: true, mode: "repulse" },
                  resize: true,
                },
                modes: {
                  push: { quantity: 4 },
                  repulse: { distance: 150, duration: 0.4 },
                },
              },
              particles: {
                color: { value: "#2a9d8f" },
                links: { color: "#2a9d8f", distance: 150, enable: true, opacity: 0.4, width: 1 },
                move: { direction: "none", enable: true, outModes: { default: "bounce" }, speed: 1.5 },
                number: { density: { enable: true, area: 800 }, value: 80 },
                opacity: { value: 0.5 },
                shape: { type: "circle" },
                size: { value: { min: 1, max: 3 } },
              },
              detectRetina: true,
            }}
          />
        </div>'''

content = re.sub(old_bg_pattern, particles_jsx, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Idea 2 applied successfully.')
