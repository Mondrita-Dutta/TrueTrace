import sys

path = 'frontend/src/pages/public/LandingPage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

old_hero_pattern = r'      <section className="relative overflow-hidden pt-20 pb-32">.*?className="absolute bottom-10 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -z-10"\s*/>'

new_hero = '''      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-slate-50 dark:bg-[#0b1121] -z-20" />
        
        {/* Animated Orbs Background (Idea 1) */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <motion.div 
            animate={{ 
              x: [0, 100, -50, 0], 
              y: [0, -100, 50, 0],
              scale: [1, 1.2, 0.9, 1]
            }} 
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -left-40 w-96 h-96 bg-primary/30 dark:bg-primary/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-70"
          />
          <motion.div 
            animate={{ 
              x: [0, -100, 100, 0], 
              y: [0, 100, -50, 0],
              scale: [1, 1.5, 1, 1]
            }} 
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-20 right-10 w-[500px] h-[500px] bg-cyan-400/30 dark:bg-cyan-500/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[120px] opacity-60"
          />
          <motion.div 
            animate={{ 
              x: [0, 50, -100, 0], 
              y: [0, 50, -100, 0],
              scale: [1, 0.8, 1.2, 1]
            }} 
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="absolute -bottom-40 left-1/2 w-96 h-96 bg-purple-500/30 dark:bg-purple-600/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-70"
          />
        </div>'''

if re.search(old_hero_pattern, content, re.DOTALL):
    content = re.sub(old_hero_pattern, new_hero, content, flags=re.DOTALL)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Idea 1 applied.')
else:
    print('Regex not found.')

