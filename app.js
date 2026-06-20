/**
 * ==========================================================================
 * Aura Task Manager & DOM Playground JavaScript
 * Focuses on core DOM API, Event Handling, and Browser Rendering concepts.
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

// Counters
const counterAll = document.getElementById("counter-all");
const counterPending = document.getElementById("counter-pending");
const counterCompleted = document.getElementById("counter-completed");

// Search & Filters
const searchInput = document.getElementById("search-input");
const categoryFilterContainer = document.getElementById("category-filter-container");
const clearAllBtn = document.getElementById("clear-all-btn");

// Theme Toggle
const themeToggleBtn = document.getElementById("theme-toggle-btn");

// Attributes vs Properties Demo
const demoInput = document.getElementById("demo-input");
const attrOutput = document.getElementById("attr-output");
const propOutput = document.getElementById("prop-output");

// Event Propagation Playground
const grandparent = document.getElementById("grandparent-node");
const parent = document.getElementById("parent-node");
const child = document.getElementById("child-node");
const consoleLogs = document.getElementById("console-logs");
const clearPropLogsBtn = document.getElementById("clear-prop-logs");

// --- INITIALIZATION & RECOVERY ---
document.addEventListener("DOMContentLoaded", () => {
    // Load tasks from LocalStorage
    const savedTasks = localStorage.getItem("aura_tasks");
    if (savedTasks) {
        try {
            tasksState = JSON.parse(savedTasks);
            renderTasksList();
        } catch (e) {
            console.error("Failed to parse local tasks standard. Reinitializing.", e);
            tasksState = [];
        }
    }
    
    // Setup Theme from LocalStorage or system preference
    const savedTheme = localStorage.getItem("aura_theme") || 
                       (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    setTheme(savedTheme);

    // Initial setup of Attributes vs Properties outputs
    updateAttrPropDemo();
});

// --- THEME MANAGEMENT ---
function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("aura_theme", theme);
    
    // Demonstrating classList usage
    if (theme === "light") {
        document.body.classList.add("light-mode");
    } else {
        document.body.classList.remove("light-mode");
    }
}

themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
});


// --- TASK UTILITIES & RENDERING ---

/**
 * Saves the current state of tasks to LocalStorage.
 */
function saveTasksToStorage() {
    localStorage.setItem("aura_tasks", JSON.stringify(tasksState));
}

/**
 * Updates status counters based on current state.
 */
function updateCounters() {
    const total = tasksState.length;
    const completed = tasksState.filter(t => t.status === "completed").length;
    const pending = total - completed;

    counterAll.textContent = total;
    counterPending.textContent = pending;
    counterCompleted.textContent = completed;
}

/**
 * Generates DOM node structure for a single task card.
 * Uses createElement(), createTextNode() and append() / appendChild().
 */
function createTaskCardNode(task) {
    // 1. Create outer card container
    const card = document.createElement("div");
    card.className = "task-card";
    
    // Demonstration of dataset property & setAttribute
    card.dataset.id = task.id; // sets data-id attribute internally
    card.setAttribute("data-status", task.status);
    card.setAttribute("data-category", task.category);
    
    // Add priority high-light state if present
    if (task.starred) {
        card.setAttribute("data-starred", "true");
        card.classList.add("starred-active");
    }

    // 2. Create Task status toggle column (Check box area)
    const statusBtnCol = document.createElement("div");
    statusBtnCol.className = "status-col";

    const statusBtn = document.createElement("button");
    statusBtn.className = "task-status-btn";
    statusBtn.setAttribute("aria-label", "Toggle complete status");
    
    // Dynamically choose check icon based on status
    const statusIcon = document.createElement("i");
    statusIcon.className = task.status === "completed" 
        ? "fa-solid fa-circle-check" 
        : "fa-regular fa-circle";
    statusBtn.appendChild(statusIcon);
    statusBtnCol.appendChild(statusBtn);

    // 3. Create Content Details Column
    const contentCol = document.createElement("div");
    contentCol.className = "task-card-content";

    // Task Title Span
    const titleSpan = document.createElement("span");
    titleSpan.className = "task-title-text";
    
    // Using createTextNode to prevent XSS and showcase vanilla Node interface
    const titleText = document.createTextNode(task.title);
    titleSpan.appendChild(titleText);

    // Metadata wrapper
    const metaDiv = document.createElement("div");
    metaDiv.className = "task-card-meta";

    // Category badge
    const catBadge = document.createElement("span");
    catBadge.className = "badge-category";
    catBadge.setAttribute("data-category", task.category);
    catBadge.textContent = task.category;

    // Date/Time badge
    const dateBadge = document.createElement("span");
    dateBadge.className = "task-date-badge";
    dateBadge.innerHTML = `<i class="fa-regular fa-clock"></i> ${task.createdAt}`;

    metaDiv.append(catBadge, dateBadge);
    contentCol.append(titleSpan, metaDiv);

    // 4. Action buttons column
    const actionsCol = document.createElement("div");
    actionsCol.className = "task-actions";

    // Priority Star Button (Attribute Demo toggler)
    const starBtn = document.createElement("button");
    starBtn.className = "action-btn star-btn";
    starBtn.setAttribute("aria-label", "Toggle priority task");
    const starIcon = document.createElement("i");
    starIcon.className = task.starred ? "fa-solid fa-star text-warning" : "fa-regular fa-star";
    starBtn.appendChild(starIcon);

    // Move Up Button (Demonstrating before())
    const upBtn = document.createElement("button");
    upBtn.className = "action-btn move-up-btn";
    upBtn.setAttribute("aria-label", "Move task up");
    const upIcon = document.createElement("i");
    upIcon.className = "fa-solid fa-chevron-up";
    upBtn.appendChild(upIcon);

    // Move Down Button (Demonstrating after())
    const downBtn = document.createElement("button");
    downBtn.className = "action-btn move-down-btn";
    downBtn.setAttribute("aria-label", "Move task down");
    const downIcon = document.createElement("i");
    downIcon.className = "fa-solid fa-chevron-down";
    downBtn.appendChild(downIcon);

    // Edit Button (Demonstrating replaceWith())
    const editBtn = document.createElement("button");
    editBtn.className = "action-btn edit-btn";
    editBtn.setAttribute("aria-label", "Edit task title");
    const editIcon = document.createElement("i");
    editIcon.className = "fa-regular fa-pen-to-square";
    editBtn.appendChild(editIcon);

    // Delete Button (Demonstrating remove())
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "action-btn delete-btn";
    deleteBtn.setAttribute("aria-label", "Delete task");
    const deleteIcon = document.createElement("i");
    deleteIcon.className = "fa-regular fa-trash-can";
    deleteBtn.appendChild(deleteIcon);

    // Assemble Actions column
    actionsCol.append(starBtn, upBtn, downBtn, editBtn, deleteBtn);

    // Assemble entire card
    card.append(statusBtnCol, contentCol, actionsCol);

    return card;
}

/**
 * Main Rendering function.
 * Implements performance optimization using DocumentFragment to limit paint reflows.
 */
function renderTasksList() {
    const filter = getActiveCategoryFilter();
    const query = searchInput.value.toLowerCase().trim();

    // Filter tasks based on selected filter and search term
    const filteredTasks = tasksState.filter(task => {
        const matchesCategory = filter === "all" || task.category === filter;
        const matchesSearch = task.title.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
    });

    // Handle empty display states
    if (filteredTasks.length === 0) {
        // Clear tasks leaving only empty-state visible
        const cards = taskListContainer.querySelectorAll(".task-card");
        cards.forEach(c => c.remove());
        emptyState.style.display = "flex";
        updateCounters();
        return;
    }

    emptyState.style.display = "none";

    // Performance Optimization: DocumentFragment
    // Instead of directly appending items in a loop to taskListContainer, we create a
    // DocumentFragment. This acts as a virtual DOM root, preventing multiple layout reflows/repaints.
    const fragment = document.createDocumentFragment();

    filteredTasks.forEach(task => {
        const taskCardNode = createTaskCardNode(task);
        fragment.appendChild(taskCardNode);
    });

    // Safely clear previous tasks while avoiding empty state removal
    const activeCards = taskListContainer.querySelectorAll(".task-card");
    activeCards.forEach(c => c.remove());
    
    // Append the complete fragment in one single visual repaint!
    taskListContainer.appendChild(fragment);
    
    updateCounters();
}

/**
 * Returns the currently active category filter string.
 */
function getActiveCategoryFilter() {
    const activePill = categoryFilterContainer.querySelector(".filter-pill.active");
    return activePill ? activePill.dataset.filter : "all";
}


// --- DOM ACTIONS: FORM SUBMISSION ---

taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = taskTitleInput.value.trim();
    const category = taskCategorySelect.value;
    const errorSpan = document.getElementById("title-error");

    // Simple Form Validation
    if (!title) {
        errorSpan.style.display = "block";
        taskTitleInput.focus();
        return;
    }
    errorSpan.style.display = "none";

    // Create a new task object
    const newTask = {
        id: Date.now().toString(),
        title: title,
        category: category,
        status: "pending",
        starred: false,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Add to local state array
    // Adding at the start of array to match prepend actions
    tasksState.unshift(newTask);
    saveTasksToStorage();

    // 1. Instantiate the DOM node
    const newCardNode = createTaskCardNode(newTask);

    // Hide empty state if visible
    emptyState.style.display = "none";

    // 2. Perform prepending DOM manipulation
    // prepend() inserts node right before the first child of taskListContainer
    taskListContainer.prepend(newCardNode);

    // Reset input fields
    taskTitleInput.value = "";
    updateCounters();
});

// Clear input error on typing
taskTitleInput.addEventListener("input", () => {
    document.getElementById("title-error").style.display = "none";
});


// --- EVENT DELEGATION: TASK CARD CONTROLS ---
// Rather than attaching listeners to hundreds of separate delete/edit buttons inside 
// each card, we register a single listener on parent '#task-list'. Event Bubbling 
// floats clicked buttons up, allowing us to inspect target element details dynamically.

taskListContainer.addEventListener("click", (e) => {
    // 1. Detect target buttons using closest()
    const targetCard = e.target.closest(".task-card");
    if (!targetCard) return; // Click was not on or inside a task card

    const taskId = targetCard.dataset.id; // Retrieve custom data-id
    const taskIndex = tasksState.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    // A. Toggle Status Action
    if (e.target.closest(".task-status-btn")) {
        const currentStatus = targetCard.getAttribute("data-status");
        const nextStatus = currentStatus === "pending" ? "completed" : "pending";
        
        // Update state
        tasksState[taskIndex].status = nextStatus;
        saveTasksToStorage();

        // Update DOM attributes
        targetCard.setAttribute("data-status", nextStatus);
        
        // Toggle icon visually
        const statusIcon = targetCard.querySelector(".task-status-btn i");
        if (nextStatus === "completed") {
            statusIcon.className = "fa-solid fa-circle-check";
        } else {
            statusIcon.className = "fa-regular fa-circle";
        }

        updateCounters();
        return;
    }

    // B. Toggle Highlight / Star Action
    // Showcases: getAttribute, setAttribute, removeAttribute, hasAttribute
    if (e.target.closest(".star-btn")) {
        const starBtn = targetCard.querySelector(".star-btn");
        const starIcon = starBtn.querySelector("i");

        // Use hasAttribute to check priority state
        if (targetCard.hasAttribute("data-starred")) {
            // Remove state
            targetCard.removeAttribute("data-starred");
            targetCard.classList.remove("starred-active");
            starIcon.className = "fa-regular fa-star";
            tasksState[taskIndex].starred = false;
        } else {
            // Set state
            targetCard.setAttribute("data-starred", "true");
            targetCard.classList.add("starred-active");
            starIcon.className = "fa-solid fa-star text-warning";
            tasksState[taskIndex].starred = true;
        }
        saveTasksToStorage();
        return;
    }

    // C. Edit Task Title Inline (Showcases replaceWith() DOM method)
    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) {
        const titleSpan = targetCard.querySelector(".task-title-text");
        const editIcon = editBtn.querySelector("i");
        
        const isEditing = targetCard.classList.contains("editing");

        if (!isEditing) {
            // Begin editing phase
            targetCard.classList.add("editing");
            editIcon.className = "fa-solid fa-check text-success";
            
            // Create target replacement: <input type="text">
            const editInput = document.createElement("input");
            editInput.type = "text";
            editInput.className = "form-input task-title-edit-input";
            editInput.value = titleSpan.textContent;
            editInput.setAttribute("style", "padding: 0.25rem 0.5rem; font-size: 0.95rem; font-weight: 600; width: 100%;");
            
            // DOM replaceWith(): Replaces titleSpan element node with editInput
            titleSpan.replaceWith(editInput);
            editInput.focus();
            
            // Allow press enter to save
            editInput.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    editBtn.click(); // Triggers save state
                }
            });
        } else {
            // Save state phase
            const editInput = targetCard.querySelector(".task-title-edit-input");
            const updatedTitle = editInput.value.trim() || "Untitled Task";

            // Update local state
            tasksState[taskIndex].title = updatedTitle;
            saveTasksToStorage();

            // Create target replacement: <span> containing text node
            const staticSpan = document.createElement("span");
            staticSpan.className = "task-title-text";
            const textNode = document.createTextNode(updatedTitle);
            staticSpan.appendChild(textNode);

            // DOM replaceWith(): Replaces active input with static span node
            editInput.replaceWith(staticSpan);
            
            // Reset edit button icon state
            targetCard.classList.remove("editing");
            editIcon.className = "fa-regular fa-pen-to-square";
        }
        return;
    }

    // D. Move Task Up (Showcases before() DOM method)
    if (e.target.closest(".move-up-btn")) {
        const previousSibling = targetCard.previousElementSibling;
        
        // Prevent moving past boundaries or mixing with non-card templates
        if (previousSibling && previousSibling.classList.contains("task-card")) {
            // DOM before(): Inserts targetCard immediately before previousSibling node
            previousSibling.before(targetCard);

            // Mirror structural change in javascript array indices
            const temp = tasksState[taskIndex];
            tasksState[taskIndex] = tasksState[taskIndex - 1];
            tasksState[taskIndex - 1] = temp;
            saveTasksToStorage();
        }
        return;
    }

    // E. Move Task Down (Showcases after() DOM method)
    if (e.target.closest(".move-down-btn")) {
        const nextSibling = targetCard.nextElementSibling;
        
        if (nextSibling && nextSibling.classList.contains("task-card")) {
            // DOM after(): Inserts targetCard immediately after nextSibling node
            nextSibling.after(targetCard);

            // Mirror structural change in javascript array indices
            const temp = tasksState[taskIndex];
            tasksState[taskIndex] = tasksState[taskIndex + 1];
            tasksState[taskIndex + 1] = temp;
            saveTasksToStorage();
        }
        return;
    }

    // F. Delete Task Action (Showcases remove() DOM method)
    if (e.target.closest(".delete-btn")) {
        // Run sliding exit animation
        targetCard.classList.add("task-exit");
        
        // Wait for CSS transition keyframe to complete, then remove element from layout tree
        targetCard.addEventListener("transitionend", () => {
            // DOM remove(): Removes element from the page layout tree
            targetCard.remove();
            
            // Clean up state array
            tasksState.splice(taskIndex, 1);
            saveTasksToStorage();
            
            // Re-render dashboard check in case list is now empty
            if (tasksState.length === 0) {
                renderTasksList();
            } else {
                updateCounters();
            }
        });
        return;
    }
});


// --- SEARCH, FILTERS & BOARD CONTROLS ---

// Filter Pills click handling
categoryFilterContainer.addEventListener("click", (e) => {
    const clickedPill = e.target.closest(".filter-pill");
    if (!clickedPill) return;

    // Deactivate previous active filters
    const activePill = categoryFilterContainer.querySelector(".filter-pill.active");
    if (activePill) {
        activePill.classList.remove("active");
    }

    // Activate clicked filter
    clickedPill.classList.add("active");
    renderTasksList();
});

// Search input handler with basic debouncing/responsiveness
searchInput.addEventListener("input", () => {
    renderTasksList();
});

// Clear All Tasks action
clearAllBtn.addEventListener("click", () => {
    if (tasksState.length === 0) return;
    
    if (confirm("Are you sure you want to delete all tasks on this board?")) {
        // Collect current cards and trigger fade outs
        const cards = taskListContainer.querySelectorAll(".task-card");
        cards.forEach(card => {
            card.classList.add("task-exit");
            card.addEventListener("transitionend", () => card.remove());
        });

        // Reset memory array
        tasksState = [];
        saveTasksToStorage();
        
        setTimeout(() => {
            renderTasksList();
        }, 350);
    }
});


// --- DEMONSTRATION 1: ATTRIBUTES VS PROPERTIES ---
// Explains the behavioral division of HTML inputs.
// - Attribute: Initial template value specified inside HTML index definition. static, unchanging.
// - Property: Node value object maintained dynamically by internal layout engine. Live, editable.

function updateAttrPropDemo() {
    // 1. Get HTML Attribute state
    const attributeValue = demoInput.getAttribute("value");
    
    // 2. Get Live JS DOM property state
    const propertyValue = demoInput.value;

    // Render results into demonstration outputs
    attrOutput.textContent = attributeValue === null ? "null" : `"${attributeValue}"`;
    propOutput.textContent = `"${propertyValue}"`;
}

// Attach character tracking input event listener to capture live adjustments
demoInput.addEventListener("input", updateAttrPropDemo);


// --- DEMONSTRATION 2: EVENT PROPAGATION PLAYGROUND ---
// Showcases DOM Capturing vs Bubbling phase behaviors using visual logs and staggered box outlines.

let visualLoggerIndex = 1;

/**
 * Outputs a formatted event trace log directly on the custom screen console dashboard.
 */
function logPropagationStep(eventName, nodeName, phase, eventObject) {
    // Check if console-logs placeholder is active and remove
    const placeholder = consoleLogs.querySelector(".console-placeholder");
    if (placeholder) {
        placeholder.remove();
    }

    const logRow = document.createElement("div");
    logRow.className = "log-entry";

    const indexSpan = document.createElement("span");
    indexSpan.className = "log-arrow";
    indexSpan.textContent = `[${visualLoggerIndex++}] ➔`;

    const phaseSpan = document.createElement("span");
    if (phase === "Capture") {
        phaseSpan.className = "log-phase-capture";
        phaseSpan.textContent = "[Capture]";
    } else {
        phaseSpan.className = "log-phase-bubble";
        phaseSpan.textContent = "[Bubble ]";
    }

    const nodeDetails = document.createElement("span");
    nodeDetails.innerHTML = ` Node: <span class="log-node">#${nodeName}</span> (Target: <span class="log-target">${eventObject.target.id}</span>)`;

    logRow.append(indexSpan, phaseSpan, nodeDetails);
    consoleLogs.appendChild(logRow);
    
    // Auto scroll output window to show new sequences
    consoleLogs.scrollTop = consoleLogs.scrollHeight;
}

/**
 * Staggers a visual glowing outline highlight on the respective playground node blocks
 * to visually illustrate the direction the event is travelling.
 */
function animatePropagationHighlight(element, delay) {
    setTimeout(() => {
        element.classList.add("highlight");
        setTimeout(() => {
            element.classList.remove("highlight");
        }, 300);
    }, delay);
}

/**
 * Returns which propagation mode (bubbling vs capturing) is checked in the radio group.
 */
function getSelectedPropagationMode() {
    const radio = document.querySelector('input[name="propagation-mode"]:checked');
    return radio ? radio.value : "bubble";
}

// A. Register Event listeners covering BOTH Bubble & Capture phases on Grandparent, Parent, Child.
// The third parameter `useCapture` handles which phase to catch:
// - true: Listen during CAPTURING phase
// - false / omitted: Listen during BUBBLING phase

// --- CAPTURE PHASE REGISTRATIONS ---
grandparent.addEventListener("click", (e) => {
    const mode = getSelectedPropagationMode();
    if (mode === "capture") {
        logPropagationStep("click", "grandparent-node", "Capture", e);
        animatePropagationHighlight(grandparent, 0); // first hit in capture
    }
}, true); // useCapture = true

parent.addEventListener("click", (e) => {
    const mode = getSelectedPropagationMode();
    if (mode === "capture") {
        logPropagationStep("click", "parent-node", "Capture", e);
        animatePropagationHighlight(parent, 250); // second hit in capture
    }
}, true); // useCapture = true

child.addEventListener("click", (e) => {
    const mode = getSelectedPropagationMode();
    if (mode === "capture") {
        logPropagationStep("click", "child-node", "Capture", e);
        animatePropagationHighlight(child, 500); // target hit in capture
    }
}, true); // useCapture = true


// --- BUBBLE PHASE REGISTRATIONS ---
child.addEventListener("click", (e) => {
    const mode = getSelectedPropagationMode();
    if (mode === "bubble") {
        logPropagationStep("click", "child-node", "Bubble", e);
        animatePropagationHighlight(child, 0); // first hit in bubble (target)
    }
}, false); // useCapture = false (or omitted)

parent.addEventListener("click", (e) => {
    const mode = getSelectedPropagationMode();
    if (mode === "bubble") {
        logPropagationStep("click", "parent-node", "Bubble", e);
        animatePropagationHighlight(parent, 250); // second hit in bubble
    }
}, false); // useCapture = false

grandparent.addEventListener("click", (e) => {
    const mode = getSelectedPropagationMode();
    if (mode === "bubble") {
        logPropagationStep("click", "grandparent-node", "Bubble", e);
        animatePropagationHighlight(grandparent, 500); // last hit in bubble
    }
}, false); // useCapture = false


// Clear Console Logs Button Click
clearPropLogsBtn.addEventListener("click", () => {
    consoleLogs.innerHTML = `<div class="console-placeholder">Click the child button above to trace event execution...</div>`;
    visualLoggerIndex = 1;
});
