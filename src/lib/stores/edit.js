import { writable } from 'svelte/store';

export const editorID = writable(0);
export const editor = writable(null);
export const fileToOpen = writable("");

export function setEditorID(id) {
  editorID.set(id);
}

export function setEditor(editorComponent) {
  editor.set(editorComponent);
}

export function openFile(path = "") {
  fileToOpen.set(path);
}