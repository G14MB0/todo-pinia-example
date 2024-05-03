<!-- 
  Main update on this file:
  - change the main element into a <form /> to handle "required" validation
  - add html element (described in the template) using ant-design components to align with original design:
    - add Button to improve UX  (previous keyup event was not so intuitive)
    - add DatePicker (just date, but can be easily extended to datetime if necessary) to handle due-date selection for new todos
  - create a ref for propagating DatePicker value
  - add custom date formatting function to align format with API schema
  - add css style 
 -->


<template>

  <div v-if="showPopup" class="overlay">
    <div class="popup">
      <h3>Edit Item</h3>
      <Typography>Current Text: {{ editingTodo.text }}</Typography>
      <Input v-model:value="editingText" placeholder="Enter name" style="border-radius: 5px; margin-bottom: 10px;"/>
      <Typography>Current Due Date: {{ editingTodo.dueDate }}</Typography>
      <DatePicker v-model:value="editingDate"  style="margin-bottom: 10px;"/>
      <!-- <button @click="updateItem">Save</button> -->
      <div style="width: 100%; display: flex; justify-content: flex-end;">
        <Button @click="showPopup = false" style="border-radius: 5px; ">Cancel</button>
        <Button @click="updateTodo" style="border-radius: 5px;  margin-left: 5px; min-width: 40%;" type="primary">Update</button>
      </div>
    </div>
  </div>

  <!-- Added a form to handle required inputs. in this case just the name is required. removed the keyup.enter since form handle this already -->
  
  <form class="todo-form"  @submit="handleAddTodo">
    <Input
      v-model:value="field"
      class="input"
      placeholder="Type name of todo"
      required
    />
    <!-- Add Datepicker and button from ant-design to handle for Date picking and a more user friendly submit -->
    <DatePicker 
      style="margin: 15px 5px; width: 33%"
      type="date"
      v-model:value="selectedDate"
      bordered
      format="YYYY-MM-DD"
    />
    <!-- added button type: submit to handle the form submitting. -->
    <Button 
      type="primary"
      html-type="submit"
      class="input"
    >
      Add
    </Button> 
  </form> 

  <!-- Styled this component -->
  <div class="info" style="margin-bottom: 35px;">
    <Typography>Done: {{ store.doneTodosCount }}</Typography>
    <Typography>Important: {{ store.importantTodosCount }}</Typography>
    <Typography>Active: {{ store.activeTodosCount }}</Typography>
  </div>

  <div class="filters">
    <Input v-model:value="filterText" placeholder="Filter by text" style="border-radius: 5px;"/>
      <div style="width: 40%; display: flex; justify-content: flex-end;">
      <div title="Show also completed ToDos">
      <Checkbox v-model:checked="showDone" >Done</Checkbox>
    </div>
    <div title="Show only Important ToDos">
      <Checkbox v-model:checked="showImportant" >Important</Checkbox>
    </div>
    </div>
    </div>

  
  <div class="column-titles">
      <div class="column status">Status</div>
      <div class="column task">Task</div>
      <div class="column due-date">Due Date</div>
      <div class="column actions"></div>
  </div>
  <List bordered :data-source="filteredTodos" item-layout="horizontal" class="customScroller">
    <template #renderItem="{ item }">
      <ListItem>
        <div style="width: 20%">
          <CheckOutlined class="icon" @click="store.toggleDone(item.id)" title="Toggle done" />
          <ExclamationOutlined
            color="red"
            @click="store.toggleImportant(item.id)"
            title="Toggle important"
          />
        </div>
        <Typography :class="{ 'line-through': item.done, 'text-bold': item.important }" style="width: 50%;">{{
          item.text
        }}</Typography>
        <!-- Included this to show the due-date. just for this purpose, it will be empty if no due-date has been selected for the current ToDo -->
        <Typography :class="{ 'line-through': item.done, 'text-bold': item.important }" style="width: 20%">{{
          item.dueDate
        }}</Typography>
        <div style="width: 10%; display: flex; justify-content: space-around;">
          <EditOutlined @click="editItem(item.id)" style="width: 5%" />
          <CloseCircleOutlined @click="store.removeTodo(item.id)" style="width: 5%" />
        </div>
     </ListItem>
    </template>
  </List>
</template>

<script setup lang="ts">
import { Input, List, ListItem, Typography, DatePicker, Button, Checkbox } from 'ant-design-vue';
import { ref, computed, watch } from 'vue';
import { useTodoStore } from '@/stores/todo';
// import { v4 as uuidv4 } from 'uuid';
import CloseCircleOutlined from '@ant-design/icons-vue/lib/icons/CloseCircleOutlined';
import CheckOutlined from '@ant-design/icons-vue/lib/icons/CheckOutlined';
import ExclamationOutlined from '@ant-design/icons-vue/lib/icons/ExclamationOutlined';
import moment from 'moment';
import { EditOutlined } from '@ant-design/icons-vue';


const field = ref('');
const selectedDate = ref(''); // added this to store the selected date
const store = useTodoStore();

// Add this to handle filtering todos
const filterText = ref('');
const showDone = ref(false);
const showImportant = ref(false);

const showPopup = ref(false);
const editingId = ref('0');
const editingTodo = ref();

const editingDate = ref(''); 
const editingText = ref(''); 


// This function is used to filter todo based on specific entries. It filter directly the local store (no server filtering)
// const filteredTodos = computed(() => {
//   return store.todos.filter(todo => {
//     return (todo.text.toLowerCase().includes(filterText.value.toLowerCase())) &&
//            (showDone.value ? true : !todo.done) &&
//            (showImportant.value ? todo.important : true);
//   });
// });

// Watch for changes in filterText and fetch new data. 
// In this case only text search is performed server side!!
// *** This functionality uses a lot of server traffic, so is not good ***
// The second function is dealing with "done" and "important" filters. It uses local values
watch(filterText, (newValue) => {
  store.fetchTodosByContent(newValue);
}, { immediate: true });

const filteredTodos = computed(() => {
  return store.todos.filter(todo => {
    return (showDone.value ? true : !todo.done) &&
           (showImportant.value ? todo.important : true);
  });
});



// Function to custom format date as a string
function formatDate(date: Date|null|undefined) {
  if (!date) return null;
  return date.toISOString().split('T')[0]
}


// This function handle the editing logic start
function editItem(id: string) {
  editingId.value = id;
  const currentTodo = store.todos.find(todo => todo.id === editingId.value);
  if (currentTodo) {
    editingTodo.value = currentTodo;
    // Ensure selectedDate is updated to the current dueDate of the editingTodo
    editingText.value = currentTodo.text; // Fallback to today's date if dueDate is missing
  }
  showPopup.value = true;
  editingTodo.value = store.todos.find(todo => todo.id === editingId.value)
}

// This function handle the editing logic end
function updateTodo() {
  store.editTodo(editingId.value, { text: editingText.value, dueDate: editingDate.value ? (typeof editingDate.value === 'string' ? editingDate.value : formatDate(editingDate.value)) : null });
  showPopup.value = false;
}


// overwritten id creation (mantained a dummy empty value to align with interface) because servers will deal with IDs. 
function createTodo(text: string, date: string | null) {
  return { text, id: "", done: false, important: false, dueDate: typeof date === 'string' ? date : formatDate(date) };
}

function handleAddTodo(event: Event) {
  event.preventDefault();

   //check if field are empty, thus prevent Todo creation. the form already do this, this is a reduntant check!
  if (!field.value) {
    return; 
  }

  // added selectedDate.value || null, accoring to not mandatory date input
  const todo = createTodo(field.value, selectedDate.value || null);
  store.addTodo(todo);

  field.value = '';
  selectedDate.value = '';
}
</script>

<style scoped>
.input {
  margin: 15px 0;
  border-radius: 5px;
}
.icon {
  margin-right: 10px;
}
.line-through {
  text-decoration: line-through;
}
.text-bold {
  font-weight: 700;
}

.todo-form {
  display: flex;
  justify-content: space-between;
}

.info {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 0;
  margin-bottom: 10px;
  box-shadow: 0 0 2px rgb(153, 153, 153);
  border-radius: 5px;
  transition: all 0.2s;
}


.info:hover {
  box-shadow: 0 0 4px rgb(153, 153, 153);
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
  border-radius: 5px;
  margin-top: 10px;
}

.ant-picker {
  border-radius: 5px;
}

.ant-list {
  border-radius: 5px;
  transition: all 0.2s;
  margin-bottom: 20px;
  overflow-y: auto;
  max-height: 70vh;
}
.ant-list:hover{
  box-shadow: 0 0 4px rgb(153, 153, 153);
}


/* This will improve data visualization in todo lists by creating alternating color lines */
.ant-list-item {
  border-bottom: 1px solid #eee; /* Adds a bottom border to each list item */
  padding: 10px; /* Adds padding to make each list item more distinct */
}

.ant-list-item:last-child {
  border-bottom: none; /* Removes border from the last item */
}

.ant-list-item:nth-child(odd) {
  background-color: #e6e6e6; /* Alternate background for odd items */
}

.column-titles, .list-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 24px 5px 24px;
}

.column {
  text-align: left;
  overflow: hidden; /* Prevents overflow and ensures the content fits in the designated width */
  color: #303030;
}

.status {
  width: 20%;
  font-weight: 500;
}

.task {
  width: 50%;
  font-weight: 500;
}

.due-date {
  width: 20%;
  font-weight: 500;
}

.actions {
  width: 10%;
  font-weight: 500;
}


.overlay {
  z-index: 1;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup {
  display: flex;
  flex-direction: column;
  min-width: 400px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

</style>
