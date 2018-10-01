/**
 * Returns hexadecimal color
 */
function randomColor() {
    const hexChars = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        let code = Math.floor(Math.random() * 16);
        color += hexChars.charAt(code);
    }
    return color;
}


/**
 * Convert from hex string to RGB object
 *  adapted from stackoverflow.com/questions/35969656/how-can-i-generate-the-opposite-color-according-to-current-color
 */
function hexToRgb(hexColor) {
    hexColor = hexColor.slice(1);
    rgbColor = {
        r: parseInt(hexColor.slice(0, 2), 16),
        g: parseInt(hexColor.slice(2, 4), 16),
        b: parseInt(hexColor.slice(4, 6), 16)
    }
    return rgbColor;
}

/**
 * Convert from RGB object to HSL object
 * adapted from Johannes's comment on stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
 */
function rgbToHsl(rgbColor) {
    let r = rgbColor.r / 255;
    let g = rgbColor.g / 255;
    let b = rgbColor.b / 255;
    
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);

    let h, s, l = (max + min ) /2;

    if(max == min) {
        h = s = 0; // achromatic
    }
    else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - (max + min)) : d / (max + min);
        switch(max) {
            case r: h = ((g - b) / d + 0) * 60; break;
            case g: h = ((b - r) / d + 2) * 60; break;
            case b: h = ((r - g) / d + 4) * 60; break;
        }
    }
    return {h, s, l};
}

/**
 * Convert from HSL object to hex string
 * Adapted from icl7126 stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex
 */
function hslToHex(h, s, l) {
    h /= 360;

    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3) * 255;
        g = hue2rgb(p, q, h) * 255;
        b = hue2rgb(p, q, h - 1 / 3) * 255;
    }
    const toHex = x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(Math.round(r))}${toHex(Math.round(g))}${toHex(Math.round(b))}`;
}

/**
 * Converts {h, s, l} to string usable in CSS
 */
function stringifyHsl(hslColor) {
    let h = hslColor.h;
    let s = (hslColor.s * 100) + "%";
    let l = (hslColor.l * 100) + "%";
    return `hsl(${h}, ${s}, ${l})`;
}

/**
 * Shifts hue of {h, s, l} by the specified angle
 */
function modHue(hslColor, angle) {
    let newColor = {
        h: hslColor.h + angle,
        s: hslColor.s,
        l: hslColor.l
    };
    return newColor;
}

/**
 * Styles color swatches using colors hue-shifted by the given amount from base color
 */
function displayColorScheme(color, spread) {
    // Set color of swatches
    setStyle("#primary-swatch", "background-color: " + stringifyHsl(color) + ";");
    setStyle("#secondary-swatch", "background-color: " + stringifyHsl(modHue(color, spread)) + ";");
    setStyle("#tertiary-swatch", "background-color: " + stringifyHsl(modHue(color, -spread)) + ";");
}

/**
 * Displays hexadecimal code for colors on swatches
 */
function setSwatchText(color, spread) {
    let secondaryColor = modHue(color, spread);
    let tertiaryColor = modHue(color, -spread);
    document.getElementById('primary-text').innerHTML = hslToHex(color.h, color.s, color.l);
    document.getElementById('secondary-text').innerHTML = hslToHex(secondaryColor.h, secondaryColor.s, secondaryColor.l);
    document.getElementById('tertiary-text').innerHTML = hslToHex(tertiaryColor.h, tertiaryColor.s, tertiaryColor.l);
}

//  ========================
//  === Helper Functions ===
//  ========================

function setStyle(elementId, styleRule) {
    var element;
    if (elementId[0] === "#") {
        element = document.getElementById(elementId.substring(1));
    }
    else if (elementId[0] === ".") {
        element = document.getElementByClassName(elementId.substring(1));
    }
    else {
        throw new Error('Invalid elementId, must begin with # or .');
    }

    element.setAttribute("style", styleRule);
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function updateClipboard(newClip) {
    navigator.clipboard.writeText(newClip).then(
        () => {
            console.log("copy success");
        },
        () => {
            console.error("copy fail", err);
        }
    );
}

//  ==================
//  === Initialize ===
//  ==================

function initAll() {
    // Add event listener for GENERATE button
    document.getElementById('generate-button').addEventListener('click', function () {
        let color = rgbToHsl(hexToRgb(randomColor()));
        color.s = getRandomNumber(0.5, 1);
        color.l = getRandomNumber(0.5, 0.8);
        let diff = 0;

        // Color boldness 
        // color schemes: analogous = 30, split complementary = 165, triadic = 120
        if (document.getElementById('boldness-reserved').checked) {
            diff = 30;
        }
        if (document.getElementById('boldness-balanced').checked) {
            diff = 165;
        }
        if (document.getElementById('boldness-bold').checked) {
            diff = 120;
        }

        // Color temperature
        if (document.getElementById('warmth-cool').checked) {
            color.h = getRandomNumber(90, 270);
        }
        if (document.getElementById('warmth-warm').checked) {
            color.h = getRandomNumber(-90, 45);
        }

        displayColorScheme(color, diff);
        setSwatchText(color, diff);
    });

    // Add event listeners for click to copy
    const swatches = document.getElementsByClassName('swatch-text');
    for (let i = 0; i < swatches.length; i++) {
        swatches[i].addEventListener('click', function() {
            updateClipboard(swatches[i].innerHTML);
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    let color = rgbToHsl(hexToRgb(randomColor()));
    displayColorScheme(color, 165);
    setSwatchText(color, 165);

    initAll();
    M.AutoInit();
});

