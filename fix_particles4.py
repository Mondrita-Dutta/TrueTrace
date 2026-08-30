import sys
import re

path = 'frontend/src/pages/public/LandingPage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the Particles component with a Modern Grid & Glow design
old_particles_pattern = r'<Particles.*?detectRetina: true,\s*\}\}\s*/>'

new_design = '''{/* Animated Grid & Glow Background (Idea 3) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Subtle Grid Pattern */}
          <motion.div 
            animate={{ backgroundPosition: ["0px 0px", "0px 40px"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
            style={{
              backgroundImage: linear-gradient(to right, rgba(42, 157, 143, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(42, 157, 143, 0.1) 1px, transparent 1px),
              backgroundSize: '40px 40px',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)'
            }}
          />
          
          {/* Central Breathing Glow */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.6, 0.4]
            }} 
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-1/2 -translate-x-1/2"
            style={{ 
              width: '800px', 
              height: '500px', 
              borderRadius: '50%',
              backgroundColor: 'rgba(42, 157, 143, 0.25)', 
              filter: 'blur(100px)',
              transform: 'translateX(-50%) translateY(-30%)'
            }}
          />
          
          {/* Accent Glow */}
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.4, 0.2]
            }} 
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/4 right-0"
            style={{ 
              width: '600px', 
              height: '600px', 
              borderRadius: '50%',
              backgroundColor: 'rgba(102, 126, 234, 0.15)', 
              filter: 'blur(120px)'
            }}
          />
        </div>'''

if re.search(old_particles_pattern, content, re.DOTALL):
    content = re.sub(old_particles_pattern, new_design, content, flags=re.DOTALL)
    
    # We can also clean up the unused Particles imports to prevent warnings
    content = content.replace("import Particles from 'react-tsparticles';\n", "")
    content = content.replace("import { loadSlim } from 'tsparticles-slim';\n", "")
    
    init_func_pattern = r'\s*const particlesInit = useCallback\(async engine => \{\s*await loadSlim\(engine\);\s*\}, \[\]\);'
    content = re.sub(init_func_pattern, '', content)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Idea 3 applied successfully.')
else:
    print('Regex failed to find Particles component.')
