document.addEventListener("DOMContentLoaded", () => {
  const animations = [
    {
      name: "Bounce",
      key: "bounce",
      css: `@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}`,
    },
    {
      name: "Fade In",
      key: "fade-in",
      css: `@keyframes fade-in {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}`,
    },
    {
      name: "Slide Up",
      key: "slide-up",
      css: `@keyframes slide-up {
  0% { transform: translateY(50px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}`,
    },
    {
      name: "Slide Down",
      key: "slide-down",
      css: `@keyframes slide-down {
  0% { transform: translateY(-50px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}`,
    },
    {
      name: "Scale Up",
      key: "scale-up",
      css: `@keyframes scale-up {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}`,
    },
    {
      name: "Scale Down",
      key: "scale-down",
      css: `@keyframes scale-down {
  0% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}`,
    },
    {
      name: "Rotate (Right)",
      key: "rotate-right",
      css: `@keyframes rotate-right {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`,
    },
    {
      name: "Rotate (Left)",
      key: "rotate-left",
      css: `@keyframes rotate-left {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(-360deg); }
}`,
    },
  ];

  const animationList = document.getElementById("animation-list");
  const previewBox = document.getElementById("preview-box");
  const cssCode = document.getElementById("css-code");
  const playBtn = document.getElementById("play-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const stopBtn = document.getElementById("stop-btn");
  const copyBtn = document.getElementById("copy-btn");
  const durationInput = document.getElementById("duration");
  const iterationSelect = document.getElementById("iteration");

  let activeAnim = null;
  let styleEl = null;

  // create animation cards
  animations.forEach((anim) => {
    const card = document.createElement("div");
    card.className = "animation-card";
    card.textContent = anim.name;
    card.dataset.key = anim.key;
    card.addEventListener("click", () => selectAnimation(anim, card));
    animationList.appendChild(card);
  });

  function ensureStyleEl() {
    styleEl = document.getElementById("dynamic-animations");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "dynamic-animations";
      document.head.appendChild(styleEl);
    }
  }

  function buildCSS(anim, duration, iteration) {
    const animName = anim.key;
    const iter = iteration === "infinite" ? "infinite" : String(iteration);
    const css = `${anim.css}

#preview-box {
  animation-name: ${animName};
  animation-duration: ${duration}s;
  animation-timing-function: ease;
  animation-iteration-count: ${iter};
  animation-fill-mode: both;
}`;
    return css;
  }

  function applyAnimation(anim, opts = {}) {
    const dur =
      typeof opts.duration === "number"
        ? opts.duration
        : parseFloat(durationInput.value) || 1;
    const iter = opts.iteration || iterationSelect.value || "infinite";

    // ensure style tag has keyframes
    ensureStyleEl();
    styleEl.innerHTML = `${anim.css}`;

    // remove any animation to reset; force reflow, then apply new one
    previewBox.style.animation = "none";
    // force reflow to ensure the browser resets the animation
    // eslint-disable-next-line no-unused-expressions
    previewBox.offsetWidth;
    // set animation shorthand
    previewBox.style.animation = `${anim.key} ${dur}s ease ${
      iter === "infinite" ? "infinite" : iter
    }`;
    previewBox.style.animationPlayState = "running";

    // set CSS textarea content
    cssCode.value = buildCSS(anim, dur, iter);
  }

  function selectAnimation(anim, cardEl) {
    // clear active class on other cards
    document
      .querySelectorAll(".animation-card")
      .forEach((c) => c.classList.remove("active"));
    cardEl.classList.add("active");
    activeAnim = anim;
    applyAnimation(anim);
  }

  playBtn.addEventListener("click", () => {
    if (!activeAnim) {
      // if none selected, pick first
      const first = animations[0];
      const firstCard = document.querySelector(".animation-card");
      if (first && !activeAnim) selectAnimation(first, firstCard);
      return;
    }
    // resume if paused otherwise start (re-apply to restart)
    if (
      previewBox.style.animation &&
      previewBox.style.animationPlayState === "paused"
    ) {
      previewBox.style.animationPlayState = "running";
    } else {
      applyAnimation(activeAnim);
    }
  });

  pauseBtn.addEventListener("click", () => {
    if (!activeAnim) return;
    // pause without removing animation so playback can resume
    previewBox.style.animationPlayState = "paused";
  });

  stopBtn.addEventListener("click", () => {
    // stop & reset to no animation
    previewBox.style.animation = "none";
    previewBox.style.animationPlayState = "paused";
  });

  copyBtn.addEventListener("click", async () => {
    if (!cssCode.value) return;
    try {
      await navigator.clipboard.writeText(cssCode.value);
      copyBtn.textContent = "Copied ✓";
      setTimeout(
        () => (copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy CSS'),
        1500
      );
    } catch (e) {
      alert("Copy failed — select and copy manually.");
    }
  });

  // keyboard: space to play/pause
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      if (!activeAnim) return;
      if (
        previewBox.style.animationPlayState === "paused" ||
        !previewBox.style.animation
      ) {
        playBtn.click();
      } else {
        pauseBtn.click();
      }
    }
  });

  // initialize with first animation selected
  const firstCard = document.querySelector(".animation-card");
  if (firstCard) {
    firstCard.click();
  }
});
