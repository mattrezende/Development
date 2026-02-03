document.addEventListener('DOMContentLoaded', () => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks'));
    if (storedTasks) {
     storedTasks.forEach((task) => tasks.push(task));
        updateTaskList();
        updateStats();  
    }
});

let tasks = [];

const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

const addTask = () => {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();

   if (taskText) {
        tasks.push({ text: taskText, completed: false });
        taskInput.value = "";
        taskInput.focus();
        updateTaskList();
        updateStats();
        saveTasks();
   }
};

const toggleTaskComplete = (index) => {
    tasks[index].completed = !tasks[index].completed;
    updateTaskList();
    updateStats();
     saveTasks();
}

const deleteTask = (index) => {
    tasks.splice(index, 1);
    updateTaskList();
    updateStats();
     saveTasks();
}

const editTask = (index) => {
    const taskInput = document.getElementById('taskInput');
    taskInput.value = tasks[index].text;
    
    tasks.splice(index, 1);
    updateTaskList();
    updateStats();
     saveTasks();
}

const updateStats = () => {
    const completeTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    const progress = ( completeTasks / totalTasks) * 100;

    const progressBar = document.getElementById('progress');
    progressBar.style.width = `${progress}%`;

    document.getElementById('numbers').innerText = `${completeTasks} / ${totalTasks}`;

    if (tasks.length && completeTasks === totalTasks) {
        blaskConfetti();
    }
}

const updateTaskList = () => {
    const taskList = document.getElementById('task-list');

    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
       const taskItem = document.createElement('li'); 

       taskItem.innerHTML = `
       <div class="taskItem">
                <label class="task ${task.completed ? 'completed' : ''}">
                     <input type="checkbox" class="checkbox" ${task.completed ? 'checked' : ''}/>
                     <span class="custom-checkbox"></span>
                      <p>${task.text}</p>
                </label>
                <div class="icons">
                     <i class="fa-regular fa-pen-to-square" id="edit" onclick="editTask(${index})"></i>
                     <i class="fa-regular fa-trash-can" id="delete" onclick="deleteTask(${index})"></i>
                
                </div>
       </div>
    `;

        taskItem.addEventListener('change', () => toggleTaskComplete(index));
         taskList.appendChild(taskItem);
    })
}

document.getElementById('newTask').addEventListener('click', function(event) {
    event.preventDefault();
    
    addTask();
});

const blaskConfetti = () => {
    const count = 200,
  defaults = {
    origin: { y: 0.7 },
  };

function fire(particleRatio, opts) {
  confetti(
    Object.assign({}, defaults, opts, {
      particleCount: Math.floor(count * particleRatio),
    })
  );
}

fire(0.25, {
  spread: 26,
  startVelocity: 55,
});

fire(0.2, {
  spread: 60,
});

fire(0.35, {
  spread: 100,
  decay: 0.91,
  scalar: 0.8,
});

fire(0.1, {
  spread: 120,
  startVelocity: 25,
  decay: 0.92,
  scalar: 1.2,
});

fire(0.1, {
  spread: 120,
  startVelocity: 45,
});
}
