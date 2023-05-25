import { writable } from 'svelte/store';

export const renderedURL = writable("");

export function setRenderedURL(url) {
    renderedURL.set(url);
}