/* Progressive enhancement: the full catalogue and navigation work without JS. */
const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('#main-nav');
const narrowViewport = window.matchMedia('(max-width: 760px)');

function setMenuOpen(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.querySelector('span').textContent = open ? '−' : '＋';
  navigation.hidden = narrowViewport.matches && !open;
}

function syncNavigation() {
  menuButton.hidden = !narrowViewport.matches;
  setMenuOpen(false);
}

syncNavigation();
narrowViewport.addEventListener('change', syncNavigation);
menuButton.addEventListener('click', () => {
  setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenuOpen(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false);
    menuButton.focus();
  }
});

const toolbar = document.querySelector('.catalog-toolbar');
const filterButtons = [...document.querySelectorAll('.filters button')];
const products = [...document.querySelectorAll('.product')];
const count = document.querySelector('.result-count');
toolbar.hidden = false;

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const category = button.dataset.category;
    filterButtons.forEach((filter) => {
      filter.setAttribute('aria-pressed', String(filter === button));
    });
    let visibleCount = 0;
    products.forEach((product) => {
      const visible = category === 'all' || product.dataset.category === category;
      product.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    count.textContent = `Показано: ${visibleCount} из ${products.length}`;
  });
});
