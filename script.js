/* ========== DATA ===========
   Replace image file names inside images/ folder accordingly:
   images/java-loop.jpg
   images/mocha-mode.jpg
   images/dark-roast.jpg
   images/latte-log.jpg
   images/iced-debugger.jpg
   images/syntax-chill.jpg
   images/caramel-cache.jpg
   images/byte-frappe.jpg
============================== */

const MENU = [
  // hot
  { id:'java-loop', name:'Java Loop', price:380, desc:'Keeps you running forever.', section:'hot', img:'images/java-loop.jpg' },
  { id:'mocha-mode', name:'Mocha Mode', price:430, desc:'Warm, cozy & aesthetically coded.', section:'hot', img:'images/mocha-mode.jpg' },
  { id:'dark-roast', name:'Dark Roast Function', price:440, desc:'Returns pure focus.', section:'hot', img:'images/dark-roast.jpg' },
  { id:'latte-log', name:'Latte Log', price:350, desc:'Prints calm to your console.', section:'hot', img:'images/latte-log.jpg' },
  // cold
  { id:'iced-debugger', name:'Iced Debugger', price:480, desc:'Freezes bugs & reboots your brain.', section:'cold', img:'images/iced-debugger.jpg' },
  { id:'syntax-chill', name:'Syntax Chill', price:420, desc:'Smooth like clean code.', section:'cold', img:'images/syntax-chill.jpg' },
  { id:'caramel-cache', name:'Caramel Cache', price:450, desc:'Sweet storage for tired minds.', section:'cold', img:'images/caramel-cache.jpg' },
  { id:'byte-frappe', name:'Byte Frappe', price:400, desc:'A byte of chill for busy brains.', section:'cold', img:'images/byte-frappe.jpg' }
];

const introWrap = document.getElementById('introWrap');
const introVideo = document.getElementById('introVideo');
const app = document.getElementById('app');
const categoryCards = document.getElementById('categoryCards');
const categoryButtons = document.getElementById('categoryButtons');
const gallery = document.getElementById('gallery');
const cartToggle = document.getElementById('cartToggle');
const cartList = document.getElementById('cartList');
const totalPriceEl = document.getElementById('totalPrice');
const placeOrderBtn = document.getElementById('placeOrder');
const cartCountEl = document.getElementById('cartCount');
const welcomeCard = document.getElementById('welcomeCard');

let CART = {}; // {id: {item, qty}}
let currentCategory = null;
let revealTimer = null;

// utility
const format = n => '₨' + n.toFixed(2);

// reveal app after intro finishes or after 4000ms minimum
function revealApp() {
  if (!app.classList.contains('hidden')) return;
  introWrap.classList.add('hidden');
  app.classList.remove('hidden');
  // animate intro entrance
  setTimeout(()=> welcomeCard.classList.add('fadeIn'), 60);
}
introVideo.addEventListener('loadedmetadata', ()=> {
  const minDelay = 3000;
  const durationMs = Math.max(minDelay, Math.min(7000, Math.floor(introVideo.duration * 1000)));
  setTimeout(revealApp, durationMs);
});
// fallback
setTimeout(revealApp, 4500);

// Category selection handlers (both top pills and big cards)
function attachCategoryClicks() {
  document.querySelectorAll('.catBtn').forEach(b => {
    b.addEventListener('click', ()=> showCategory(b.dataset.cat));
  });
  document.querySelectorAll('.bigCard').forEach(b => {
    b.addEventListener('click', ()=> showCategory(b.dataset.cat));
  });
}

// show category: wipe gallery then reveal items one-by-one (snappy like a site)
async function showCategory(cat) {
  // if same category clicked, ignore
  if (currentCategory === cat) return;
  currentCategory = cat;

  // reset gallery
  gallery.innerHTML = '';
  gallery.classList.remove('hidden');
  welcomeCard.classList.add('hidden');

  // filter items
  const items = MENU.filter(i => i.section === cat);

  // create DOM cards but keep them hidden; reveal one-by-one quickly
  items.forEach((it)=>{
    const card = document.createElement('div');
    card.className = 'itemCard';
    card.innerHTML = `
      <img class="itemImage" src="${it.img}" alt="${it.name}" onerror="this.style.display='none'"/>
      <div class="itemRow">
        <div>
          <div class="itemName">${it.name}</div>
          <div class="itemDesc">${it.desc}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:700">${format(it.price)}</div>
          <button class="addBtn" data-id="${it.id}">Add</button>
        </div>
      </div>
    `;
    gallery.appendChild(card);
  });

  // reveal quickly one by one
  const cards = Array.from(gallery.children);
  for (let i = 0; i < cards.length; i++) {
    // small delay between reveals (snappy)
    await new Promise(r => setTimeout(r, 220));
    cards[i].classList.add('show');
  }
}

// add to cart
function addToCart(id) {
  const menuItem = MENU.find(m=>m.id===id);
  if(!menuItem) return;
  if(!CART[id]) CART[id] = { item: menuItem, qty: 0 };
  CART[id].qty += 1;
  renderCart();
}

// render cart
function renderCart() {
  cartList.innerHTML = '';
  const ids = Object.keys(CART);
  if(ids.length === 0){
    cartList.innerHTML = `<div class="emptyMsg">Cart is empty — add some coffee ☕</div>`;
    totalPriceEl.textContent = format(0);
    cartCountEl.textContent = 0;
    return;
  }
  let total = 0;
  ids.forEach(id=>{
    const { item, qty } = CART[id];
    const row = document.createElement('div');
    row.className = 'cartItem';
    row.innerHTML = `
      <div class="meta">
        <div style="font-weight:700">${item.name}</div>
        <div style="color:var(--muted);font-size:0.9rem">₨${item.price} × ${qty}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
        <div style="font-weight:700">₨${(item.price*qty).toFixed(2)}</div>
        <div class="qtyControls">
          <button class="qtyBtn" data-id="${id}" data-op="dec">−</button>
          <div style="min-width:26px;text-align:center">${qty}</div>
          <button class="qtyBtn" data-id="${id}" data-op="inc">+</button>
        </div>
      </div>
    `;
    cartList.appendChild(row);
    total += item.price * qty;
  });
  totalPriceEl.textContent = format(total);
  cartCountEl.textContent = ids.reduce((s,k)=>s + CART[k].qty, 0);

  // attach qty handlers
  cartList.querySelectorAll('.qtyBtn').forEach(b=>{
    b.addEventListener('click', ()=> {
      const id = b.dataset.id;
      const op = b.dataset.op;
      if(op === 'inc') CART[id].qty += 1;
      else CART[id].qty -= 1;
      if(CART[id].qty <= 0) delete CART[id];
      renderCart();
    });
  });
}

// place order
placeOrderBtn.addEventListener('click', ()=> {
  const ids = Object.keys(CART);
  if(ids.length === 0) { alert('Cart is empty — add a coffee ☕'); return; }
  let total = 0;
  let msg = 'Order confirmed!\\n\\n';
  ids.forEach(id => {
    const c = CART[id];
    msg += `${c.qty} × ${c.item.name} — ${format(c.item.price * c.qty)}\\n`;
    total += c.item.price * c.qty;
  });
  msg += `\\nTotal: ${format(total)}\\n\\nThanks for visiting The Debug Café ☕`;
  alert(msg);
  // clear
  for (const k in CART) delete CART[k];
  renderCart();
});

// global click delegation for Add buttons in gallery
document.body.addEventListener('click', (e) => {
  if(e.target.matches('.addBtn')){
    const id = e.target.dataset.id;
    addToCart(id);
    // quick feedback
    const original = e.target.textContent;
    e.target.textContent = 'Added ✓';
    setTimeout(()=> e.target.textContent = original, 700);
  }
  if(e.target.matches('.catBtn') || e.target.closest('.bigCard')){
    // category buttons handled by attachCategoryClicks initialised below
  }
});

// cart toggle (scroll to cart)
document.getElementById('cartToggle').addEventListener('click', ()=> {
  document.getElementById('cartPanel').scrollIntoView({behavior:'smooth', block:'center'});
});

// initialisation after DOM ready
document.addEventListener('DOMContentLoaded', ()=> {
  // show category buttons & attach big cards clicks
  attachCategoryClicks();

  // top category buttons (same functionality)
  document.querySelectorAll('.catBtn').forEach(b=>{
    b.addEventListener('click', ()=> showCategory(b.dataset.cat));
  });

  // after reveal, categories are selectable anytime
  // make sure welcome visible before selection
  renderCart();
});
