// NEW FILE!
// reactive variable and relative methods that handle localStorage operation (set, get, remove)
// Those function update both the localStorage value AND the reactive "storageState" variable

// Just for this purpose, these functions handle explicitly the key === 'token' (a more general aproach could be used)



import { reactive } from 'vue';

export const storageState = reactive({
    token: localStorage.getItem('token') || null
});

// Function to set item and notify about the change
export function setItem(key: string, value: string) {
    localStorage.setItem(key, value);
    if (key === 'token') {
        storageState.token = value;
    }
}

// Function to get item
export function getItem(key: string) {
    return localStorage.getItem(key);
}

// Function to remove item
export function removeItem(key: string) {
    localStorage.removeItem(key);
    if (key === 'token') {
        storageState.token = null;
    }
}
