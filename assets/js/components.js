(function () {
  // Get the base path for the current page
  function getBasePath() {
    // Get the current path
    var path = window.location.pathname;
    // Remove the filename and trailing slash to get the directory
    var pathParts = path.split("/");
    // Remove empty parts and the last part (filename or empty)
    var dirParts = pathParts.filter(function (part) {
      return part !== "";
    });
    // Remove the last part if it's a file (has extension)
    if (dirParts.length > 0 && dirParts[dirParts.length - 1].includes(".")) {
      dirParts.pop();
    }
    // Build the path to go back to root
    var depth = dirParts.length;
    var basePath = "";
    for (var i = 0; i < depth; i++) {
      basePath += "../";
    }
    return basePath || "./";
  }

  function loadComponent(selector, url) {
    var target = document.querySelector(selector);
    if (!target) return Promise.resolve();

    // Make the URL relative to the current page's location
    var basePath = getBasePath();
    // If URL already starts with / or http, don't modify it
    if (url.startsWith("/") || url.startsWith("http")) {
      // URL is absolute, don't modify
    } else {
      // Make URL relative to current page
      url = basePath + url;
    }

    return fetch(url)
      .then(function (response) {
        if (!response.ok) throw new Error("Unable to load " + url);
        return response.text();
      })
      .then(function (html) {
        target.innerHTML = html;
      });
  }

  function initialiseNavbar() {
    var dataNode = document.getElementById("navbarData");
    var desktopNav = document.getElementById("desktopNav");
    var mobileNav = document.getElementById("mobileNav");
    var navData = dataNode ? JSON.parse(dataNode.textContent) : { items: [] };

    function makeGroups(groups) {
      return groups
        .map(function (group) {
          return (
            '<div class="mega-column"><h3>' +
            group.title +
            "</h3>" +
            group.links
              .map(function (link) {
                // Make navigation links relative to current page
                var linkHref = link[1];
                // If link is absolute (starts with / or http), keep as is
                if (!linkHref.startsWith("/") && !linkHref.startsWith("http")) {
                  // If link is a filename like contact.html, make it relative
                  if (linkHref.includes(".html") && !linkHref.includes("/")) {
                    // For subdirectory pages, we need to go back to root
                    var basePath = getBasePath();
                    linkHref = basePath + linkHref;
                  }
                }
                return '<a href="' + linkHref + '">' + link[0] + "</a>";
              })
              .join("") +
            "</div>"
          );
        })
        .join("");
    }

    // Process navigation items
    navData.items.forEach(function (item, index) {
      if (item.href) {
        // Make navigation links relative to current page
        var linkHref = item.href;
        if (!linkHref.startsWith("/") && !linkHref.startsWith("http")) {
          if (linkHref.includes(".html") && !linkHref.includes("/")) {
            var basePath = getBasePath();
            linkHref = basePath + linkHref;
          }
        }
        desktopNav.insertAdjacentHTML(
          "beforeend",
          '<li><a href="' +
            linkHref +
            '" class="nav-link">' +
            item.title +
            "</a></li>",
        );
        mobileNav.insertAdjacentHTML(
          "beforeend",
          '<a href="' +
            linkHref +
            '" class="mobile-nav-link">' +
            item.title +
            "</a>",
        );
        return;
      }
      var menuId = "mobileMenuGroup" + index;
      desktopNav.insertAdjacentHTML(
        "beforeend",
        '<li class="nav-dropdown"><button class="btn nav-dropdown-toggle" type="button" aria-haspopup="true" aria-expanded="false">' +
          item.title +
          ' <span class="nav-chevron">&#9662;</span></button><div class="nav-dropdown-menu" role="menu">' +
          makeGroups(item.groups) +
          "</div></li>",
      );
      mobileNav.insertAdjacentHTML(
        "beforeend",
        '<div class="mobile-nav-item"><button class="mobile-nav-link mobile-dropdown-trigger" type="button" data-dropdown="' +
          menuId +
          '">' +
          item.title +
          ' <span class="dropdown-arrow">&#9662;</span></button><div class="mobile-dropdown-menu" id="' +
          menuId +
          '">' +
          makeGroups(item.groups) +
          "</div></div>",
      );
    });

    var header = document.getElementById("mainHeader");
    var menuToggle = document.getElementById("menuToggle");
    var mobileMenu = document.getElementById("mobileMenu");
    var menuClose = document.getElementById("menuClose");
    var menuOverlay = document.getElementById("menuOverlay");

    function setMobileMenu(open) {
      if (!mobileMenu || !menuToggle) return;
      mobileMenu.classList.toggle("is-open", open);
      mobileMenu.setAttribute("aria-hidden", String(!open));
      menuToggle.classList.toggle("is-active", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-is-open", open);
    }

    if (menuToggle)
      menuToggle.addEventListener("click", function () {
        setMobileMenu(!mobileMenu.classList.contains("is-open"));
      });
    if (menuClose)
      menuClose.addEventListener("click", function () {
        setMobileMenu(false);
      });
    if (menuOverlay)
      menuOverlay.addEventListener("click", function () {
        setMobileMenu(false);
      });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMobileMenu(false);
    });

    document.querySelectorAll(".mobile-menu a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMobileMenu(false);
      });
    });
    document
      .querySelectorAll(".mobile-dropdown-trigger")
      .forEach(function (trigger) {
        trigger.addEventListener("click", function () {
          var panel = document.getElementById(trigger.dataset.dropdown);
          if (!panel) return;
          var willOpen = !panel.classList.contains("active");
          document
            .querySelectorAll(".mobile-dropdown-menu")
            .forEach(function (menu) {
              menu.classList.remove("active");
            });
          document
            .querySelectorAll(".mobile-dropdown-trigger")
            .forEach(function (button) {
              button.classList.remove("active");
            });
          panel.classList.toggle("active", willOpen);
          trigger.classList.toggle("active", willOpen);
        });
      });

    document.querySelectorAll(".nav-dropdown").forEach(function (dropdown) {
      var toggle = dropdown.querySelector(".nav-dropdown-toggle");
      if (!toggle) return;
      toggle.addEventListener("click", function (event) {
        event.stopPropagation();
        var willOpen = toggle.getAttribute("aria-expanded") !== "true";
        document
          .querySelectorAll(".nav-dropdown-toggle")
          .forEach(function (button) {
            button.setAttribute("aria-expanded", "false");
          });
        toggle.setAttribute("aria-expanded", String(willOpen));
      });
    });
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".nav-dropdown"))
        document
          .querySelectorAll(".nav-dropdown-toggle")
          .forEach(function (button) {
            button.setAttribute("aria-expanded", "false");
          });
    });

    if (header)
      window.addEventListener(
        "scroll",
        function () {
          header.classList.toggle("scrolled", window.scrollY > 20);
        },
        { passive: true },
      );
  }

  function initialiseFaq() {
    var faqTarget = document.querySelector('[data-component="faq"]');
    var dataNode = document.getElementById("faqData");
    if (!faqTarget || !dataNode) return;

    var faqData;
    try {
      faqData = JSON.parse(dataNode.textContent);
    } catch (error) {
      console.error("Unable to read FAQ data", error);
      return;
    }

    var title = faqTarget.querySelector("#faq-title");
    var description = faqTarget.querySelector("#faq-description");
    var list = faqTarget.querySelector("#faqList");
    if (!list || !Array.isArray(faqData.items)) return;

    if (title && faqData.title) title.textContent = faqData.title;
    if (description && faqData.description)
      description.textContent = faqData.description;
    list.innerHTML = faqData.items
      .map(function (item, index) {
        return (
          '<details class="faq-item"' +
          (index === 0 ? " open" : "") +
          "><summary>" +
          item.question +
          '<span class="faq-icon" aria-hidden="true"></span></summary><p>' +
          item.answer +
          "</p></details>"
        );
      })
      .join("");
  }

  // Get the base path for component loading
  var componentBasePath = getBasePath();

  Promise.all([
    loadComponent(
      '[data-component="navbar"]',
      componentBasePath + "components/navbar.html",
    ),
    loadComponent(
      '[data-component="footer"]',
      componentBasePath + "components/footer.html",
    ),
    loadComponent(
      '[data-component="faq"]',
      componentBasePath + "components/faq.html",
    ),
  ])
    .then(function () {
      initialiseNavbar();
      initialiseFaq();
    })
    .catch(function (error) {
      console.error(error);
    });
})();
