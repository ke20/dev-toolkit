const input = document.getElementById('codeInput');
const previewCode = document.getElementById('previewCode');
const langSelect = document.getElementById('lang');
const renderBtn = document.getElementById('renderBtn');
const downloadBtn = document.getElementById('downloadBtn');

function updatePreview() {
  const lang = langSelect.value || 'javascript';
  previewCode.className = 'language-' + lang;
  // Use textContent to avoid HTML injection and preserve code
  previewCode.textContent = input.value || '// paste code and click "Render Preview"';
  // Ask Prism to highlight this block
  if (window.Prism) {
    Prism.highlightElement(previewCode);
  }
}

// Keep preview live (optional)
input.addEventListener('input', () => {
  // throttling could be added, but this is fine for a single tool
  updatePreview();
});

langSelect.addEventListener('change', updatePreview);
renderBtn.addEventListener('click', updatePreview);

// Download as PNG using html2canvas
downloadBtn.addEventListener('click', async () => {
  // ensure preview is updated
  updatePreview();

  const previewEl = document.getElementById('preview');

  try {
    // scale:2 for higher resolution; backgroundColor:null to preserve transparent background if needed
    const canvas = await html2canvas(previewEl, { scale: 2, useCORS: true, backgroundColor: null });
    const dataUrl = canvas.toDataURL('image/png');

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'code.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    console.error('Failed to capture preview:', err);
    alert('Could not capture image — check console for details.');
  }
});

// initialize default preview
updatePreview();
