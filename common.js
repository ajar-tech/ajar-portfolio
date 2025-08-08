// Common interactions: tilt3D, ripple, cursor glow, scroll reveal, theme transition
(function(){
  const html = document.documentElement
  const saved = localStorage.getItem('theme')
  if (saved) html.setAttribute('data-theme', saved)
  window.setTheme = function(next){
    if (!document.startViewTransition){
      html.setAttribute('data-theme', next); localStorage.setItem('theme', next); return
    }
    document.startViewTransition(() => { html.setAttribute('data-theme', next); localStorage.setItem('theme', next) })
  }

  // Cursor glow
  const glow = document.createElement('div')
  glow.className = 'cursor-glow'
  document.body.appendChild(glow)
  let gx = -9999, gy = -9999
  function gl(){ glow.style.setProperty('--x', gx + 'px'); glow.style.setProperty('--y', gy + 'px'); requestAnimationFrame(gl) }
  gl()
  document.addEventListener('pointermove', (e)=>{ gx = e.clientX; gy = e.clientY }, {passive:true})

  // Scroll-in reveal
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('revealed')
        io.unobserve(en.target)
      }
    })
  }, {threshold: 0.12})
  document.querySelectorAll('.reveal').forEach(el => io.observe(el))

  // Tilt 3D + Ripple enhancer (call after rendering cards)
  window.enhanceCards = function(selector){
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.querySelectorAll(selector).forEach(card => {
      let raf = 0, rx=0, ry=0, tx=0, ty=0
      const maxTilt = 10
      const rect = () => card.getBoundingClientRect()

      function loop(){
        tx += (rx - tx) * 0.12
        ty += (ry - ty) * 0.12
        card.style.transform = `rotateX(${ty}deg) rotateY(${tx}deg) translateZ(0)`
        raf = requestAnimationFrame(loop)
      }
      function onMove(e){
        const r = rect()
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        rx = (px - 0.5) * (maxTilt*2)
        ry = -(py - 0.5) * (maxTilt*2)
      }
      function onEnter(){ if (!prefersReduced){ cancelAnimationFrame(raf); raf = requestAnimationFrame(loop) } }
      function onLeave(){ cancelAnimationFrame(raf); rx=ry=tx=ty=0; card.style.transform='' }

      card.addEventListener('pointerenter', onEnter)
      card.addEventListener('pointerleave', onLeave)
      card.addEventListener('pointermove', onMove)

      // Ripple
      card.addEventListener('pointerdown', (e)=>{
        const r = rect()
        const x = e.clientX - r.left, y = e.clientY - r.top
        const rip = document.createElement('span')
        rip.className = 'ripple'
        rip.style.left = x + 'px'; rip.style.top = y + 'px'
        card.appendChild(rip)
        rip.addEventListener('animationend', ()=>rip.remove())
      }, {passive:true})
    })
  }

  // Intercept page navigation for shared element transitions
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-vt]')
    if (!a || !document.startViewTransition) return
    e.preventDefault()
    const href = a.getAttribute('href')
    document.startViewTransition(() => { window.location.href = href })
  })
})();