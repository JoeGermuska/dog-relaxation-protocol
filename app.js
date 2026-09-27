// Relaxation Protocol app — vanilla JS, hash-routed, localStorage progress.

const STORAGE_KEY = "relax-protocol-progress-v1";
const root = document.getElementById("app");

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

let progress = loadProgress(); // { "1": [true, false, ...], ... }

function getModuleChecks(moduleId, stepCount) {
  const key = String(moduleId);
  let arr = progress[key];
  if (!arr) {
    arr = new Array(stepCount).fill(false);
    progress[key] = arr;
  } else if (arr.length !== stepCount) {
    // defensive: pad/truncate if data ever changes
    arr = arr.slice(0, stepCount);
    while (arr.length < stepCount) arr.push(false);
    progress[key] = arr;
  }
  return arr;
}

function setStepChecked(moduleId, stepIndex, checked) {
  const module = MODULES.find((m) => m.id === moduleId);
  const arr = getModuleChecks(moduleId, module.steps.length);
  arr[stepIndex] = checked;
  saveProgress(progress);
}

function moduleCompletedCount(moduleId) {
  const module = MODULES.find((m) => m.id === moduleId);
  const arr = getModuleChecks(moduleId, module.steps.length);
  return arr.filter(Boolean).length;
}

function totalSteps() {
  return MODULES.reduce((sum, m) => sum + m.steps.length, 0);
}

function totalCompleted() {
  return MODULES.reduce((sum, m) => sum + moduleCompletedCount(m.id), 0);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

// ---------- Router ----------

function parseHash() {
  const hash = location.hash.replace(/^#\/?/, "");
  if (hash === "" || hash === "home") return { view: "home" };
  if (hash === "about") return { view: "about" };
  const moduleMatch = hash.match(/^module\/(\d+)(?:\/(one))?$/);
  if (moduleMatch) {
    return {
      view: "module",
      id: parseInt(moduleMatch[1], 10),
      mode: moduleMatch[2] === "one" ? "one" : "all",
    };
  }
  return { view: "home" };
}

function navigate(hash) {
  location.hash = hash;
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);

function render() {
  const route = parseHash();
  window.scrollTo(0, 0);
  if (route.view === "about") {
    renderAbout();
  } else if (route.view === "module") {
    renderModule(route.id, route.mode);
  } else {
    renderHome();
  }
}

// ---------- Views ----------

function renderTopbar(title, backHash, homeStyle) {
  return `
    <div class="topbar${homeStyle ? " home" : ""}">
      <div class="topbar-inner">
        ${backHash ? `<a class="back-link" href="#${backHash}">&larr; Back</a>` : ""}
        <h1>${title}</h1>
      </div>
    </div>
  `;
}

function renderHome() {
  const done = totalCompleted();
  const total = totalSteps();
  const pct = total ? Math.round((done / total) * 100) : 0;

  const items = MODULES.map((m) => {
    const c = moduleCompletedCount(m.id);
    const n = m.steps.length;
    const mpct = n ? Math.round((c / n) * 100) : 0;
    const isDone = c === n;
    return `
      <a class="module-card" href="#module/${m.id}">
        <div class="module-num${isDone ? " done" : ""}">${isDone ? "&#10003;" : m.id}</div>
        <div class="module-body">
          <div class="title">Module ${m.id}</div>
          <div class="sub">${c} of ${n} steps done</div>
        </div>
        <div class="module-mini-track"><div class="module-mini-fill" style="width:${mpct}%"></div></div>
      </a>
    `;
  }).join("");

  root.innerHTML = `
    ${renderTopbar("Relaxation Protocol", null, true)}
    <div class="wrap">
      <div class="hero">
        <h1>Relaxation Protocol</h1>
        <p>15 modules, easiest to hardest. Work through a few exercises per session — stop and back up a step if your dog shows any sign of stress.</p>
        <div class="overall-progress">
          <div class="row"><span>Overall progress</span><strong>${done} / ${total} steps</strong></div>
          <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
        </div>
      </div>
      <a class="about-link" href="#about">
        <span>How to use this &amp; general tips</span>
        <span class="chev">&rarr;</span>
      </a>
      <ul class="module-list">
        ${items}
      </ul>
      <div class="footer-note">${escapeHtml(INTRO.source)}</div>
    </div>
  `;
}

function renderAbout() {
  const list = (arr) => arr.map((s) => `<li>${escapeHtml(s)}</li>`).join("");
  root.innerHTML = `
    ${renderTopbar("About", "/")}
    <div class="wrap">
      <div class="section" style="margin-top:20px;">
        <h2>Purpose</h2>
        <p>${escapeHtml(INTRO.purpose)}</p>
      </div>
      <div class="section">
        <h2>Practice, practice, practice</h2>
        <p>${escapeHtml(INTRO.progress)}</p>
      </div>
      <div class="section">
        <h2>The exercises</h2>
        <p>${escapeHtml(INTRO.exercises)}</p>
      </div>
      <div class="section">
        <h2>Household</h2>
        <p>${escapeHtml(INTRO.household)}</p>
      </div>
      <div class="section">
        <h2>The mat</h2>
        <p>${escapeHtml(INTRO.mat)}</p>
      </div>
      <div class="section">
        <h2>Modules &amp; sessions</h2>
        <p>${escapeHtml(INTRO.modules)}</p>
      </div>
      <div class="section">
        <h2>Choosing a room</h2>
        <p>${escapeHtml(INTRO.room)}</p>
      </div>
      <div class="section">
        <h2>Rewards</h2>
        <p>${escapeHtml(INTRO.reward)}</p>
      </div>
      <div class="section">
        <h2>Food treat guidelines</h2>
        <ul>${list(INTRO.treats)}</ul>
      </div>
      <div class="section">
        <h2>Getting started</h2>
        <ol>${INTRO.gettingStarted.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
        <p>${escapeHtml(INTRO.gettingStartedNotes)}</p>
      </div>
      <div class="section">
        <h2>Tips</h2>
        <ul>${list(INTRO.tips)}</ul>
      </div>
      <div class="callout">
        If your dog is growling, lunging, barking, whining, consistently trying to escape, or trembling: stop, do not reward, and contact the Behavior Service.
      </div>
      <div class="footer-note">${escapeHtml(INTRO.source)}</div>
    </div>
  `;
}

function renderModule(id, mode) {
  const module = MODULES.find((m) => m.id === id);
  if (!module) {
    navigate("/");
    return;
  }
  const checks = getModuleChecks(module.id, module.steps.length);
  const done = checks.filter(Boolean).length;
  const total = module.steps.length;

  const prevModule = MODULES.find((m) => m.id === id - 1);
  const nextModule = MODULES.find((m) => m.id === id + 1);

  root.innerHTML = `
    ${renderTopbar(`Module ${id}`, "/")}
    <div class="wrap">
      <div class="module-header">
        <div>
          <h1>Module ${id}</h1>
          <div class="sub">${total} exercises</div>
        </div>
      </div>

      <div class="mode-toggle">
        <button data-mode="all" class="${mode === "all" ? "active" : ""}">All steps</button>
        <button data-mode="one" class="${mode === "one" ? "active" : ""}">One at a time</button>
      </div>
      <div class="progress-line">${done} of ${total} done</div>

      <div id="mode-body"></div>

      <div class="module-nav">
        ${prevModule ? `<a href="#module/${prevModule.id}${mode === "one" ? "/one" : ""}">&larr; Module ${prevModule.id}</a>` : `<span>&larr;</span>`}
        ${nextModule ? `<a href="#module/${nextModule.id}${mode === "one" ? "/one" : ""}">Module ${nextModule.id} &rarr;</a>` : `<span>&rarr;</span>`}
      </div>

      <div class="utility-row">
        <button class="link-btn" id="reset-btn">Reset progress for this module</button>
      </div>
    </div>
  `;

  root.querySelectorAll(".mode-toggle button").forEach((btn) => {
    btn.addEventListener("click", () => {
      navigate(`/module/${id}${btn.dataset.mode === "one" ? "/one" : ""}`);
    });
  });

  root.querySelector("#reset-btn").addEventListener("click", () => {
    if (confirm(`Reset progress for Module ${id}?`)) {
      progress[String(id)] = new Array(total).fill(false);
      saveProgress(progress);
      render();
    }
  });

  const body = root.querySelector("#mode-body");
  if (mode === "one") {
    renderStepper(body, module, checks);
  } else {
    renderChecklist(body, module, checks);
  }
}

function renderChecklist(container, module, checks) {
  container.innerHTML = `
    <ul class="checklist">
      ${module.steps
        .map(
          (step, i) => `
        <li class="step-row${checks[i] ? " checked" : ""}" data-idx="${i}">
          <div class="step-check">&#10003;</div>
          <div class="step-num">${i + 1}</div>
          <div class="step-text">${escapeHtml(step)}</div>
        </li>
      `
        )
        .join("")}
    </ul>
  `;
  container.querySelectorAll(".step-row").forEach((row) => {
    row.addEventListener("click", () => {
      const idx = parseInt(row.dataset.idx, 10);
      const nowChecked = !row.classList.contains("checked");
      setStepChecked(module.id, idx, nowChecked);
      row.classList.toggle("checked", nowChecked);
      const line = document.querySelector(".progress-line");
      if (line) {
        const done = getModuleChecks(module.id, module.steps.length).filter(Boolean).length;
        line.textContent = `${done} of ${module.steps.length} done`;
      }
    });
  });
}

function renderStepper(container, module, checks) {
  // start at the first unchecked step, or the last step if all done
  let firstUnchecked = checks.findIndex((c) => !c);
  let cur = firstUnchecked === -1 ? module.steps.length - 1 : firstUnchecked;

  function paint() {
    const total = module.steps.length;
    const isChecked = checks[cur];
    const allDone = checks.every(Boolean);
    container.innerHTML = `
      <div class="stepper">
        <div class="stepper-meta">Step ${cur + 1} of ${total}${isChecked ? " · done" : ""}</div>
        <div class="stepper-card"><p>${escapeHtml(module.steps[cur])}</p></div>
        <div class="stepper-nav">
          <button class="btn" id="prev-btn" ${cur === 0 ? "disabled" : ""}>&larr; Prev</button>
          <button class="btn primary" id="done-btn">${isChecked ? "Checked ✓" : "Mark done"}</button>
          <button class="btn" id="next-btn" ${cur === total - 1 ? "disabled" : ""}>Next &rarr;</button>
        </div>
        ${allDone ? `<div class="stepper-complete">🎉 All exercises in this module are done. Repeat the module in a new room, or move on to Module ${module.id + 1}.</div>` : ""}
      </div>
    `;
    container.querySelector("#prev-btn").addEventListener("click", () => {
      if (cur > 0) {
        cur--;
        paint();
      }
    });
    container.querySelector("#next-btn").addEventListener("click", () => {
      if (cur < total - 1) {
        cur++;
        paint();
      }
    });
    container.querySelector("#done-btn").addEventListener("click", () => {
      const newVal = !checks[cur];
      checks[cur] = newVal;
      setStepChecked(module.id, cur, newVal);
      const line = document.querySelector(".progress-line");
      if (line) {
        const done = checks.filter(Boolean).length;
        line.textContent = `${done} of ${total} done`;
      }
      if (newVal && cur < total - 1) {
        cur++;
      }
      paint();
    });
  }

  paint();
}
