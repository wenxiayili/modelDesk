export function createAnimationTools(config) {
  const {
    els,
    state,
    readControlNumber,
    formatCount,
    escapeHtml,
    setStatus,
    updateViewChip
  } = config;

  function setupAnimations(container) {
    resetAnimations({ keepUi: true });
    const groups = Array.from(container.animationGroups || []);
    state.animationItems = groups.map((group, index) => ({
      group,
      index,
      name: group.name || `Animation ${index + 1}`,
      playable: typeof group.play === "function" && typeof group.stop === "function"
    }));
    state.activeAnimationIndex = state.animationItems.findIndex((item) => item.playable);
    if (state.activeAnimationIndex < 0 && state.animationItems.length) {
      state.activeAnimationIndex = 0;
    }
    applyAnimationSpeed();
    renderAnimations();
  }

  function resetAnimations(options = {}) {
    stopAllAnimations();
    state.animationItems = [];
    state.activeAnimationIndex = -1;
    state.animationPlaying = false;
    if (!options.keepUi) renderAnimations();
    updateViewChip();
  }

  function stopAllAnimations() {
    state.animationItems.forEach((item) => {
      if (typeof item.group?.stop === "function") item.group.stop();
    });
  }

  function selectAnimation(index) {
    if (!Number.isFinite(index) || index < 0 || index >= state.animationItems.length) return;
    const current = getActiveAnimationItem();
    if (current?.playable) current.group.stop();
    state.animationPlaying = false;
    state.activeAnimationIndex = index;
    applyAnimationSpeed();
    renderAnimations();
    const item = getActiveAnimationItem();
    setStatus(item?.playable ? `已选择动画 ${item.name}` : "该动画格式暂不支持播放");
    updateViewChip();
  }

  function handleAnimationListClick(event) {
    const item = event.target.closest("[data-animation-index]");
    if (!item || !els.animationList?.contains(item)) return;
    selectAnimation(Number(item.dataset.animationIndex));
  }

  function toggleAnimationPlayback() {
    const item = getActiveAnimationItem();
    if (!item?.playable) {
      setStatus(state.animationItems.length ? "该动画格式暂不支持播放" : "当前模型没有动画", true);
      return;
    }

    if (state.animationPlaying) {
      if (typeof item.group.pause === "function") {
        item.group.pause();
      } else {
        item.group.stop();
      }
      state.animationPlaying = false;
      setStatus(`已暂停动画 ${item.name}`);
    } else {
      item.group.speedRatio = state.animationSpeed;
      item.group.play(true);
      state.animationPlaying = true;
      setStatus(`正在播放动画 ${item.name}`);
    }
    renderAnimations();
    updateViewChip();
  }

  function stopActiveAnimation() {
    const item = getActiveAnimationItem();
    if (!item?.playable) return;
    item.group.stop();
    state.animationPlaying = false;
    renderAnimations();
    updateViewChip();
    setStatus(`已停止动画 ${item.name}`);
  }

  function applyAnimationSpeed() {
    state.animationSpeed = readControlNumber(els.animationSpeedRange, 1);
    state.animationItems.forEach((item) => {
      if (item.playable) item.group.speedRatio = state.animationSpeed;
    });
  }

  function getActiveAnimationItem() {
    return state.animationItems[state.activeAnimationIndex] || null;
  }

  function renderAnimations() {
    const items = state.animationItems;
    const activeItem = getActiveAnimationItem();
    const canPlay = Boolean(activeItem?.playable);

    if (els.animationPanelTitle) {
      els.animationPanelTitle.textContent = items.length ? `动画 (${formatCount(items.length)})` : "动画";
    }

    if (els.animationSelect) {
      els.animationSelect.disabled = !items.length;
      els.animationSelect.innerHTML = items.length
        ? items.map((item, index) => `<option value="${index}">${escapeHtml(item.name)}${item.playable ? "" : "（仅查看）"}</option>`).join("")
        : `<option value="">无动画</option>`;
      els.animationSelect.value = state.activeAnimationIndex >= 0 ? String(state.activeAnimationIndex) : "";
    }

    [els.animationPlayButton, els.animationStopButton, els.animationSpeedRange, els.animationSpeedValue].forEach((control) => {
      if (control) control.disabled = !canPlay;
    });
    els.animationPlayButton?.classList.toggle("is-active", state.animationPlaying);

    if (!els.animationList) return;
    if (!items.length) {
      els.animationList.className = "empty-list";
      els.animationList.textContent = "未载入动画";
      return;
    }

    els.animationList.className = "animation-list";
    els.animationList.innerHTML = items.map((item, index) => {
      const classes = [
        "animation-item",
        index === state.activeAnimationIndex ? "is-active" : "",
        item.playable ? "" : "is-muted"
      ].filter(Boolean).join(" ");
      const status = item.playable
        ? (index === state.activeAnimationIndex && state.animationPlaying ? "播放中" : "就绪")
        : "仅查看";
      return `<div class="${classes}" data-animation-index="${index}">
        <span title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span>
        <small>${status}</small>
      </div>`;
    }).join("");
  }

  return {
    setupAnimations,
    resetAnimations,
    selectAnimation,
    handleAnimationListClick,
    toggleAnimationPlayback,
    stopActiveAnimation,
    applyAnimationSpeed,
    renderAnimations
  };
}
