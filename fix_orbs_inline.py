import sys
import re

path = 'frontend/src/pages/public/LandingPage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_hero_pattern = r'      <section className="relative overflow-hidden pt-20 pb-32">.*?className="absolute -bottom-20 left-1/3 w-\[500px\] h-\[500px\] md:w-\[700px\] md:h-\[700px\] bg-purple-500/40 dark:bg-purple-600/30 rounded-full blur-\[100px\] md:blur-\[150px\]"\s*/>\s*</div>'

new_hero = '''      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 -z-20" />
        
        {/* Animated Orbs Background (Idea 1 - Guaranteed Inline Styles) */}
        <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
          <motion.div 
            animate={{ 
              x: [0, 150, -100, 0], 
              y: [0, -150, 100, 0],
              scale: [1, 1.2, 0.8, 1]
            }} 
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: '600px', height: '600px', filter: 'blur(100px)' }}
            className="absolute top-10 -left-20 bg-teal-400/40 dark:bg-teal-500/30 rounded-full"
          />
          <motion.div 
            animate={{ 
              x: [0, -150, 150, 0], 
              y: [0, 150, -100, 0],
              scale: [1, 1.5, 1, 1]
            }} 
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            style={{ width: '500px', height: '500px', filter: 'blur(100px)' }}
            className="absolute top-40 right-10 bg-cyan-400/30 dark:bg-cyan-500/20 rounded-full"
          />
          <motion.div 
            animate={{ 
              x: [0, 100, -150, 0], 
              y: [0, 100, -150, 0],
              scale: [1, 0.8, 1.3, 1]
            }} 
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            style={{ width: '700px', height: '700px', filter: 'blur(120px)' }}
            className="absolute -bottom-20 left-1/3 bg-purple-500/40 dark:bg-purple-600/30 rounded-full"
          />
        </div>'''

if re.search(old_hero_pattern, content, re.DOTALL):
    content = re.sub(old_hero_pattern, new_hero, content, flags=re.DOTALL)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Inline styles applied.')
else:
    print('Regex not found.')
