// State management
let tasks = [];
let tasksContainer = document.getElementById("tasks-container");
let taskInput = document.getElementById("task-input");
let addButton = document.getElementById("add-btn");
let currentDateElement = document.getElementById("current-date");
let currentFilter = "all";

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
  // Re-assign elements after DOM is loaded
  tasksContainer = document.getElementById("tasks-container");
  taskInput = document.getElementById("task-input");
  addButton = document.getElementById("add-btn");
  currentDateElement = document.getElementById("current-date");

  // Load tasks from localStorage
  loadTasks();

  // Update date initially and set interval
  updateDate();
  setInterval(updateDate, 60000);

  // Event listeners
  addButton.addEventListener("click", addTask);
  taskInput.addEventListener("keypress", handleKeyPress);

  // Add enhanced UI features
  addSortingControls();
  addTaskStats();

  // Render initial tasks
  renderTasks();
});

// Update current date
function updateDate() {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const today = new Date();
  currentDateElement.textContent = today.toLocaleDateString("en-US", options);
}

// Load tasks from localStorage
function loadTasks() {
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Add priority property to existing tasks if they don't have it
  tasks = savedTasks.map((task) => ({
    ...task,
    priority: task.priority || "normal",
  }));
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Add a new task
function addTask() {
  const inputValue = taskInput.value.trim();

  if (inputValue !== "") {
    const newTask = {
      id: Date.now(),
      text: inputValue,
      completed: false,
      priority: "normal",
      createdAt: new Date().toISOString(),
    };

    // Add with animation
    tasks.push(newTask);
    taskInput.value = "";

    saveTasks();
    renderTasks();

    // Focus back on the input
    taskInput.focus();
  }
}

// Delete a task
function deleteTask(id) {
  // Find the task element
  const taskElement = document.querySelector(`.task-item[data-id="${id}"]`);

  // Add removing animation class
  if (taskElement) {
    taskElement.classList.add("removing");

    // Wait for animation to complete before removing
    setTimeout(() => {
      tasks = tasks.filter((task) => task.id !== id);
      saveTasks();
      renderTasks();
    }, 300);
  } else {
    // If element not found, just remove from data
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
    renderTasks();
  }
}

// Toggle task completion status
function toggleCompleted(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

// Cycle through task priorities
function cyclePriority(id) {
  const priorities = ["low", "normal", "high"];

  tasks = tasks.map((task) => {
    if (task.id === id) {
      const currentIndex = priorities.indexOf(task.priority);
      const nextIndex = (currentIndex + 1) % priorities.length;
      return { ...task, priority: priorities[nextIndex] };
    }
    return task;
  });

  saveTasks();
  renderTasks();
}

// Handle Enter key press
function handleKeyPress(e) {
  if (e.key === "Enter") {
    addTask();
  }
}

// Add sorting controls to the UI
function addSortingControls() {
  const sortingControls = document.createElement("div");
  sortingControls.className = "sorting-controls";
  sortingControls.innerHTML = `
        <button id="sort-all" class="sort-btn active">All</button>
        <button id="sort-active" class="sort-btn">Active</button>
        <button id="sort-completed" class="sort-btn">Completed</button>
    `;

  document.querySelector(".app-header").appendChild(sortingControls);

  // Add event listeners for sorting
  document.getElementById("sort-all").addEventListener("click", () => {
    setActiveSortButton("sort-all");
    currentFilter = "all";
    renderTasks();
  });

  document.getElementById("sort-active").addEventListener("click", () => {
    setActiveSortButton("sort-active");
    currentFilter = "active";
    renderTasks();
  });

  document.getElementById("sort-completed").addEventListener("click", () => {
    setActiveSortButton("sort-completed");
    currentFilter = "completed";
    renderTasks();
  });
}

// Set active sort button
function setActiveSortButton(buttonId) {
  document.querySelectorAll(".sort-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.getElementById(buttonId).classList.add("active");
}

// Add task statistics to the UI
function addTaskStats() {
  const statsBar = document.createElement("div");
  statsBar.className = "stats-bar";
  statsBar.innerHTML = `
        <span id="tasks-count">0 tasks</span>
        <button id="clear-completed" class="clear-btn">Clear completed</button>
    `;

  document.querySelector(".app-footer").prepend(statsBar);

  // Add event listener for clear completed button
  document.getElementById("clear-completed").addEventListener("click", () => {
    tasks = tasks.filter((task) => !task.completed);
    saveTasks();
    renderTasks();
  });
}

// Update task statistics
function updateTaskStats() {
  const count = tasks.length;
  const completedCount = tasks.filter((task) => task.completed).length;
  const activeCount = count - completedCount;

  const tasksCountElement = document.getElementById("tasks-count");
  if (tasksCountElement) {
    tasksCountElement.textContent = `${count} tasks · ${completedCount} completed · ${activeCount} active`;
  }
}

// Render tasks to the DOM
function renderTasks() {
  // Clear the tasks container
  tasksContainer.innerHTML = "";

  // Filter tasks based on current filter
  let filteredTasks = tasks;

  if (currentFilter === "active") {
    filteredTasks = tasks.filter((task) => !task.completed);
  } else if (currentFilter === "completed") {
    filteredTasks = tasks.filter((task) => task.completed);
  }

  // Show empty state if no tasks
  if (filteredTasks.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";

    const emptyText = document.createElement("p");

    if (tasks.length === 0) {
      emptyText.textContent = "You have no tasks yet. Add one above!";
    } else {
      emptyText.textContent = `No ${currentFilter} tasks to display.`;
    }

    emptyState.appendChild(emptyText);
    tasksContainer.appendChild(emptyState);
  } else {
    // Render each task
    filteredTasks.forEach((task) => {
      const taskItem = document.createElement("div");
      taskItem.className = `task-item ${task.completed ? "completed" : ""}`;
      taskItem.setAttribute("data-id", task.id);

      // Create priority indicator
      const priorityIndicator = document.createElement("div");
      priorityIndicator.className = `priority-indicator ${task.priority}`;
      priorityIndicator.title = `Priority: ${
        task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
      }`;
      priorityIndicator.addEventListener("click", () => cyclePriority(task.id));

      // Create checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-checkbox";
      checkbox.checked = task.completed;
      checkbox.addEventListener("change", () => toggleCompleted(task.id));

      // Create task text span
      const taskText = document.createElement("span");
      taskText.className = "task-text";
      taskText.textContent = task.text;

      // Create delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "cross-btn";
      deleteBtn.textContent = "×";
      deleteBtn.addEventListener("click", () => deleteTask(task.id));

      // Append all elements to task item
      taskItem.appendChild(priorityIndicator);
      taskItem.appendChild(checkbox);
      taskItem.appendChild(taskText);
      taskItem.appendChild(deleteBtn);

      // Append task item to tasks container
      tasksContainer.appendChild(taskItem);
    });
  }

  // Update task statistics
  updateTaskStats();
}
