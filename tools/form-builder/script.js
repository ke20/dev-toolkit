let draggedElement = null;
let draggedFromCanvas = false;
let elementCounter = 0;

const canvas = document.getElementById('canvas');
const codeOutput = document.getElementById('codeOutput');
const copyBtn = document.getElementById('copyBtn');

// Sidebar element
document.querySelectorAll('.sidebar .form-element').forEach(elem => {
    elem.addEventListener('dragstart', (e) => {
        draggedElement = e.target;
        draggedFromCanvas = false;
        e.dataTransfer.effectAllowed = 'copy';
    });
});

// Canvas elemnets
canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggedFromCanvas ? 'move' : 'copy';
    canvas.classList.add('drag-over');

    
    const afterElement = getDragAfterElement(canvas, e.clientY);
    const indicator = document.querySelector('.drop-indicator');
    
    if (!indicator) {
        const newIndicator = document.createElement('div');
        newIndicator.className = 'drop-indicator active';
        if (afterElement) {
            canvas.insertBefore(newIndicator, afterElement);
        } else {
            canvas.appendChild(newIndicator);
        }
    }
});

canvas.addEventListener('dragleave', (e) => {
    if (e.target === canvas) {
        canvas.classList.remove('drag-over');
        removeDropIndicator();
    }
});

canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    canvas.classList.remove('drag-over');
    canvas.classList.remove('empty');

    const afterElement = getDragAfterElement(canvas, e.clientY);

    if (draggedFromCanvas) {
        // Reordering within canvas
        if (afterElement) {
            canvas.insertBefore(draggedElement, afterElement);
        } else {
            canvas.appendChild(draggedElement);
        }
    } else {
        // Adding new element from sidebar
        const type = draggedElement.dataset.type;
        const newElement = createFormElement(type);
        
        if (afterElement) {
            canvas.insertBefore(newElement, afterElement);
        } else {
            canvas.appendChild(newElement);
        }
        
        makeElementDraggable(newElement);
    }

    removeDropIndicator();
    generateCode();
});

function createFormElement(type) {
    const wrapper = document.createElement('div');
    wrapper.className = 'dropped-element';
    wrapper.dataset.type = type;
    elementCounter++;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>'; 
    deleteBtn.style.float = 'right'; 
    deleteBtn.onclick = function(e) {
        e.stopPropagation();
        wrapper.remove();
        generateCode();
        if (canvas.children.length === 0) {
            canvas.classList.add('empty');
        }
    };

    const label = document.createElement('label');
    let input;

    switch(type) {
        case 'text':
            label.textContent = 'Text Input';
            input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Enter text';
            input.name = `text_${elementCounter}`;
            input.id = `text_${elementCounter}`;
            label.setAttribute('for', input.id);
            break;
        case 'email':
            label.textContent = 'Email';
            input = document.createElement('input');
            input.type = 'email';
            input.placeholder = 'Enter email';
            input.name = `email_${elementCounter}`;
            input.id = `email_${elementCounter}`;
            label.setAttribute('for', input.id);
            break;
        case 'password':
            label.textContent = 'Password';
            input = document.createElement('input');
            input.type = 'password';
            input.placeholder = 'Enter password';
            input.name = `password_${elementCounter}`;
            input.id = `password_${elementCounter}`;
            label.setAttribute('for', input.id);
            break;
        case 'number':
            label.textContent = 'Number';
            input = document.createElement('input');
            input.type = 'number';
            input.placeholder = 'Enter number';
            input.name = `number_${elementCounter}`;
            input.id = `number_${elementCounter}`;
            label.setAttribute('for', input.id);
            break;
        case 'textarea':
            label.textContent = 'Message';
            input = document.createElement('textarea');
            input.placeholder = 'Enter your message';
            input.rows = 4;
            input.name = `message_${elementCounter}`;
            input.id = `message_${elementCounter}`;
            label.setAttribute('for', input.id);
            break;
        case 'select':
            label.textContent = 'Select Option';
            input = document.createElement('select');
            input.name = `select_${elementCounter}`;
            input.id = `select_${elementCounter}`;
            label.setAttribute('for', input.id);
            ['Option 1', 'Option 2', 'Option 3'].forEach(opt => {
                const option = document.createElement('option');
                option.textContent = opt;
                option.value = opt.toLowerCase().replace(' ', '_');
                input.appendChild(option);
            });
            break;
        case 'button':
            input = document.createElement('button');
            input.type = 'button';
            input.textContent = 'Click Me';
            wrapper.appendChild(deleteBtn);
            wrapper.appendChild(input);
            return wrapper;
        case 'submit':
            input = document.createElement('button');
            input.type = 'submit';
            input.textContent = 'Submit';
            wrapper.appendChild(deleteBtn);
            wrapper.appendChild(input);
            return wrapper;
        case 'checkbox':
            const checkboxContainer = document.createElement('div');
            checkboxContainer.style.display = 'flex';
            checkboxContainer.style.alignItems = 'center';
            checkboxContainer.style.gap = '10px';
            
            input = document.createElement('input');
            input.type = 'checkbox';
            input.name = `checkbox_${elementCounter}`;
            input.id = `checkbox_${elementCounter}`;
            input.style.width = '20px';
            input.style.height = '20px';
            input.style.cursor = 'pointer';
            
            const checkboxLabel = document.createElement('input');
            checkboxLabel.type = 'text';
            checkboxLabel.placeholder = 'Checkbox label';
            checkboxLabel.value = 'Accept terms and conditions';
            checkboxLabel.className = 'checkbox-label-input';
            checkboxLabel.style.flex = '1';
            checkboxLabel.style.border = '1px solid #ddd';
            checkboxLabel.style.padding = '8px';
            checkboxLabel.style.borderRadius = '4px';
            
            checkboxContainer.appendChild(input);
            checkboxContainer.appendChild(checkboxLabel);
            
            wrapper.appendChild(deleteBtn);
            wrapper.appendChild(checkboxContainer);
            wrapper.dataset.checkboxLabel = checkboxLabel.value;
            
            checkboxLabel.addEventListener('input', () => {
                wrapper.dataset.checkboxLabel = checkboxLabel.value;
                generateCode();
            });
            
            return wrapper;
        case 'radio':
            const radioContainer = document.createElement('div');
            radioContainer.style.display = 'flex';
            radioContainer.style.alignItems = 'center';
            radioContainer.style.gap = '10px';
            
            input = document.createElement('input');
            input.type = 'radio';
            input.name = `radio_group`;
            input.id = `radio_${elementCounter}`;
            input.style.width = '20px';
            input.style.height = '20px';
            input.style.cursor = 'pointer';
            
            const radioLabel = document.createElement('input');
            radioLabel.type = 'text';
            radioLabel.placeholder = 'Radio button label';
            radioLabel.value = `Option ${elementCounter}`;
            radioLabel.className = 'radio-label-input';
            radioLabel.style.flex = '1';
            radioLabel.style.border = '1px solid #ddd';
            radioLabel.style.padding = '8px';
            radioLabel.style.borderRadius = '4px';
            
            radioContainer.appendChild(input);
            radioContainer.appendChild(radioLabel);
            
            wrapper.appendChild(deleteBtn);
            wrapper.appendChild(radioContainer);
            wrapper.dataset.radioLabel = radioLabel.value;
            
            radioLabel.addEventListener('input', () => {
                wrapper.dataset.radioLabel = radioLabel.value;
                generateCode();
            });
            
            return wrapper;
    }

    wrapper.appendChild(deleteBtn);
    wrapper.appendChild(label);
    wrapper.appendChild(input);

    return wrapper;
}

function makeElementDraggable(element) {
    element.draggable = true;
    
    element.addEventListener('dragstart', (e) => {
        draggedElement = element;
        draggedFromCanvas = true;
        element.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    });

    element.addEventListener('dragend', () => {
        element.classList.remove('dragging');
        removeDropIndicator();
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.dropped-element:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function removeDropIndicator() {
    const indicator = document.querySelector('.drop-indicator');
    if (indicator) {
        indicator.remove();
    }
}

function generateCode() {
    let html = '<form>\n';
    
    const elements = canvas.querySelectorAll('.dropped-element');
    elements.forEach(elem => {
        const type = elem.dataset.type;
        const label = elem.querySelector('label').textContent;
        const id = `${type}-${Math.random().toString(36).substr(2, 9)}`;

        html += '  <div class="form-group">\n';
        html += `    <label for="${id}">${label}</label>\n`;
        
        switch(type) {
            case 'text':
                html += `    <input type="text" id="${id}" class="form-control" placeholder="Enter text">\n`;
                break;
            case 'email':
                html += `    <input type="email" id="${id}" class="form-control" placeholder="Enter email">\n`;
                break;
            case 'password':
                html += `    <input type="password" id="${id}" class="form-control" placeholder="Enter password">\n`;
                break;
            case 'number':
                html += `    <input type="number" id="${id}" class="form-control" placeholder="Enter number">\n`;
                break;
            case 'textarea':
                html += `    <textarea id="${id}" class="form-control" placeholder="Enter message"></textarea>\n`;
                break;
            case 'select':
                html += `    <select id="${id}" class="form-control">\n`;
                html += '      <option value="">Select an option</option>\n';
                html += '    </select>\n';
                break;
            case 'checkbox':
                html += `    <input type="checkbox" id="${id}" class="form-check-input">\n`;
                break;
            case 'radio':
                html += `    <input type="radio" id="${id}" class="form-check-input">\n`;
                break;
            case 'button':
                html += `    <button type="button" id="${id}" class="btn btn-primary">${label}</button>\n`;
                break;
            case 'submit':
                html += `    <button type="submit" id="${id}" class="btn btn-primary">${label}</button>\n`;
                break;
        }
        html += '  </div>\n';
    });

    html += '</form>';
    
    if (codeOutput.value !== html) {
        codeOutput.value = html;
    }
}

// Copy code to clipboard
copyBtn.addEventListener('click', () => {
    codeOutput.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyBtn.textContent = 'Copy Code';
    }, 2000);
});

// Allow editing the code
codeOutput.addEventListener('input', () => {
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = codeOutput.value;
    
    // Clear existing canvas
    while (canvas.firstChild) {
        canvas.removeChild(canvas.firstChild);
    }
    
    // Convert the HTML form elements back to draggable elements
    const formGroups = tempContainer.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        let type;
        let element;
        
        if (group.querySelector('input[type="text"]')) type = 'text';
        else if (group.querySelector('input[type="email"]')) type = 'email';
        else if (group.querySelector('input[type="password"]')) type = 'password';
        else if (group.querySelector('input[type="number"]')) type = 'number';
        else if (group.querySelector('textarea')) type = 'textarea';
        else if (group.querySelector('select')) type = 'select';
        else if (group.querySelector('input[type="checkbox"]')) type = 'checkbox';
        else if (group.querySelector('input[type="radio"]')) type = 'radio';
        else if (group.querySelector('button[type="submit"]')) type = 'submit';
        else if (group.querySelector('button')) type = 'button';
        
        if (type) {
            element = createFormElement(type);
            canvas.appendChild(element);
            makeElementDraggable(element);
        }
    });
    
    if (canvas.children.length === 0) {
        canvas.classList.add('empty');
    } else {
        canvas.classList.remove('empty');
    }
});