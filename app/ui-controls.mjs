export function createUiControls(config) {
  const {
    els,
    panelStateKey,
    themeKey,
    setStatus
  } = config;

  function bindCollapsiblePanels() {
    const panelStates = readPanelStates();
    document.querySelectorAll("[data-collapsible-panel]").forEach((panel) => {
      const key = panel.dataset.panelKey || "";
      const toggle = panel.querySelector("[data-panel-toggle]");
      setPanelCollapsed(panel, Boolean(panelStates[key]), { persist: false });
      toggle?.addEventListener("click", () => {
        setPanelCollapsed(panel, !panel.classList.contains("is-collapsed"));
      });
    });
  }

  function setPanelCollapsed(panel, collapsed, options = {}) {
    panel.classList.toggle("is-collapsed", collapsed);
    const toggle = panel.querySelector("[data-panel-toggle]");
    toggle?.setAttribute("aria-expanded", String(!collapsed));
    if (options.persist === false) return;
    const key = panel.dataset.panelKey;
    if (!key) return;
    const panelStates = readPanelStates();
    panelStates[key] = Boolean(collapsed);
    window.localStorage.setItem(panelStateKey, JSON.stringify(panelStates));
  }

  function readPanelStates() {
    try {
      return JSON.parse(window.localStorage.getItem(panelStateKey) || "{}") || {};
    } catch {
      return {};
    }
  }

  function bindUtilityControls() {
    els.themeButton?.addEventListener("click", toggleTheme);
    els.settingsButton?.addEventListener("click", (event) => {
      event.stopPropagation();
      togglePopover(els.settingsPopover, els.helpPopover);
    });
    els.helpButton?.addEventListener("click", (event) => {
      event.stopPropagation();
      togglePopover(els.helpPopover, els.settingsPopover);
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".utility-popover") && !event.target.closest(".utility-actions")) {
        closeUtilityPopovers();
      }
    });
    bindQuickToggle(els.quickGridToggle, els.gridToggle);
    bindQuickToggle(els.quickAxisToggle, els.axisToggle);
    bindQuickToggle(els.quickEnvToggle, els.envToggle);
    syncQuickToggles();
  }

  function bindQuickToggle(quickToggle, sourceToggle) {
    quickToggle?.addEventListener("change", () => setSourceToggle(sourceToggle, quickToggle.checked));
    sourceToggle?.addEventListener("change", syncQuickToggles);
  }

  function setSourceToggle(sourceToggle, checked) {
    if (!sourceToggle || sourceToggle.checked === checked) return;
    sourceToggle.checked = checked;
    sourceToggle.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function syncQuickToggles() {
    if (els.quickGridToggle) els.quickGridToggle.checked = els.gridToggle.checked;
    if (els.quickAxisToggle) els.quickAxisToggle.checked = els.axisToggle.checked;
    if (els.quickEnvToggle) els.quickEnvToggle.checked = els.envToggle.checked;
  }

  function togglePopover(target, other) {
    if (!target) return;
    const show = target.hidden;
    closeUtilityPopovers();
    if (other) other.hidden = true;
    target.hidden = !show;
  }

  function closeUtilityPopovers() {
    if (els.settingsPopover) els.settingsPopover.hidden = true;
    if (els.helpPopover) els.helpPopover.hidden = true;
  }

  function applyStoredTheme() {
    const theme = window.localStorage.getItem(themeKey) || "light";
    document.body.classList.toggle("is-dark", theme === "dark");
    els.themeButton?.classList.toggle("is-active", theme === "dark");
  }

  function toggleTheme() {
    const dark = !document.body.classList.contains("is-dark");
    document.body.classList.toggle("is-dark", dark);
    els.themeButton?.classList.toggle("is-active", dark);
    window.localStorage.setItem(themeKey, dark ? "dark" : "light");
    setStatus(dark ? "已切换深色主题" : "已切换浅色主题");
  }

  return {
    bindCollapsiblePanels,
    bindUtilityControls,
    applyStoredTheme,
    closeUtilityPopovers
  };
}
