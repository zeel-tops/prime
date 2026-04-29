(function () {
  'use strict';

  const STORAGE_KEY = 'todos.vanilla.v1';

  const form = document.querySelector('#todo-form');
  const input = document.querySelector('#todo-input');
  const list = document.querySelector('#todo-list');
  const itemsLeft = document.querySelector('#items-left');
  const clearCompletedBtn = document.querySelector('#clear-completed');
  const filterButtons = document.querySelectorAll('.filter');

  let todos = loadTodos();
  let currentFilter = 'all';

  function loadTodos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('Could not parse stored todos, starting fresh.', err);
      return [];
    }
  }

  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
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

  function updateTodoText(id, text) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const trimmed = text.trim();
    if (!trimmed) {
      deleteTodo(id);
      return;
    }
    todo.text = trimmed;
    saveTodos();
    render();
  }

  function clearCompleted() {
    todos = todos.filter((t) => !t.completed);
    saveTodos();
    render();
  }

  function getFilteredTodos() {
    if (currentFilter === 'active') return todos.filter((t) => !t.completed);
    if (currentFilter === 'completed') return todos.filter((t) => t.completed);
    return todos;
  }

  function buildTodoElement(todo) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', 'Mark as complete');
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;
    text.title = 'Double-click to edit';
    text.addEventListener('dblclick', () => startEditing(li, todo));

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'todo-delete';
    deleteBtn.setAttribute('aria-label', 'Delete todo');
    deleteBtn.textContent = '×';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    li.append(checkbox, text, deleteBtn);
    return li;
  }

  function startEditing(li, todo) {
    const textNode = li.querySelector('.todo-text');
    if (!textNode) return;

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'todo-edit-input';
    editInput.value = todo.text;

    let committed = false;
    const commit = () => {
      if (committed) return;
      committed = true;
      updateTodoText(todo.id, editInput.value);
    };

    editInput.addEventListener('blur', commit);
    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commit();
      } else if (e.key === 'Escape') {
        committed = true;
        render();
      }
    });

    li.replaceChild(editInput, textNode);
    editInput.focus();
    editInput.select();
  }

  function render() {
    const filtered = getFilteredTodos();
    list.replaceChildren();

    if (filtered.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty-state';
      empty.textContent =
        todos.length === 0 ? 'No todos yet. Add one above!' : 'Nothing to show here.';
      list.appendChild(empty);
    } else {
      const fragment = document.createDocumentFragment();
      filtered.forEach((todo) => fragment.appendChild(buildTodoElement(todo)));
      list.appendChild(fragment);
    }

    const remaining = todos.filter((t) => !t.completed).length;
    itemsLeft.textContent = `${remaining} ${remaining === 1 ? 'item' : 'items'} left`;

    const hasCompleted = todos.some((t) => t.completed);
    clearCompletedBtn.disabled = !hasCompleted;
    clearCompletedBtn.style.visibility = hasCompleted ? 'visible' : 'hidden';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodo(input.value);
    input.value = '';
    input.focus();
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      filterButtons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      render();
    });
  });

  render();
})();
