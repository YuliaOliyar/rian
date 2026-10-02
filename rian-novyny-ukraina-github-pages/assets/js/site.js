(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".nav-primary");
  if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute(
        "aria-label",
        open ? "Закрити меню" : "Відкрити меню",
      );
    });
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        menu.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Відкрити меню");
      }
    });
  }

  const searchButton = document.querySelector(".search-toggle");
  const searchForm = document.querySelector("#header-search-form");
  const masthead = document.querySelector(".masthead");
  if (searchButton && searchForm && masthead) {
    searchButton.addEventListener("click", () => {
      const open = searchForm.classList.toggle("is-open");
      masthead.classList.toggle("is-search-open", open);
      searchButton.setAttribute("aria-expanded", String(open));
      searchButton.setAttribute(
        "aria-label",
        open ? "Закрити пошук" : "Відкрити пошук",
      );
      if (open) searchForm.querySelector("input")?.focus();
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    menu?.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Відкрити меню");
    searchForm?.classList.remove("is-open");
    masthead?.classList.remove("is-search-open");
    searchButton?.setAttribute("aria-expanded", "false");
    searchButton?.setAttribute("aria-label", "Відкрити пошук");
  });

  document.querySelector(".back-top")?.addEventListener("click", () => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
  });

  // Only the standalone GitHub Pages demo has #search-status. WordPress keeps its native search.
  const status = document.querySelector("#search-status");
  const query = new URLSearchParams(location.search).get("q")?.trim();
  if (!status || !query) return;

  const input = document.querySelector("#site-search");
  if (input) input.value = query;
  const original = document.querySelectorAll(
    ".top-grid, main > .section, .editorial-row, .two-column-lower",
  );
  const candidates = [
    ...document.querySelectorAll('main a[href="article.html"]'),
  ];
  const titles = new Set();
  const matches = candidates.filter((link) => {
    const title = (
      link.querySelector("h1,h2,h3,strong")?.textContent ||
      link.textContent ||
      ""
    ).trim();
    if (
      !title ||
      titles.has(title) ||
      !title.toLocaleLowerCase("uk").includes(query.toLocaleLowerCase("uk"))
    )
      return false;
    titles.add(title);
    return true;
  });
  original.forEach((element) => {
    element.hidden = true;
  });
  status.hidden = false;
  status.classList.add("section");
  const heading = document.createElement("h1");
  heading.className = "section-title";
  heading.textContent = `Пошук: ${query}`;
  status.append(heading);
  const description = document.createElement("p");
  description.textContent = matches.length
    ? `Знайдено матеріалів у демо: ${matches.length}`
    : "У демо не знайдено матеріалів за цим запитом.";
  status.append(description);
  const list = document.createElement("ul");
  list.className = "related-list";
  matches.forEach((match) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = match.getAttribute("href");
    link.textContent = (
      match.querySelector("h1,h2,h3,strong")?.textContent ||
      match.textContent ||
      ""
    ).trim();
    item.append(link);
    list.append(item);
  });
  status.append(list);
  document.title = `Пошук: ${query} — РІА Новини Україна`;
})();
