let delButtons = document.getElementsByClassName('todo-delete');

for (let i = 0; i < delButtons.length; i++) {
    delButtons[i].addEventListener('click', deleteTodo);
}

function newTodo() {
    //Do validity checking here
    let textInput = document.getElementById('todo-text-input').value;
    let intervalInput = document.getElementById('todo-interval-input').value;
    let offsetInput = document.getElementById('todo-offset-input').value;

    if (!textInput || !intervalInput || !offsetInput) {
        alert('All inputs must have values!')
    }

    if (offsetInput >= intervalInput) {
        alert('Your offset must be less than your interval!')
    }

    const http = new XMLHttpRequest();
    const url = '/newtodo'
    http.open('POST', url);
    http.addEventListener('load', event => {
        if (event.target.status === 200) {
            let originDate = 1536080400;
            let currentTime = Math.floor((new Date()).getTime() / 1000);
            let secondsSinceFirst = currentTime - originDate;
            let weeksSinceFirst = Math.floor(secondsSinceFirst / 604800);     
            
            let todo = null;

            if (weeksSinceFirst % intervalInput == offsetInput) {
                let newTodo = Handlebars.templates.todoPartial({
                    text: textInput,
                    weeksUntilNext: intervalInput,
                    inactive: false
                })

                document.getElementById('actives').insertAdjacentHTML('beforeend', newTodo);
                let activeTexts = document.getElementById('actives').querySelectorAll('.todo-delete');
                todo = activeTexts.item(activeTexts.length - 1);
            } else {
                let newTodo = Handlebars.templates.todoPartial({
                    text: textInput,
                    weeksUntilNext: (intervalInput - (weeksSinceFirst % intervalInput) + offsetInput) % intervalInput,
                    inactive: true
                })

                document.getElementById('inactives').insertAdjacentHTML('beforeend', newTodo);
                let inactiveTexts = document.getElementById('inactives').querySelectorAll('.todo-delete');
                todo = inactiveTexts.item(inactiveTexts.length - 1);
            }

            todo.addEventListener('click', deleteTodo);
        } else if (event.target.status === 409) {
            alert('To-Do already exists!  Change the text!');
        } else {
            alert('Error storing to-do!  Please try again!');
        }
    })

    let body = {
        text: document.getElementById('todo-text-input').value.trim(),
        interval: document.getElementById('todo-interval-input').value.trim(),
        offset: document.getElementById('todo-offset-input').value.trim()
    }

    http.setRequestHeader('Content-type', 'application/json');
    http.send(JSON.stringify(body))
}

function showInactives() {
    let inactives = document.getElementById('inactives');

    if (inactives.classList.contains('hidden')) {
        inactives.classList.remove('hidden');
        document.getElementById('show-inactive').innerText = 'Hide Inactive To-Do\'s';
    } else {
        inactives.classList.add('hidden');
        document.getElementById('show-inactive').innerText = 'Show Inactive To-Do\'s';
    }
}

function showAdd() {
    let addTodo = document.getElementById('add-todo');

    if (addTodo.classList.contains('hidden')) {
        addTodo.classList.remove('hidden');
    } else {
        addTodo.classList.add('hidden');
        document.getElementById('todo-text-input').value = '';
        document.getElementById('todo-interval-input').value = '';
        document.getElementById('todo-offset-input').value = '';
    }
}

function deleteTodo(event) {
    let text = event.target.parentElement.getElementsByClassName('todo-text')[0].innerText;
    const http = new XMLHttpRequest();
    const url = '/deletetodo'
    http.open('DELETE', url);
    http.addEventListener('load', event => {
        if (event.target.status === 200) {
            let todos = document.getElementsByClassName('todo-text');

            for (let i = 0; i < todos.length; i++) {
                let todo = todos[i];
                if (todo.innerText == text) {
                    todo.parentElement.remove();
                }
            }
        } else if (event.target.status === 409) {
            alert('To-Do already exists!  Change the text!');
        } else {
            alert('Error storing to-do!  Please try again!');
        }
    })

    let body = {
        text: text
    }

    http.setRequestHeader('Content-type', 'application/json');
    http.send(JSON.stringify(body));
}