/**
 * Хроносфера — Главный контроллер приложения (App Controller)
 * Управление интерфейсом, генерацией сценариев, хроникой дня и работой ИИ-Консультанта
 */

document.addEventListener("DOMContentLoaded", () => {
  // Инициализация фонового канваса в теплых тонах
  initCanvas();

  // Ссылки на элементы UI
  const form = document.getElementById("chrono-form");
  const queryInput = document.getElementById("query-input");
  const loader = document.getElementById("chrono-loader");
  const loaderText = document.getElementById("loader-text");
  const scenarioView = document.getElementById("scenario-view");
  const btnSound = document.getElementById("btn-sound");
  const btnFavorites = document.getElementById("btn-favorites");
  const btnSettings = document.getElementById("btn-settings");
  const btnSaveFav = document.getElementById("btn-save-fav");
  const btnPrint = document.getElementById("btn-print");
  const favBtnLabel = document.getElementById("fav-btn-label");

  // Элементы ИИ-Консультанта
  const aiOracleForm = document.getElementById("ai-oracle-form");
  const aiQuestionInput = document.getElementById("ai-question-input");
  const aiLoadingBox = document.getElementById("ai-loading-box");
  const aiAnswersFeed = document.getElementById("ai-answers-feed");
  const btnAskAI = document.getElementById("btn-ask-ai");

  let currentScenario = null;

  // 1. Инициализация звука
  btnSound.addEventListener("click", () => {
    const isEnabled = window.chronoAudio.toggleSound();
    btnSound.classList.toggle("active", isEnabled);
    if (isEnabled) {
      window.chronoAudio.playClick();
      showToast("Звуковые эффекты включены");
    } else {
      showToast("Звук отключен");
    }
  });

  // 2. Обработка ввода запроса
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = queryInput.value.trim();
    if (!query) return;

    await executeGeneration(query);
  });

  // 3. Обработка быстрых пресетов
  document.querySelectorAll(".chip-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const query = btn.getAttribute("data-query");
      queryInput.value = query;
      window.chronoAudio.playClick();
      await executeGeneration(query);
    });
  });

  // 4. Логика генерации сценария
  async function executeGeneration(query) {
    window.chronoAudio.playWarp();
    showLoader(true);

    const steps = [
      "ИИ сканирует квантовый спектр вероятностей...",
      "Вычисление точки бифуркации и каузальных связей...",
      "Моделирование последствий: от развилки до 2026 года...",
      "Формирование хроники одного дня и ретро-артефакта..."
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      loaderText.textContent = steps[stepIndex];
      window.chronoAudio.playType();
    }, 400);

    try {
      const engineMode = window.chronoStorage.getEngineMode();
      let scenario = null;

      // Попытка генерации через Gemini, если включен
      if (engineMode === "gemini" && window.chronoGeminiClient.hasApiKey()) {
        try {
          scenario = await window.chronoGeminiClient.generateAlternativeHistory(query);
        } catch (err) {
          console.warn("Ошибка Gemini API, переключаемся на встроенный движок:", err);
          showToast("Сбой Gemini API: использован встроенный хроно-интеллект");
          scenario = window.chronoCausalEngine.generate(query);
        }
      } else {
        // Задержка для атмосферного ощущения мыслительного процесса
        await new Promise((res) => setTimeout(res, 650));
        scenario = window.chronoCausalEngine.generate(query);
      }

      clearInterval(interval);
      showLoader(false);

      if (scenario) {
        currentScenario = scenario;
        window.chronoStorage.addToHistory(query);
        renderScenario(scenario);
        window.chronoAudio.playSync();

        // Плавный скролл к началу результатов
        scenarioView.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (error) {
      clearInterval(interval);
      showLoader(false);
      console.error(error);
      showToast("Ошибка при расчете ветви времени: " + error.message);
    }
  }

  function showLoader(show) {
    if (show) {
      loader.classList.add("active");
      scenarioView.classList.remove("active");
      document.getElementById("btn-submit").disabled = true;
    } else {
      loader.classList.remove("active");
      scenarioView.classList.add("active");
      document.getElementById("btn-submit").disabled = false;
    }
  }

  // 5. Рендеринг сценария в DOM
  function renderScenario(sc) {
    // Мета-карточка
    document.getElementById("sc-title").textContent = sc.title;
    document.getElementById("sc-summary").textContent = sc.summary;
    document.getElementById("sc-bifurcation-text").textContent = sc.divergencePoint;
    document.getElementById("sc-score").textContent = sc.divergenceScore;
    document.getElementById("sc-score-bar").style.width = `${sc.divergenceScore}%`;
    document.getElementById("sc-paradox-class").textContent = sc.paradoxLevel || "Высокий сдвиг";

    // Обновление состояния кнопки "В избранное"
    updateFavButtonState();

    // Шкала времени
    const timelineList = document.getElementById("sc-timeline-list");
    timelineList.innerHTML = "";

    sc.timeline.forEach((node, index) => {
      const nodeEl = document.createElement("div");
      nodeEl.className = "timeline-node";

      let detailsHtml = "";
      if (node.details && node.details.length > 0) {
        detailsHtml = `
          <ul class="node-details-list">
            ${node.details.map((d) => `<li>${d}</li>`).join("")}
          </ul>
        `;
      }

      nodeEl.innerHTML = `
        <div class="node-header">
          <span class="node-year-badge">${node.year}</span>
          <span class="node-epoch-title">${node.epochTitle || `Эпоха #${index + 1}`}</span>
        </div>
        <h4 class="node-headline">${node.headline}</h4>
        <p class="node-description">${node.description}</p>
        ${detailsHtml}
        ${node.quote ? `<div class="node-quote">${node.quote}</div>` : ""}
      `;

      nodeEl.addEventListener("click", () => {
        window.chronoAudio.playClick();
        nodeEl.style.transform = "scale(1.02)";
        setTimeout(() => (nodeEl.style.transform = ""), 200);
      });

      timelineList.appendChild(nodeEl);
    });

    // Сферы влияния
    document.getElementById("sc-sphere-tech").textContent = sc.spheres.tech;
    document.getElementById("sc-sphere-politics").textContent = sc.spheres.politics;
    document.getElementById("sc-sphere-daily").textContent = sc.spheres.dailyLife;
    document.getElementById("sc-sphere-economy").textContent = sc.spheres.economy;

    // Аналитический баланс реальности (Плюсы и минусы)
    if (sc.balance) {
      document.getElementById("sc-balance-gains").textContent = sc.balance.gains;
      document.getElementById("sc-balance-losses").textContent = sc.balance.losses;
    } else {
      document.getElementById("sc-balance-gains").textContent = "Глубокая трансформация общественных институтов и новые стимулы к фундаментальным открытиям.";
      document.getElementById("sc-balance-losses").textContent = "Отказ от привычных технологических удобств прежней исторической траектории.";
    }

    // Хроника одного дня (Day in Life)
    const dayGrid = document.getElementById("sc-day-grid");
    if (dayGrid) {
      dayGrid.innerHTML = "";
      const dayData = sc.dayInLife || [
        { time: "08:00", title: "Утро и адаптация", desc: "Распорядок дня граждан в новых исторических условиях." },
        { time: "13:00", title: "Деловой полдень", desc: "Функционирование производств и муниципальных служб." },
        { time: "19:00", title: "Вечерний досуг", desc: "Культурная и социальная жизнь горожан." }
      ];

      dayData.forEach((slice) => {
        const item = document.createElement("div");
        item.className = "day-slice-item";
        item.innerHTML = `
          <div class="day-slice-time">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${slice.time}
          </div>
          <div class="day-slice-title">${slice.title}</div>
          <div class="day-slice-desc">${slice.desc}</div>
        `;
        dayGrid.appendChild(item);
      });
    }

    // Ключевые институты и корпорации
    const instGrid = document.getElementById("sc-institutions-grid");
    if (instGrid) {
      instGrid.innerHTML = "";
      const instData = sc.institutions || [
        { tag: "Главный регулятор", name: "Коллегия Развития Реальности", desc: "Орган координации ключевых отраслей и технологических стандартов." }
      ];

      instData.forEach((inst) => {
        const card = document.createElement("div");
        card.className = "institution-card";
        card.innerHTML = `
          <div class="institution-tag">${inst.tag}</div>
          <div class="institution-name">${inst.name}</div>
          <div class="institution-desc">${inst.desc}</div>
        `;
        instGrid.appendChild(card);
      });
    }

    // Эффект бабочки
    document.getElementById("sc-butterfly").textContent = sc.butterflyEffect;

    // Газетный артефакт
    const art = sc.artifact;
    document.getElementById("art-stamp").textContent = art.stamp || "АРХИВ ХРОНОСФЕРЫ";
    document.getElementById("art-source").textContent = art.source || "ХРОНИКА ВРЕМЕНИ";
    document.getElementById("art-date").textContent = art.date || "Архивная запись";
    document.getElementById("art-price").textContent = art.price || "Общественное достояние";
    document.getElementById("art-headline").textContent = art.headline;
    document.getElementById("art-lead").textContent = art.lead;

    const colContainer = document.getElementById("art-columns");
    colContainer.innerHTML = "";
    if (art.columns && art.columns.length > 0) {
      art.columns.forEach((col) => {
        const colEl = document.createElement("div");
        colEl.className = "newspaper-col";
        colEl.innerHTML = `
          <h5>${col.title}</h5>
          <p>${col.text}</p>
        `;
        colContainer.appendChild(colEl);
      });
    }

    // ИИ-Консультант: сброс и добавление первого демонстрационного ответа
    aiAnswersFeed.innerHTML = "";
    loadInitialAIAnswer(sc);

    // Ветвление ("Что дальше?")
    const branchesList = document.getElementById("sc-branches-list");
    branchesList.innerHTML = "";

    if (sc.nextQuestions && sc.nextQuestions.length > 0) {
      sc.nextQuestions.forEach((q) => {
        const btn = document.createElement("button");
        btn.className = "branch-chip-btn";
        btn.innerHTML = `
          <span>${q}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        `;
        btn.addEventListener("click", async () => {
          queryInput.value = q;
          window.chronoAudio.playClick();
          await executeGeneration(q);
        });
        branchesList.appendChild(btn);
      });
    }
  }

  // 6. Логика ИИ-Консультанта (Хроно-Оракул)
  aiOracleForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = aiQuestionInput.value.trim();
    if (!q || !currentScenario) return;
    await executeAIQuestion(q);
  });

  // Клик по быстрым вопросам
  document.querySelectorAll(".ai-chip").forEach((chip) => {
    chip.addEventListener("click", async () => {
      const q = chip.getAttribute("data-q");
      aiQuestionInput.value = q;
      window.chronoAudio.playClick();
      await executeAIQuestion(q);
    });
  });

  async function executeAIQuestion(question) {
    if (!currentScenario) return;
    aiLoadingBox.classList.add("active");
    btnAskAI.disabled = true;
    window.chronoAudio.playType();

    try {
      const answer = await window.chronoAIOracle.answerQuestion(question, currentScenario);
      aiLoadingBox.classList.remove("active");
      btnAskAI.disabled = false;

      renderAIAnswerCard(answer);
      window.chronoAudio.playSync();
      aiQuestionInput.value = "";
    } catch (err) {
      aiLoadingBox.classList.remove("active");
      btnAskAI.disabled = false;
      showToast("Ошибка при ответе ИИ: " + err.message);
    }
  }

  function renderAIAnswerCard(ans) {
    const card = document.createElement("div");
    card.className = "ai-answer-card";

    let mechanismsHtml = "";
    if (ans.mechanisms && ans.mechanisms.length > 0) {
      mechanismsHtml = `
        <ul class="ai-mechanism-list">
          ${ans.mechanisms.map((m) => `<li>${m}</li>`).join("")}
        </ul>
      `;
    }

    let balanceHtml = "";
    if (ans.balance) {
      balanceHtml = `
        <div class="ai-answer-section">
          <div class="ai-block-badge badge-balance">⚖️ Плюсы и минусы порядка</div>
          <div class="ai-balance-grid">
            <div class="ai-balance-box pro">
              <strong>Преимущество (+):</strong> ${ans.balance.pro}
            </div>
            <div class="ai-balance-box con">
              <strong>Неудобство (−):</strong> ${ans.balance.con}
            </div>
          </div>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="ai-answer-query">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <span>${ans.query}</span>
      </div>

      <!-- 1. Прямой четкий ответ -->
      <div class="ai-answer-section">
        <div class="ai-block-badge badge-core">🎯 Прямой ответ (Ровно и четко)</div>
        <p class="ai-section-text"><strong>${ans.core}</strong></p>
      </div>

      <!-- 2. Механизм устройства -->
      <div class="ai-answer-section">
        <div class="ai-block-badge badge-mechanism">⚙️ Как это устроено на практике</div>
        ${mechanismsHtml}
      </div>

      <!-- 3. Живой пример -->
      ${
        ans.example
          ? `
        <div class="ai-answer-section">
          <div class="ai-block-badge badge-example">🏙️ Конкретный пример из 2026 года</div>
          <p class="ai-section-text" style="font-style: italic; color: #fed7aa;">${ans.example}</p>
        </div>
      `
          : ""
      }

      <!-- 4. Баланс -->
      ${balanceHtml}

      <div style="font-size: 0.75rem; color: var(--text-dim); text-align: right; margin-top: 4px;">
        🤖 Анализ: ${ans.source || "Хроно-ИИ Режим высокой четкости"}
      </div>
    `;

    // Добавляем новый ответ наверх
    aiAnswersFeed.prepend(card);
  }

  // Первоначальный демонстрационный ответ ИИ для сценария
  function loadInitialAIAnswer(sc) {
    let sampleQuestion = "Как люди знакомятся и общаются без интернета?";
    if (sc.id === "dinosaurs-survived") {
      sampleQuestion = "Как люди выживают рядом с гигантскими хищниками?";
    } else if (sc.id === "rome-never-fell") {
      sampleQuestion = "Как устроен римский орбитальный Сенат?";
    } else if (sc.id === "no-electricity") {
      sampleQuestion = "Как работают гигантские механические компьютеры?";
    }

    const defaultAns = window.chronoAIOracle.generateStructuredOfflineAnswer(sampleQuestion, sc);
    defaultAns.source = "Хроно-ИИ (Демонстрационный разбор)";
    renderAIAnswerCard(defaultAns);
  }

  // 7. Избранное
  function updateFavButtonState() {
    if (!currentScenario) return;
    const isFav = window.chronoStorage.isFavorite(currentScenario.id);
    btnSaveFav.classList.toggle("active", isFav);
    favBtnLabel.textContent = isFav ? "В избранном ★" : "В избранное";
  }

  btnSaveFav.addEventListener("click", () => {
    if (!currentScenario) return;
    const added = window.chronoStorage.toggleFavorite(currentScenario);
    window.chronoAudio.playClick();
    updateFavButtonState();
    showToast(added ? "Сценарий сохранен в избранное" : "Удалено из избранного");
  });

  // Открытие модального окна избранного
  btnFavorites.addEventListener("click", () => {
    window.chronoAudio.playClick();
    renderFavoritesModal();
    openModal("modal-favorites");
  });

  function renderFavoritesModal() {
    const container = document.getElementById("favorites-container");
    const favs = window.chronoStorage.getFavorites();

    if (favs.length === 0) {
      container.innerHTML = `<p style="color: var(--text-dim); text-align: center; padding: 20px;">Нет сохраненных хроник. Сохраняйте интересные ветви кнопкой «В избранное».</p>`;
      return;
    }

    container.innerHTML = "";
    favs.forEach((item) => {
      const el = document.createElement("div");
      el.className = "favorite-item";
      el.innerHTML = `
        <div class="favorite-info">
          <h4>${item.title}</h4>
          <p>${item.divergencePoint}</p>
        </div>
        <button class="btn-remove-fav" title="Удалить">&times;</button>
      `;

      el.querySelector(".favorite-info").addEventListener("click", () => {
        closeModal("modal-favorites");
        currentScenario = item;
        queryInput.value = item.query || item.title;
        renderScenario(item);
        window.chronoAudio.playSync();
        scenarioView.scrollIntoView({ behavior: "smooth" });
      });

      el.querySelector(".btn-remove-fav").addEventListener("click", (e) => {
        e.stopPropagation();
        window.chronoStorage.toggleFavorite(item);
        renderFavoritesModal();
        updateFavButtonState();
        showToast("Удалено из избранного");
      });

      container.appendChild(el);
    });
  }

  // 8. Печать / PDF
  btnPrint.addEventListener("click", () => {
    window.chronoAudio.playClick();
    window.print();
  });

  // 9. Настройки (Gemini API)
  btnSettings.addEventListener("click", () => {
    window.chronoAudio.playClick();
    const select = document.getElementById("select-engine");
    const keyInput = document.getElementById("input-gemini-key");

    select.value = window.chronoStorage.getEngineMode();
    keyInput.value = window.chronoGeminiClient.getApiKey();

    openModal("modal-settings");
  });

  document.getElementById("btn-save-settings").addEventListener("click", () => {
    const select = document.getElementById("select-engine");
    const keyInput = document.getElementById("input-gemini-key");

    window.chronoStorage.setEngineMode(select.value);
    window.chronoGeminiClient.setApiKey(keyInput.value);

    window.chronoAudio.playClick();
    closeModal("modal-settings");
    showToast("Настройки успешно сохранены");
  });

  // Модальные окна: закрытие
  document.querySelectorAll(".close-modal").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-modal");
      closeModal(modalId);
    });
  });

  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("active");
      }
    });
  });

  function openModal(id) {
    document.getElementById(id).classList.add("active");
  }

  function closeModal(id) {
    document.getElementById(id).classList.remove("active");
  }

  // Всплывающие уведомления (Toast)
  function showToast(msg) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>${msg}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(40px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Автозапуск первого сценария ("Что было бы, если бы люди не изобрели интернет?")
  const defaultQuery = "Что было бы, если бы люди не изобрели интернет?";
  queryInput.value = defaultQuery;
  const initialPreset = findMatchingPreset(defaultQuery);
  if (initialPreset) {
    currentScenario = initialPreset;
    renderScenario(initialPreset);
    scenarioView.classList.add("active");
  }
});

// ============================================================
// ФОНОВЫЙ КВАНТОВЫЙ ХОЛСТ (ТЕПЛЫЙ ЯНТАРНЫЙ ПОТОК ЧАСТИЦ)
// ============================================================
function initCanvas() {
  const canvas = document.getElementById("temporal-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particleCount = Math.min(65, Math.floor((width * height) / 18000));
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2 + 0.8,
      color: Math.random() > 0.4 ? "rgba(245, 158, 11, " : "rgba(234, 88, 12, "
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Рисуем теплые линии соединения
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(217, 119, 6, ${0.18 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Рисуем теплые частицы
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + "0.75)";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#f59e0b";
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    requestAnimationFrame(animate);
  }

  animate();
}
