document.addEventListener('DOMContentLoaded', function () {
	const messageInput = document.getElementById('message-input');
	const secretInput = document.getElementById('secret-input');
	const generateBtn = document.getElementById('generate-btn');
	const outputEl = document.getElementById('hmac-output');
	const copyBtn = document.getElementById('copy-btn');

	function getSelectedFormat() {
		const checked = document.querySelector('input[name="output-format"]:checked');
		return checked ? checked.value : 'hex';
	}

	function toHex(buffer) {
		const bytes = new Uint8Array(buffer);
		let hex = '';
		for (let i = 0; i < bytes.length; i++) {
			hex += bytes[i].toString(16).padStart(2, '0');
		}
		return hex;
	}

	function toBase64(buffer) {
		const bytes = new Uint8Array(buffer);
		let binary = '';
		for (let i = 0; i < bytes.length; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return btoa(binary);
	}

	async function hmacSHA256(message, key) {
		const enc = new TextEncoder();
		const keyData = enc.encode(key);
		const msgData = enc.encode(message);

		const cryptoKey = await crypto.subtle.importKey(
			'raw',
			keyData,
			{ name: 'HMAC', hash: { name: 'SHA-256' } },
			false,
			['sign']
		);

		return await crypto.subtle.sign('HMAC', cryptoKey, msgData);
	}

	async function generate() {
		const message = messageInput.value || '';
		const secret = secretInput.value || '';

		if (!message.trim() || !secret.trim()) {
			outputEl.textContent = 'Please enter both message and secret key.';
			copyBtn.disabled = true;
			return;
		}

		try {
			const signature = await hmacSHA256(message, secret);
			const format = getSelectedFormat();
			const value = format === 'base64' ? toBase64(signature) : toHex(signature);
			outputEl.textContent = value;
			copyBtn.disabled = false;

			generateBtn.classList.add('clicked');
			generateBtn.innerHTML = '<i class="fas fa-check"></i> Generated!';
			setTimeout(() => {
				generateBtn.classList.remove('clicked');
				generateBtn.innerHTML = '<i class="fas fa-shield-alt"></i> Generate HMAC';
			}, 1200);
		} catch (e) {
			outputEl.textContent = 'Error generating HMAC in this browser.';
			copyBtn.disabled = true;
		}
	}

	generateBtn.addEventListener('click', generate);

	copyBtn.addEventListener('click', async function () {
		const text = outputEl.textContent || '';
		if (!text) return;
		try {
			await navigator.clipboard.writeText(text);
			copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
			copyBtn.classList.add('copied');
			copyBtn.style.background = 'var(--success-color)';
			copyBtn.style.borderColor = 'var(--success-color)';
			setTimeout(() => {
				copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy to Clipboard';
				copyBtn.classList.remove('copied');
				copyBtn.style.background = '';
				copyBtn.style.borderColor = '';
			}, 1600);
		} catch (err) {
			const textArea = document.createElement('textarea');
			textArea.value = text;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);
			copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
			setTimeout(() => {
				copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy to Clipboard';
			}, 1600);
		}
	});

	// Keyboard accessibility for Enter/Space on button
	generateBtn.addEventListener('keydown', function (e) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			generateBtn.click();
		}
	});
});
