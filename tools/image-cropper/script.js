document.addEventListener('DOMContentLoaded', function() {
    // Element references
    let dropZone = document.getElementById('drop-zone');
    let previewArea = document.getElementById('preview-area');
    let previewContainer = previewArea.querySelector('.preview-container');
    let cropZone = null;

    let btnUpload = document.getElementById('upload-image');
    let btnCrop = document.getElementById('crop-button');
    let btnReset = document.getElementById('reset-button');

    let imgPreview = document.getElementById('img-preview');
    
    // State variables
    let isMouseDown = false;

    // Auto-focus on main input if applicable
    const mainInput = document.getElementById('main-input');
    if (mainInput) {
        mainInput.focus();
    }

    // Event listeners
    // ---

    dropZone.addEventListener('click', function(event) {
        btnUpload.click();
    });

    dropZone.addEventListener('drop', function(event) {
        event.preventDefault();

        dropZone.classList.remove('dragover');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
    
    dropZone.addEventListener('dragover', function(event) {
        event.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', function(event) {
        event.preventDefault();
        dropZone.classList.remove('dragover');
    });

    // ---

    btnUpload.addEventListener('change', function(event) {
        const files = event.target.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });

    // ---
    
    btnCrop.addEventListener('click', function() {
        // If no crop zone, shake the image to indicate error
        if (!cropZone) {
            shake(imgPreview);
            return;
        }

        // If crop zone is too small, shake the image to indicate error
        if (cropZone.getBoundingClientRect().width < 15 || cropZone.getBoundingClientRect().height < 15) {
            shake(cropZone);
            return;
        }

        // Calculate cropping coordinates relative to the original image size
        const rect = imgPreview.getBoundingClientRect();
        const scaleX = imgPreview.naturalWidth / rect.width;
        const scaleY = imgPreview.naturalHeight / rect.height;

        const sx = parseInt(cropZone.style.left) * scaleX;
        const sy = parseInt(cropZone.style.top) * scaleY;
        const sw = parseInt(cropZone.style.width) * scaleX;
        const sh = parseInt(cropZone.style.height) * scaleY;

        // Create a canvas to perform the cropping
        const canvas = document.getElementById('cropped-canvas') ?? document.createElement('canvas');
        canvas.id = 'cropped-canvas';
        canvas.width = sw;
        canvas.height = sh;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(imgPreview, sx, sy, sw, sh, 0, 0, sw, sh);

        // Convert canvas to data URL and replace the preview image by the cropped version
        const croppedImageURL = canvas.toDataURL('image/png');
        imgPreview.src = croppedImageURL;
        cropZone.remove();
        cropZone = null;
    });

    btnReset.addEventListener('click', function() {
        // Reset everything
        imgPreview.src = '';
        dropZone.style.display = 'block';
        previewArea.style.display = 'none';

        // Remove crop zone if any
        cropZone?.remove();
        cropZone = null;
        
        // Stop tracking mouse movement
        isMouseDown = false;
    });

    previewArea.addEventListener('mousedown', function(event) {
        event.stopPropagation();

        // Ignore clicks on buttons crop and reset
        if (event.target === btnCrop || event.target === btnReset) {
            return;
        }

        // create a new crop zone
        cropZone ??= document.createElement('div');
        cropZone.id = 'crop-zone';
        cropZone.classList.add('crop-zone');
        cropZone.style.left = event.offsetX + 'px';
        cropZone.style.top = event.offsetY + 'px';
        cropZone.style.width = '0px';
        cropZone.style.height = '0px';
        previewContainer.appendChild(cropZone);
    
        // start tracking mouse movement
        isMouseDown = true;
    });
    
    previewArea.addEventListener('mousemove', function(event) {
        // only proceed if mouse is down
        if (!isMouseDown || !cropZone) return;

        // Calculate new width and height based on mouse position
        const rect = previewContainer.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Ensure left and top are not negative
        if (parseInt(cropZone.style.left) < 0) {
            cropZone.style.left = '0px';
        }
        if (parseInt(cropZone.style.top) < 0) {
            cropZone.style.top = '0px';
        }

        // Update left and top if mouse moved to the left or above the initial point
        if (x < parseInt(cropZone.style.left)) {
            cropZone.style.left = x + 'px';
        }
        if (y < parseInt(cropZone.style.top)) {
            cropZone.style.top = y + 'px';
        }            

        // Update width and height
        cropZone.style.width = Math.abs(x - parseInt(cropZone.style.left)) + 'px';
        cropZone.style.height = Math.abs(y - parseInt(cropZone.style.top)) + 'px';

        // Ensure cropZone stays within the image bounds
        const maxWidth = rect.width - parseInt(cropZone.style.left);
        const maxHeight = rect.height - parseInt(cropZone.style.top);
        if (parseInt(cropZone.style.width) > maxWidth) {
            cropZone.style.width = maxWidth + 'px';
        }
        if (parseInt(cropZone.style.height) > maxHeight) {
            cropZone.style.height = maxHeight + 'px';
        }
    });

    previewArea.addEventListener('mouseup', function(event) {
        isMouseDown = false;

        if (event.target === btnCrop || event.target === btnReset) {
            return;
        }

        if (event.target !== imgPreview && event.target !== cropZone) {
            cropZone?.remove();
            cropZone = null;
        }
    });

    // function to handle file upload
    function handleFileUpload(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload a valid image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            imgPreview.src = e.target.result;
            imgPreview.draggable = false; // Prevent dragging the image itself
            previewArea.style.display = 'block';
            dropZone.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    function shake(element) {
        element.classList.add("shake");
        setTimeout(() => element.classList.remove("shake"), 300);
    }
});