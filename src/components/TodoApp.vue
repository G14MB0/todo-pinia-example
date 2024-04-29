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
  <div class="info">
    <Typography>Done: {{ store.doneTodosCount }}</Typography>
    <Typography>Important: {{ store.importantTodosCount }}</Typography>
    <Typography>Active: {{ store.activeTodosCount }}</Typography>
  </div>

  <List bordered :data-source="store.todos" item-layout="horizontal" class="customScroller">
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
        <Typography :class="{ 'line-through': item.done, 'text-bold': item.important }">{{
          item.text
        }}</Typography>
        <!-- Included this to show the due-date. just for this purpose, it will be empty if no due-date has been selected for the current ToDo -->
        <Typography :class="{ 'line-through': item.done, 'text-bold': item.important }" style="width: 20%">{{
          item.dueDate
        }}</Typography>
        <CloseCircleOutlined @click="store.removeTodo(item.id)" style="width: 10%"
      /></ListItem>
    </template>
  </List>
</template>

<script setup lang="ts">
import { Input, List, ListItem, Typography, DatePicker, Button } from 'ant-design-vue';
import { ref } from 'vue';
import { useTodoStore } from '@/stores/todo';
// import { v4 as uuidv4 } from 'uuid';
import CloseCircleOutlined from '@ant-design/icons-vue/lib/icons/CloseCircleOutlined';
import CheckOutlined from '@ant-design/icons-vue/lib/icons/CheckOutlined';
import ExclamationOutlined from '@ant-design/icons-vue/lib/icons/ExclamationOutlined';


const field = ref('');
const selectedDate = ref(''); // added this to store the selected date
const store = useTodoStore();


// Function to custom format date as a string
function formatDate(date: Date|null|undefined) {
  if (!date) return null;
  return date.toISOString().split('T')[0]
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

</style>
