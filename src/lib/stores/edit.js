import { writable } from 'svelte/store';

export const activeEditorID = writable(0);
export const editor = writable(null);
export const fileToOpen = writable("");

export function setActiveEditorID(id) {
  activeEditorID.set(id);
}

export function setEditor(editorComponent) {
  editor.set(editorComponent);
}

export function openFile(path = "") {
  fileToOpen.set(path);
}