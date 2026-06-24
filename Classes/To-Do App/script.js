// ---------- State ----------
  var tasks = [];               // array of {id, text, completed, priority, dueDate}
  var currentFilter = 'all';    // 'all' | 'completed' | 'pending'
  var currentSearch = '';

  // ---------- DOM References ----------
  var taskInput = document.getElementById('taskInput');
  var priorityInput = document.getElementById('priorityInput');
  var dueDateInput = document.getElementById('dueDateInput');
  var addBtn = document.getElementById('addBtn');
  var errorMsg = document.getElementById('errorMsg');
  var searchInput = document.getElementById('searchInput');
  var taskList = document.getElementById('taskList');
  var clearAllBtn = document.getElementById('clearAllBtn');
  var filterButtons = document.querySelectorAll('.filter-btn');

  var totalCountEl = document.getElementById('totalCount');
  var completedCountEl = document.getElementById('completedCount');
  var pendingCountEl = document.getElementById('pendingCount');

  // ---------- Local Storage ----------
  function saveTasks() {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
  }

  function loadTasks() {
    var stored = localStorage.getItem('todoTasks');
    if (stored) {
      tasks = JSON.parse(stored);
    } else {
      tasks = [];
    }
  }

  // ---------- Error Message ----------
  function showError(message) {
    errorMsg.textContent = message;
    setTimeout(function () {
      errorMsg.textContent = '';
    }, 2000);
  }

  // ---------- Add Task ----------
  function addTask() {
    var taskText = taskInput.value.trim();

    if (taskText === '') {
      showError('Please enter a task before adding.');
      return;
    }

    var newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
      priority: priorityInput.value,
      dueDate: dueDateInput.value || ''
    };

    tasks.push(newTask);
    saveTasks();

    taskInput.value = '';
    dueDateInput.value = '';
    taskInput.focus();

    renderTasks();
  }

  // ---------- Delete Task ----------
  function deleteTask(id) {
    var newTasks = [];
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id !== id) {
        newTasks.push(tasks[i]);
      }
    }
    tasks = newTasks;
    saveTasks();
    renderTasks();
  }

  // ---------- Complete Task (toggle) ----------
  function toggleCompleteTask(id) {
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id === id) {
        if (tasks[i].completed) {
          tasks[i].completed = false;
        } else {
          tasks[i].completed = true;
        }
        break;
      }
    }
    saveTasks();
    renderTasks();
  }

  // ---------- Clear All ----------
  function clearAllTasks() {
    if (tasks.length === 0) {
      showError('There are no tasks to clear.');
      return;
    }
    var confirmed = window.confirm('Are you sure you want to delete all tasks?');
    if (confirmed) {
      tasks = [];
      saveTasks();
      renderTasks();
    }
  }

  // ---------- Search ----------
  function matchesSearch(task) {
    if (currentSearch === '') {
      return true;
    }
    var taskTextLower = task.text.toLowerCase();
    var searchLower = currentSearch.toLowerCase();
    if (taskTextLower.indexOf(searchLower) !== -1) {
      return true;
    } else {
      return false;
    }
  }

  function handleSearch() {
    currentSearch = searchInput.value.trim();
    renderTasks();
  }

  // ---------- Filter ----------
  function matchesFilter(task) {
    if (currentFilter === 'all') {
      return true;
    } else if (currentFilter === 'completed') {
      return task.completed === true;
    } else if (currentFilter === 'pending') {
      return task.completed === false;
    }
    return true;
  }

  function setFilter(filterName) {
    currentFilter = filterName;

    for (var i = 0; i < filterButtons.length; i++) {
      if (filterButtons[i].getAttribute('data-filter') === filterName) {
        filterButtons[i].classList.add('active');
      } else {
        filterButtons[i].classList.remove('active');
      }
    }
    renderTasks();
  }

  // ---------- Due Date Helper ----------
  function isOverdue(task) {
    if (!task.dueDate) {
      return false;
    }
    if (task.completed) {
      return false;
    }
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var due = new Date(task.dueDate);
    if (due < today) {
      return true;
    } else {
      return false;
    }
  }

  // ---------- Update Counters ----------
  function updateCounters() {
    var totalTasks = tasks.length;
    var completedTasks = 0;

    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].completed) {
        completedTasks = completedTasks + 1;
      }
    }

    var pendingTasks = totalTasks - completedTasks;

    totalCountEl.textContent = totalTasks;
    completedCountEl.textContent = completedTasks;
    pendingCountEl.textContent = pendingTasks;
  }

  // ---------- Create Task Element ----------
  function createTaskElement(task) {
    var li = document.createElement('li');
    li.className = 'task-item priority-' + task.priority;

    if (task.completed) {
      li.classList.add('completed');
    }

    // Hide if it doesn't match filter or search
    if (!matchesFilter(task) || !matchesSearch(task)) {
      li.classList.add('hidden');
    }

    var taskMain = document.createElement('div');
    taskMain.className = 'task-main';

    var taskTextSpan = document.createElement('span');
    taskTextSpan.className = 'task-text';
    taskTextSpan.textContent = task.text;

    var metaDiv = document.createElement('div');
    metaDiv.className = 'task-meta';

    var priorityTag = document.createElement('span');
    priorityTag.className = 'priority-tag ' + task.priority;
    priorityTag.textContent = task.priority + ' priority';
    metaDiv.appendChild(priorityTag);

    if (task.dueDate) {
      var dueSpan = document.createElement('span');
      dueSpan.textContent = ' | Due: ' + task.dueDate;
      if (isOverdue(task)) {
        dueSpan.classList.add('overdue');
        dueSpan.textContent += ' (Overdue)';
      }
      metaDiv.appendChild(dueSpan);
    }

    taskMain.appendChild(taskTextSpan);
    taskMain.appendChild(metaDiv);

    var btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';

    var completeBtn = document.createElement('button');
    completeBtn.className = 'complete-btn';
    if (task.completed) {
      completeBtn.textContent = 'Undo';
    } else {
      completeBtn.textContent = 'Complete';
    }
    completeBtn.addEventListener('click', function () {
      toggleCompleteTask(task.id);
    });

    var deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', function () {
      deleteTask(task.id);
    });

    btnGroup.appendChild(completeBtn);
    btnGroup.appendChild(deleteBtn);

    li.appendChild(taskMain);
    li.appendChild(btnGroup);

    return li;
  }

  // ---------- Render All Tasks ----------
  function renderTasks() {
    taskList.innerHTML = '';

    if (tasks.length === 0) {
      var emptyMsg = document.createElement('div');
      emptyMsg.className = 'empty-msg';
      emptyMsg.textContent = 'No tasks yet. Add one above!';
      taskList.appendChild(emptyMsg);
      updateCounters();
      return;
    }

    var visibleCount = 0;

    for (var i = 0; i < tasks.length; i++) {
      var taskElement = createTaskElement(tasks[i]);
      taskList.appendChild(taskElement);
      if (!taskElement.classList.contains('hidden')) {
        visibleCount = visibleCount + 1;
      }
    }

    if (visibleCount === 0) {
      var noMatchMsg = document.createElement('div');
      noMatchMsg.className = 'empty-msg';
      noMatchMsg.textContent = 'No tasks match your search/filter.';
      taskList.appendChild(noMatchMsg);
    }

    updateCounters();
  }

  // ---------- Event Listeners ----------
  addBtn.addEventListener('click', addTask);

  taskInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      addTask();
    }
  });

  searchInput.addEventListener('input', handleSearch);

  clearAllBtn.addEventListener('click', clearAllTasks);

  for (var i = 0; i < filterButtons.length; i++) {
    filterButtons[i].addEventListener('click', function () {
      var filterName = this.getAttribute('data-filter');
      setFilter(filterName);
    });
  }

  // ---------- Init ----------
  loadTasks();
  renderTasks();