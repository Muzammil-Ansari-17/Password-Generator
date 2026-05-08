(function () {
  const STORAGE_KEY = "password-generator-theme";
  const CHARSETS = {
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+=-/*~`|:?><",
  };

  const dom = {};

  document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.classList.add("js");
    cacheDom();
    initTheme();
    initNavigation();
    initGenerator();
    initCopyActions();
    initRevealAnimations();
    initCounters();
    setCurrentYear();
    if (dom.passwordField && dom.generateButton) {
      generatePassword(false);
    }
  });

  function cacheDom() {
    dom.root = document.documentElement;
    dom.navToggle = document.querySelector("[data-nav-toggle]");
    dom.nav = document.querySelector("[data-navigation]");
    dom.themeToggle = document.querySelector("[data-theme-toggle]");
    dom.passwordField = document.getElementById("password");
    dom.copyButton = document.getElementById("copy");
    dom.regenButton = document.getElementById("regenerate");
    dom.generateButton = document.getElementById("generate");
    dom.generateLabel = document.querySelector("[data-generate-label]");
    dom.resetButton = document.querySelector("[data-reset]");
    dom.lengthRange = document.getElementById("lengthRange");
    dom.lengthInput = document.getElementById("length");
    dom.lengthValue = document.getElementById("length-value");
    dom.checkboxes = [
      document.getElementById("includeLower"),
      document.getElementById("includeUpper"),
      document.getElementById("includeNumbers"),
      document.getElementById("includeSymbols"),
    ].filter(Boolean);
    dom.status = document.getElementById("generator-status");
    dom.toastStack = document.querySelector("[data-toast-stack]");
    dom.strengthBar = document.querySelector("[data-strength-bar]");
    dom.strengthSegments = Array.from(document.querySelectorAll("[data-strength-segment]"));
    dom.strengthText = document.querySelector("[data-strength-text]");
    dom.entropyText = document.querySelector("[data-entropy-text]");
    dom.copyTriggers = Array.from(document.querySelectorAll("[data-copy-value]"));
    dom.yearNodes = Array.from(document.querySelectorAll("[data-year]"));
    dom.revealTargets = Array.from(document.querySelectorAll("main .section, main .panel, main .ad-slot, main .callout, main .feature-card, main .tip-card, main .mistake-card, main .quote-card, main .article-card, main .stat-card, main .contact-card, main .content-card, main .faq-item"));
    dom.counterNodes = Array.from(document.querySelectorAll("[data-counter]"));
  }

  function initTheme() {
    const savedTheme = safeStorageGet(STORAGE_KEY);
    setTheme(savedTheme || "light");

    if (!dom.themeToggle) return;

    dom.themeToggle.addEventListener("click", () => {
      const nextTheme = dom.root.dataset.theme === "dark" ? "light" : "dark";
      setTheme(nextTheme);
      safeStorageSet(STORAGE_KEY, nextTheme);
      showToast("Theme updated", `Switched to ${nextTheme} mode.`, "info");
    });
  }

  function setTheme(theme) {
    dom.root.dataset.theme = theme === "dark" ? "dark" : "light";
    dom.themeToggle?.setAttribute("aria-pressed", String(dom.root.dataset.theme === "dark"));
  }

  function initNavigation() {
    if (dom.navToggle && dom.nav) {
      dom.navToggle.addEventListener("click", () => {
        const open = dom.nav.classList.toggle("is-open");
        dom.navToggle.setAttribute("aria-expanded", String(open));
        dom.navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      });

      dom.nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          if (window.innerWidth <= 860) {
            dom.nav.classList.remove("is-open");
            dom.navToggle.setAttribute("aria-expanded", "false");
            dom.navToggle.setAttribute("aria-label", "Open navigation");
          }
        });
      });
    }
  }

  function initGenerator() {
    if (!dom.generateButton) return;

    const syncLength = (value) => {
      const clamped = clamp(parseInt(value, 10) || 12, 8, 32);
      if (dom.lengthRange) dom.lengthRange.value = String(clamped);
      if (dom.lengthInput) dom.lengthInput.value = String(clamped);
      if (dom.lengthValue) dom.lengthValue.textContent = String(clamped);
      return clamped;
    };

    dom.lengthRange?.addEventListener("input", (event) => {
      syncLength(event.target.value);
    });

    dom.lengthInput?.addEventListener("input", (event) => {
      syncLength(event.target.value);
    });

    dom.resetButton?.addEventListener("click", () => {
      dom.checkboxes.forEach((box) => {
        box.checked = true;
      });
      syncLength(12);
      updateStats({ length: 12, selectedCharsets: 4 });
      showStatus("Options restored to the recommended defaults.", "info");
      generatePassword(false);
    });

    dom.generateButton.addEventListener("click", () => generatePassword(true));
    dom.regenButton?.addEventListener("click", () => generatePassword(true));
    dom.copyButton?.addEventListener("click", () => copyPassword());

    dom.checkboxes.forEach((box) => {
      box.addEventListener("change", () => {
        syncOptionCards();
        const selected = getSelectedCharsets();
        updateStats({ length: getPasswordLength(), selectedCharsets: selected.length });
      });
    });

    syncOptionCards();
    updateStats({ length: getPasswordLength(), selectedCharsets: getSelectedCharsets().length });
  }

  function initCopyActions() {
    if (!dom.copyTriggers?.length) return;

    dom.copyTriggers.forEach((trigger) => {
      trigger.addEventListener("click", async () => {
        const value = trigger.dataset.copyValue || "";
        const label = trigger.dataset.copyLabel || "Value";
        const successMessage = trigger.dataset.copySuccess || `${label} copied to clipboard.`;
        const failureMessage = trigger.dataset.copyError || `Unable to copy ${label.toLowerCase()}.`;
        const tone = trigger.dataset.copyTone || "success";

        const success = await copyText(value, trigger, successMessage, failureMessage, tone);
        if (success) {
          trigger.classList.add("is-copied");
          window.setTimeout(() => trigger.classList.remove("is-copied"), 500);
        }
      });
    });
  }

  function initRevealAnimations() {
    if (!dom.revealTargets?.length) return;

    dom.revealTargets.forEach((node) => node.classList.add("reveal"));

    if (!("IntersectionObserver" in window)) {
      dom.revealTargets.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14 });

    dom.revealTargets.forEach((node) => observer.observe(node));
  }

  function initCounters() {
    if (!dom.counterNodes?.length) return;

    const animateCounter = (node) => {
      const target = parseInt(node.dataset.countTarget || "0", 10);
      const duration = 1100;
      const start = performance.now();
      const from = 0;

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const value = Math.round(from + (target - from) * easeOutCubic(progress));
        node.textContent = String(value);
        if (progress < 1) window.requestAnimationFrame(tick);
      };

      window.requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      dom.counterNodes.forEach(animateCounter);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    dom.counterNodes.forEach((node) => observer.observe(node));
  }

  function generatePassword(withLoading = true) {
    if (!dom.passwordField || !dom.generateButton) return;

    const selected = getSelectedCharsets();
    const length = getPasswordLength();

    if (!selected.length) {
      dom.passwordField.value = "";
      updateStats({ length, selectedCharsets: 0 });
      showStatus("Select at least one character set before generating.", "error");
      showToast("Nothing to generate", "Choose at least one character set.", "error");
      return;
    }

    if (withLoading) setLoading(true);

    window.setTimeout(() => {
      const password = buildPassword(selected, length);
      dom.passwordField.value = password;
      updateStats({ length, selectedCharsets: selected.length, password });
      showStatus("Password generated successfully. Copy it before closing the page.", "success");
      if (withLoading) setLoading(false);
    }, withLoading ? 220 : 0);
  }

  function buildPassword(selectedCharsets, length) {
    const pool = selectedCharsets.map((item) => CHARSETS[item]);
    const chars = pool.join("");
    const result = [];

    pool.forEach((charset) => {
      result.push(pickChar(charset));
    });

    while (result.length < length) {
      result.push(pickChar(chars));
    }

    return shuffle(result).join("");
  }

  async function copyPassword() {
    if (!dom.passwordField) return;

    const value = dom.passwordField.value.trim();
    if (!value) {
      showStatus("Generate a password before copying.", "error");
      showToast("Copy unavailable", "Create a password first.", "error");
      return;
    }

    const copied = await copyText(value, dom.copyButton, "Password copied to the clipboard.", "Clipboard access failed in this browser.", "success");
    if (copied) {
      dom.copyButton?.classList.add("is-copied");
      window.setTimeout(() => dom.copyButton?.classList.remove("is-copied"), 500);
    }
  }

  async function copyText(value, trigger, successMessage, failureMessage, tone = "success") {
    const onSuccess = () => {
      if (trigger === dom.copyButton) {
        showStatus(successMessage, "success");
      }
      showToast("Copied", successMessage, tone);
    };

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(value);
        onSuccess();
        return true;
      } catch (error) {
        // Fall through to the legacy path.
      }
    }

    const helper = document.createElement("textarea");
    helper.value = value;
    helper.setAttribute("readonly", "readonly");
    helper.style.position = "absolute";
    helper.style.left = "-9999px";
    document.body.appendChild(helper);
    helper.select();

    try {
      const copied = document.execCommand("copy");
      if (!copied) throw new Error("copy command failed");
      onSuccess();
      return true;
    } catch (error) {
      if (trigger === dom.copyButton) {
        showStatus(failureMessage, "error");
      }
      showToast("Copy failed", failureMessage, "error");
      return false;
    } finally {
      document.body.removeChild(helper);
    }
  }

  function updateStats({ length, selectedCharsets, password = dom.passwordField?.value || "" }) {
    const poolSize = getPoolSize(selectedCharsets);
    const entropyBits = poolSize && length ? Math.round(length * log2(poolSize)) : 0;
    const hasPassword = Boolean(password);
    const strength = hasPassword ? scorePassword(password, selectedCharsets, length) : 0;
    const width = hasPassword ? clamp(Math.round((strength / 100) * 100), 0, 100) : 0;

    if (dom.strengthBar) {
      dom.strengthBar.style.width = `${width}%`;
      dom.strengthBar.style.background = strength >= 80
        ? "linear-gradient(90deg, var(--warning), var(--success))"
        : strength >= 50
          ? "linear-gradient(90deg, var(--danger), var(--warning))"
          : "linear-gradient(90deg, var(--danger), var(--warning))";
    }

    if (dom.strengthText) {
      dom.strengthText.textContent = hasPassword ? getStrengthLabel(strength) : "Use the controls below to generate a password.";
    }

    if (dom.entropyText) {
      dom.entropyText.textContent = entropyBits
        ? `Estimated entropy: ${entropyBits} bits`
        : "Estimated entropy: unavailable until options are selected";
    }

    if (dom.lengthValue) {
      dom.lengthValue.textContent = String(length);
    }

    updateStrengthSegments(strength);
  }

  function syncOptionCards() {
    document.querySelectorAll(".option-card").forEach((card) => {
      const checkbox = card.querySelector("input[type='checkbox']");
      card.classList.toggle("is-checked", Boolean(checkbox?.checked));
    });
  }

  function scorePassword(password, selectedCharsets, length) {
    let score = 0;

    score += clamp(length * 2.8, 0, 56);
    score += selectedCharsets * 8;
    if (/[a-z]/.test(password)) score += 6;
    if (/[A-Z]/.test(password)) score += 6;
    if (/[0-9]/.test(password)) score += 6;
    if (/[^A-Za-z0-9]/.test(password)) score += 8;
    if (length >= 16) score += 10;
    if (length >= 24) score += 8;

    return clamp(Math.round(score), 0, 100);
  }

  function getStrengthLabel(score) {
    if (score >= 85) return "Very strong";
    if (score >= 65) return "Strong";
    if (score >= 45) return "Good";
    return "Needs more variety";
  }

  function getSelectedCharsets() {
    return [
      dom.checkboxes[0]?.checked && "lower",
      dom.checkboxes[1]?.checked && "upper",
      dom.checkboxes[2]?.checked && "numbers",
      dom.checkboxes[3]?.checked && "symbols",
    ].filter(Boolean);
  }

  function getPasswordLength() {
    return clamp(parseInt(dom.lengthInput?.value || dom.lengthRange?.value || "12", 10) || 12, 8, 32);
  }

  function getPoolSize(selectedCount) {
    const sizes = [26, 26, 10, 24];
    return [dom.checkboxes[0]?.checked, dom.checkboxes[1]?.checked, dom.checkboxes[2]?.checked, dom.checkboxes[3]?.checked]
      .reduce((total, isEnabled, index) => total + (isEnabled ? sizes[index] : 0), 0) || selectedCount;
  }

  function pickChar(charset) {
    const index = randomIndex(charset.length);
    return charset[index];
  }

  function shuffle(items) {
    const output = items.slice();
    for (let index = output.length - 1; index > 0; index -= 1) {
      const swapIndex = randomIndex(index + 1);
      [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
    }
    return output;
  }

  function randomIndex(max) {
    if (window.crypto && crypto.getRandomValues) {
      const bytes = new Uint32Array(1);
      crypto.getRandomValues(bytes);
      return bytes[0] % max;
    }

    return Math.floor(Math.random() * max);
  }

  function setLoading(isLoading) {
    if (!dom.generateButton || !dom.generateLabel) return;
    dom.generateButton.classList.toggle("is-loading", isLoading);
    dom.generateButton.setAttribute("aria-busy", String(isLoading));
    dom.generateLabel.textContent = isLoading ? "Generating..." : "Generate password";
  }

  function updateStrengthSegments(score) {
    if (!dom.strengthSegments?.length) return;

    const activeCount = clamp(Math.ceil(score / 20), 0, dom.strengthSegments.length);
    dom.strengthSegments.forEach((segment, index) => {
      segment.classList.toggle("is-active", index < activeCount);
      segment.style.background =
        index < activeCount
          ? score >= 80
            ? "linear-gradient(90deg, var(--primary), var(--success))"
            : score >= 50
              ? "linear-gradient(90deg, var(--warning), var(--primary))"
              : "linear-gradient(90deg, var(--danger), var(--warning))"
          : "";
    });
  }

  function showStatus(message, tone) {
    if (!dom.status) return;
    dom.status.className = "status";
    if (tone === "error") dom.status.classList.add("is-error");
    if (tone === "success") dom.status.classList.add("is-success");
    dom.status.textContent = message;
  }

  function showToast(title, message, tone = "info") {
    if (!dom.toastStack) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.dataset.tone = tone;
    toast.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span>`;
    dom.toastStack.appendChild(toast);

    window.setTimeout(() => {
      toast.remove();
    }, 2800);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function safeStorageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // Ignore restricted storage environments.
    }
  }

  function log2(number) {
    return Math.log(number) / Math.log(2);
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function setCurrentYear() {
    const year = String(new Date().getFullYear());
    dom.yearNodes?.forEach((node) => {
      node.textContent = year;
    });
  }
})();
