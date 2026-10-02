(() => {
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
          summary.textContent = `Ваша оцінка: ${saved} / 5`;
          message.textContent =
            "Демо: оцінка зберігається лише у цьому браузері.";
          buttons.forEach((button) => {
            button.disabled = true;
          });
        }
      } catch (_) {
        message.textContent = "Локальне сховище недоступне у цьому браузері.";
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
            summary.textContent = `Ваша оцінка: ${score} / 5`;
            message.textContent =
              "Дякуємо! Це демо — оцінку бачите тільки ви у цьому браузері.";
            buttons.forEach((item) => {
              item.disabled = true;
            });
            paint(selected);
          } catch (_) {
            message.textContent =
              "Не вдалося зберегти оцінку в цьому браузері.";
          }
          return;
        }

        buttons.forEach((item) => {
          item.disabled = true;
        });
        message.textContent = "Зберігаємо оцінку…";
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
                "Не вдалося зберегти оцінку. Спробуйте знову.",
            );
            failure.status = response.status;
            throw failure;
          }
          selected = score;
          summary.textContent = `${Number(result.data.average).toLocaleString("uk-UA", { maximumFractionDigits: 1 })} / 5 · ${result.data.count} голосів`;
          message.textContent = `Дякуємо! Ваша оцінка: ${score} із 5.`;
          paint(selected);
        } catch (error) {
          message.textContent =
            error.message || "Помилка мережі. Спробуйте ще раз.";
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
    status.textContent = "Збережені коментарі недоступні у цьому браузері.";
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
      date.textContent = new Date(entry.at).toLocaleString("uk-UA", {
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
      status.textContent = "Вкажіть імʼя та напишіть коментар.";
      return;
    }
    const updated = [{ name, text, at: Date.now() }, ...comments].slice(0, 50);
    try {
      localStorage.setItem(key, JSON.stringify(updated));
      comments = updated;
      renderComments();
      form.reset();
      status.textContent =
        "Коментар додано лише у вашому браузері. Інші відвідувачі його не побачать.";
    } catch (_) {
      status.textContent = "Не вдалося зберегти коментар у цьому браузері.";
    }
  });
})();
