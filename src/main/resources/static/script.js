console.log("SCRIPT LOADED");

const API_URL = "/api/tasks";
let currentPage = 0;
let pageSize = 5;
let totalPages = 0;
let currentSearch = "";
let editingTaskId = null;
let currentSort = "";

/* ===========================
   FETCH TASKS
=========================== */
async function fetchTasks(page = 0) {

    currentPage = page;

    let url = `${API_URL}?page=${page}&size=${pageSize}`;

    if (currentSearch) {
        url += `&search=${currentSearch}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    totalPages = data.totalPages;

    let tasks = data.content;

    if (currentSort) {
        tasks = sortTasks(tasks);
    }

    displayTasks(tasks);
    updatePagination();
    updateDashboard(data);   // ✅ FIXED
}

/* ===========================
   DASHBOARD UPDATE (FIXED)
=========================== */
function updateDashboard(data) {

    // Total tasks in database (from backend)
    document.getElementById("totalCount").innerText =
        data.totalElements;

    const tasks = data.content;

    const pending =
        tasks.filter(t => t.status === "PENDING").length;

    const progress =
        tasks.filter(t => t.status === "IN_PROGRESS").length;

    const completed =
        tasks.filter(t => t.status === "COMPLETED").length;

    document.getElementById("pendingCount").innerText = pending;
    document.getElementById("progressCount").innerText = progress;
    document.getElementById("completedCount").innerText = completed;
}

/* ===========================
   SORTING
=========================== */
function applySorting() {
    currentSort = document.getElementById("sortSelect").value;
    fetchTasks(currentPage);
}

function sortTasks(tasks) {

    return tasks.sort((a, b) => {

        if (currentSort === "title")
            return a.title.localeCompare(b.title);

        if (currentSort === "priority") {
            const order = { HIGH: 1, MEDIUM: 2, LOW: 3 };
            return order[a.priority] - order[b.priority];
        }

        if (currentSort === "status") {
            const order = { PENDING: 1, IN_PROGRESS: 2, COMPLETED: 3 };
            return order[a.status] - order[b.status];
        }

        if (currentSort === "dueDate")
            return new Date(a.dueDate) - new Date(b.dueDate);

        return 0;
    });
}

/* ===========================
   DISPLAY TASKS
=========================== */
function displayTasks(tasks) {

    const container = document.getElementById("taskContainer");
    container.innerHTML = "";

    if (!tasks || tasks.length === 0) {
        container.innerHTML = "<p>No tasks found.</p>";
        return;
    }

    tasks.forEach(task => {

        const dueClass = getDueDateClass(task.dueDate);

        const div = document.createElement("div");
        div.className = `task border-${task.status} ${dueClass}`;

        div.innerHTML = `
            <div class="task-layout">
                
                <div class="task-left">
                    <h3>${task.title}</h3>
                    <p>${task.description || ""}</p>
                    <small>Due: ${formatDate(task.dueDate)}</small>
                </div>

                <div class="task-right">

                    <div class="badges">
                        <span class="badge status-${task.status}">
                            ${task.status}
                        </span>
                        <span class="badge priority-${task.priority}">
                            ${task.priority}
                        </span>
                    </div>

                    <div class="actions">
                        <button onclick="editTask(${task.id})">Edit</button>
                        <button onclick="toggleStatus(${task.id}, '${task.status}')">Toggle</button>
                        <button onclick="deleteTask(${task.id})">Delete</button>
                    </div>

                </div>
            </div>
        `;

        container.appendChild(div);
    });
}

/* ===========================
   DUE DATE LOGIC
=========================== */
function getDueDateClass(dueDate) {

    if (!dueDate) return "";

    const today = new Date();
    const due = new Date(dueDate);

    today.setHours(0,0,0,0);
    due.setHours(0,0,0,0);

    if (due < today) return "overdue";
    if (due.getTime() === today.getTime()) return "due-today";

    return "";
}

function formatDate(date) {
    if (!date) return "No due date";
    return new Date(date).toLocaleString();
}

/* ===========================
   CREATE / UPDATE
=========================== */
async function createTask() {

    const task = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        status: document.getElementById("status").value,
        priority: document.getElementById("priority").value,
        dueDate: document.getElementById("dueDate").value
    };

    await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(task)
    });

    fetchTasks();
}
/* ===========================
   EDIT
=========================== */
async function editTask(id) {

    const response = await fetch(`${API_URL}/${id}`);
    const task = await response.json();

    document.getElementById("title").value = task.title;
    document.getElementById("description").value = task.description;
    document.getElementById("status").value = task.status;
    document.getElementById("priority").value = task.priority;
    document.getElementById("dueDate").value =
        task.dueDate ? task.dueDate.slice(0,16) : "";

    editingTaskId = id;
    document.querySelector(".form-card button").innerText = "Update Task";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ===========================
   DELETE
=========================== */
async function deleteTask(id) {
    if (!confirm("Delete this task?")) return;
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchTasks(currentPage);
}

/* ===========================
   TOGGLE STATUS
=========================== */
async function toggleStatus(id, currentStatus) {

    const newStatus =
        currentStatus === "PENDING" ? "IN_PROGRESS" :
        currentStatus === "IN_PROGRESS" ? "COMPLETED" :
        "PENDING";

    const response = await fetch(`${API_URL}/${id}`);
    const task = await response.json();

    task.status = newStatus;

    await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
    });

    fetchTasks(currentPage);
}

/* ===========================
   PAGINATION
=========================== */
function nextPage() {
    if (currentPage < totalPages - 1)
        fetchTasks(currentPage + 1);
}

function previousPage() {
    if (currentPage > 0)
        fetchTasks(currentPage - 1);
}

function updatePagination() {
    document.getElementById("pageInfo").innerText =
        `Page ${currentPage + 1} of ${totalPages}`;
}

/* ===========================
   CLEAR
=========================== */
function clearForm() {
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("status").value = "PENDING";
    document.getElementById("priority").value = "LOW";
    document.getElementById("dueDate").value = "";
}

/* ===========================
   INITIAL LOAD
=========================== */
fetchTasks();
