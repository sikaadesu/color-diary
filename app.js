// Get today's date in the user's local timezone.
// The diary uses the user's local calendar day rather than UTC.
const today = new Date();

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

const todayDate = `${year}-${month}-${day}`;

// Display today's date in ISO 8601 format.
document.getElementById("today-date").textContent = todayDate;

const colorPreview = document.getElementById("color-preview");
const hueWheel = document.getElementById("hue-wheel");
const saturationBrightness = document.getElementById("saturation-brightness");
const hueCursor = document.getElementById("hue-cursor");
const sbCursor = document.getElementById("sb-cursor");

// Store the current hue, saturation, and brightness values.
// Keeping these values separate makes the picker easier to extend later.
let currentHue = 0;
let currentSaturation = 0;
let currentBrightness = 50;


/*
 * Update the saturation/brightness area when the hue changes.
 */
function updateSaturationBrightness() {
    saturationBrightness.style.background = `
        linear-gradient(to top, #000000, transparent),
        linear-gradient(to right, #ffffff, hsl(${currentHue}, 100%, 50%))
    `;
}


/*
 * Update the color preview using the current HSL values.
 */
function updateColorPreview() {
    const color = hslToHex(
        currentHue,
        currentSaturation,
        currentBrightness
    );

    colorPreview.style.backgroundColor = color;
}


/*
 * Update the hue based on the pointer position.
 */
function selectHue(event) {
    const rect = hueWheel.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = event.clientX - centerX;
    const y = event.clientY - centerY;

    let angle = Math.atan2(y, x) * (180 / Math.PI);

    currentHue = (angle + 90 + 360) % 360;

    const radius = rect.width / 2;
    const radians = (currentHue - 90) * (Math.PI / 180);

    const cursorX = rect.width / 2 + Math.cos(radians) * radius;
    const cursorY = rect.height / 2 + Math.sin(radians) * radius;

    hueCursor.style.left = `${cursorX}px`;
    hueCursor.style.top = `${cursorY}px`;

    updateSaturationBrightness();
    updateColorPreview();
}


/*
 * Update saturation and brightness based on the pointer position.
 */
function selectSaturationBrightness(event) {
    const rect = saturationBrightness.getBoundingClientRect();

    const x = Math.max(
        0,
        Math.min(1, (event.clientX - rect.left) / rect.width)
    );

    const y = Math.max(
        0,
        Math.min(1, (event.clientY - rect.top) / rect.height)
    );

    currentSaturation = x * 100;
    currentBrightness = (1 - y) * 100;

    sbCursor.style.left = `${x * 100}%`;
    sbCursor.style.top = `${y * 100}%`;

    updateColorPreview();
}


/*
 * Enable click and drag interaction for the hue wheel.
 */
let draggingHue = false;

hueWheel.addEventListener("pointerdown", (event) => {
    draggingHue = true;
    hueWheel.setPointerCapture(event.pointerId);
    selectHue(event);
});

hueWheel.addEventListener("pointermove", (event) => {
    if (!draggingHue) return;

    selectHue(event);
});

hueWheel.addEventListener("pointerup", () => {
    draggingHue = false;
});

hueWheel.addEventListener("pointercancel", () => {
    draggingHue = false;
});


/*
 * Enable click and drag interaction for saturation and brightness.
 */
let draggingSaturationBrightness = false;

saturationBrightness.addEventListener("pointerdown", (event) => {
    draggingSaturationBrightness = true;
    saturationBrightness.setPointerCapture(event.pointerId);
    selectSaturationBrightness(event);
});

saturationBrightness.addEventListener("pointermove", (event) => {
    if (!draggingSaturationBrightness) return;

    selectSaturationBrightness(event);
});

saturationBrightness.addEventListener("pointerup", () => {
    draggingSaturationBrightness = false;
});

saturationBrightness.addEventListener("pointercancel", () => {
    draggingSaturationBrightness = false;
});


/*
 * Convert HSL values to a HEX color.
 */
function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r = 0;
    let g = 0;
    let b = 0;

    if (h < 60) {
        r = c;
        g = x;
    } else if (h < 120) {
        r = x;
        g = c;
    } else if (h < 180) {
        g = c;
        b = x;
    } else if (h < 240) {
        g = x;
        b = c;
    } else if (h < 300) {
        r = x;
        b = c;
    } else {
        r = c;
        b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}


/*
 * Set the initial picker state.
 */
function setInitialPickerPosition() {
    const hueRect = hueWheel.getBoundingClientRect();
    const hueRadius = hueRect.width / 2;

    // Position the hue cursor according to the initial hue.
const radians = (currentHue - 90) * (Math.PI / 180);

const hueX =
    hueRect.width / 2 + Math.cos(radians) * hueRadius;

const hueY =
    hueRect.height / 2 + Math.sin(radians) * hueRadius;

hueCursor.style.left = `${hueX}px`;
hueCursor.style.top = `${hueY}px`;

// Position the saturation/brightness cursor according to the initial values.
sbCursor.style.left = `${currentSaturation}%`;
sbCursor.style.top = `${100 - currentBrightness}%`;

    updateSaturationBrightness();
    updateColorPreview();
}

setInitialPickerPosition();