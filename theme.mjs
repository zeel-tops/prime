const STORAGE_KEY = "theme";
const DARK_CLASS = "dark-mode";

export function getStoredTheme(storage) {
    try {
        const value = storage.getItem(STORAGE_KEY);
        return value === "light" || value === "dark" ? value : null;
    } catch {
        return null;
    }
}

export function getSystemTheme(matchMedia) {
    if (typeof matchMedia !== "function") return "light";
    try {
        return matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    } catch {
        return "light";
    }
}

export function getInitialTheme({ storage, matchMedia }) {
    const stored = getStoredTheme(storage);
    if (stored) return stored;
    return getSystemTheme(matchMedia);
}

export function applyTheme(theme, body) {
    if (theme === "dark") {
        body.classList.add(DARK_CLASS);
    } else {
        body.classList.remove(DARK_CLASS);
    }
}

export function setTheme(theme, { body, storage }) {
    applyTheme(theme, body);
    try {
        storage.setItem(STORAGE_KEY, theme);
    } catch {
        // Storage may be unavailable (private browsing, quota). The class still
        // applies for the current session; persistence is best-effort.
    }
}

export function toggleTheme({ body, storage }) {
    const next = body.classList.contains(DARK_CLASS) ? "light" : "dark";
    setTheme(next, { body, storage });
    return next;
}

function updateButton(button, theme) {
    if (!button) return;
    const isDark = theme === "dark";
    button.setAttribute("aria-pressed", isDark ? "true" : "false");
    button.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
    );
    button.textContent = isDark ? "Light mode" : "Dark mode";
}

export function init({ document: doc, storage, matchMedia }) {
    const body = doc.body;
    const button = doc.querySelector("[data-theme-toggle]");
    const initial = getInitialTheme({ storage, matchMedia });
    applyTheme(initial, body);
    updateButton(button, initial);
    if (button) {
        button.addEventListener("click", () => {
            const next = toggleTheme({ body, storage });
            updateButton(button, next);
        });
    }
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
    const start = () =>
        init({
            document,
            storage: window.localStorage,
            matchMedia: window.matchMedia
                ? window.matchMedia.bind(window)
                : undefined,
        });
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
}
