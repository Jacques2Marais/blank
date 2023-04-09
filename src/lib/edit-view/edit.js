import { writable } from 'svelte/store';

export const editorID = writable(0);
export const editor = writable(null);

export function setEditorID(id) {
  editorID.set(id);
}

export function setEditor(editor) {
  editor.set(editor);
}