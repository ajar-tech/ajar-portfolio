(() => {
  const grid = document.getElementById('grid')
  const search = document.getElementById('search')
  const chips = [...document.querySelectorAll('.chip')]
  let filter = 'All', q = ''

  function cardTemplate(it, i){
    return `
    <article class="card reveal" style="transition-delay:${i*20}ms">
      <a class="card-link" href="p/${it.slug}.html" data-vt>
        <div class="card-inner" data-tilt>
          <div class="thumb" style="view-transition-name:thumb-${it.slug}"></div>
          <div class="glow"></div>
          <div class="meta">
            <div class="title" style="view-transition-name:title-${it.slug}">${it.title}</div>
            <div class="row"><span class="badge">${it.category}</span><span>${it.year||''}</span></div>
          </div>
        </div>
      </a>
    </article>`
  }

  function render(items){ grid.innerHTML = items.map(cardTemplate).join(''); enhanceCards('[data-tilt]') }

  let all = []
  fetch('data/projects.json').then(r=>r.json()).then(items => { all = items; update() })

  function update(){
    let items = all.slice()
    if (filter !== 'All') items = items.filter(i => i.category === filter)
    if (q) { const s = q.toLowerCase(); items = items.filter(i => i.title.toLowerCase().includes(s)) }
    items.sort((a,b)=> a.category===b.category? (a.order||999)-(b.order||999) : a.category.localeCompare(b.category))
    render(items)
  }

  search.addEventListener('input', (e)=>{ q = e.target.value; update() })
  document.addEventListener('keydown', (e)=>{ if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){ e.preventDefault(); search.focus() } })
  chips.forEach(c => c.addEventListener('click', () => { chips.forEach(x=>x.classList.remove('active')); c.classList.add('active'); filter = c.dataset.filter; update() }))
})();