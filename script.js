document.addEventListener('DOMContentLoaded', function() {
    const mosaic = document.getElementById('mosaic');
    const colorPicker = document.getElementById('color-picker');
    const hexValue = document.getElementById('hex-value');
    const hexDisplay = document.getElementById('hex-display');
    const baseColorPreview = document.getElementById('base-color-preview');
    const gapColorPicker = document.getElementById('gap-color-picker');
    const gapHexValue = document.getElementById('gap-hex-value');
    const gapHexDisplay = document.getElementById('gap-hex-display');
    const gapColorPreview = document.getElementById('gap-color-preview');
    const randomSlider = document.getElementById('random-slider');
    const randomValue = document.getElementById('random-value');
    const randomDisplay = document.getElementById('random-display');
    const gridSizeSlider = document.getElementById('grid-size-slider');
    const gridSizeValue = document.getElementById('grid-size-value');
    const gridSizeDisplay = document.getElementById('grid-size-display');
    const toggleAnimationBtn = document.getElementById('toggle-animation');
    const randomnessState = document.getElementById('randomness-state');
    const durationSlider = document.getElementById('duration-slider');
    const durationValue = document.getElementById('duration-value');
    const durationDisplay = document.getElementById('duration-display');
    const framerateSlider = document.getElementById('framerate-slider');
    const framerateValue = document.getElementById('framerate-value');
    const framerateDisplay = document.getElementById('framerate-display');
    const smoothTransitionToggle = document.getElementById('smooth-transition');
    const presetButtonsContainer = document.getElementById('preset-buttons');
    const customButton = document.getElementById('custom-button');
    const customPanel = document.getElementById('custom-panel');
    const exportImageBtn = document.getElementById('export-image');
    const nameZhInput = document.getElementById('name-zh-input');
    const nameEnInput = document.getElementById('name-en-input');
    
    // Presets data
    let presets = [];
    let currentPresetIndex = -1;
    let isCustomMode = false;
    
    // Animation state variables
    let animationRunning = false;
    let animationInterval;
    let animationDuration = parseInt(durationSlider.value) * 1000; // Convert to milliseconds
    let animationFrameRate = parseInt(framerateSlider.value);
    let frameInterval = animationDuration / animationFrameRate;
    let smoothTransitions = smoothTransitionToggle.checked;
    
    // Toggle custom panel when custom button is clicked
    customButton.addEventListener('click', function() {
        toggleCustomPanel();
    });
    
    function toggleCustomPanel() {
        isCustomMode = !isCustomMode;
        customPanel.classList.toggle('active');
        customButton.classList.toggle('active');
        
        if (isCustomMode) {
            // Deactivate any selected preset button
            const activePresetButtons = document.querySelectorAll('.preset-button.active');
            activePresetButtons.forEach(button => {
                if (button !== customButton) {
                    button.classList.remove('active');
                    button.style.backgroundColor = '#f0f0f0';
                    button.style.borderColor = '#dddddd';
                    button.style.color = '';
                }
            });
            
            // Activate custom button using current base color instead of hardcoded color
            const baseColor = colorPicker.value;
            customButton.style.backgroundColor = baseColor;
            customButton.style.borderColor = darkenColor(baseColor, 20);
            customButton.style.color = isLightColor(baseColor) ? 'black' : 'white';
            
            // Set currentPresetIndex to -1 to indicate custom mode
            currentPresetIndex = -1;
            localStorage.setItem('mosaicCurrentPreset', currentPresetIndex);
            
            // Sync panel values with current settings
            syncCustomPanelWithCurrentSettings();
            
            // Show "Custom" in both language displays
            updatePresetNameDisplay('定制', 'Custom');
            
            // Update the grid colors with current color picker value
            updateColors(colorPicker.value, randomSlider.value);
            
            // Make sure the toggle slider has the right color if smooth transitions are enabled
            if (smoothTransitionToggle.checked) {
                const toggleSlider = document.querySelector('.toggle-slider');
                if (toggleSlider) {
                    toggleSlider.style.backgroundColor = colorPicker.value;
                }
            }
        } else {
            // Reset custom button to default state
            customButton.style.backgroundColor = '#707070';
            customButton.style.borderColor = '707070';
            customButton.style.color = 'white';
        }
    }
    
    // Sync the custom panel values with current settings
    function syncCustomPanelWithCurrentSettings() {
        colorPicker.value = hexValue.textContent;
        hexDisplay.textContent = hexValue.textContent;
        
        gapColorPicker.value = gapHexValue.textContent;
        gapHexDisplay.textContent = gapHexValue.textContent;
        
        randomSlider.value = randomValue.textContent;
        randomDisplay.textContent = randomValue.textContent;
        
        const gridSize = gridSizeValue.textContent.split('×')[0];
        gridSizeSlider.value = gridSize;
        gridSizeDisplay.textContent = gridSizeValue.textContent;
        
        durationSlider.value = durationValue.textContent;
        durationDisplay.textContent = durationValue.textContent;
        
        framerateSlider.value = framerateValue.textContent;
        framerateDisplay.textContent = framerateValue.textContent;
        
        // If in custom mode, keep existing custom names
        // If switching from a preset, use the preset names as starting point
        if (currentPresetIndex >= 0 && presets[currentPresetIndex]) {
            nameZhInput.value = presets[currentPresetIndex].name || '定制';
            nameEnInput.value = presets[currentPresetIndex].nameEn || 'Custom';
        } else if (!nameZhInput.value && !nameEnInput.value) {
            nameZhInput.value = '定制';
            nameEnInput.value = 'Custom';
        }
        
        // After syncing controls, make sure to update the visual display
        updateColors(colorPicker.value, randomSlider.value);
        updateGapColor(gapColorPicker.value);
        
        // If using smooth transitions, update them with current settings
        if (smoothTransitions) {
            updateSmoothTransitions(true);
        }
    }
    
    // Update all displays when custom sliders change
    colorPicker.addEventListener('input', function() {
        const newColor = this.value;
        hexValue.textContent = newColor;
        hexDisplay.textContent = newColor;
        baseColorPreview.style.backgroundColor = newColor;
        
        // Update body background
        updateBodyBackground(newColor);
        // Update body text color
        updateBodyTextColor(newColor);
        // Update button colors
        updateButtonColors(newColor);
        
        // Update preset name color based on new base color
        const textColor = isLightColor(newColor) ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 1)';
        const shadowColor = isLightColor(newColor) ? 
            '0 0 10px rgba(255, 255, 255, 0.5)' : 
            '0 0 10px rgba(0, 0, 0, 0.5)';
        
        const presetNameZhDisplay = document.getElementById('preset-name-zh-display');
        const presetNameEnDisplay = document.getElementById('preset-name-en-display');
        
        if (presetNameZhDisplay && presetNameZhDisplay.textContent) {
            presetNameZhDisplay.style.color = textColor;
            presetNameZhDisplay.style.textShadow = shadowColor;
        }
        
        if (presetNameEnDisplay && presetNameEnDisplay.textContent) {
            presetNameEnDisplay.style.color = textColor;
            presetNameEnDisplay.style.textShadow = shadowColor;
        }
        
        updateColors(newColor, randomSlider.value);
        saveSettings();
    });
    
    gapColorPicker.addEventListener('input', function() {
        const newColor = this.value;
        gapHexValue.textContent = newColor;
        gapHexDisplay.textContent = newColor;
        gapColorPreview.style.backgroundColor = newColor;
        updateGapColor(newColor);
        saveSettings();
    });
    
    randomSlider.addEventListener('input', function() {
        const newValue = this.value;
        randomValue.textContent = newValue;
        randomDisplay.textContent = newValue;
        updateRandomnessStateDisplay(newValue);
        updateColors(colorPicker.value, newValue);
        saveSettings();
    });
    
    gridSizeSlider.addEventListener('input', function() {
        const size = parseInt(this.value);
        gridSizeDisplay.textContent = `${size}×${size}`;
        createGrid(size);
        updateColors(colorPicker.value, randomSlider.value);
        saveSettings();
    });
    
    durationSlider.addEventListener('input', function() {
        const newDuration = parseInt(this.value);
        durationValue.textContent = newDuration;
        durationDisplay.textContent = newDuration;
        animationDuration = newDuration * 1000;
        frameInterval = animationDuration / animationFrameRate;
        
        if (animationRunning) {
            restartAnimation();
        }
        
        saveSettings();
    });
    
    framerateSlider.addEventListener('input', function() {
        const newFramerate = parseInt(this.value);
        framerateValue.textContent = newFramerate;
        framerateDisplay.textContent = newFramerate;
        animationFrameRate = newFramerate;
        frameInterval = animationDuration / animationFrameRate;
        
        if (smoothTransitions) {
            updateSmoothTransitions(true);
        }
        
        if (animationRunning) {
            restartAnimation();
        }
        
        saveSettings();
    });
    
    // Restart animation with current settings
    function restartAnimation() {
        clearInterval(animationInterval);
        animationInterval = setInterval(() => {
            updateColors(colorPicker.value, randomSlider.value);
        }, frameInterval);
    }
    
    // Load presets from JSON file
    fetchPresets();
    
    // Load saved settings from localStorage or use defaults
    loadSavedSettings();
    
    // Create the grid with current size
    createGrid(parseInt(gridSizeSlider.value));
    
    // Initialize with current values
    updateColors(colorPicker.value, randomSlider.value);
    updateGapColor(gapColorPicker.value);
    updateRandomnessStateDisplay(randomSlider.value);
    updateSmoothTransitions(smoothTransitions);
    updateColorPreviews();
    
    // Fetch presets from JSON file
    function fetchPresets() {
        fetch('presets.json')
            .then(response => response.json())
            .then(data => {
                presets = data;
                createPresetButtons();
                
                // Apply the saved preset or default to first preset
                const savedPresetIndex = localStorage.getItem('mosaicCurrentPreset');
                if (savedPresetIndex !== null) {
                    if (savedPresetIndex === "-1") {
                        // Custom mode was active
                        toggleCustomPanel();
                    } else if (savedPresetIndex < presets.length) {
                        applyPreset(parseInt(savedPresetIndex));
                    }
                } else if (presets.length > 0) {
                    applyPreset(0);
                }
            })
            .catch(error => {
                console.error('Error loading presets:', error);
            });
    }
    
    // Create buttons for each preset
    function createPresetButtons() {
        presetButtonsContainer.innerHTML = '';
        
        presets.forEach((preset, index) => {
            const button = document.createElement('button');
            button.textContent = preset.name;
            button.className = 'preset-button';
            
            // Store preset's base color as data attribute for easy access
            button.dataset.baseColor = preset.baseColor;
            
            // Set active state if this is the current preset
            if (index === currentPresetIndex) {
                button.classList.add('active');
                button.style.backgroundColor = preset.baseColor;
                button.style.borderColor = darkenColor(preset.baseColor, 20);
                button.style.color = isLightColor(preset.baseColor) ? 'black' : 'white';
            }
            
            // Add hover event listeners
            button.addEventListener('mouseenter', function() {
                if (!this.classList.contains('active')) {
                    const baseColor = this.dataset.baseColor;
                    this.style.backgroundColor = lightenColor(baseColor, 70);
                    this.style.borderColor = baseColor;
                }
            });
            
            button.addEventListener('mouseleave', function() {
                if (!this.classList.contains('active')) {
                    this.style.backgroundColor = '#f0f0f0';
                    this.style.borderColor = '#ddd';
                }
            });
            
            button.addEventListener('click', () => {
                // If custom panel is open, close it
                if (isCustomMode) {
                    toggleCustomPanel();
                }
                applyPreset(index);
            });
            
            presetButtonsContainer.appendChild(button);
        });
    }
    
    // Apply a preset by index
    function applyPreset(index) {
        if (index >= 0 && index < presets.length) {
            const preset = presets[index];
            currentPresetIndex = index;
            
            // First update the color picker value
            colorPicker.value = preset.baseColor;
            hexValue.textContent = preset.baseColor;
            hexDisplay.textContent = preset.baseColor;
            
            // Update body background
            updateBodyBackground(preset.baseColor);
            // Update body text color
            updateBodyTextColor(preset.baseColor);
            // Update button colors
            updateButtonColors(preset.baseColor);
            
            // Then update the preset name display so it uses the correct color
            updatePresetNameDisplay(preset.name, preset.nameEn);
            
            // Continue updating the rest of the UI elements
            gapColorPicker.value = preset.gapColor;
            gapHexValue.textContent = preset.gapColor;
            gapHexDisplay.textContent = preset.gapColor;
            
            randomSlider.value = preset.randomValue;
            randomValue.textContent = preset.randomValue;
            randomDisplay.textContent = preset.randomValue;
            
            gridSizeSlider.value = preset.gridSizeValue;
            gridSizeValue.textContent = `${preset.gridSizeValue}×${preset.gridSizeValue}`;
            gridSizeDisplay.textContent = `${preset.gridSizeValue}×${preset.gridSizeValue}`;
            
            durationSlider.value = preset.durationValue;
            durationValue.textContent = preset.durationValue;
            durationDisplay.textContent = preset.durationValue;
            
            framerateSlider.value = preset.framerateValue;
            framerateValue.textContent = preset.framerateValue;
            framerateDisplay.textContent = preset.framerateValue;
            
            // Update active preset button
            const buttons = document.querySelectorAll('.preset-button');
            buttons.forEach((button, i) => {
                if (button === customButton) {
                    button.classList.remove('active');
                    button.style.backgroundColor = '#707070'; // Default custom button color
                    button.style.borderColor = '#707070';
                } else if (i === index) {
                    button.classList.add('active');
                    button.style.backgroundColor = preset.baseColor;
                    button.style.borderColor = darkenColor(preset.baseColor, 20);
                    button.style.color = isLightColor(preset.baseColor) ? 'black' : 'white';
                } else {
                    button.classList.remove('active');
                    button.style.backgroundColor = '#f0f0f0';
                    button.style.borderColor = '#ddd';
                    button.style.color = '';
                }
            });
            
            // Apply changes
            animationDuration = parseInt(preset.durationValue) * 1000;
            animationFrameRate = parseInt(preset.framerateValue);
            frameInterval = animationDuration / animationFrameRate;
            
            createGrid(parseInt(preset.gridSizeValue));
            
            // For rainbow preset, we need special handling of colors
            if (preset.isRainbow) {
                updateColors(preset.baseColor, preset.randomValue);
            } else {
                updateColors(preset.baseColor, preset.randomValue);
            }
            
            updateGapColor(preset.gapColor);
            updateRandomnessStateDisplay(preset.randomValue);
            updateColorPreviews();
            
            if (smoothTransitions) {
                updateSmoothTransitions(true);
            }
            
            // If animation is running, restart it with new parameters
            if (animationRunning) {
                restartAnimation();
            }
            
            // Save the current preset index
            localStorage.setItem('mosaicCurrentPreset', index);
            
            // Save all settings
            saveSettings();
        }
    }
    
    // Update color preview boxes
    function updateColorPreviews() {
        baseColorPreview.style.backgroundColor = colorPicker.value;
        gapColorPreview.style.backgroundColor = gapColorPicker.value;
    }
    
    // Toggle animation function
    function toggleAnimation() {
        if (!animationRunning) {
            // Start animation
            animationRunning = true;
            toggleAnimationBtn.textContent = '停止动画';
            toggleAnimationBtn.classList.add('active');
            
            // Update button color for active state
            const activeColor = darkenColor(colorPicker.value, 25);
            toggleAnimationBtn.style.backgroundColor = activeColor;
            
            animationInterval = setInterval(() => {
                updateColors(colorPicker.value, randomSlider.value);
            }, frameInterval);
        } else {
            // Stop animation
            animationRunning = false;
            toggleAnimationBtn.textContent = '开始动画';
            toggleAnimationBtn.classList.remove('active');
            
            // Restore normal button color
            toggleAnimationBtn.style.backgroundColor = colorPicker.value;
            
            clearInterval(animationInterval);
        }
        
        saveSettings();
    }
    
    // Toggle animation button click handler
    toggleAnimationBtn.addEventListener('click', toggleAnimation);
    
    // Toggle smooth transitions
    smoothTransitionToggle.addEventListener('change', function() {
        smoothTransitions = this.checked;
        updateSmoothTransitions(smoothTransitions);
        
        // Update toggle slider color based on the checked state
        const toggleSlider = document.querySelector('.toggle-slider');
        if (toggleSlider) {
            toggleSlider.style.backgroundColor = this.checked ? colorPicker.value : '#ccc';
        }
        
        saveSettings();
    });
    
    // Add event listeners for the name input fields
    nameZhInput.addEventListener('input', function() {
        if (isCustomMode) {
            updatePresetNameDisplay(this.value, nameEnInput.value);
        }
    });
    
    nameEnInput.addEventListener('input', function() {
        if (isCustomMode) {
            updatePresetNameDisplay(nameZhInput.value, this.value);
        }
    });
    
    // Add event listener for export image button
    exportImageBtn.addEventListener('click', exportImage);
    
    // Function to export the grid as an image
    function exportImage() {
        // Create a loading state for the button
        const originalText = exportImageBtn.textContent;
        const originalColor = exportImageBtn.style.backgroundColor;
        
        exportImageBtn.textContent = '保存中...';
        exportImageBtn.disabled = true;
        exportImageBtn.style.backgroundColor = '#6c757d';
        
        // Use html2canvas library to capture the grid
        // We need to dynamically load the library first
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = function() {
            // Once the library is loaded, capture the grid
            const gridWrapper = document.querySelector('.grid-container-wrapper');
            
            // Capture the grid with html2canvas
            html2canvas(gridWrapper, {
                backgroundColor: null,
                useCORS: true,
                scale: 2, // Higher resolution
                logging: false
            }).then(canvas => {
                // Convert canvas to a data URL
                const imageData = canvas.toDataURL('image/png');
                
                // Create a temporary link to download the image
                const link = document.createElement('a');
                
                // Generate filename with current date/time
                const now = new Date();
                const timestamp = now.toISOString().replace(/[:.]/g, '-').substring(0, 19);
                const preset = currentPresetIndex >= 0 ? presets[currentPresetIndex].name : '定制';
                const filename = `mosaic-${preset}-${timestamp}.png`;
                
                link.download = filename;
                link.href = imageData;
                link.click();
                
                // Reset button state
                exportImageBtn.textContent = originalText;
                exportImageBtn.disabled = false;
                exportImageBtn.style.backgroundColor = originalColor;
            });
        };
        
        // Add the script to the document
        document.body.appendChild(script);
    }
    
    // Save current settings to localStorage
    function saveSettings() {
        localStorage.setItem('mosaicBaseColor', colorPicker.value);
        localStorage.setItem('mosaicGapColor', gapColorPicker.value);
        localStorage.setItem('mosaicRandomness', randomSlider.value);
        localStorage.setItem('mosaicGridSize', gridSizeSlider.value);
        localStorage.setItem('mosaicAnimationRunning', animationRunning);
        localStorage.setItem('mosaicAnimationDuration', durationSlider.value);
        localStorage.setItem('mosaicAnimationFramerate', framerateSlider.value);
        localStorage.setItem('mosaicSmoothTransitions', smoothTransitions);
    }
    
    // Load settings from localStorage
    function loadSavedSettings() {
        const savedColor = localStorage.getItem('mosaicBaseColor');
        const savedGapColor = localStorage.getItem('mosaicGapColor');
        const savedRandomness = localStorage.getItem('mosaicRandomness');
        const savedGridSize = localStorage.getItem('mosaicGridSize');
        const savedAnimationState = localStorage.getItem('mosaicAnimationRunning');
        const savedDuration = localStorage.getItem('mosaicAnimationDuration');
        const savedFramerate = localStorage.getItem('mosaicAnimationFramerate');
        const savedSmoothTransition = localStorage.getItem('mosaicSmoothTransitions');
        
        if (savedColor) {
            colorPicker.value = savedColor;
            hexValue.textContent = savedColor;
            hexDisplay.textContent = savedColor;
            
            // Update body background with saved color
            updateBodyBackground(savedColor);
            // Update body text color with saved color
            updateBodyTextColor(savedColor);
            // Update button colors
            updateButtonColors(savedColor);
        }
        
        if (savedGapColor) {
            gapColorPicker.value = savedGapColor;
            gapHexValue.textContent = savedGapColor;
            gapHexDisplay.textContent = savedGapColor;
        }
        
        if (savedRandomness) {
            randomSlider.value = savedRandomness;
            randomValue.textContent = savedRandomness;
            randomDisplay.textContent = savedRandomness;
            updateRandomnessStateDisplay(savedRandomness);
        } else {
            updateRandomnessStateDisplay(1);
        }
        
        if (savedGridSize) {
            gridSizeSlider.value = savedGridSize;
            gridSizeValue.textContent = `${savedGridSize}×${savedGridSize}`;
            gridSizeDisplay.textContent = `${savedGridSize}×${savedGridSize}`;
        } else {
            // Default grid number display
            gridSizeValue.textContent = `${gridSizeSlider.value}×${gridSizeSlider.value}`;
            gridSizeDisplay.textContent = `${gridSizeSlider.value}×${gridSizeSlider.value}`;
        }
        
        if (savedDuration) {
            durationSlider.value = savedDuration;
            durationValue.textContent = savedDuration;
            durationDisplay.textContent = savedDuration;
            animationDuration = parseInt(savedDuration) * 1000;
        }
        
        if (savedFramerate) {
            framerateSlider.value = savedFramerate;
            framerateValue.textContent = savedFramerate;
            framerateDisplay.textContent = savedFramerate;
            animationFrameRate = parseInt(savedFramerate);
        }
        
        if (savedSmoothTransition !== null) {
            smoothTransitions = savedSmoothTransition === 'true';
            smoothTransitionToggle.checked = smoothTransitions;
        }
        
        // Recalculate frame interval
        frameInterval = animationDuration / animationFrameRate;
        
        // Restore animation state
        if (savedAnimationState === 'true') {
            setTimeout(() => {
                animationRunning = true;
                toggleAnimationBtn.textContent = '停止动画';
                
                animationInterval = setInterval(() => {
                    updateColors(colorPicker.value, randomSlider.value);
                }, frameInterval);
            }, 500); // Start animation after a short delay
        }
    }
    
    function createGrid(size) {
        // Clear existing grid cells
        mosaic.innerHTML = '';
        
        // Get container dimensions
        const containerWidth = mosaic.clientWidth;
        const containerHeight = mosaic.clientHeight;
        
        // Calculate proper column and row counts to maintain square cells
        let rows = size;
        let cols = size;
        
        // If container is not square, adjust columns or rows to keep cells square
        if (containerWidth !== containerHeight) {
            const aspectRatio = containerWidth / containerHeight;
            
            if (aspectRatio > 1) {
                // Wider than tall - adjust columns
                cols = Math.floor(size * aspectRatio);
            } else {
                // Taller than wide - adjust rows
                rows = Math.floor(size / aspectRatio);
            }
        }
        
        // Set CSS grid properties dynamically
        mosaic.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        mosaic.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        
        // Create grid cells
        for (let i = 0; i < rows * cols; i++) {
            const cell = document.createElement('div');
            cell.className = smoothTransitions ? 'grid-cell smooth' : 'grid-cell';
            mosaic.appendChild(cell);
        }
        
        // Update grid number display to show actual dimensions
        gridSizeValue.textContent = `${cols}×${rows}`;
        gridSizeDisplay.textContent = `${cols}×${rows}`;
        
        // Apply gap color
        updateGapColor(gapColorPicker.value);
    }
    
    function updateGapColor(hexColor) {
        mosaic.style.backgroundColor = hexColor;
    }
    
    function hexToHsl(hex) {
        // Convert hex to RGB first
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
        
        // Then convert RGB to HSL
        r /= 255;
        g /= 255;
        b /= 255;
        
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }
    
    // Update colors with a staggered approach to make transitions more visible
    function updateColors(hexColor, randomnessLevel) {
        const cells = document.querySelectorAll('.grid-cell');
        
        // Check if current preset is the rainbow preset
        const isRainbowPreset = currentPresetIndex >= 0 && 
            presets[currentPresetIndex].isRainbow === true;
        
        if (isRainbowPreset && cells.length > 0) {
            // Get rainbow colors from preset
            const rainbowColors = presets[currentPresetIndex].rainbowColors;
            
            // Calculate the total number of rows in the grid
            const totalCells = cells.length;
            const cols = parseInt(mosaic.style.gridTemplateColumns.match(/repeat\((\d+)/)[1]);
            const rows = Math.ceil(totalCells / cols);
            
            // Convert randomness level to integer
            const level = parseInt(randomnessLevel);
            
            // If using smooth transitions, apply colors with some delay between cells
            if (smoothTransitions && cells.length > 0) {
                const cellArray = Array.from(cells);
                const staggerDelay = Math.min(5, frameInterval / 10); // Small stagger delay
                
                cellArray.forEach((cell, index) => {
                    setTimeout(() => {
                        const row = Math.floor(index / cols);
                        const section = Math.floor(row / (rows / 7)); // Determine which of the 7 sections
                        const colorIndex = Math.min(section, rainbowColors.length - 1);
                        
                        // Apply rainbow color with randomness
                        applyRainbowColorToCell(cell, rainbowColors[colorIndex], level);
                    }, index % 5 * staggerDelay); // Small groups for staggered updates
                });
            } else {
                cells.forEach((cell, index) => {
                    const row = Math.floor(index / cols);
                    const section = Math.floor(row / (rows / 7)); // Determine which of the 7 sections
                    const colorIndex = Math.min(section, rainbowColors.length - 1);
                    
                    // Apply rainbow color with randomness
                    applyRainbowColorToCell(cell, rainbowColors[colorIndex], level);
                });
            }
            
            return; // Exit the function early
        }
        
        // Original color handling for non-rainbow presets
        const hslColor = hexToHsl(hexColor);
        const baseHue = hslColor.h;
        const baseSaturation = hslColor.s;
        const baseLightness = hslColor.l;
        
        // Convert randomness level to integer
        const level = parseInt(randomnessLevel);
        
        // If using smooth transitions, apply colors with some delay between cells
        if (smoothTransitions && cells.length > 0) {
            const cellArray = Array.from(cells);
            const staggerDelay = Math.min(5, frameInterval / 10); // Small stagger delay
            
            cellArray.forEach((cell, index) => {
                setTimeout(() => {
                    applyColorToCell(cell, baseHue, baseSaturation, baseLightness, level);
                }, index % 5 * staggerDelay); // Small groups for staggered updates
            });
        } else {
            cells.forEach(cell => {
                applyColorToCell(cell, baseHue, baseSaturation, baseLightness, level);
            });
        }
    }
    
    // Helper function to apply color to a cell
    function applyColorToCell(cell, baseHue, baseSaturation, baseLightness, level) {
        // Default values (for level 1)
        let hue = baseHue;
        let saturation = baseSaturation;
        let lightness = baseLightness;
        
        switch (level) {
            case 1:
                // Level 1: Small variations in saturation (±5%) and lightness (±5%)
                const smallSatVar = Math.floor(Math.random() * 11) - 5; // -5% to +5%
                saturation = Math.min(100, Math.max(0, baseSaturation + smallSatVar));
                
                const smallLightVar = Math.floor(Math.random() * 11) - 5; // -5% to +5%
                lightness = Math.min(100, Math.max(0, baseLightness + smallLightVar));
                break;
                
            case 2:
                // Level 2: Big variations in lightness (80-90%) with small saturation (±10%)
                const satVariation = Math.floor(Math.random() * 21) - 10; // -10% to +10%
                saturation = Math.min(100, Math.max(0, baseSaturation + satVariation));
                
                // High lightness range (80-90%)
                lightness = Math.floor(Math.random() * 11) + 80; // 80% to 90%
                break;
                
            case 3:
                // Level 3: Two lightness ranges (30-50% and 80-90%) with small saturation variations
                const satVar = Math.floor(Math.random() * 21) - 10; // -10% to +10%
                saturation = Math.min(100, Math.max(0, baseSaturation + satVar));
                
                // Randomly choose between middle (30-40%) and high (60-70%) lightness ranges
                if (Math.random() < 0.5) {
                    // Middle lightness range (30-40%)
                    lightness = Math.floor(Math.random() * 31) + 30; // 30% to 40%
                } else {
                    // High lightness range (60-70%)
                    lightness = Math.floor(Math.random() * 11) + 60; // 60% to 70%
                }
                break;
                
            default:
                // Levels 4-10: Progressively increasing randomness in saturation and lightness
                
                if (level === 4) {
                    // Level 4: Mild variations in saturation and lightness
                    const satRange = 10; // ±20%
                    const satOffset = Math.floor(Math.random() * (satRange * 2)) - satRange;
                    saturation = Math.min(100, Math.max(0, baseSaturation + satOffset));
                    
                    // Choose from a few specific lightness ranges
                    const lightRanges = [
                        [30, 50],  // Middle
                        [70, 85],  // Medium-high
                        [85, 90]   // High
                    ];
                    const rangeIndex = Math.floor(Math.random() * lightRanges.length);
                    const [min, max] = lightRanges[rangeIndex];
                    lightness = Math.floor(Math.random() * (max - min + 1)) + min;
                }
                else if (level >= 5 && level <= 7) {
                    // Levels 5-7: Medium variations in saturation and lightness
                    const satRange = 20 + (level - 7) * 10; // Ranges from ±0% to ±20%
                    const satOffset = Math.floor(Math.random() * (satRange * 2)) - satRange;
                    saturation = Math.min(100, Math.max(0, baseSaturation + satOffset));
                    
                    // Wider lightness range as level increases
                    const lightRanges = [
                        [20, 50],  // Medium-low to middle
                        [10, 30],  // Medium dark variations
                        [20, 80]   // Wide range
                    ];
                    const rangeIndex = level - 5; // 0, 1, or 2
                    const [min, max] = lightRanges[rangeIndex];
                    lightness = Math.floor(Math.random() * (max - min + 1)) + min;
                }
                else if (level >= 8 && level <= 9) {
                    // Levels 8-9: Strong variations including very dark or very light colors
                    saturation = Math.floor(Math.random() * 51); // 0% to 51%
                    
                    // High chance of very dark or very light colors
                    const extremeRanges = [
                        [5, 20],    // Very dark
                        [30, 70],   // Middle
                        [80, 95]    // Very light
                    ];
                    
                    // Level 9 increases chance of extreme values
                    const extremeWeight = level === 9 ? 0.7 : 0.4;
                    
                    if (Math.random() < extremeWeight) {
                        // Choose very dark or very light
                        const rangeIndex = Math.random() < 0.5 ? 0 : 2;
                        const [min, max] = extremeRanges[rangeIndex];
                        lightness = Math.floor(Math.random() * (max - min + 1)) + min;
                    } else {
                        // Choose middle range
                        const [min, max] = extremeRanges[1];
                        lightness = Math.floor(Math.random() * (max - min + 1)) + min;
                    }
                }
                else if (level === 10) {
                    // Level 10: Full randomization
                    saturation = Math.floor(Math.random() * 101); // 0% to 100%
                    lightness = Math.floor(Math.random() * 101); // 0% to 100%
                }
                break;
        }
        
        // Set the HSL color
        cell.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    
    // Helper function to apply rainbow colors with randomness
    function applyRainbowColorToCell(cell, hexColor, level) {
        // Convert hex to HSL
        const hslColor = hexToHsl(hexColor);
        const baseHue = hslColor.h;
        const baseSaturation = hslColor.s;
        const baseLightness = hslColor.l;
        
        // Default values
        let hue = baseHue;
        let saturation = baseSaturation;
        let lightness = baseLightness;
        
        // Apply randomness based on level
        switch (level) {
            case 1:
                // Very slight variations to maintain distinct rainbow bands
                hue = Math.max(0, Math.min(360, baseHue + (Math.random() * 10 - 5)));
                saturation = Math.max(0, Math.min(100, baseSaturation + (Math.random() * 10 - 5)));
                lightness = Math.max(0, Math.min(100, baseLightness + (Math.random() * 10 - 5)));
                break;
                
            case 2:
            case 3:
                // Medium variations but stay in the same color family
                hue = Math.max(0, Math.min(360, baseHue + (Math.random() * 20 - 10)));
                saturation = Math.max(0, Math.min(100, baseSaturation + (Math.random() * 20 - 10)));
                lightness = Math.max(0, Math.min(100, baseLightness + (Math.random() * 30 - 15)));
                break;
                
            case 4:
            case 5:
                // Larger variations but still recognizable
                hue = Math.max(0, Math.min(360, baseHue + (Math.random() * 30 - 15)));
                saturation = Math.max(0, Math.min(100, baseSaturation + (Math.random() * 30 - 15)));
                lightness = Math.max(20, Math.min(80, baseLightness + (Math.random() * 40 - 20)));
                break;
                
            default:
                // Levels 6-10: Very high randomness, but still stay somewhat in hue range
                const hueRange = Math.min(30, (level - 5) * 10);
                const satRange = Math.min(50, (level - 5) * 10);
                const lightRange = Math.min(60, (level - 5) * 10);
                
                hue = Math.max(0, Math.min(360, baseHue + (Math.random() * hueRange * 2 - hueRange)));
                saturation = Math.max(20, Math.min(100, baseSaturation + (Math.random() * satRange - satRange/2)));
                lightness = Math.max(10, Math.min(90, baseLightness + (Math.random() * lightRange - lightRange/2)));
                break;
        }
        
        // Set the HSL color
        cell.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    
    // Update randomness state display based on level
    function updateRandomnessStateDisplay(level) {
        const descriptions = {
            1: "Level 1: Subtle variations",
            2: "Level 2: Light variations",
            3: "Level 3: Dual tones",
            4: "Level 4: Mild variations",
            5: "Level 5: Medium variations",
            6: "Level 6: Medium dark variations",
            7: "Level 7: Strong variations", 
            8: "Level 8: High contrast",
            9: "Level 9: Extreme variations",
            10: "Level 10: Full randomization"
        };
        
        randomnessState.textContent = descriptions[level] || `Level ${level}`;
    }
    
    // Function to update smooth transitions
    function updateSmoothTransitions(isSmooth) {
        const cells = document.querySelectorAll('.grid-cell');
        
        if (isSmooth) {
            // Calculate optimal transition time (slightly less than frame interval)
            // This ensures transition completes just before the next color change
            const transitionTime = Math.max(0.05, (frameInterval / 1000) * 0.8); // 80% of frame interval in seconds
            
            cells.forEach(cell => {
                cell.classList.add('smooth');
                cell.style.transitionDuration = `${transitionTime}s`;
            });
        } else {
            cells.forEach(cell => {
                cell.classList.remove('smooth');
                cell.style.transitionDuration = '0s';
            });
        }
    }
    
    // Add a function to update the preset name display
    function updatePresetNameDisplay(presetName, presetNameEn) {
        const presetNameZhDisplay = document.getElementById('preset-name-zh-display');
        const presetNameEnDisplay = document.getElementById('preset-name-en-display');
        
        // Clear any existing content
        presetNameZhDisplay.textContent = '';
        presetNameEnDisplay.textContent = '';
        
        // Set new preset names if provided
        if (presetName) {
            presetNameZhDisplay.textContent = presetName;
            
            // If this is "Custom", show the same text in both languages
            if (presetName === '定制') {
                presetNameEnDisplay.textContent = 'Custom';
            } else {
                // Otherwise show the English name if available
                presetNameEnDisplay.textContent = presetNameEn || '';
            }
            
            // Make the names visible
            presetNameZhDisplay.style.opacity = '1';
            presetNameEnDisplay.style.opacity = '1';
            
            // Set text color based on base color brightness
            const baseColor = colorPicker.value;
            const textColor = isLightColor(baseColor) ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 1)';
            
            presetNameZhDisplay.style.color = textColor;
            presetNameEnDisplay.style.color = textColor;
            
            // Update text shadow for better contrast
            const shadowColor = isLightColor(baseColor) ? 
                '0 0 10px rgba(255, 255, 255, 0.5)' : 
                '0 0 10px rgba(0, 0, 0, 0.5)';
            
            presetNameZhDisplay.style.textShadow = shadowColor;
            presetNameEnDisplay.style.textShadow = shadowColor;
        }
    }
    
    // Function to determine if a color is light or dark
    function isLightColor(hexColor) {
        // Remove # if present
        hexColor = hexColor.replace('#', '');
        
        // Parse the color
        let r, g, b;
        if (hexColor.length === 3) {
            r = parseInt(hexColor.charAt(0) + hexColor.charAt(0), 16);
            g = parseInt(hexColor.charAt(1) + hexColor.charAt(1), 16);
            b = parseInt(hexColor.charAt(2) + hexColor.charAt(2), 16);
        } else {
            r = parseInt(hexColor.substr(0, 2), 16);
            g = parseInt(hexColor.substr(2, 2), 16);
            b = parseInt(hexColor.substr(4, 2), 16);
        }
        
        // Calculate luminance - gives more weight to green as human eyes are more sensitive to it
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Return true if light, false if dark
        return luminance > 0.66;
    }
    
    // Function to darken a hex color by a percentage
    function darkenColor(hexColor, percent) {
        // Remove the # if present
        hexColor = hexColor.replace('#', '');
        
        // Parse the hex color
        let r = parseInt(hexColor.substring(0, 2), 16);
        let g = parseInt(hexColor.substring(2, 4), 16);
        let b = parseInt(hexColor.substring(4, 6), 16);
        
        // Darken by reducing each component by the percentage
        r = Math.max(0, Math.floor(r * (1 - percent / 100)));
        g = Math.max(0, Math.floor(g * (1 - percent / 100)));
        b = Math.max(0, Math.floor(b * (1 - percent / 100)));
        
        // Convert back to hex
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // Function to lighten a hex color by a percentage
    function lightenColor(hexColor, percent) {
        // Remove the # if present
        hexColor = hexColor.replace('#', '');
        
        // Parse the hex color
        let r = parseInt(hexColor.substring(0, 2), 16);
        let g = parseInt(hexColor.substring(2, 4), 16);
        let b = parseInt(hexColor.substring(4, 6), 16);
        
        // Lighten by increasing each component by the percentage
        r = Math.min(255, Math.floor(r * (1 + percent / 100)));
        g = Math.min(255, Math.floor(g * (1 + percent / 100)));
        b = Math.min(255, Math.floor(b * (1 + percent / 100)));
        
        // Convert back to hex
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    // Function to update body background with darkened base color
    function updateBodyBackground(baseColor) {
        isLightColor(baseColor) ? 
            document.body.style.backgroundColor = lightenColor(baseColor, 60) : // 40% lighter
            document.body.style.backgroundColor = darkenColor(baseColor, 60); // 40% darker
    }

    // Function to update body text color with darkened base color
    function updateBodyTextColor(baseColor) {
        const textColor = isLightColor(baseColor) ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 1)';
        document.body.style.color = textColor;
    }
    
    // Function to update button colors based on base color
    function updateButtonColors(baseColor) {
        // Get the buttons
        const toggleAnimationBtn = document.getElementById('toggle-animation');
        const exportImageBtn = document.getElementById('export-image');
        const smoothTransitionToggle = document.getElementById('smooth-transition');
        
        // Set base colors
        const normalColor = baseColor;
        const hoverColor = darkenColor(baseColor, 15);
        const activeColor = darkenColor(baseColor, 25);
        const textColor = isLightColor(baseColor) ? 'black' : 'white';
        
        // Update toggle animation button
        toggleAnimationBtn.style.backgroundColor = toggleAnimationBtn.classList.contains('active') ? 
            activeColor : normalColor;
        toggleAnimationBtn.style.color = textColor;
        
        // Update export button (unless disabled)
        if (!exportImageBtn.disabled) {
            exportImageBtn.style.backgroundColor = normalColor;
            exportImageBtn.style.color = textColor;
        }
        
        // Update toggle slider colors
        const toggleSlider = document.querySelector('.toggle-slider');
        if (toggleSlider) {
            // Update the toggle slider background color when checked
            if (smoothTransitionToggle.checked) {
                toggleSlider.style.backgroundColor = normalColor;
            }
            
            // Add event listener to update color on toggle change
            smoothTransitionToggle.addEventListener('change', function() {
                if (this.checked) {
                    toggleSlider.style.backgroundColor = normalColor;
                } else {
                    toggleSlider.style.backgroundColor = '#ccc'; // Default gray when unchecked
                }
            });
        }
        
        // Update custom button if it's active (in custom mode)
        if (isCustomMode && customButton.classList.contains('active')) {
            customButton.style.backgroundColor = baseColor;
            customButton.style.borderColor = darkenColor(baseColor, 20);
            customButton.style.color = textColor;
        }
        
        // Update footer link color to match the base color
        const footerLink = document.querySelector('.footer a');
        if (footerLink) {
            footerLink.style.color = darkenColor(baseColor, 20);
            // Add hover effect
            footerLink.onmouseenter = function() {
                this.style.color = darkenColor(baseColor, 20);
                this.style.textDecoration = 'underline';
            };
            footerLink.onmouseleave = function() {
                this.style.color = baseColor;
                this.style.textDecoration = 'none';
            };
        }
    }
    
    // Call updateButtonColors on initialization
    // Add this after other initialization calls
    updateButtonColors(colorPicker.value);
});