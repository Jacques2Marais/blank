import { writable } from 'svelte/store';

export const editorID = writable(0);

export function setEditorID(id) {
  editorID.set(id);
}