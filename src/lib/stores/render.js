import { writable } from 'svelte/store';

export const renderedURL = writable("");

export function setRenderedURL(url) {
    console.log(url);
    renderedURL.set(url);
}