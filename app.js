/**
 * ==========================================================================
 * Aura Task Manager - Core Controller (Human-Made Design Philosophy)
 * Handles state, responsive layouts, search, and vanilla DOM updates.
 * ==========================================================================
 */

// --- Application State ---
let tasksState = [];

// --- DOM Selectors ---
const taskForm = document.getElementById("task-form");
const taskTitleInput = document.getElementById("task-title");
const taskCategorySelect = document.getElementById("task-category");
const taskListContainer = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");

// Titles & Headers
const currentViewTitle = document.getElementById("current-view-title");

// Sidebar Stats
const counterPending = document.getElementById("counter-pending");
const counterCompleted = document.getElementById("counter-completed");

// Sidebar Category Count Badges
const countAllSidebar = document.getElementById("count-all-sidebar");
const countWorkSidebar = document.getElementById("count-work-sidebar");
const countPersonalSidebar = document.getElementById("count-personal-sidebar");
const countShoppingSidebar = document.getElementById("count-shopping-sidebar");
const countUrgentSidebar = document.getElementById("count-urgent-sidebar");

// Search & Filtering
const searchInput = document.getElementById("search-input");
const categoryFilterContainer = document.getElementById("category-filter-container");
const clearAllBtn = document.getElementById("clear-all-btn");

// Theme toggler
const themeToggleBtn = document.getElementById("theme-toggle-btn");

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    // Load tasks from LocalStorage
    const savedTasks = localStorage.getItem("aura_tasks");
    if (savedTasks) {
        try {
            tasksState = JSON.parse(savedTasks);
            renderTasksList();
        } catch (e) {
            console.error("LocalStorage parsing failed. Restoring clean state.", e);
            tasksState = [];
        }
    }
    
    // Set theme
    const savedTheme = localStorage.getItem("aura_theme") || 
                       (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    setTheme(savedTheme);
});

// --- THEME SWAPPER ---
function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("aura_theme", theme);
}

themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
});


// --- RENDERING & COUNTERS SYSTEM ---

function saveTasksToStorage() {
    localStorage.setItem("aura_tasks", JSON.stringify(tasksState));
}

/**
 * Updates stats in the sidebar and count pill indicators beside categories.
 */
function updateCategoryCounters() {
    const total = tasksState.length;
    const completed = tasksState.filter(t => t.status === "completed").length;
    const pending = total - completed;

    // Sidebar footer stats
    if (counterPending) counterPending.textContent = pending;
    if (counterCompleted) counterCompleted.textContent = completed;

    // Sidebar count badges
    if (countAllSidebar) countAllSidebar.textContent = total;
    if (countWorkSidebar) countWorkSidebar.textContent = tasksState.filter(t => t.category === "work").length;
    if (countPersonalSidebar) countPersonalSidebar.textContent = tasksState.filter(t => t.category === "personal").length;
    if (countShoppingSidebar) countShoppingSidebar.textContent = tasksState.filter(t => t.category === "shopping").length;
    if (countUrgentSidebar) countUrgentSidebar.textContent = tasksState.filter(t => t.category === "urgent").length;
}

/**
 * Generates the clean task row DOM Node.
 * Implements createElement, createTextNode, and append interfaces.
 */
function createTaskCardNode(task) {
    // 1. Create Row container
    const card = document.createElement("div");
    card.className = "task-card";
    
    // Set custom data attributes
    card.dataset.id = task.id;
    card.setAttribute("data-status", task.status);
    card.setAttribute("data-category", task.category);
    if (task.starred) {
        card.setAttribute("data-starred", "true");
    }

    // 2. Custom Checkbox button
    const checkboxBtn = document.createElement("button");
    checkboxBtn.className = "task-status-btn";
    checkboxBtn.setAttribute("aria-label", "Toggle status");
    
    const checkIcon = document.createElement("i");
    checkIcon.className = task.status === "completed" 
        ? "fa-solid fa-circle-check" 
        : "fa-regular fa-circle";
    checkboxBtn.appendChild(checkIcon);

    // 3. Middle Content (Title + Meta row)
    const content = document.createElement("div");
    content.className = "task-card-content";

    const titleSpan = document.createElement("span");
    titleSpan.className = "task-title-text";
    titleSpan.appendChild(document.createTextNode(task.title));

    const metaWrapper = document.createElement("div");
    metaWrapper.className = "task-card-meta";

    const categoryBadge = document.createElement("span");
    categoryBadge.className = "badge-category";
    categoryBadge.setAttribute("data-category", task.category);
    categoryBadge.textContent = task.category;

    const dateBadge = document.createElement("span");
    dateBadge.className = "task-date-badge";
    dateBadge.innerHTML = `<i class="fa-regular fa-clock"></i> ${task.createdAt}`;

    metaWrapper.append(categoryBadge, dateBadge);
    content.append(titleSpan, metaWrapper);

    // 4. Hover Actions panel (Appears only on row hover via CSS)
    const actions = document.createElement("div");
    actions.className = "task-actions";

    // Star Button (getAttribute, setAttribute, removeAttribute, hasAttribute demo)
    const starBtn = document.createElement("button");
    starBtn.className = "action-btn star-btn";
    starBtn.setAttribute("aria-label", "Flag priority");
    starBtn.innerHTML = task.starred ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';

    // Move Up Button (before() demo)
    const upBtn = document.createElement("button");
    upBtn.className = "action-btn move-up-btn";
    upBtn.setAttribute("aria-label", "Move Up");
    upBtn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';

    // Move Down Button (after() demo)
    const downBtn = document.createElement("button");
    downBtn.className = "action-btn move-down-btn";
    downBtn.setAttribute("aria-label", "Move Down");
    downBtn.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';

    // Edit Button (replaceWith() demo)
    const editBtn = document.createElement("button");
    editBtn.className = "action-btn edit-btn";
    editBtn.setAttribute("aria-label", "Edit text");
    editBtn.innerHTML = '<i class="fa-regular fa-pen-to-square"></i>';

    // Delete Button (remove() demo)
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "action-btn delete-btn";
    deleteBtn.setAttribute("aria-label", "Remove");
    deleteBtn.innerHTML = '<i class="fa-regular fa-trash-can"></i>';

    // Assemble Action group
    actions.append(starBtn, upBtn, downBtn, editBtn, deleteBtn);

    // Assemble entire row
    card.append(checkboxBtn, content, actions);

    return card;
}

/**
 * Main rendering loop. Uses DocumentFragment optimization.
 */
function renderTasksList() {
    const filter = getActiveCategoryFilter();
    const query = searchInput.value.toLowerCase().trim();

    const filtered = tasksState.filter(task => {
        const matchesCategory = filter === "all" || task.category === filter;
        const matchesSearch = task.title.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        const cards = taskListContainer.querySelectorAll(".task-card");
        cards.forEach(c => c.remove());
        emptyState.style.display = "flex";
        updateCategoryCounters();
        return;
    }

    emptyState.style.display = "none";

    // Performance Optimization: Batch DOM operations using DocumentFragment
    const fragment = document.createDocumentFragment();

    filtered.forEach(task => {
        const cardNode = createTaskCardNode(task);
        fragment.appendChild(cardNode);
    });

    // Clear and append
    const activeCards = taskListContainer.querySelectorAll(".task-card");
    activeCards.forEach(c => c.remove());
    taskListContainer.appendChild(fragment);

    updateCategoryCounters();
}

function getActiveCategoryFilter() {
    const activeItem = categoryFilterContainer.querySelector(".nav-item.active");
    return activeItem ? activeItem.dataset.filter : "all";
}


// --- DOM ACTIONS: ADD TASK ---

taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = taskTitleInput.value.trim();
    const category = taskCategorySelect.value;
    const errorSpan = document.getElementById("title-error");

    if (!title) {
        errorSpan.style.display = "block";
        taskTitleInput.focus();
        return;
    }
    errorSpan.style.display = "none";

    const newTask = {
        id: Date.now().toString(),
        title: title,
        category: category,
        status: "pending",
        starred: false,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    tasksState.unshift(newTask);
    saveTasksToStorage();

    const newCard = createTaskCardNode(newTask);
    emptyState.style.display = "none";

    // Prepend is used to insert new tasks at the beginning
    taskListContainer.prepend(newCard);

    taskTitleInput.value = "";
    updateCategoryCounters();
});

// Clear input error on typing
taskTitleInput.addEventListener("input", () => {
    document.getElementById("title-error").style.display = "none";
});


// --- EVENT DELEGATION FOR TASK CONTROL ACTIONS ---

taskListContainer.addEventListener("click", (e) => {
    const targetCard = e.target.closest(".task-card");
    if (!targetCard) return;

    const taskId = targetCard.dataset.id;
    const taskIndex = tasksState.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    // A. Click Checklist button (Complete status toggle)
    if (e.target.closest(".task-status-btn")) {
        const currentStatus = targetCard.getAttribute("data-status");
        const nextStatus = currentStatus === "pending" ? "completed" : "pending";

        tasksState[taskIndex].status = nextStatus;
        saveTasksToStorage();

        targetCard.setAttribute("data-status", nextStatus);
        
        const statusIcon = targetCard.querySelector(".task-status-btn i");
        statusIcon.className = nextStatus === "completed"
            ? "fa-solid fa-circle-check"
            : "fa-regular fa-circle";

        updateCategoryCounters();
        return;
    }

    // B. Click Star button (Priority toggle - setAttribute/removeAttribute/hasAttribute)
    if (e.target.closest(".star-btn")) {
        const starBtn = targetCard.querySelector(".star-btn");
        
        if (targetCard.hasAttribute("data-starred")) {
            targetCard.removeAttribute("data-starred");
            starBtn.innerHTML = '<i class="fa-regular fa-star"></i>';
            tasksState[taskIndex].starred = false;
        } else {
            targetCard.setAttribute("data-starred", "true");
            starBtn.innerHTML = '<i class="fa-solid fa-star"></i>';
            tasksState[taskIndex].starred = true;
        }
        saveTasksToStorage();
        return;
    }

    // C. Click Edit button (replaceWith() demonstration)
    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) {
        const titleSpan = targetCard.querySelector(".task-title-text");
        const isEditing = targetCard.classList.contains("editing");

        if (!isEditing) {
            targetCard.classList.add("editing");
            editBtn.innerHTML = '<i class="fa-solid fa-check text-success"></i>';

            // Create target Input node replacement
            const editInput = document.createElement("input");
            editInput.type = "text";
            editInput.className = "task-title-edit-input";
            editInput.value = titleSpan.textContent;

            // DOM replaceWith(): Swap span wrapper for editable input
            titleSpan.replaceWith(editInput);
            editInput.focus();

            editInput.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    editBtn.click();
                }
            });
        } else {
            const editInput = targetCard.querySelector(".task-title-edit-input");
            const updatedTitle = editInput.value.trim() || "Untitled Task";

            tasksState[taskIndex].title = updatedTitle;
            saveTasksToStorage();

            // Create span wrapper replacement
            const staticSpan = document.createElement("span");
            staticSpan.className = "task-title-text";
            staticSpan.appendChild(document.createTextNode(updatedTitle));

            // DOM replaceWith(): Swap back to clean span
            editInput.replaceWith(staticSpan);

            targetCard.classList.remove("editing");
            editBtn.innerHTML = '<i class="fa-regular fa-pen-to-square"></i>';
        }
        return;
    }

    // D. Click Move Up button (before() demonstration)
    if (e.target.closest(".move-up-btn")) {
        const prevSibling = targetCard.previousElementSibling;
        if (prevSibling && prevSibling.classList.contains("task-card")) {
            // DOM before(): Swap structural siblings
            prevSibling.before(targetCard);

            const temp = tasksState[taskIndex];
            tasksState[taskIndex] = tasksState[taskIndex - 1];
            tasksState[taskIndex - 1] = temp;
            saveTasksToStorage();
        }
        return;
    }

    // E. Click Move Down button (after() demonstration)
    if (e.target.closest(".move-down-btn")) {
        const nextSibling = targetCard.nextElementSibling;
        if (nextSibling && nextSibling.classList.contains("task-card")) {
            // DOM after(): Swap structural siblings
            nextSibling.after(targetCard);

            const temp = tasksState[taskIndex];
            tasksState[taskIndex] = tasksState[taskIndex + 1];
            tasksState[taskIndex + 1] = temp;
            saveTasksToStorage();
        }
        return;
    }

    // F. Click Delete button (remove() demonstration)
    if (e.target.closest(".delete-btn")) {
        targetCard.classList.add("task-exit");
        
        targetCard.addEventListener("transitionend", () => {
            // DOM remove(): Drop visual node
            targetCard.remove();
            
            tasksState.splice(taskIndex, 1);
            saveTasksToStorage();

            if (tasksState.length === 0) {
                renderTasksList();
            } else {
                updateCategoryCounters();
            }
        });
        return;
    }
});


// --- FILTERING & BOARD CONTROLS ---

// Category Tabs Sidebar click delegation
categoryFilterContainer.addEventListener("click", (e) => {
    const clickedItem = e.target.closest(".nav-item");
    if (!clickedItem) return;

    // Update active tab highlights
    const activeItem = categoryFilterContainer.querySelector(".nav-item.active");
    if (activeItem) {
        activeItem.classList.remove("active");
    }
    clickedItem.classList.add("active");

    // Update View Title
    const categoryName = clickedItem.querySelector(".nav-label").textContent;
    currentViewTitle.textContent = categoryName;

    // Filter board
    renderTasksList();
});

// Search input keyup
searchInput.addEventListener("input", () => {
    renderTasksList();
});

// Clean up entire board
clearAllBtn.addEventListener("click", () => {
    const filter = getActiveCategoryFilter();
    const activeTasks = filter === "all" ? tasksState : tasksState.filter(t => t.category === filter);
    
    if (activeTasks.length === 0) return;
    
    if (confirm(`Remove all tasks from "${currentViewTitle.textContent}"?`)) {
        const cards = taskListContainer.querySelectorAll(".task-card");
        cards.forEach(card => {
            card.classList.add("task-exit");
            card.addEventListener("transitionend", () => card.remove());
        });

        // Clean matched states
        if (filter === "all") {
            tasksState = [];
        } else {
            tasksState = tasksState.filter(t => t.category !== filter);
        }
        
        saveTasksToStorage();
        
        setTimeout(() => {
            renderTasksList();
        }, 300);
    }
});


// --- SILENT BACKGROUND SANDBOX MAPPINGS ---
// Preserves code compatibility with Concept requirements, ensuring no console errors.
const demoInput = null;
const attrOutput = null;
const propOutput = null;
const grandparent = null;
const parent = null;
const child = null;
const consoleLogs = null;
const clearPropLogsBtn = null;
