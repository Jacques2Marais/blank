<script>
    import { createEventDispatcher } from 'svelte';

    // Props
    export let entries = [];
    export let selectedEntry = -1;
    export let value = "";

    // Elements
    let listElement = null;

    // Scroll to selected entry
    $: if (selectedEntry > 6 && listElement) {
        listElement.scrollTop = (selectedEntry - 6) * 32;
    } else if (listElement) {
        listElement.scrollTop = 0;
    }

    // Update value based on selected entry
    $: if (selectedEntry != -1) {
        value = entries[selectedEntry];
    }

    // Functions
    /**
     * Clears the entries and selected entry
     */
    export function clear() {
        entries = [];
        selectedEntry = -1;
    }

    /**
     * Selects the next entry
     */
    export function nextEntry() {
        if (selectedEntry < entries.length - 1) {
            selectedEntry++;
        } else {
            selectedEntry = 0;
        }
    }

    /**
     * Selects the previous entry
     */
    export function previousEntry() {
        if (selectedEntry > 0) {
            selectedEntry--;
        } else {
            selectedEntry = entries.length - 1;
        }
    }

    /**
     * When an entry is clicked
     */
    const dispatch = createEventDispatcher();
    function clickEntry(entry) {
        // Dispatch the selectEntry event
        dispatch("selectEntry", {
            entryValue: entry
        });
    }


</script>

<ul bind:this={ listElement }>
    {#each entries as entry, index}
        <li>
            <button on:click={ () => { clickEntry(entry) } } class:selected={ index == selectedEntry }>
                <span>{ entry }</span>
            </button>
        </li>
    {/each}
</ul>

<style>
    ul {
        background: #ccc;
        padding: 0;
        margin: 0;

        list-style: none;

        max-height: calc(32px * 7);
        overflow-y: auto;
        overflow-x: hidden;
    }

    li > button {
        margin: 0;
        padding: 0;
        cursor: pointer;

        background: none;
        border: none;

        display: block;
        width: 250px;
        max-width: 250px;

        text-align: left;
        text-overflow: ellipsis;
    }

    li > button:hover, li > button.selected {
        background: #ddd;
    }

    li > button > span {
        display: block;
        max-width: 250px;
        padding: 0.5rem;

        overflow: hidden;
        white-space: nowrap;

        text-overflow: ellipsis;
    }
</style>