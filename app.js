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

/*
 * Open the diary database.
 * IndexedDB keeps diary entries available after the page is closed.
 */
const DB_NAME = "ColorDiary";
const DB_VERSION = 1;
const STORE_NAME = "entries";

let db;

const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onupgradeneeded = (event) => {
    db = event.target.result;

    if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
            keyPath: "date"
        });
    }
};

request.onsuccess = (event) => {
    db = event.target.result;
    loadTodayEntry();
    loadDiaryDay();
};

request.onerror = () => {
    console.error("Failed to open IndexedDB.");
};

/*
 * Save today's color to IndexedDB.
 * Saving only happens when the user explicitly presses the check button.
 */
document.getElementById("save-button").addEventListener("click", () => {
    if (!db) {
        console.error("Database is not ready.");
        return;
    }

    const color = hslToHex(
        currentHue,
        currentSaturation,
        currentBrightness
    );

    const entry = {
        date: todayDate,
        color: color
    };

    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    store.put(entry);

    transaction.onerror = () => {
        console.error("Failed to save the color.");
    };
});

/*
 * Load today's saved color from IndexedDB.
 * If no entry exists, the picker keeps its default state.
 */
function loadTodayEntry() {
    if (!db) return;

    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.get(todayDate);

    request.onsuccess = () => {
        const entry = request.result;

        if (!entry) {
            return;
        }

        const { h, s, l } = hexToHsl(entry.color);

        currentHue = h;
        currentSaturation = s;
        currentBrightness = l;

        setInitialPickerPosition();
    };

    request.onerror = () => {
        console.error("Failed to load today's entry.");
    };
}


/*
 * Convert a HEX color to HSL values.
 * The picker stores its current state as HSL internally.
 */
function hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;

        s = l > 0.5
            ? d / (2 - max - min)
            : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;

            case g:
                h = (b - r) / d + 2;
                break;

            case b:
                h = (r - g) / d + 4;
                break;
        }

        h *= 60;
    }

    return {
        h: h,
        s: s * 100,
        l: l * 100
    };
}

const screens = {
    today: document.getElementById("today-screen"),
    diary: document.getElementById("diary-screen"),
    settings: document.getElementById("settings-screen")
};

const navigationButtons = document.querySelectorAll(".bottom-nav button");

navigationButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const screenName = button.dataset.screen;

        if (!screens[screenName]) {
            return;
        }

        Object.values(screens).forEach((screen) => {
            screen.hidden = true;
        });

        screens[screenName].hidden = false;

        navigationButtons.forEach((navButton) => {
            navButton.classList.remove("active");
        });

        button.classList.add("active");
    });
});

let diaryDate = todayDate;

const diaryDateElement = document.getElementById("diary-date");
const diaryColorElement = document.getElementById("diary-color");
const previousDayButton = document.getElementById("previous-day");
const nextDayButton = document.getElementById("next-day");


/*
 * Display the selected diary date and its saved color.
 * Missing dates are intentionally left empty because the absence of a color
 * is part of the diary itself.
 */
function loadDiaryDay() {
    diaryDateElement.textContent = diaryDate;
    diaryColorElement.textContent = "・";
    diaryColorElement.style.backgroundColor = "transparent";

    if (!db) return;

    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(diaryDate);

    request.onsuccess = () => {
        const entry = request.result;

        if (!entry) {
            return;
        }

        diaryColorElement.textContent = "";
        diaryColorElement.style.backgroundColor = entry.color;
    };

    request.onerror = () => {
        console.error("Failed to load diary entry.");
    };
}


/*
 * Move the diary date by a specified number of days.
 */
function changeDiaryDate(days) {
    const date = new Date(`${diaryDate}T00:00:00`);

    date.setDate(date.getDate() + days);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    diaryDate = `${year}-${month}-${day}`;

    loadDiaryDay();
}


previousDayButton.addEventListener("click", () => {
    changeDiaryDate(-1);
});

nextDayButton.addEventListener("click", () => {
    changeDiaryDate(1);
});

const dayView = document.querySelector(".diary-navigation");
const dayColor = document.getElementById("diary-color");
const weekView = document.getElementById("week-view");
const monthView = document.getElementById("month-view");

const dayModeButton = document.getElementById("day-mode");
const weekModeButton = document.getElementById("week-mode");
const monthModeButton = document.getElementById("month-mode");

let diaryMode = "day";
let weekStartDate = getWeekStartDate(diaryDate);


/*
 * Get the Sunday that starts the week containing the given date.
 */
function getWeekStartDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    const dayOfWeek = date.getDay();

    date.setDate(date.getDate() - dayOfWeek);

    return formatDate(date);
}


/*
 * Format a Date object as YYYY-MM-DD.
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/*
 * Change the visible diary mode.
 */
function setDiaryMode(mode) {
    diaryMode = mode;

    dayModeButton.classList.toggle("active", mode === "day");
    weekModeButton.classList.toggle("active", mode === "week");
    monthModeButton.classList.toggle("active", mode === "month");

    dayView.hidden = mode !== "day";
    dayColor.hidden = mode !== "day";
    weekView.hidden = mode !== "week";
    monthView.hidden = mode !== "month";

    if (mode === "day") {
        loadDiaryDay();
    }

    if (mode === "week") {
        weekStartDate = getWeekStartDate(diaryDate);
        loadDiaryWeek();
    }

    if (mode === "month") {
        loadDiaryMonth();
    }
}


dayModeButton.addEventListener("click", () => {
    setDiaryMode("day");
});

weekModeButton.addEventListener("click", () => {
    setDiaryMode("week");
});

monthModeButton.addEventListener("click", () => {
    setDiaryMode("month");
});

/*
 * Load the seven days belonging to the current week.
 */
function loadDiaryWeek() {
    const weekDateElement = document.getElementById("week-date");

    const startDate = new Date(`${weekStartDate}T00:00:00`);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    weekDateElement.textContent =
        `${formatDate(startDate)} – ${formatDate(endDate)}`;

    const colorElements = [
        document.getElementById("week-sun"),
        document.getElementById("week-mon"),
        document.getElementById("week-tue"),
        document.getElementById("week-wed"),
        document.getElementById("week-thu"),
        document.getElementById("week-fri"),
        document.getElementById("week-sat")
    ];

    colorElements.forEach((element, index) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + index);

        element.textContent = "・";
        element.style.backgroundColor = "transparent";
        element.dataset.date = formatDate(date);

        element.onclick = () => {
            diaryDate = element.dataset.date;
            setDiaryMode("day");
        };
    });

    if (!db) return;

    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const requests = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        requests.push(store.get(formatDate(date)));
    }

    requests.forEach((request, index) => {
        request.onsuccess = () => {
            const entry = request.result;

            if (!entry) {
                return;
            }

            colorElements[index].textContent = "";
            colorElements[index].style.backgroundColor = entry.color;
        };
    });

    transaction.onerror = () => {
        console.error("Failed to load diary week.");
    };
}


/*
 * Move the visible week by one week.
 */
function changeDiaryWeek(weeks) {
    const date = new Date(`${weekStartDate}T00:00:00`);

    date.setDate(date.getDate() + weeks * 7);

    weekStartDate = formatDate(date);

    loadDiaryWeek();
}


document.getElementById("previous-week").addEventListener("click", () => {
    changeDiaryWeek(-1);
});

document.getElementById("next-week").addEventListener("click", () => {
    changeDiaryWeek(1);
});

/*
 * Store the month currently displayed in Month view.
 */
let monthDate = new Date(`${diaryDate}T00:00:00`);


/*
 * Load the calendar and display saved colors for the current month.
 */
function loadDiaryMonth() {
    const monthDateElement = document.getElementById("month-date");
    const monthGrid = document.getElementById("month-grid");

    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    monthDateElement.textContent =
        `${year}-${String(month + 1).padStart(2, "0")}`;

    monthGrid.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add empty cells before the first day of the month.
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "month-cell empty";

        monthGrid.appendChild(emptyCell);
    }

    const colorCells = [];

    // Create one cell for each day of the month.
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("div");

        cell.className = "month-cell";
        cell.textContent = "・";

        const date = new Date(year, month, day);
        const dateString = formatDate(date);

        cell.dataset.date = dateString;

cell.addEventListener("click", () => {
    diaryDate = cell.dataset.date;
    setDiaryMode("day");
});

colorCells.push(cell);

monthGrid.appendChild(cell);
    }

    if (!db) return;

    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    colorCells.forEach((cell) => {
        const request = store.get(cell.dataset.date);

        request.onsuccess = () => {
            const entry = request.result;

            if (!entry) {
                return;
            }

            cell.textContent = "";
            cell.style.backgroundColor = entry.color;
        };
    });

    transaction.onerror = () => {
        console.error("Failed to load diary month.");
    };
}

/*
 * Move the visible month by the specified number of months.
 */
function changeDiaryMonth(months) {
    monthDate.setMonth(monthDate.getMonth() + months);

    loadDiaryMonth();
}


document.getElementById("previous-month").addEventListener("click", () => {
    changeDiaryMonth(-1);
});

document.getElementById("next-month").addEventListener("click", () => {
    changeDiaryMonth(1);
});

document.getElementById("export-button").addEventListener("click", () => {
    if (!db) {
        console.error("Database is not ready.");
        return;
    }

    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.getAll();

    request.onsuccess = () => {
        const entries = request.result;

        const json = JSON.stringify(entries, null, 2);

        const blob = new Blob([json], {
            type: "application/json"
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `color-diary-${todayDate}.json`;

        link.click();

        URL.revokeObjectURL(url);
    };

    request.onerror = () => {
        console.error("Failed to export diary data.");
    };
});