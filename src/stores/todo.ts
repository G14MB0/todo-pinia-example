// Main update on this file
// I decided to mantain the Pinia store logic in addition to the new server side logic.
// There is no a main pro to this in this specific case since the amount of data is relatively small
// In general, if the store logic is only on server side, any update of components where data need to be shown, need to request
// data from server.
// Here insted the user data is requested at mount (actually is requested once the login is done), then only modifications
// trigger data update server side and in general only the updated data is passed/requested from server (not all the user stack)

// In this way the graphical rendering of todos is still performed using Pinia store while pinia store is updated along with server mods.

// key point:
//  - fetchTodo align server data with pinia store data (called at login)
//  - any modification in the pinia store is made only after succes modification in server (avoid data mismatch)
//  - for this purpose specific endpoint are made for "important" and "done" to reduce server traffic


import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { ITodo } from '@/interfaces';
import { API_URL } from '@/main';
//imported axios
import axios from 'axios';

// imported to use token in requests
import { storageState } from './token';


function toggleProp(prop: 'important' | 'done', id: string, todo: ITodo) {
  return todo.id === id ? { ...todo, [prop]: !todo[prop] } : todo;
}

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<ITodo[]>([]);

  // Function to fetch server for Todos. 
  async function fetchTodos() {
    try {
      const response = await axios.get(`${API_URL}/todo/`, {
        headers: { 'Authorization': `Bearer ${storageState.token}` }
      }); // Replace with your endpoint
      todos.value = response.data;
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  }

  // Add a new todo to server. if success, add also to Pinia store
  function addTodo(todo: ITodo) {
    axios.post(`${API_URL}/todo/`, todo, {
      headers: { 'Authorization': `Bearer ${storageState.token}` }
    }) 
      .then((response) => { 

        todos.value.push(response.data);
        })
      .catch((error) => console.error('Error adding todo:', error));
  }


  // Remove todo from server, then remove from Pinia store
  function removeTodo(id: string) {
    axios.delete(`${API_URL}/todo/${id}`, {
      headers: { 'Authorization': `Bearer ${storageState.token}` }
    }) 
      .then((response) => {todos.value = todos.value.filter((todo: ITodo) => todo.id !== id);})
      .catch((error) => console.error('Error removing todo:', error));
  }


  

// In this two function I follow a different aproach:
// first change the value of the todo by toggling it's state as made before
// then update it's value on the server using API
// if server respons "ok" then nothing happen
// if server responds with error, then go back with the previous state in the pinia store
  function toggleDone(id: string) {
    todos.value = todos.value.map((todo) => toggleProp('done', id, todo));
    axios.put(`${API_URL}/todo/update/${id}`, todos.value.find(todo => todo.id === id), {
      headers: { 'Authorization': `Bearer ${storageState.token}` }
    })
    .then((response) => {})
    .catch((error) => {console.error('Error updating todo:', error); todos.value = todos.value.map((todo) => toggleProp('done', id, todo));});
  }

  function toggleImportant(id: string) {
    todos.value = todos.value.map((todo) => toggleProp('important', id, todo));
    axios.put(`${API_URL}/todo/update/${id}`, todos.value.find(todo => todo.id === id), {
      headers: { 'Authorization': `Bearer ${storageState.token}` }
    })
    .then((response) => {})
    .catch((error) => {console.error('Error updating todo:', error); todos.value = todos.value.map((todo) => toggleProp('important', id, todo));});
  }


  // TODO check if these functions works after fetching todos from server and update local todos
  const doneTodosCount = computed(() => todos.value.filter((todo) => todo.done).length);
  const importantTodosCount = computed(() => todos.value.filter((todo) => todo.important).length);
  const activeTodosCount = computed(() => todos.value.filter((todo) => !todo.done).length);

  return {
    fetchTodos,
    addTodo,
    removeTodo,
    toggleDone,
    toggleImportant,
    doneTodosCount,
    importantTodosCount,
    activeTodosCount,
    todos
  };
});
