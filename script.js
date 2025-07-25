// DOM Elements - Authentication & App
const authView = document.getElementById('auth-view');
const appView = document.getElementById('app-view');
const authMsg = document.getElementById('auth-msg');

const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');

const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');

const registerForm = document.getElementById('register-form');
const regEmail = document.getElementById('reg-email');
const regPassword = document.getElementById('reg-password');

const logoutBtn = document.getElementById('logout-btn');
const usernameDisplay = document.getElementById('username-display');
const editProfileBtn = document.getElementById('edit-profile-btn');

const profileModal = document.getElementById('profile-modal');
const closeProfileModalBtn = document.getElementById('close-profile-modal');
const profileForm = document.getElementById('profile-form');
const usernameInput = document.getElementById('username-input');

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority-select');
const categoryInput = document.getElementById('category-input');
const dueDateInput = document.getElementById('due-date');
const recurrenceSelect = document.getElementById('recurrence-select');
const tasksList = document.getElementById('tasks-list');
const formMsg = document.getElementById('form-msg');
const notesInput = document.getElementById('task-notes-input');
const newSubtaskInput = document.getElementById('new-subtask-input');
const addSubtaskBtn = document.getElementById('add-subtask-btn');
const subtasksListPreview = document.getElementById('subtasks-list-preview');

let formSubtasks = [];

const searchInput = document.getElementById('search-input');
const filterCompleted = document.getElementById('filter-completed');
const filterPriority = document.getElementById('filter-priority');
const filterCategory = document.getElementById('filter-category');
const sortOption = document.getElementById('sort-option');

const bulkActions = document.getElementById('bulk-actions');
const selectAllTasksCheckbox = document.getElementById('select-all-tasks');
const bulkCompleteBtn = document.getElementById('bulk-complete-btn');
const bulkDeleteBtn = document.getElementById('bulk-delete-btn');

const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

const editModal = document.getElementById('edit-modal');
const closeModalBtn = document.getElementById('close-modal');
const editForm = document.getElementById('edit-form');
const editTaskInput = document.getElementById('edit-task-input');
const editPrioritySelect = document.getElementById('edit-priority-select');
const editCategoryInput = document.getElementById('edit-category-input');
const editDueDate = document.getElementById('edit-due-date');
const editRecurrenceSelect = document.getElementById('edit-recurrence-select');
const editNotesTextarea = document.getElementById('edit-notes-textarea');
const subtasksContainer = document.getElementById('subtasks-container');
const subtasksList = document.getElementById('subtasks-list');

// Globals
let currentUserEmail = null;
let tasks = [];
let filteredTasks = [];
let categories = new Set();
let selectedTaskIndices = new Set();
let editTaskIdx = null;
let profileData = {}; // username, etc.

// Utilities: LocalStorage keys
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '{}');
}
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}
function getUserTasks(email) {
  return JSON.parse(localStorage.getItem(`tasks_${email}`) || '[]');
}
function saveUserTasks(email, tasks) {
  localStorage.setItem(`tasks_${email}`, JSON.stringify(tasks));
}
function getUserProfile(email) {
  return JSON.parse(localStorage.getItem(`profile_${email}`) || '{}');
}
function saveUserProfile(email, profile) {
  localStorage.setItem(`profile_${email}`, JSON.stringify(profile));
}

// Display Helpers
const notes = notesInput.value.trim();
const subtasks = [...formSubtasks];

function renderSubtasksPreview() {
  subtasksListPreview.innerHTML = '';
  if (formSubtasks.length === 0) return;
  formSubtasks.forEach((sub, idx) => {
    const li = document.createElement('li');
    li.textContent = sub.text;
    // Remove button for each subtask
    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.title = 'Remove subtask';
    delBtn.onclick = () => {
      formSubtasks.splice(idx, 1);
      renderSubtasksPreview();
    };
    li.appendChild(delBtn);
    subtasksListPreview.appendChild(li);
  });
}

addSubtaskBtn.addEventListener('click', () => {
  const val = newSubtaskInput.value.trim();
  if (val) {
    formSubtasks.push({ text: val, completed: false });
    newSubtaskInput.value = '';
    renderSubtasksPreview();
  }
});
newSubtaskInput.addEventListener('keydown', (e) => {
  if(e.key === 'Enter') {
    addSubtaskBtn.click();
    e.preventDefault();
  }
});

function showAppView() {
  authView.style.display = 'none';
  appView.style.display = 'block';
  updateUsernameDisplay();
  applyThemePreference();
}

function showAuthView() {
  authView.style.display = 'block';
  appView.style.display = 'none';
  showLoginForm();
  clearAppData();
  clearFilters();
  resetTheme(); // reset to default on logout
}

function showLoginForm() {
  registerContainer.style.display = 'none';
  loginContainer.style.display = 'block';
  authMsg.style.color = '#ff5252';
  authMsg.textContent = '';
  registerForm.reset();
}

function showRegisterForm() {
  loginContainer.style.display = 'none';
  registerContainer.style.display = 'block';
  authMsg.style.color = '#ff5252';
  authMsg.textContent = '';
  loginForm.reset();
}

function clearAppData() {
  tasks = [];
  filteredTasks = [];
  categories.clear();
  selectedTaskIndices.clear();
  clearBulkSelection();
}

function clearFilters() {
  searchInput.value = '';
  filterCompleted.value = 'all';
  filterPriority.value = 'all';
  filterCategory.innerHTML = '<option value="all" selected>All Categories</option>';
  sortOption.value = 'created';
}

// Authentication Handlers

showRegisterBtn.addEventListener('click', () => showRegisterForm());
showLoginBtn.addEventListener('click', () => showLoginForm());

registerForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = regEmail.value.toLowerCase().trim();
  const password = regPassword.value.trim();
  if (!email || !password) {
    authMsg.textContent = "Please enter email and password.";
    return;
  }
  if (password.length < 6) {
    authMsg.textContent = "Password must be at least 6 characters.";
    return;
  }
  let users = getUsers();
  if (users[email]) {
    authMsg.textContent = "Email already registered.";
    return;
  }
  users[email] = password;
  saveUsers(users);
  authMsg.style.color = '#8adb91';
  authMsg.textContent = "Registered successfully, please login.";
  registerForm.reset();
  showLoginForm();
});

loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = loginEmail.value.toLowerCase().trim();
  const password = loginPassword.value.trim();
  const users = getUsers();
  if (!users[email]) {
    authMsg.textContent = "Email not registered.";
    return;
  }
  if (users[email] !== password) {
    authMsg.textContent = "Incorrect password.";
    return;
  }
  currentUserEmail = email;
  sessionStorage.setItem('currentUserEmail', currentUserEmail);
  profileData = getUserProfile(currentUserEmail);
  tasks = getUserTasks(currentUserEmail);
  authMsg.textContent = '';
  showAppView();
  renderFilters();
  applyFiltersAndRender();
  notifyDueTasks();
});

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('currentUserEmail');
  currentUserEmail = null;
  clearAppData();
  showAuthView();
});

// Profile Modal

function updateUsernameDisplay() {
  usernameDisplay.textContent = profileData.username ? `${profileData.username}'s To-Do List` : 'My To-Do List';
}

editProfileBtn.addEventListener('click', () => {
  usernameInput.value = profileData.username || '';
  profileModal.style.display = 'block';
  setTimeout(() => usernameInput.focus(), 100);
});

closeProfileModalBtn.addEventListener('click', () => {
  profileModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === profileModal) profileModal.style.display = 'none';
});

profileForm.addEventListener('submit', e => {
  e.preventDefault();
  profileData.username = usernameInput.value.trim();
  saveUserProfile(currentUserEmail, profileData);
  updateUsernameDisplay();
  profileModal.style.display = 'none';
});

// Task Management

taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = taskInput.value.trim();
  const priority = prioritySelect.value;
  let category = categoryInput.value.trim();
  if (category) category = category.charAt(0).toUpperCase() + category.slice(1);
  else category = null;
  const dueDate = dueDateInput.value || null;
  const recurrence = recurrenceSelect.value;
  const notes = notesInput.value.trim();
  const subtasks = [...formSubtasks];

  if(!text) {
    formMsg.textContent = "Please enter a task.";
    setTimeout(() => formMsg.textContent = '', 1800);
    return;
  }
  const createdAt = new Date().toISOString();
  tasks.push({
    text,
    priority,
    category,
    dueDate,
    recurrence,
    completed: false,
    createdAt,
    notes,
    subtasks
  });
  saveTasks();
  taskForm.reset();
  formMsg.textContent = '';
  formSubtasks = [];
  renderSubtasksPreview();
  renderFilters();
  applyFiltersAndRender();
  notifyDueTasks();
});

function saveTasks() {
  if (currentUserEmail) saveUserTasks(currentUserEmail, tasks);
}

// Filtering & Sorting

searchInput.addEventListener('input', () => applyFiltersAndRender());
filterCompleted.addEventListener('change', () => applyFiltersAndRender());
filterPriority.addEventListener('change', () => applyFiltersAndRender());
filterCategory.addEventListener('change', () => applyFiltersAndRender());
sortOption.addEventListener('change', () => applyFiltersAndRender());

function renderFilters() {
  categories.clear();
  tasks.forEach(t => {
    if (t.category) categories.add(t.category);
  });
  const optionsHTML = ['<option value="all" selected>All Categories</option>'];
  Array.from(categories).sort().forEach(cat => {
    optionsHTML.push(`<option value="${cat}">${cat}</option>`);
  });
  filterCategory.innerHTML = optionsHTML.join('');
}

function applyFiltersAndRender() {
  let filtered = tasks;

  // Search filter
  const searchVal = searchInput.value.toLowerCase().trim();
  if (searchVal) {
    filtered = filtered.filter(t =>
      t.text.toLowerCase().includes(searchVal) ||
      (t.category && t.category.toLowerCase().includes(searchVal)) ||
      (t.notes && t.notes.toLowerCase().includes(searchVal)) ||
      (t.subtasks && t.subtasks.some(st => st.text.toLowerCase().includes(searchVal)))
    );
  }

  // Completion filter
  if (filterCompleted.value === 'completed') {
    filtered = filtered.filter(t => t.completed);
  } else if (filterCompleted.value === 'incomplete') {
    filtered = filtered.filter(t => !t.completed);
  }

  // Priority filter
  if (['high', 'medium', 'low'].includes(filterPriority.value)) {
    filtered = filtered.filter(t => t.priority === filterPriority.value);
  }

  // Category filter
  if (filterCategory.value !== 'all') {
    filtered = filtered.filter(t => t.category === filterCategory.value);
  }

  // Sorting
  switch (sortOption.value) {
    case 'dueDate':
      filtered.sort((a, b) => {
        if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
        else if (a.dueDate) return -1;
        else if (b.dueDate) return 1;
        else return 0;
      });
      break;
    case 'priority':
      const map = { high: 0, medium: 1, low: 2 };
      filtered.sort((a, b) => map[a.priority] - map[b.priority]);
      break;
    case 'created':
    default:
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
  }

  filteredTasks = filtered;
  renderTasks();
  updateProgressBar();
  updateBulkActions();
}

function updateBulkActions() {
  if (selectedTaskIndices.size > 0) {
    bulkActions.style.display = 'flex';
  } else {
    bulkActions.style.display = 'none';
  }
  selectAllTasksCheckbox.checked = selectedTaskIndices.size === filteredTasks.length && filteredTasks.length > 0;
}

function clearBulkSelection() {
  selectedTaskIndices.clear();
  updateBulkActions();
}

// Render all tasks matching current filters
function renderTasks() {
  tasksList.innerHTML = '';
  if (filteredTasks.length === 0) {
    tasksList.innerHTML = '<li style="color:#888;text-align:center;">No tasks found.</li>';
    return;
  }

  filteredTasks.forEach((task, idx) => {
    const globalIdx = tasks.indexOf(task);
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.classList.add('added');

    // Checkbox for bulk select
    const selectCheckbox = document.createElement('input');
    selectCheckbox.type = 'checkbox';
    selectCheckbox.className = 'task-select-checkbox';
    selectCheckbox.checked = selectedTaskIndices.has(globalIdx);
    selectCheckbox.title = 'Select task for bulk actions';
    selectCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) selectedTaskIndices.add(globalIdx);
      else selectedTaskIndices.delete(globalIdx);
      updateBulkActions();
    });

    // Checkbox for complete
    const completeCheckbox = document.createElement('input');
    completeCheckbox.type = 'checkbox';
    completeCheckbox.checked = task.completed;
    completeCheckbox.title = 'Mark task as completed';
    completeCheckbox.addEventListener('change', () => {
      task.completed = !task.completed;
      saveTasks();
      applyFiltersAndRender();
    });

    // Label for task text
    const label = document.createElement('label');
    label.textContent = task.text;
    label.htmlFor = '';
    label.title = 'Click Edit to modify task';
    if (task.completed) label.style.textDecoration = 'line-through';

    // Metadata spans
    const metaDiv = document.createElement('div');
    metaDiv.className = 'task-meta';

    const prioritySpan = document.createElement('span');
    prioritySpan.className = 'task-priority priority-' + task.priority;
    prioritySpan.textContent = task.priority;
    metaDiv.appendChild(prioritySpan);

    if (task.category) {
      const catSpan = document.createElement('span');
      catSpan.className = 'task-category';
      catSpan.textContent = task.category;
      metaDiv.appendChild(catSpan);
    }
    if (task.dueDate) {
      const dueSpan = document.createElement('span');
      dueSpan.className = 'task-due-date';
      dueSpan.textContent = 'Due: ' + new Date(task.dueDate).toLocaleDateString();
      metaDiv.appendChild(dueSpan);
    }
    if (task.recurrence && task.recurrence !== 'none') {
      const recSpan = document.createElement('span');
      recSpan.className = 'task-recurrence';
      recSpan.textContent = 'Repeats: ' + task.recurrence;
      metaDiv.appendChild(recSpan);
    }

    // -- Notes/Subtasks toggle icon and details blocks
    let showNotesIcon = (task.notes && task.notes.trim()) || (task.subtasks && task.subtasks.length > 0);
    let notesBtn = null, detailsDiv = null;

    if (showNotesIcon) {
      notesBtn = document.createElement('button');
      notesBtn.className = 'notes-toggle-btn';
      notesBtn.title = 'Show/hide notes and subtasks';
      notesBtn.innerHTML = '📝';

      detailsDiv = document.createElement('div');
      detailsDiv.className = 'task-details';
      detailsDiv.style.display = 'none';

      // Only render notes or subtasks if they exist
      if (task.notes && task.notes.trim()) {
        const notesP = document.createElement('p');
        notesP.className = 'task-notes';
        notesP.textContent = task.notes;
        detailsDiv.appendChild(notesP);
      }

      // --- Subtask list with checkboxes
      if (task.subtasks && task.subtasks.length > 0) {
        const subtasksUl = document.createElement('ul');
        subtasksUl.className = 'task-subtasks-list';
        task.subtasks.forEach((st, stIdx) => {
          const stLi = document.createElement('li');
          stLi.style.display = 'flex';
          stLi.style.alignItems = 'center';

          // Subtask complete checkbox
          const subChk = document.createElement('input');
          subChk.type = 'checkbox';
          subChk.checked = !!st.completed;
          subChk.style.marginRight = "8px";
          subChk.title = 'Mark subtask as completed';
          subChk.addEventListener('change', () => {
            st.completed = !st.completed;
            saveTasks();
            applyFiltersAndRender();
          });

          const subLbl = document.createElement('label');
          subLbl.textContent = st.text;
          if (st.completed) subLbl.style.textDecoration = 'line-through';

          stLi.appendChild(subChk);
          stLi.appendChild(subLbl);
          subtasksUl.appendChild(stLi);
        });
        detailsDiv.appendChild(subtasksUl);
      }

      // click = show, doubleclick = hide
      notesBtn.addEventListener('click', () => { detailsDiv.style.display = 'block'; });
      notesBtn.addEventListener('dblclick', () => { detailsDiv.style.display = 'none'; });
    }

    // Subtasks meta icon (for completion count)
    if (task.subtasks && task.subtasks.length > 0) {
      const subtasksCompleted = task.subtasks.filter(st => st.completed).length;
      const subtasksSpan = document.createElement('span');
      subtasksSpan.className = 'task-subtasks-indicator';
      subtasksSpan.title = 'Subtasks completed';
      subtasksSpan.textContent = `☑️ ${subtasksCompleted}/${task.subtasks.length}`;
      metaDiv.appendChild(subtasksSpan);
    }

    // Task has notes? Put indicator in meta bar
    if (task.notes && task.notes.trim()) {
      const noteSpan = document.createElement('span');
      noteSpan.className = 'task-notes-indicator';
      noteSpan.title = 'Has Notes';
      noteSpan.textContent = '📝';
      metaDiv.appendChild(noteSpan);
    }

    // Task action buttons
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.title = 'Edit task';
    editBtn.className = 'edit-btn';
    editBtn.innerHTML = '✎';
    editBtn.addEventListener('click', () => openEditModal(globalIdx));

    const delBtn = document.createElement('button');
    delBtn.title = 'Delete task';
    delBtn.className = 'del-btn';
    delBtn.innerHTML = '🗑️';
    delBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this task?')) {
        tasks.splice(globalIdx, 1);
        saveTasks();
        applyFiltersAndRender();
      }
    });

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(delBtn);

    // Build list item
    li.appendChild(selectCheckbox);
    li.appendChild(completeCheckbox);
    li.appendChild(label);
    li.appendChild(metaDiv);

    // ADD NOTES ICON AND EXPANDABLE SECTION HERE
    if (showNotesIcon) {
      li.appendChild(notesBtn);
      li.appendChild(detailsDiv);
    }

    li.appendChild(actionsDiv);
    tasksList.appendChild(li);

    // Animate add
    setTimeout(() => li.classList.remove('added'), 500);
  });
}

// Bulk actions

selectAllTasksCheckbox.addEventListener('change', () => {
  if (selectAllTasksCheckbox.checked) {
    filteredTasks.forEach(t => {
      const idx = tasks.indexOf(t);
      selectedTaskIndices.add(idx);
    });
  } else {
    filteredTasks.forEach(t => {
      const idx = tasks.indexOf(t);
      selectedTaskIndices.delete(idx);
    });
  }
  renderTasks();
  updateBulkActions();
});

bulkCompleteBtn.addEventListener('click', () => {
  selectedTaskIndices.forEach(idx => {
    if (tasks[idx]) tasks[idx].completed = true;
  });
  saveTasks();
  clearBulkSelection();
  applyFiltersAndRender();
});

bulkDeleteBtn.addEventListener('click', () => {
  if (!confirm(`Delete ${selectedTaskIndices.size} selected task(s)?`)) return;
  const indicesToDelete = Array.from(selectedTaskIndices).sort((a, b) => b - a);
  indicesToDelete.forEach(idx => {
    if (tasks[idx]) tasks.splice(idx, 1);
  });
  saveTasks();
  clearBulkSelection();
  applyFiltersAndRender();
});

// Progress Bar

function updateProgressBar() {
  if (tasks.length === 0) {
    progressBar.style.width = '0%';
    progressText.textContent = 'No tasks';
    return;
  }
  const completedCount = tasks.filter(t => t.completed).length;
  const percent = Math.round((completedCount / tasks.length) * 100);
  progressBar.style.width = percent + '%';
  progressText.textContent = `${percent}% completed (${completedCount} of ${tasks.length})`;
}

// Edit Task Modal Logic

function openEditModal(globalIdx) {
  editTaskIdx = globalIdx;
  const task = tasks[editTaskIdx];
  if (!task) return;

  // Fill form fields
  editTaskInput.value = task.text;
  editPrioritySelect.value = task.priority;
  editCategoryInput.value = task.category || '';
  editDueDate.value = task.dueDate || '';
  editRecurrenceSelect.value = task.recurrence || 'none';
  editNotesTextarea.value = task.notes || '';

  renderSubtasks(task.subtasks || []);
  editModal.style.display = 'block';
  setTimeout(() => editTaskInput.focus(), 150);
}

function renderSubtasks(subtasks) {
  subtasksList.innerHTML = '';
  if (!subtasks || subtasks.length === 0) {
    subtasksList.innerHTML = '<li style="color:#aaa; font-style:italic;">No subtasks</li>';
    return;
  }
  subtasks.forEach((st, idx) => {
    const li = document.createElement('li');
    li.className = 'subtask-item' + (st.completed ? ' completed' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = st.completed;
    checkbox.title = 'Mark subtask as completed';
    checkbox.addEventListener('change', () => {
      subtasks[idx].completed = checkbox.checked;
      saveSubtasks();
      renderSubtasks(subtasks);
      saveTasks(); // Save main tasks as well
      applyFiltersAndRender();
    });

    const label = document.createElement('label');
    label.textContent = st.text;

    const delBtn = document.createElement('button');
    delBtn.title = 'Delete subtask';
    delBtn.innerHTML = '🗑️';
    delBtn.className = 'subtask-del-btn';
    delBtn.addEventListener('click', () => {
      if (confirm('Delete this subtask?')) {
        subtasks.splice(idx, 1);
        saveSubtasks();
        renderSubtasks(subtasks);
        saveTasks();
        applyFiltersAndRender();
      }
    });

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(delBtn);
    subtasksList.appendChild(li);
  });
}

function saveSubtasks() {
  if (editTaskIdx === null) return;
  tasks[editTaskIdx].subtasks = tasks[editTaskIdx].subtasks || [];
  // Tasks subtasks are updated live on checkbox change.
}

addSubtaskBtn.addEventListener('click', () => {
  const text = newSubtaskInput.value.trim();
  if (!text) return;
  if (editTaskIdx === null) return;
  tasks[editTaskIdx].subtasks = tasks[editTaskIdx].subtasks || [];
  tasks[editTaskIdx].subtasks.push({ text, completed: false });
  newSubtaskInput.value = '';
  saveTasks();
  renderSubtasks(tasks[editTaskIdx].subtasks);
  applyFiltersAndRender();
});

// Modal close handlers

closeModalBtn.addEventListener('click', () => {
  editModal.style.display = 'none';
  editTaskIdx = null;
});

window.addEventListener('click', e => {
  if (e.target === editModal) {
    editModal.style.display = 'none';
    editTaskIdx = null;
  }
  if (e.target === profileModal) {
    profileModal.style.display = 'none';
  }
});

// Save edited task

editForm.addEventListener('submit', e => {
  e.preventDefault();
  if (editTaskIdx === null) return;

  const text = editTaskInput.value.trim();
  let category = editCategoryInput.value.trim();
  if (category) category = category.charAt(0).toUpperCase() + category.slice(1);
  else category = null;
  if (!text) {
    alert("Task cannot be empty.");
    return;
  }
  tasks[editTaskIdx].text = text;
  tasks[editTaskIdx].priority = editPrioritySelect.value;
  tasks[editTaskIdx].category = category;
  tasks[editTaskIdx].dueDate = editDueDate.value || null;
  tasks[editTaskIdx].recurrence = editRecurrenceSelect.value || 'none';
  tasks[editTaskIdx].notes = editNotesTextarea.value.trim();

  saveTasks();
  editModal.style.display = 'none';
  editTaskIdx = null;
  renderFilters();
  applyFiltersAndRender();
});

// Theme Toggle

const themeCheckbox = document.getElementById('checkbox');

function applyThemePreference() {
  const themePref = localStorage.getItem('theme') || 'light';
  if (themePref === 'dark') {
    document.body.classList.add('dark-mode');
    themeCheckbox.checked = true;
  } else {
    document.body.classList.remove('dark-mode');
    themeCheckbox.checked = false;
  }
}

function toggleTheme(e) {
  if (e.target.checked) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  }
}

themeCheckbox.addEventListener('change', toggleTheme);

function resetTheme() {
  localStorage.removeItem('theme');
  document.body.classList.remove('dark-mode');
  themeCheckbox.checked = false;
}

// Notify for due tasks (for today or overdue)

function notifyDueTasks() {
  const now = new Date();
  if (!("Notification" in window)) return;

  // Request permission
  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }
  if (Notification.permission !== "granted") return;

  const tasksDueToday = tasks.filter(t => {
    if (!t.dueDate || t.completed) return false;
    const due = new Date(t.dueDate);
    return due.toDateString() === now.toDateString() || due < now;
  });
  if (tasksDueToday.length > 0) {
    new Notification("Tasks Due Today", {
      body: `You have ${tasksDueToday.length} task(s) due today or overdue. Don't forget to check them!`,
      icon: "" // Add icon URL if available
    });
  }
}

// On load: initialize

window.onload = () => {
  currentUserEmail = sessionStorage.getItem('currentUserEmail');
  if (currentUserEmail) {
    profileData = getUserProfile(currentUserEmail);
    tasks = getUserTasks(currentUserEmail);
    showAppView();
    renderFilters();
    applyFiltersAndRender();
    notifyDueTasks();
  } else {
    showAuthView();
  }
};

const themeToggle = document.getElementById('checkbox');
const themeLink = document.getElementById('theme-link');

function setTheme(mode) {
  themeLink.href = mode === 'dark' ? 'dark.css' : 'light.css';
  localStorage.setItem('theme', mode);
  themeToggle.checked = mode === 'dark';
}

themeToggle.addEventListener('change', (e) => {
  setTheme(e.target.checked ? 'dark' : 'light');
});

// On load, apply the saved theme or light by default
window.onload = () => {
  const saved = localStorage.getItem('theme') || 'light';
  setTheme(saved);
};
