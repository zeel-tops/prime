import { test } from "node:test";
import assert from "node:assert/strict";
import {
    applyTheme,
    getInitialTheme,
    getStoredTheme,
    getSystemTheme,
    init,
    setTheme,
    toggleTheme,
} from "./theme.mjs";

function createBody() {
    const classes = new Set();
    return {
        classList: {
            add: (c) => classes.add(c),
            remove: (c) => classes.delete(c),
            contains: (c) => classes.has(c),
        },
    };
}

function createStorage(initial = {}) {
    const map = new Map(Object.entries(initial));
    return {
        getItem: (k) => (map.has(k) ? map.get(k) : null),
        setItem: (k, v) => map.set(k, String(v)),
        removeItem: (k) => map.delete(k),
    };
}

function createDoc(body, button) {
    return {
        body,
        querySelector: (sel) =>
            sel === "[data-theme-toggle]" ? button : null,
    };
}

function createButton() {
    const attrs = {};
    const listeners = {};
    return {
        textContent: "",
        setAttribute: (k, v) => {
            attrs[k] = v;
        },
        getAttribute: (k) => attrs[k],
        addEventListener: (event, fn) => {
            listeners[event] = fn;
        },
        click: () => listeners.click && listeners.click(),
        _attrs: attrs,
    };
}

test("applyTheme adds dark-mode class when dark", () => {
    const body = createBody();
    applyTheme("dark", body);
    assert.equal(body.classList.contains("dark-mode"), true);
});

test("applyTheme removes dark-mode class when light", () => {
    const body = createBody();
    body.classList.add("dark-mode");
    applyTheme("light", body);
    assert.equal(body.classList.contains("dark-mode"), false);
});

test("getStoredTheme returns null when nothing is stored", () => {
    assert.equal(getStoredTheme(createStorage()), null);
});

test("getStoredTheme returns the stored value when valid", () => {
    assert.equal(getStoredTheme(createStorage({ theme: "dark" })), "dark");
    assert.equal(getStoredTheme(createStorage({ theme: "light" })), "light");
});

test("getStoredTheme rejects invalid stored values", () => {
    assert.equal(getStoredTheme(createStorage({ theme: "rainbow" })), null);
});

test("getStoredTheme returns null when storage throws", () => {
    const storage = {
        getItem: () => {
            throw new Error("blocked");
        },
    };
    assert.equal(getStoredTheme(storage), null);
});

test("getSystemTheme returns dark when prefers-color-scheme: dark matches", () => {
    const mm = (q) => ({ matches: q.includes("dark") });
    assert.equal(getSystemTheme(mm), "dark");
});

test("getSystemTheme defaults to light when matchMedia is missing", () => {
    assert.equal(getSystemTheme(undefined), "light");
});

test("getInitialTheme prefers stored value over system preference", () => {
    const stored = getInitialTheme({
        storage: createStorage({ theme: "light" }),
        matchMedia: () => ({ matches: true }),
    });
    assert.equal(stored, "light");
});

test("getInitialTheme falls back to system preference when nothing stored", () => {
    const theme = getInitialTheme({
        storage: createStorage(),
        matchMedia: () => ({ matches: true }),
    });
    assert.equal(theme, "dark");
});

test("getInitialTheme defaults to light when no preference is available", () => {
    const theme = getInitialTheme({
        storage: createStorage(),
        matchMedia: () => ({ matches: false }),
    });
    assert.equal(theme, "light");
});

test("setTheme persists to storage and applies the class", () => {
    const body = createBody();
    const storage = createStorage();
    setTheme("dark", { body, storage });
    assert.equal(body.classList.contains("dark-mode"), true);
    assert.equal(storage.getItem("theme"), "dark");
});

test("setTheme tolerates storage errors and still applies the class", () => {
    const body = createBody();
    const storage = {
        setItem: () => {
            throw new Error("quota");
        },
    };
    assert.doesNotThrow(() => setTheme("dark", { body, storage }));
    assert.equal(body.classList.contains("dark-mode"), true);
});

test("toggleTheme flips light to dark and persists the new value", () => {
    const body = createBody();
    const storage = createStorage();
    applyTheme("light", body);
    const next = toggleTheme({ body, storage });
    assert.equal(next, "dark");
    assert.equal(body.classList.contains("dark-mode"), true);
    assert.equal(storage.getItem("theme"), "dark");
});

test("toggleTheme flips dark to light and persists the new value", () => {
    const body = createBody();
    const storage = createStorage();
    applyTheme("dark", body);
    const next = toggleTheme({ body, storage });
    assert.equal(next, "light");
    assert.equal(body.classList.contains("dark-mode"), false);
    assert.equal(storage.getItem("theme"), "light");
});

test("init applies stored preference and wires the toggle button", () => {
    const body = createBody();
    const button = createButton();
    const storage = createStorage({ theme: "dark" });
    init({
        document: createDoc(body, button),
        storage,
        matchMedia: () => ({ matches: false }),
    });
    assert.equal(body.classList.contains("dark-mode"), true);
    assert.equal(button.getAttribute("aria-pressed"), "true");
    assert.equal(button.textContent, "Light mode");

    button.click();
    assert.equal(body.classList.contains("dark-mode"), false);
    assert.equal(storage.getItem("theme"), "light");
    assert.equal(button.getAttribute("aria-pressed"), "false");
    assert.equal(button.textContent, "Dark mode");
});

test("init defaults to light when no preference is stored and system is light", () => {
    const body = createBody();
    const button = createButton();
    init({
        document: createDoc(body, button),
        storage: createStorage(),
        matchMedia: () => ({ matches: false }),
    });
    assert.equal(body.classList.contains("dark-mode"), false);
    assert.equal(button.getAttribute("aria-pressed"), "false");
});

test("init handles a missing toggle button without throwing", () => {
    const body = createBody();
    assert.doesNotThrow(() =>
        init({
            document: createDoc(body, null),
            storage: createStorage(),
            matchMedia: () => ({ matches: false }),
        })
    );
});
