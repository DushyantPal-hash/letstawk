(function () {
  function loadComponent(selector, url) {
    var target = document.querySelector(selector);
    if (!target) return Promise.resolve();
    return fetch(url)
      .then(function (response) {
        if (!response.ok) throw new Error('Unable to load ' + url);
        return response.text();
      })
      .then(function (html) { target.innerHTML = html; });
  }

  function initialiseNavbar() {
    var dataNode = document.getElementById('navbarData');
    var desktopNav = document.getElementById('desktopNav');
    var mobileNav = document.getElementById('mobileNav');
    var navData = dataNode ? JSON.parse(dataNode.textContent) : { items: [] };

    function makeGroups(groups) {
      return groups.map(function (group) {
        return '<div class="mega-column"><h3>' + group.title + '</h3>' + group.links.map(function (link) { return '<a href="' + link[1] + '">' + link[0] + '</a>'; }).join('') + '</div>';
      }).join('');
    }
    navData.items.forEach(function (item, index) {
      if (item.href) {
        desktopNav.insertAdjacentHTML('beforeend', '<li><a href="' + item.href + '" class="nav-link">' + item.title + '</a></li>');
        mobileNav.insertAdjacentHTML('beforeend', '<a href="' + item.href + '" class="mobile-nav-link">' + item.title + '</a>');
        return;
      }
      var menuId = 'mobileMenuGroup' + index;
      desktopNav.insertAdjacentHTML('beforeend', '<li class="nav-dropdown"><button class="nav-dropdown-toggle" type="button" aria-haspopup="true" aria-expanded="false">' + item.title + ' <span class="nav-chevron">&#9662;</span></button><div class="nav-dropdown-menu" role="menu">' + makeGroups(item.groups) + '</div></li>');
      mobileNav.insertAdjacentHTML('beforeend', '<div class="mobile-nav-item"><button class="mobile-nav-link mobile-dropdown-trigger" type="button" data-dropdown="' + menuId + '">' + item.title + ' <span class="dropdown-arrow">&#9662;</span></button><div class="mobile-dropdown-menu" id="' + menuId + '">' + makeGroups(item.groups) + '</div></div>');
    });

    var header = document.getElementById('mainHeader');
    var menuToggle = document.getElementById('menuToggle');
    var mobileMenu = document.getElementById('mobileMenu');
    var menuClose = document.getElementById('menuClose');
    var menuOverlay = document.getElementById('menuOverlay');

    function setMobileMenu(open) {
      if (!mobileMenu || !menuToggle) return;
      mobileMenu.classList.toggle('is-open', open);
      mobileMenu.setAttribute('aria-hidden', String(!open));
      menuToggle.classList.toggle('is-active', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-is-open', open);
    }

    if (menuToggle) menuToggle.addEventListener('click', function () { setMobileMenu(!mobileMenu.classList.contains('is-open')); });
    if (menuClose) menuClose.addEventListener('click', function () { setMobileMenu(false); });
    if (menuOverlay) menuOverlay.addEventListener('click', function () { setMobileMenu(false); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') setMobileMenu(false); });

    document.querySelectorAll('.mobile-menu a').forEach(function (link) { link.addEventListener('click', function () { setMobileMenu(false); }); });
    document.querySelectorAll('.mobile-dropdown-trigger').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var panel = document.getElementById(trigger.dataset.dropdown);
        if (!panel) return;
        var willOpen = !panel.classList.contains('active');
        document.querySelectorAll('.mobile-dropdown-menu').forEach(function (menu) { menu.classList.remove('active'); });
        document.querySelectorAll('.mobile-dropdown-trigger').forEach(function (button) { button.classList.remove('active'); });
        panel.classList.toggle('active', willOpen);
        trigger.classList.toggle('active', willOpen);
      });
    });

    document.querySelectorAll('.nav-dropdown').forEach(function (dropdown) {
      var toggle = dropdown.querySelector('.nav-dropdown-toggle');
      if (!toggle) return;
      toggle.addEventListener('click', function (event) {
        event.stopPropagation();
        var willOpen = toggle.getAttribute('aria-expanded') !== 'true';
        document.querySelectorAll('.nav-dropdown-toggle').forEach(function (button) { button.setAttribute('aria-expanded', 'false'); });
        toggle.setAttribute('aria-expanded', String(willOpen));
      });
    });
    document.addEventListener('click', function (event) {
      if (!event.target.closest('.nav-dropdown')) document.querySelectorAll('.nav-dropdown-toggle').forEach(function (button) { button.setAttribute('aria-expanded', 'false'); });
    });

    if (header) window.addEventListener('scroll', function () { header.classList.toggle('scrolled', window.scrollY > 20); }, { passive: true });
  }

  Promise.all([
    loadComponent('[data-component="navbar"]', 'components/navbar.html'),
    loadComponent('[data-component="footer"]', 'components/footer.html')
  ]).then(initialiseNavbar).catch(function (error) { console.error(error); });
}());
