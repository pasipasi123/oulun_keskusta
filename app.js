import { ORIGIN, polygonAt } from './geometry.js';

const status = document.querySelector('#map-status');
if (!window.L) {
  status.hidden = false;
  status.textContent = 'Karttakirjasto ei latautunut. Tarkista verkkoyhteys ja lataa sivu uudelleen.';
} else {
  const cities = { oulu: ORIGIN, helsinki: [60.1699, 24.9384], tampere: [61.4981, 23.7608], turku: [60.4518, 22.2666], jyvaskyla: [62.2415, 25.7473], lahti: [60.9827, 25.6615], lappeenranta: [61.0587, 28.1887] };
  // Disable Leaflet's separate CSS zoom animation: the screen-fixed SVG must
  // always reflect the same instantaneous zoom as the tile layer.
  const map = L.map('map', { zoomControl: false, zoomAnimation: false, minZoom: 3, maxZoom: 19, scrollWheelZoom: 'center', doubleClickZoom: 'center', maxBounds: [[-80, -Infinity], [80, Infinity]], maxBoundsViscosity: 1 }).setView(ORIGIN, 13);
  map.attributionControl.setPrefix(false);
  const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
  let failures = 0;
  tiles.on('tileerror', () => {
    if (++failures >= 3) { status.hidden = false; status.textContent = 'Karttatiilien lataus epäonnistui. Tarkista verkkoyhteys.'; }
  });
  tiles.on('tileload', () => { failures = 0; status.hidden = true; });
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.control.scale({ position: 'bottomleft', imperial: false, maxWidth: 140 }).addTo(map);
  const svg = document.querySelector('#outline');
  const polygon = document.querySelector('#city-polygon');
  const buttons = [...document.querySelectorAll('[data-city]')];
  const picker = document.querySelector('.city-picker');
  const cityToggle = document.querySelector('#city-toggle');
  const mobileLayout = matchMedia('(max-width: 600px)');
  function closeCityList() {
    picker.classList.remove('is-open');
    cityToggle.setAttribute('aria-expanded', 'false');
  }
  cityToggle.addEventListener('click', () => {
    const open = picker.classList.toggle('is-open');
    cityToggle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('pointerdown', event => {
    if (!picker.contains(event.target)) closeCityList();
  });
  picker.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeCityList(); cityToggle.focus(); }
  });
  mobileLayout.addEventListener('change', closeCityList);
  function render() {
    const center = map.getCenter(), size = map.getSize();
    svg.setAttribute('viewBox', `0 0 ${size.x} ${size.y}`);
    polygon.setAttribute('points', polygonAt([center.lat, center.lng]).map(point => {
      const p = map.latLngToContainerPoint(point);
      return `${p.x},${p.y}`;
    }).join(' '));
    const lng = ((center.lng + 180) % 360 + 360) % 360 - 180;
    document.querySelector('#coordinates').textContent = `${Math.abs(center.lat).toFixed(4)}° ${center.lat >= 0 ? 'N' : 'S'} · ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(map.distance(center, cities[button.dataset.city]) < 100)));
    const selectedCity = buttons.find(button => button.getAttribute('aria-pressed') === 'true');
    document.querySelector('#city-current').textContent = selectedCity?.textContent || 'Valitse kaupunki';
    document.querySelector('.polygon-label').hidden = map.getZoom() < 12;
  }
  map.on('move zoom resize', render);
  buttons.forEach(button => button.addEventListener('click', () => {
    map.setView(cities[button.dataset.city], 13, { animate: false });
    closeCityList();
    if (mobileLayout.matches) cityToggle.focus();
  }));
  new ResizeObserver(() => map.invalidateSize({ pan: false })).observe(document.querySelector('#map'));
  render();
}

const dialog = document.querySelector('#about-dialog');
document.querySelector('#about-button').addEventListener('click', () => dialog.showModal());
document.querySelector('#close-about').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
