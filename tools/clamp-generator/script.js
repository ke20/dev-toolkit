document.addEventListener("DOMContentLoaded", () => {
  const minSizeEl = document.getElementById("min-size");
  const maxSizeEl = document.getElementById("max-size");
  const prefSizeEl = document.getElementById("pref-size");
  const minVwEl = document.getElementById("min-vw");
  const maxVwEl = document.getElementById("max-vw");
  const generateBtn = document.getElementById("generate");
  const resultEl = document.getElementById("result");
  const copyBtn = document.getElementById("copy");
  const resetBtn = document.getElementById("reset");
  const previewEl = document.getElementById("preview-sample");
  const outputUnit = document.getElementById("output-unit");

  function fmt(n) {
    return Number(n).toFixed(4).replace(/\.?0+$/,"");
  }

  function pxToRem(px) {
    return px / 16;
  }

  function buildClamp(minSize, maxSize, minVw, maxVw, unit = "px") {
    // slope in (px per vw unit)
    // slope_vw = (maxSize - minSize) / (maxVw - minVw) * 100
    const slopeVw = (maxSize - minSize) / (maxVw - minVw) * 100;
    const interceptPx = minSize - (slopeVw * minVw) / 100;

    // if slope is 0 (min==max or vw equal), return fixed size
    if (Math.abs(slopeVw) < 1e-6) {
      if (unit === "rem") {
        return `${fmt(pxToRem(minSize))}rem`;
      }
      return `${fmt(minSize)}px`;
    }

    // prepare display units
    if (unit === "rem") {
      const minRem = fmt(pxToRem(minSize));
      const maxRem = fmt(pxToRem(maxSize));
      const interceptRem = fmt(pxToRem(interceptPx));
      const slopeVwRem = fmt(slopeVw / 16); // because slope in px per vw; convert px to rem
      const fluid = `calc(${slopeVwRem}vw + ${interceptRem}rem)`;
      return `clamp(${minRem}rem, ${fluid}, ${maxRem}rem)`;
    } else {
      const minStr = `${fmt(minSize)}px`;
      const maxStr = `${fmt(maxSize)}px`;
      const fluid = `calc(${fmt(slopeVw)}vw + ${fmt(interceptPx)}px)`;
      return `clamp(${minStr}, ${fluid}, ${maxStr})`;
    }
  }

  function applyPreview(clampCss) {
    // set font-size style for preview
    previewEl.style.fontSize = clampCss;
  }

  generateBtn.addEventListener("click", () => {
    const minSize = parseFloat(minSizeEl.value);
    const maxSize = parseFloat(maxSizeEl.value);
    const minVw = parseFloat(minVwEl.value);
    const maxVw = parseFloat(maxVwEl.value);
    const unit = outputUnit.value;

    if (isNaN(minSize) || isNaN(maxSize) || isNaN(minVw) || isNaN(maxVw)) {
      resultEl.textContent = "Please provide valid numeric values.";
      return;
    }
    if (minVw >= maxVw) {
      resultEl.textContent = "Minimum viewport must be less than maximum viewport.";
      return;
    }
    if (minSize <= 0 || maxSize <= 0) {
      resultEl.textContent = "Font sizes must be positive.";
      return;
    }

    const clampExpression = buildClamp(minSize, maxSize, minVw, maxVw, unit);
    const cssVar = `font-size: ${clampExpression};`;
    resultEl.textContent = cssVar;
    applyPreview(clampExpression);
  });

  copyBtn.addEventListener("click", async () => {
    const txt = resultEl.textContent;
    if (!txt || txt.includes("Please")) return;
    try {
      await navigator.clipboard.writeText(txt);
      copyBtn.textContent = "Copied ✓";
      setTimeout(() => copyBtn.textContent = "Copy CSS", 1200);
    } catch {
      alert("Copy failed — select and copy manually.");
    }
  });

  resetBtn.addEventListener("click", () => {
    minSizeEl.value = "16";
    maxSizeEl.value = "24";
    minVwEl.value = "320";
    maxVwEl.value = "1200";
    prefSizeEl.value = "";
    outputUnit.value = "px";
    resultEl.textContent = "Click Generate to create a clamp() expression.";
    previewEl.style.fontSize = "";
  });

  // live update preview when window resizes (so users see responsiveness)
  window.addEventListener("resize", () => {
    // re-apply current generated expression to update preview with new viewport
    const txt = resultEl.textContent;
    if (txt && txt.startsWith("font-size:")) {
      const expr = txt.replace(/^font-size:\s*/, "");
      previewEl.style.fontSize = expr;
    }
  });

  // initialize
  resetBtn.click();
});
