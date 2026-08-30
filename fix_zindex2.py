import sys
import re

path = 'frontend/src/pages/public/LandingPage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the hero section opening and background divs
old_hero = '''      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 -z-20" />
        
        {/* Animated Particle Network Background (Idea 2) */}
        <div className="absolute inset-0 -z-10" style={{ width: "100%", height: "100%" }}>
          <Particles
            id="tsparticles"
            init={particlesInit}
            className="absolute inset-0 w-full h-full"
            options={{
              fullScreen: { enable: false },'''

new_hero = '''      <section className="relative overflow-hidden pt-20 pb-32 bg-slate-50 dark:bg-slate-950">
        
        {/* Animated Particle Network Background (Idea 2) */}
        <Particles
          id="tsparticles"
          init={particlesInit}
          className="absolute inset-0 w-full h-full pointer-events-none"
          options={{
            fullScreen: { enable: false },'''

# We also need to remove the closing </div> of the old wrapper
if new_hero not in content:
    content = content.replace(old_hero, new_hero)
    # The old wrapper div was closed right before <div className="container...
    # We can just replace the closing tag
    wrapper_close_pattern = r'            \}\}\s*/>\s*</div>\s*<div className="container'
    wrapper_close_new = r'            }}\n          />\n        \n        <div className="container'
    content = re.sub(wrapper_close_pattern, wrapper_close_new, content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Hero section z-index fixed.')
else:
    print('Already fixed or regex failed.')
