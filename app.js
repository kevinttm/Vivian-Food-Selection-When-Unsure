const DATA = STALL_DATA;

const TYPE_COLORS = {
  "Bakery":"#D685AD", "Bubble Tea":"#5FBFC0", "Cafe":"#C2447A", "Chicken Rice":"#A8A77A",
  "Chinese":"#EE8130", "Dessert":"#9C4FA3", "Fast Food":"#C22E28", "Hawker Centre":"#6F35FC",
  "Hotpot":"#A5762F", "Indian":"#C9A227", "Italian":"#5FA83C", "Japanese":"#6390F0",
  "Korean":"#D7A700", "Malay":"#6D4C41", "Seafood":"#3F7FD1", "Snacks":"#8C9A1E",
  "Thai":"#4E9E4E", "Vegetarian":"#4E9E4E", "Western":"#8C8FA3"
};
function typeColor(c){ return TYPE_COLORS[c] || "#8C8FA3"; }

const state = { search:"", price:new Set(), cuisine:new Set(), mall:new Set(), sortNearest:true };

const ALL_PRICES = ["$","$$","$$$"];
const ALL_CUISINES = [...new Set(DATA.map(d=>d.cuisine))].sort();
const ALL_MALLS = [...new Set(DATA.map(d=>d.mall))].sort();

function buildPanel(panelEl, items, activeSet, btnId, countId, isSwatch){
  panelEl.innerHTML = items.map(item=>{
    const swatch = isSwatch ? `<span class="swatch" style="background:${typeColor(item)}"></span>` : "";
    return `<label><input type="checkbox" data-val="${item}"> ${swatch}${item}</label>`;
  }).join("");
  panelEl.querySelectorAll('input[type=checkbox]').forEach(cb=>{
    cb.addEventListener('change', ()=>{
      const v = cb.getAttribute('data-val');
      if(cb.checked) activeSet.add(v); else activeSet.delete(v);
      updateFilterButtonState(btnId, countId, activeSet);
      render();
    });
  });
}
function updateFilterButtonState(btnId, countId, activeSet){
  const btn = document.getElementById(btnId);
  const chip = document.getElementById(countId);
  if(activeSet.size>0){ btn.classList.add('active'); chip.style.display='inline-block'; chip.textContent=activeSet.size; }
  else { btn.classList.remove('active'); chip.style.display='none'; }
}

buildPanel(document.getElementById('pricePanel'), ALL_PRICES, state.price, 'priceBtn', 'priceCount', false);
buildPanel(document.getElementById('cuisinePanel'), ALL_CUISINES, state.cuisine, 'cuisineBtn', 'cuisineCount', true);
buildPanel(document.getElementById('mallPanel'), ALL_MALLS, state.mall, 'mallBtn', 'mallCount', false);

function toggleAsyncPanel(btnId, panelId){
  document.getElementById(btnId).addEventListener('click', (e)=>{
    e.stopPropagation();
    const isOpen = document.getElementById(panelId).classList.contains('open');
    document.querySelectorAll('.filter-panel').forEach(p=>p.classList.remove('open'));
    if(!isOpen) document.getElementById(panelId).classList.add('open');
  });
}
toggleAsyncPanel('priceBtn','pricePanel');
toggleAsyncPanel('cuisineBtn','cuisinePanel');
toggleAsyncPanel('mallBtn','mallPanel');
document.addEventListener('click', ()=> document.querySelectorAll('.filter-panel').forEach(p=>p.classList.remove('open')));
document.querySelectorAll('.filter-panel').forEach(p=>p.addEventListener('click', e=>e.stopPropagation()));

document.getElementById('searchInput').addEventListener('input', (e)=>{
  state.search = e.target.value.trim().toLowerCase();
  render();
});

document.getElementById('resetBtn').addEventListener('click', ()=>{
  state.search=""; state.price.clear(); state.cuisine.clear(); state.mall.clear();
  document.getElementById('searchInput').value="";
  document.querySelectorAll('.filter-panel input[type=checkbox]').forEach(cb=>cb.checked=false);
  ['priceBtn','cuisineBtn','mallBtn'].forEach(id=>document.getElementById(id).classList.remove('active'));
  ['priceCount','cuisineCount','mallCount'].forEach(id=>document.getElementById(id).style.display='none');
  render();
});

function chipHTML(label, onRemove){
  return `<span class="chip">${label}<button data-remove="${onRemove}">✕</button></span>`;
}
function renderChips(){
  const row = document.getElementById('chipRow');
  let chips = [];
  state.price.forEach(v=>chips.push(`price:${v}`));
  state.cuisine.forEach(v=>chips.push(`cuisine:${v}`));
  state.mall.forEach(v=>chips.push(`mall:${v}`));
  row.innerHTML = chips.map(c=>{
    const [type,val] = c.split(":");
    return chipHTML(val, c);
  }).join("");
  row.querySelectorAll('button').forEach(b=>{
    b.addEventListener('click', ()=>{
      const [type,val] = b.getAttribute('data-remove').split(":");
      const setMap = {price:state.price, cuisine:state.cuisine, mall:state.mall};
      setMap[type].delete(val);
      const panelMap = {price:'pricePanel', cuisine:'cuisinePanel', mall:'mallPanel'};
      document.querySelectorAll(`#${panelMap[type]} input[type=checkbox]`).forEach(cb=>{
        if(cb.getAttribute('data-val')===val) cb.checked=false;
      });
      const btnMap = {price:['priceBtn','priceCount'], cuisine:['cuisineBtn','cuisineCount'], mall:['mallBtn','mallCount']};
      updateFilterButtonState(btnMap[type][0], btnMap[type][1], setMap[type]);
      render();
    });
  });
}

function distancePill(km){
  return `<span class="distance-pill">📍 ${km.toFixed(2)} km from you</span>`;
}

function cardHTML(d){
  const color = typeColor(d.cuisine);
  const callBtn = d.tel ? `<a class="action-btn btn-call" href="${d.tel}">📞 Call</a>` : "";
  const mapBtn = `<a class="action-btn btn-map" href="${d.maps}" target="_blank" rel="noopener">📍 Map</a>`;
  const locText = d.unit ? `${d.mall} · ${d.unit}` : d.mall;
  return `
  <div class="card" data-id="${d.id}" style="border-color:${color}">
    <div class="card-top" style="background:${color}">
      <span class="mall-tag"><span class="pball"></span>${d.mall === "Northpoint City" ? "Northpoint" : "Wisteria"}</span>
      <span class="type-badge">${d.cuisine}</span>
    </div>
    <div class="card-body">
      <div class="card-name">${d.name}</div>
      <div class="card-loc">${locText}</div>
      <div class="price-row"><span class="price-tag">${d.price}</span></div>
      <div class="distance-row">${distancePill(d.distanceKm)}</div>
      <div class="btn-row">${callBtn}${mapBtn}</div>
    </div>
  </div>`;
}

function filteredData(){
  const list = DATA.filter(d=>{
    if(state.search && !d.name.toLowerCase().includes(state.search) && !d.cuisine.toLowerCase().includes(state.search)) return false;
    if(state.price.size>0 && !state.price.has(d.price)) return false;
    if(state.cuisine.size>0 && !state.cuisine.has(d.cuisine)) return false;
    if(state.mall.size>0 && !state.mall.has(d.mall)) return false;
    return true;
  });
  if(state.sortNearest){
    list.sort((a,b)=> a.distanceKm - b.distanceKm || a.name.localeCompare(b.name));
  } else {
    list.sort((a,b)=> a.name.localeCompare(b.name));
  }
  return list;
}

document.getElementById('sortBtn').addEventListener('click', ()=>{
  state.sortNearest = !state.sortNearest;
  document.getElementById('sortBtn').textContent = state.sortNearest ? "📍 SORT: NEAREST FIRST" : "🔤 SORT: A–Z";
  document.getElementById('sortBtn').classList.toggle('active', !state.sortNearest);
  render();
});

function render(){
  renderChips();
  const list = filteredData();
  const grid = document.getElementById('grid');
  const empty = document.getElementById('emptyState');
  document.getElementById('gridSubtitle').textContent = `Showing ${list.length} of ${DATA.length} stalls`;
  document.getElementById('wheelHint').textContent = list.length>0
    ? `${list.length} stall${list.length===1?"":"s"} in the ball, ready to catch.`
    : `No stalls to spin — adjust your filters.`;
  document.getElementById('spinBtn').disabled = list.length===0;
  if(list.length===0){ grid.innerHTML=""; empty.style.display='block'; return; }
  empty.style.display='none';
  grid.innerHTML = list.map(cardHTML).join("");
}

render();

/* ---------------- SPIN WHEEL ---------------- */
const wheelSegColors = ["#EE8130","#6390F0","#D7A700","#4E9E4E","#D685AD","#6F35FC","#A5762F","#8C9A1E"];
const segEl = document.getElementById('wheelSegments');
segEl.style.background = `conic-gradient(${wheelSegColors.map((c,i)=>`${c} ${i*45}deg ${(i+1)*45}deg`).join(",")})`;
segEl.style.opacity = "0.9";

let currentRotation = 0;
const ringEl = document.getElementById('ballRing');

document.getElementById('spinBtn').addEventListener('click', ()=>{
  const list = filteredData();
  if(list.length===0) return;
  const picked = list[Math.floor(Math.random()*list.length)];
  const extraSpins = 6 + Math.floor(Math.random()*3);
  const randomOffset = Math.floor(Math.random()*360);
  currentRotation += extraSpins*360 + randomOffset;
  document.getElementById('spinBtn').disabled = true;
  ringEl.style.transform = `rotate(${currentRotation}deg)`;
  setTimeout(()=>{ showReveal(picked); document.getElementById('spinBtn').disabled = filteredData().length===0; }, 3700);
});

function showReveal(d){
  const color = typeColor(d.cuisine);
  const callBtn = d.tel ? `<a class="action-btn btn-call" href="${d.tel}">📞 Call</a>` : "";
  const mapBtn = `<a class="action-btn btn-map" href="${d.maps}" target="_blank" rel="noopener">📍 Map</a>`;
  const locText = d.unit ? `${d.mall} · ${d.unit}` : d.mall;
  document.getElementById('revealBody').innerHTML = `
    <div style="display:inline-block; padding:3px 10px; border-radius:999px; background:${color}; color:#fff; font-weight:800; font-size:11.5px; margin-bottom:10px;">${d.cuisine}</div>
    <div style="font-size:20px; font-weight:900; margin-bottom:2px;">${d.name}</div>
    <div style="font-size:12.5px; color:var(--muted); font-weight:700; margin-bottom:10px;">${locText}</div>
    <div class="price-row" style="margin-bottom:10px;"><span class="price-tag">${d.price}</span></div>
    <div class="distance-row" style="margin-bottom:14px;">${distancePill(d.distanceKm)}</div>
    <div class="btn-row">${callBtn}${mapBtn}</div>
  `;
  document.getElementById('overlay').classList.add('open');
}
document.getElementById('closeReveal').addEventListener('click', ()=>{
  document.getElementById('overlay').classList.remove('open');
});
document.getElementById('overlay').addEventListener('click', (e)=>{
  if(e.target.id==='overlay') document.getElementById('overlay').classList.remove('open');
});