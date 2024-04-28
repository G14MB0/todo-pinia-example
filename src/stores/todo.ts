// TODO add login logic -> token to all API calls

import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { ITodo } from '@/interfaces';
import { API_URL } from '@/main';
//imported axios
import axios from 'axios';


function toggleProp(prop: 'important' | 'done', id: string, todo: ITodo) {
  return todo.id === id ? { ...todo, [prop]: !todo[prop] } : todo;
}

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<ITodo[]>([]);

  // Function to fetch server for Todos. 
  // TODO align response.data to todos or viceversa to avoid new todos mismatch with server schema
  // TODO decide where to use this function
  async function fetchTodos() {
    try {
      const response = await axios.get(`${API_URL}/todo/`); // Replace with your endpoint
      todos.value = response.data;
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  }

  // Add a new todo to server. if success, add also to Pinia store
  function addTodo(todo: ITodo) {
    axios.post(`${API_URL}/todo/`, todo) 
      .then((response) => {todos.value.push(todo); console.log('Todo added successfully:', response.data)})
      .catch((error) => console.error('Error adding todo:', error));
  }


  // Remove todo from server, then remove from Pinia store
  // TODO move todos.value = ...  after api fetch success
  // TODO check if works this enpoint
  function removeTodo(id: string) {
    todos.value = todos.value.filter((todo: ITodo) => todo.id !== id);

    axios.delete(`${API_URL}/todo/${id}`) 
      .then((response) => console.log('Todo removed successfully:', response.data))
      .catch((error) => console.error('Error removing todo:', error));
  }


  // TODO update both this two function with API call
  function toggleDone(id: string) {
    todos.value = todos.value.map((todo) => toggleProp('done', id, todo));
  }

  function toggleImportant(id: string) {
    todos.value = todos.value.map((todo) => toggleProp('important', id, todo));
  }


  // TODO check if these functions works after fetching todos from server and update local todos
  const doneTodosCount = computed(() => todos.value.filter((todo) => todo.done).length);
  const importantTodosCount = computed(() => todos.value.filter((todo) => todo.important).length);
  const activeTodosCount = computed(() => todos.value.filter((todo) => !todo.done).length);

  return {
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
