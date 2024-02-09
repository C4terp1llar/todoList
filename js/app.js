// Globals
// для того, чтобы скрыть глобальные переменные мб обернуть в IIFE

let todos = [];
let users = [];
const todoList = document.querySelector('#todo-list');
const userTodo = document.querySelector('#user-todo');
const form = document.querySelector('form');

//

// Attach Events

document.addEventListener('DOMContentLoaded', initApp);
form.addEventListener('submit', handleSubmit);

//

// Basic Logic
function getUserName (userIdInTodo){
    const user = users.find( user => user.id === userIdInTodo)
    return user.name;
}
function printTodo (todo){
    const li = document.createElement('li');
    li.classList.add('li');
    li.dataset.id = todo.id;

    const title = document.createElement('p');
    title.classList.add('title');
    title.textContent = todo.title;

    const user = document.createElement('p');
    user.classList.add('user');
    user.textContent = getUserName(todo.userId);

    const statusBlock = document.createElement('div');
    statusBlock.classList.add('status-block');

    const status = document.createElement('input');
    status.classList.add('status');
    status.type = 'checkbox';
    status.checked = todo.completed;
    status.addEventListener('change', handleChange);

    statusBlock.append(status);

    const del = document.createElement('button');
    del.classList.add('delete');
    del.innerHTML = '&times;';
    del.addEventListener('click', handleDelete);

    li.append(title);
    li.append(user);
    li.append(statusBlock);
    li.append(del);

    todoList.prepend(li);
}

function createUserOption (user){
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = user.name;

    userTodo.append(option);
}

function removeTodo (todoId) {
    todos.filter( todo => todo.id != todoId);

    const todo = todoList.querySelector(`[data-id="${todoId}"]`);
    todo.querySelector('.status').removeEventListener('change', handleChange);
    todo.querySelector('.delete').removeEventListener('click', handleDelete);

    todo.remove();
}

function alertError (error){
    const errorBox = document.getElementById('error-box');
    errorBox.textContent = error;
    errorBox.classList.add('show');

    setTimeout(() => {
        errorBox.classList.remove('show');
    }, 3000);
}
//

// Event Logic

function initApp (){
    try {
        Promise.all([getTodos(), getUsers()]).then( (values) => {
            [todos, users] = values;
    
            todos.forEach((todo) => printTodo(todo));
            users.forEach((user) => createUserOption(user));
        });
    } catch (error) {
        alertError(error);
    }
}

function handleSubmit (e){
    e.preventDefault();

    if (form.todo.value != '' && form.user.value != ''){
        newTodo({
            "userId": Number(form.user.value),
            "title": form.todo.value,
            "completed": false,
        });
    }else{
        alert('Fill all fields!');
    }
}

function handleChange (){
    const todoId = this.closest('li').dataset.id;
    const completed = this.checked;

    changeStatus(todoId, completed);
}

function handleDelete (){
    const currentTodoId = this.parentElement.dataset.id;

    deleteTodo(currentTodoId);
}
//

// Async logic

async function getTodos (){
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos');
        const data = await response.json();
    
        if (!data.length){
            throw new Error ('Failed to get data from server, try later');
        }

        return data;
    } catch (error) {
        alertError(error);
    }
}

async function getUsers (){
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const data = await response.json();
    
        if (!data.length){
            throw new Error ('Failed to get data from server, try later');
        }

        return data;

    } catch (error) {
        alertError(error);
    }
}

async function newTodo (obj){
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos',{
            method: 'POST',
            body: JSON.stringify(obj),
            headers: {
              'Content-Type': 'application/json'
            }
        });
    
        const newTodo = await response.json();
    
        printTodo(newTodo);
    } catch (error) {
        alertError(error);
    }
}

async function changeStatus (id, newData){
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ completed: newData }),
            headers: {
              'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok){
            throw new Error ('Error when changing status, try later');
        }

    } catch (error) {
        alertError(error);
    }
}

async function deleteTodo (todoId) {
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
        });
    
        if (response.ok){
            removeTodo(todoId);
        }else{
            throw new Error ('Error when deleting task, try later');
        }
    } catch (error) {
        alertError(error);
    }
}

//

