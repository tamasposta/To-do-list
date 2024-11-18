const toDoAdd = document.getElementById("to-do-add");
const priority = document.getElementById("priority");
const listContainer = document.getElementById("list-container");
const toDoForm = document.getElementById("to-do-form");
const dateInput = document.getElementById("date-input");

toDoForm.addEventListener("submit", addTask);

function addTask(event) {
  event.preventDefault();

  if (toDoAdd.value === "") {
    alert("Please write something before submitting");
  } else {
    let li = document.createElement("li");
    li.innerHTML = toDoAdd.value;
    li.draggable = true;

    li.addEventListener("dragstart", handleDragStart);
    li.addEventListener("dragover", handleDragOver);
    li.addEventListener("drop", handleDrop);
    li.addEventListener("dragend", handleDragEnd);

    let dateP = document.createElement("p");
    dateP.classList.add("date-p");
    dateP.innerHTML = `Deadline: ${dateInput.value}`;
    li.appendChild(dateP);

    let prioritySpan = document.createElement("span");
    prioritySpan.classList.add("priority-badge");
    prioritySpan.innerHTML = `(${priority.value})`;
    li.appendChild(prioritySpan);

    let editIcon = document.createElement("span");
    editIcon.innerHTML = "✏️";
    editIcon.classList.add("edit-icon");

    editIcon.onclick = () => editTask(li, prioritySpan, editIcon, deleteIcon);
    li.appendChild(editIcon);

    let deleteIcon = document.createElement("span");
    deleteIcon.innerHTML = "\u00d7";
    deleteIcon.classList.add("delete-icon");
    deleteIcon.onclick = () => li.remove();
    li.appendChild(deleteIcon);

    listContainer.appendChild(li);
  }

  toDoAdd.value = "";
  saveData();
}

let draggedItem = null;

function handleDragStart(event) {
  draggedItem = this;
  setTimeout(() => (this.style.opacity = "0.5"), 0);
}

function handleDragOver(event) {
  event.preventDefault();
}

function handleDrop(event) {
  event.preventDefault();
  this.style.opacity = "1";

  if (draggedItem !== this) {
    const dropPosition =
      event.clientY - this.getBoundingClientRect().top > this.offsetHeight / 2
        ? this.nextSibling
        : this;

    listContainer.insertBefore(draggedItem, dropPosition);
  }
  resetDragStyles();
}

function handleDragEnd(event) {
  resetDragStyles();
}

function resetDragStyles() {
  if (draggedItem) {
    draggedItem.style.opacity = "1";
    draggedItem = null;
  }
}

listContainer.addEventListener(
  "click",
  function (event) {
    if (event.target.tagName === "LI") {
      event.target.classList.toggle("checked");
      saveData();
    } else if (event.target.tagName === "SPAN") {
      event.target.parentElement.remove();
      saveData();
    }
  },
  false
);

function saveData() {
  localStorage.setItem("data", listContainer.innerHTML);
}

function showTask() {
  listContainer.innerHTML = localStorage.getItem("data");
}

function editTask(li, prioritySpan, editIcon, deleteIcon) {
  let currentText = li.childNodes[0].nodeValue.trim();

  let editInput = document.createElement("input");
  editInput.type = "text";
  editInput.value = currentText;
  editInput.classList.add("edit-input");

  li.innerHTML = "";
  li.appendChild(editInput);

  editInput.addEventListener("blur", () =>
    saveTask(li, editInput, prioritySpan, editIcon, deleteIcon)
  );

  editInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      saveTask(li, editInput, prioritySpan, editIcon, deleteIcon);
    }
  });
}

function saveTask(li, editInput, prioritySpan, editIcon, deleteIcon) {
  li.innerHTML = editInput.value;

  li.appendChild(prioritySpan);
  li.appendChild(editIcon);
  li.appendChild(deleteIcon);
}

document.querySelectorAll(".priority-selector").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".priority-selector")
      .forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    filterTasks(button.innerText);
  });
});

function filterTasks(priority) {
  const tasks = document.querySelectorAll("#list-container li");

  tasks.forEach((task) => {
    const taskPriority = task
      .querySelector(".priority-badge")
      .innerText.replace(/[()]/g, "")
      .trim();

    if (priority === "All" || taskPriority === priority) {
      task.style.display = "";
    } else {
      task.style.display = "none";
    }
  });
}

document.querySelectorAll(".sort-option").forEach((button) => {
  button.addEventListener("click", () => sortTasks(button.innerText));
});

function sortTasks(criteria) {
  const tasks = Array.from(document.querySelectorAll("#list-container li"));

  tasks.sort((a, b) => {
    if (criteria === "Name(A-Z)") {
      return a.textContent.localeCompare(b.textContent);
    } else if (criteria === "Priority") {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      const aPriority = a
        .querySelector(".priority-badge")
        .innerText.replace(/[()]/g, "")
        .trim();
      const bPriority = b
        .querySelector(".priority-badge")
        .innerText.replace(/[()]/g, "")
        .trim();
      return priorityOrder[aPriority] - priorityOrder[bPriority];
    } else if (criteria === "Date") {
      const aDate = new Date(
        a.querySelector(".date-p").innerText.replace("Deadline: ", "").trim()
      );
      const bDate = new Date(
        b.querySelector(".date-p").innerText.replace("Deadline: ", "").trim()
      );
      return aDate - bDate;
    }
  });

  tasks.forEach((task) => listContainer.appendChild(task));
}

showTask();
