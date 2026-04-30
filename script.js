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
    } catch {
      // Corrupt JSON — start fresh rather than crash.
      return [];
    }
  }

  function saveTodos() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      // Storage unavailable (private mode, quota). The app still works in-memory.
    }
  }

  function generateId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return false;
    todos.push({ id: generateId(), text: trimmed, completed: false });
    saveTodos();
    render();
    return true;
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

  function createTodoElement(todo) {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", "Mark as " + (todo.completed ? "incomplete" : "complete"));
    checkbox.dataset.action = "toggle";

    const span = document.createElement("span");
    span.className = "todo-text";
    // textContent escapes any HTML in user input — guards against XSS.
    span.textContent = todo.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.setAttribute("aria-label", "Delete todo");
    deleteBtn.dataset.action = "delete";

    li.append(checkbox, span, deleteBtn);
    return li;
  }

  function render() {
    list.replaceChildren(...todos.map(createTodoElement));
    emptyState.hidden = todos.length > 0;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (addTodo(input.value)) {
      input.value = "";
      input.focus();
    }
  });

  list.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.dataset.action;
    if (!action) return;
    const li = target.closest(".todo-item");
    if (!li) return;
    const id = li.dataset.id;
    if (!id) return;

    if (action === "toggle") toggleTodo(id);
    else if (action === "delete") deleteTodo(id);
  });

  render();
})();
