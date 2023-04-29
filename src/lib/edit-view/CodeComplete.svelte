<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    function clickEntry(entry) {
        dispatch("selectEntry", {
            entryValue: entry
        });
    }

    export let entries = [];
    export let selectedEntry = -1;

    let listElement = null;

    $: if (selectedEntry > 6 && listElement) {
        listElement.scrollTop = (selectedEntry - 6) * 32;
    } else if (listElement) {
        listElement.scrollTop = 0;
    }
</script>

<ul bind:this={ listElement }>
    {#each entries as entry, i}
        <li><button on:click={ () => {clickEntry(entry) } } class:selected={ i == selectedEntry }><span>{ entry }</span></button></li>
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