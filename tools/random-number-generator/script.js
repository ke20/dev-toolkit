// DOM Elements
const minInput = document.getElementById('min-value');
const maxInput = document.getElementById('max-value');
const generateBtn = document.getElementById('generate-btn');
const resultValueEl = document.getElementById('result-value');
const copyBtn = document.getElementById('copy-btn');

// Generate random number function
function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Event listener for Generate button
generateBtn.addEventListener('click', () => {
    const min = parseInt(minInput.value);
    const max = parseInt(maxInput.value);

    if (isNaN(min) || isNaN(max) || min > max) {
        alert("Please enter valid min and max values.");
        return;
    }

    const randomNumber = generateRandomNumber(min, max);
    resultValueEl.textContent = randomNumber;
    copyBtn.disabled = false;
});

// Copy result to clipboard
copyBtn.addEventListener('click', () => {
    const value = resultValueEl.textContent;
    navigator.clipboard.writeText(value).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.classList.add('copied');

        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove('copied');
        }, 2000);
    }).catch(err => console.error("Copy failed:", err));
});
