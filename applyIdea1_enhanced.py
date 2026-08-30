import sys
import re

path = 'frontend/src/pages/public/LandingPage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_hero_pattern = r'      <section className="relative overflow-hidden pt-20 pb-32">.*?className="absolute -bottom-40 left-1/2 w-96 h-96 bg-purple-500/30 dark:bg-purple-600/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-\[100px\] opacity-70"\s*/>\s*</div>'

new_hero = '''      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 -z-20" />
        
        {/* Animated Orbs Background (Idea 1 - Enhanced) */}
        <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
          <motion.div 
            animate={{ 
              x: [0, 150, -100, 0], 
              y: [0, -150, 100, 0],
              scale: [1, 1.2, 0.8, 1]
            }} 
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 -left-20 w-[600px] h-[600px] bg-teal-400 dark:bg-teal-500 rounded-full mix-blend-multiply dark:mix-blend-screen blur-[120px] opacity-40 dark:opacity-20"
          />
          <motion.div 
            animate={{ 
              x: [0, -150, 150, 0], 
              y: [0, 150, -100, 0],
              scale: [1, 1.5, 1, 1]
            }} 
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-20 right-0 w-[700px] h-[700px] bg-cyan-400 dark:bg-cyan-500 rounded-full mix-blend-multiply dark:mix-blend-screen blur-[150px] opacity-40 dark:opacity-20"
          />
          <motion.div 
            animate={{ 
              x: [0, 100, -150, 0], 
              y: [0, 100, -150, 0],
              scale: [1, 0.8, 1.3, 1]
            }} 
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="absolute -bottom-40 left-1/3 w-[800px] h-[800px] bg-purple-500 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen blur-[150px] opacity-40 dark:opacity-20"
          />
        </div>'''

if re.search(old_hero_pattern, content, re.DOTALL):
    content = re.sub(old_hero_pattern, new_hero, content, flags=re.DOTALL)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Idea 1 enhanced applied.')
else:
    print('Regex not found.')

