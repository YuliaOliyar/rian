(() => {
  // Polish plural forms: 1 głos, 2–4 głosy, 5+ głosów (12–14 → głosów).
  const votesLabel = (n) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (n === 1) return "głos";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "głosy";
    return "głosów";
  };
  const panel = document.querySelector(".rating-panel");
  if (panel) {
    const buttons = [
      ...panel.querySelectorAll(".rating-stars button[data-score]"),
    ];
    const summary = panel.querySelector("[data-rating-summary]");
    const message = panel.querySelector("[data-rating-message]");
    const demo = panel.dataset.ratingMode === "demo";
    const storageKey = "ria-demo-rating-article-v1";
    let selected = Number(panel.dataset.selectedScore || 0);

    if (demo) {
      try {
        const saved = Number(localStorage.getItem(storageKey));
        if (Number.isInteger(saved) && saved >= 1 && saved <= 5) {
          selected = saved;
          summary.textContent = `Twoja ocena: ${saved} / 5`;
          message.textContent =
            "Demo: ocena jest zapisywana wyłącznie w tej przeglądarce.";
          buttons.forEach((button) => {
            button.disabled = true;
          });
        }
      } catch (_) {
        message.textContent = "Pamięć lokalna jest niedostępna w tej przeglądarce.";
      }
    }

    function paint(score) {
      buttons.forEach((button) => {
        const value = Number(button.dataset.score);
        button.classList.toggle("is-filled", value <= score);
        button.setAttribute("aria-pressed", String(value === selected));
      });
    }
    paint(selected);

    const group = panel.querySelector(".rating-stars");
    group?.addEventListener("mouseleave", () => paint(selected));
    buttons.forEach((button) => {
      button.addEventListener("mouseenter", () => {
        if (!button.disabled) paint(Number(button.dataset.score));
      });
      button.addEventListener("focus", () => {
        if (!button.disabled) paint(Number(button.dataset.score));
      });
      button.addEventListener("blur", () => paint(selected));
      button.addEventListener("click", async () => {
        if (button.disabled || selected) return;
        const score = Number(button.dataset.score);
        if (demo) {
          try {
            localStorage.setItem(storageKey, String(score));
            selected = score;
            summary.textContent = `Twoja ocena: ${score} / 5`;
            message.textContent =
              "Dziękujemy! To wersja demo — ocenę widzisz tylko Ty w tej przeglądarce.";
            buttons.forEach((item) => {
              item.disabled = true;
            });
            paint(selected);
          } catch (_) {
            message.textContent =
              "Nie udało się zapisać oceny w tej przeglądarce.";
          }
          return;
        }

        buttons.forEach((item) => {
          item.disabled = true;
        });
        message.textContent = "Zapisujemy ocenę…";
        try {
          const data = new URLSearchParams({
            action: "ria_rate_post",
            post_id: panel.dataset.ratingPost,
            score: String(score),
            nonce: panel.dataset.ratingNonce,
          });
          const response = await fetch(panel.dataset.ratingEndpoint, {
            method: "POST",
            credentials: "same-origin",
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: data.toString(),
          });
          const result = await response.json();
          if (!response.ok || !result.success) {
            const failure = new Error(
              result.data?.message ||
                "Nie udało się zapisać oceny. Spróbuj ponownie.",
            );
            failure.status = response.status;
            throw failure;
          }
          selected = score;
          summary.textContent = `${Number(result.data.average).toLocaleString("pl-PL", { maximumFractionDigits: 1 })} / 5 · ${result.data.count} ${votesLabel(Number(result.data.count))}`;
          message.textContent = `Dziękujemy! Twoja ocena: ${score} z 5.`;
          paint(selected);
        } catch (error) {
          message.textContent =
            error.message || "Błąd sieci. Spróbuj ponownie.";
          if (error.status !== 409 && error.status !== 429) {
            buttons.forEach((item) => {
              item.disabled = false;
            });
          }
        }
      });
    });
  }

  const form = document.querySelector("#demo-comment-form");
  if (!form) return;
  const list = document.querySelector("#demo-comments-list");
  const counter = document.querySelector("#demo-comments-count");
  const empty = document.querySelector("#demo-comments-empty");
  const status = document.querySelector("#demo-comments-status");
  const key = "ria-demo-comments-article-v1";
  let comments = [];
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    if (Array.isArray(saved)) {
      comments = saved
        .filter(
          (entry) =>
            entry &&
            typeof entry.name === "string" &&
            typeof entry.text === "string" &&
            typeof entry.at === "number" &&
            Number.isFinite(entry.at) &&
            entry.at > 0 &&
            entry.at < 8.64e15,
        )
        .slice(0, 50);
    }
  } catch (_) {
    status.textContent = "Zapisane komentarze są niedostępne w tej przeglądarce.";
  }

  function renderComments() {
    list.replaceChildren();
    comments.forEach((entry) => {
      const item = document.createElement("li");
      item.className = "demo-comment";
      const header = document.createElement("div");
      header.className = "comment-meta";
      const author = document.createElement("strong");
      author.textContent = entry.name;
      const date = document.createElement("time");
      date.dateTime = new Date(entry.at).toISOString();
      date.textContent = new Date(entry.at).toLocaleString("pl-PL", {
        dateStyle: "medium",
        timeStyle: "short",
      });
      const body = document.createElement("p");
      body.textContent = entry.text;
      header.append(author, date);
      item.append(header, body);
      list.append(item);
    });
    counter.textContent = String(comments.length);
    empty.hidden = comments.length > 0;
  }
  renderComments();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = form.elements.author.value.trim().slice(0, 60);
    const text = form.elements.comment.value.trim().slice(0, 1000);
    if (!name || !text) {
      status.textContent = "Podaj imię lub pseudonim i wpisz treść komentarza.";
      return;
    }
    const updated = [{ name, text, at: Date.now() }, ...comments].slice(0, 50);
    try {
      localStorage.setItem(key, JSON.stringify(updated));
      comments = updated;
      renderComments();
      form.reset();
      status.textContent =
        "Komentarz został dodany tylko w Twojej przeglądarce. Inni odwiedzający go nie zobaczą.";
    } catch (_) {
      status.textContent = "Nie udało się zapisać komentarza w tej przeglądarce.";
    }
  });
})();
