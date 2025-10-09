// DOM Elements
const methodSelect = document.getElementById('method-select');
const urlInput = document.getElementById('url-input');
const headersContainer = document.getElementById('headers-container');
const addHeaderBtn = document.getElementById('add-header-btn');
const requestBody = document.getElementById('request-body');
const sendRequestBtn = document.getElementById('send-request-btn');
const clearBtn = document.getElementById('clear-btn');
const copyCurlBtn = document.getElementById('copy-curl-btn');

// Response elements
const statusInfo = document.getElementById('status-info');
const statusBadge = document.getElementById('status-badge');
const loadingPane = document.getElementById('loading-pane');
const emptyPane = document.getElementById('empty-pane');
const responsePane = document.getElementById('response-pane');
const headersPane = document.getElementById('headers-pane');
const infoPane = document.getElementById('info-pane');
const responseData = document.getElementById('response-data');
const headersTbody = document.getElementById('headers-tbody');
const requestInfo = document.getElementById('request-info');

// Tab management
const tabs = document.querySelectorAll('.tab');
const tabPanes = {
    response: responsePane,
    headers: headersPane,
    info: infoPane
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateBodyVisibility();
});

function setupEventListeners() {
    // Method change handler
    methodSelect.addEventListener('change', updateBodyVisibility);
    
    // Send request handler
    sendRequestBtn.addEventListener('click', sendRequest);
    
    // Clear handler
    clearBtn.addEventListener('click', clearAll);
    
    // Copy cURL handler
    copyCurlBtn.addEventListener('click', copyCurl);
    
    // Add header handler
    addHeaderBtn.addEventListener('click', addHeader);
    
    // Tab handlers
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    // URL input validation
    urlInput.addEventListener('input', validateUrl);
}

function updateBodyVisibility() {
    const method = methodSelect.value;
    const bodySection = document.querySelector('.body-section');
    
    if (['GET', 'DELETE'].includes(method)) {
        bodySection.style.opacity = '0.5';
        requestBody.disabled = true;
    } else {
        bodySection.style.opacity = '1';
        requestBody.disabled = false;
    }
}

function validateUrl() {
    const url = urlInput.value.trim();
    const isValid = url && (url.startsWith('http://') || url.startsWith('https://'));
    
    sendRequestBtn.disabled = !isValid;
    
    if (url && !isValid) {
        urlInput.style.borderColor = '#ef4444';
    } else {
        urlInput.style.borderColor = '';
    }
}

function addHeader() {
    const headerRow = document.createElement('div');
    headerRow.className = 'header-row';
    headerRow.innerHTML = `
        <input type="text" class="header-input" placeholder="Key (e.g., Authorization)">
        <input type="text" class="header-input" placeholder="Value (e.g., Bearer token)">
        <button type="button" class="btn btn-small" onclick="removeHeader(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    headersContainer.appendChild(headerRow);
}

function removeHeader(button) {
    button.closest('.header-row').remove();
}

function getHeaders() {
    const headers = {};
    const headerRows = headersContainer.querySelectorAll('.header-row');
    
    headerRows.forEach(row => {
        const inputs = row.querySelectorAll('.header-input');
        const key = inputs[0].value.trim();
        const value = inputs[1].value.trim();
        
        if (key && value) {
            headers[key] = value;
        }
    });
    
    return headers;
}

async function sendRequest() {
    const url = urlInput.value.trim();
    const method = methodSelect.value;
    const headers = getHeaders();
    const body = requestBody.value.trim();
    
    if (!url) {
        alert('Please enter a valid URL');
        return;
    }
    
    // Show loading state
    showLoading();
    
    const startTime = Date.now();
    
    try {
        const requestOptions = {
            method: method,
            headers: headers
        };
        
        // Add body for methods that support it
        if (!['GET', 'DELETE'].includes(method) && body) {
            try {
                // Validate JSON if Content-Type is application/json
                const contentType = headers['Content-Type'] || headers['content-type'];
                if (contentType && contentType.includes('application/json')) {
                    JSON.parse(body); // Validate JSON
                }
                requestOptions.body = body;
            } catch (error) {
                throw new Error('Invalid JSON in request body: ' + error.message);
            }
        }
        
        const response = await fetch(url, requestOptions);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Get response headers
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
        });
        
        // Get response body
        let responseText;
        try {
            responseText = await response.text();
        } catch (error) {
            responseText = 'Could not read response body';
        }
        
        // Try to parse as JSON for pretty printing
        let parsedResponse = responseText;
        let isJson = false;
        
        try {
            if (responseText) {
                const parsed = JSON.parse(responseText);
                parsedResponse = JSON.stringify(parsed, null, 2);
                isJson = true;
            }
        } catch (error) {
            // Not JSON, use as-is
        }
        
        displayResponse({
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
            body: parsedResponse,
            isJson: isJson,
            duration: duration,
            url: url,
            method: method,
            requestHeaders: headers,
            requestBody: body
        });
        
    } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        displayError({
            error: error.message,
            duration: duration,
            url: url,
            method: method,
            requestHeaders: headers,
            requestBody: body
        });
    }
}

function showLoading() {
    emptyPane.classList.remove('active');
    emptyPane.classList.add('hidden');
    loadingPane.classList.remove('hidden');
    loadingPane.classList.add('active');
    statusInfo.classList.add('hidden');
}

function displayResponse(data) {
    // Hide loading, show response
    loadingPane.classList.remove('active');
    loadingPane.classList.add('hidden');
    
    // Update status badge
    statusBadge.textContent = `${data.status} ${data.statusText}`;
    statusBadge.className = 'status-badge ' + getStatusClass(data.status);
    statusInfo.classList.remove('hidden');
    
    // Update response data
    responseData.textContent = data.body || 'No response body';
    
    // Update headers table
    updateHeadersTable(data.headers);
    
    // Update info pane
    updateInfoPane(data);
    
    // Show response pane
    responsePane.classList.add('active');
    responsePane.classList.remove('hidden');
    
    // Switch to response tab
    switchTab('response');
}

function displayError(data) {
    // Hide loading
    loadingPane.classList.remove('active');
    loadingPane.classList.add('hidden');
    
    // Update status badge
    statusBadge.textContent = 'Error';
    statusBadge.className = 'status-badge status-error';
    statusInfo.classList.remove('hidden');
    
    // Update response data
    responseData.textContent = `Error: ${data.error}`;
    
    // Clear headers table
    headersTbody.innerHTML = '';
    
    // Update info pane
    updateInfoPane(data);
    
    // Show response pane
    responsePane.classList.add('active');
    responsePane.classList.remove('hidden');
    
    // Switch to response tab
    switchTab('response');
}

function getStatusClass(status) {
    if (status >= 200 && status < 300) return 'status-success';
    if (status >= 300 && status < 400) return 'status-warning';
    return 'status-error';
}

function updateHeadersTable(headers) {
    headersTbody.innerHTML = '';
    
    Object.entries(headers).forEach(([key, value]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escapeHtml(key)}</strong></td>
            <td>${escapeHtml(value)}</td>
        `;
        headersTbody.appendChild(row);
    });
}

function updateInfoPane(data) {
    const info = [];
    
    info.push(`URL: ${data.url}`);
    info.push(`Method: ${data.method}`);
    info.push(`Duration: ${data.duration}ms`);
    
    if (data.status) {
        info.push(`Status: ${data.status} ${data.statusText}`);
    }
    
    if (data.error) {
        info.push(`Error: ${data.error}`);
    }
    
    info.push('');
    info.push('Request Headers:');
    Object.entries(data.requestHeaders).forEach(([key, value]) => {
        info.push(`  ${key}: ${value}`);
    });
    
    if (data.requestBody && !['GET', 'DELETE'].includes(data.method)) {
        info.push('');
        info.push('Request Body:');
        info.push(data.requestBody);
    }
    
    requestInfo.textContent = info.join('\n');
}

function switchTab(tabName) {
    // Update tab active states
    tabs.forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update pane active states
    Object.entries(tabPanes).forEach(([name, pane]) => {
        if (name === tabName) {
            pane.classList.add('active');
            pane.classList.remove('hidden');
        } else {
            pane.classList.remove('active');
            pane.classList.add('hidden');
        }
    });
}

function clearAll() {
    // Reset form
    urlInput.value = 'https://jsonplaceholder.typicode.com/posts/1';
    methodSelect.value = 'GET';
    requestBody.value = '{\n  "title": "Test Post",\n  "body": "This is a test request body",\n  "userId": 1\n}';
    
    // Reset headers to default
    headersContainer.innerHTML = `
        <div class="header-row">
            <input type="text" class="header-input" placeholder="Key (e.g., Content-Type)" value="Content-Type">
            <input type="text" class="header-input" placeholder="Value (e.g., application/json)" value="application/json">
            <button type="button" class="btn btn-small" onclick="removeHeader(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Reset response
    emptyPane.classList.add('active');
    emptyPane.classList.remove('hidden');
    responsePane.classList.remove('active');
    responsePane.classList.add('hidden');
    statusInfo.classList.add('hidden');
    
    updateBodyVisibility();
    validateUrl();
}

function copyCurl() {
    const url = urlInput.value.trim();
    const method = methodSelect.value;
    const headers = getHeaders();
    const body = requestBody.value.trim();
    
    if (!url) {
        alert('Please enter a URL first');
        return;
    }
    
    let curlCommand = `curl -X ${method}`;
    
    // Add headers
    Object.entries(headers).forEach(([key, value]) => {
        curlCommand += ` \\\n  -H "${key}: ${value}"`;
    });
    
    // Add body for applicable methods
    if (!['GET', 'DELETE'].includes(method) && body) {
        curlCommand += ` \\\n  -d '${body.replace(/'/g, "'\"'\"'")}'`;
    }
    
    // Add URL
    curlCommand += ` \\\n  "${url}"`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(curlCommand).then(() => {
        // Show temporary feedback
        const originalText = copyCurlBtn.innerHTML;
        copyCurlBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyCurlBtn.style.background = 'var(--success-color)';
        
        setTimeout(() => {
            copyCurlBtn.innerHTML = originalText;
            copyCurlBtn.style.background = '';
        }, 2000);
    }).catch(() => {
        alert('Failed to copy to clipboard. Please try again.');
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize URL validation on page load
document.addEventListener('DOMContentLoaded', function() {
    validateUrl();
});