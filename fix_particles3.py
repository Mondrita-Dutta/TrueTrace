import sys
import re

path = 'frontend/src/pages/public/LandingPage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the Particles component with a highly visible, foolproof configuration
old_particles_pattern = r'<Particles.*?detectRetina: true,\s*\}\}\s*/>'

new_particles = '''<Particles
          id="tsparticles"
          init={particlesInit}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}
          options={{
            fullScreen: { enable: false, zIndex: 0 },
            background: { color: { value: "transparent" } },
            fpsLimit: 120,
            particles: {
              color: { value: "#2dd4bf" }, // Bright Teal
              links: { color: "#2dd4bf", distance: 150, enable: true, opacity: 0.8, width: 2 },
              move: { enable: true, speed: 2 },
              number: { density: { enable: true, area: 800 }, value: 100 },
              opacity: { value: 0.8 },
              shape: { type: "circle" },
              size: { value: { min: 3, max: 6 } }, // Much larger particles
            },
            detectRetina: true,
          }}
        />'''

content = re.sub(old_particles_pattern, new_particles, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Particles config forced and made highly visible.')
