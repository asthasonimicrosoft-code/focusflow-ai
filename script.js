
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priority");
const taskList = document.getElementById("taskList");

let tasks = [];

try {
  const saved = JSON.parse(localStorage.getItem("focusflowTasks") || "[]");
  if (Array.isArray(saved)) {
    tasks = saved.filter(t =>
      t && typeof t.name === "string" &&
      typeof t.done === "boolean" &&
      ["High", "Medium", "Low"].includes(t.priority)
    );
  }
} catch {
  tasks = [];
}

document.getElementById("today").textContent =
  new Date().toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric",
    month: "short", year: "numeric"
  });

function saveTasks() {
  localStorage.setItem("focusflowTasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const row = document.createElement("div");
    row.className = "task" + (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", "Complete " + task.name);

    checkbox.addEventListener("change", () => {
      tasks[index].done = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const info = document.createElement("div");
    info.className = "task-info";

    const name = document.createElement("div");
    name.className = "task-name";
    name.textContent = task.name;

    const priority = document.createElement("span");
    priority.className = "priority";
    priority.textContent = task.priority + " priority";

    info.append(name, priority);

    const remove = document.createElement("button");
    remove.className = "delete-btn";
    remove.textContent = "✕";
    remove.setAttribute("aria-label", "Delete " + task.name);

    remove.addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    row.append(checkbox, info, remove);
    taskList.appendChild(row);
  });

  const total = tasks.length;
  const completed = tasks.filter(task => task.done).length;
  const percent = total ? Math.round(completed / total * 100) : 0;

  document.getElementById("total").textContent = total;
  document.getElementById("completed").textContent = completed;
  document.getElementById("percentage").textContent = percent + "%";
  document.getElementById("progressBar").style.width = percent + "%";
  document.getElementById("empty").hidden = total > 0;
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const name = taskInput.value.trim();
  if (!name) return;

  tasks.push({
    name,
    priority: priorityInput.value,
    done: false
  });

  saveTasks();
  renderTasks();
  taskInput.value = "";
  taskInput.focus();
});

// Pomodoro timer
const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const FOCUS_SECONDS = 25 * 60;
let remaining = FOCUS_SECONDS;
let endTime = null;
let interval = null;

function displayTime() {
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  timerDisplay.textContent =
    String(mins).padStart(2, "0") + ":" +
    String(secs).padStart(2, "0");
}

function stopTimer() {
  clearInterval(interval);
  interval = null;
  endTime = null;
  startBtn.textContent = "▶ Start";
}

function tick() {
  remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
  displayTime();

  if (remaining <= 0) {
    stopTimer();
    startBtn.textContent = "✓ Finished";
    alert("Great work! Your focus session is complete.");
  }
}

startBtn.addEventListener("click", () => {
  if (interval) {
    stopTimer();
    return;
  }

  if (remaining <= 0) remaining = FOCUS_SECONDS;

  endTime = Date.now() + remaining * 1000;
  startBtn.textContent = "Ⅱ Pause";
  interval = setInterval(tick, 250);
  tick();
});

resetBtn.addEventListener("click", () => {
  stopTimer();
  remaining = FOCUS_SECONDS;
  displayTime();
});

renderTasks();
displayTime();
