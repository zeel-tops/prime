(function () {
  "use strict";

  const STORAGE_KEY = "todos";

  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const list = document.getElementById("todo-list");
  const emptyState = document.getElementById("empty-state");

  let todos = loadTodos();

  function loadTodos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (t) =>
          t &&
          typeof t.id === "string" &&
          typeof t.text === "string" &&
          typeof t.completed === "boolean"
      );
    } catch (err) {
      // Corrupted JSON or storage unavailable — start fresh rather than crash.
      console.warn("Could not load todos from localStorage:", err);
      return [];
    }
  }

  function saveTodos() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (err) {
      console.warn("Could not save todos to localStorage:", err);
    }
  }

  function createId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    todos.push({ id: createId(), text: trimmed, completed: false });
    saveTodos();
    render();
  }

  function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    todo.completed = !todo.completed;
    saveTodos();
    render();
  }

  function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    saveTodos();
    render();
  }

  function render() {
    list.textContent = "";

    if (todos.length === 0) {
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;

    const fragment = document.createDocumentFragment();
    for (const todo of todos) {
      fragment.appendChild(buildItem(todo));
    }
    list.appendChild(fragment);
  }

  function buildItem(todo) {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", "Mark complete");
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const span = document.createElement("span");
    span.className = "todo-text";
    // textContent (not innerHTML) — prevents XSS from todo text.
    span.textContent = todo.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.setAttribute("aria-label", "Delete todo");
    deleteBtn.textContent = "✕";
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    li.append(checkbox, span, deleteBtn);
    return li;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    addTodo(input.value);
    input.value = "";
    input.focus();
  });

  render();
})();
