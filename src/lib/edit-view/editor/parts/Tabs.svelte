<script>
    import File from "../../../utils/file.js";
    import Tab from "./utils/tab.js";
    import { fileToOpen } from "../../../stores/edit.js";

    let tabIndex = 0;
    export let tabs = [];
    export let tab = null;
    $: tab = tabs[tabIndex];

    function addTab(tab = new Tab(), setActive = true) {
        tabs.push(tab);
        
        tab.file.onLoad(() => {
            tabs = tabs;

            if (setActive) {
                setTab(tabs.length - 1);
                console.log(tab.content);
            }
        });
    }

    function removeTab(index) {
        tabs.splice(index, 1);
        tabs = tabs;

        setTab(index - 1);
    }

    function setTab(index) {
        tabIndex = index;
    }

    // Subscribe to fileToOpen store
    let initial = true;
    fileToOpen.subscribe((path) => {
        const file = new File(path);
        const tab = new Tab({ file });
        
        /*if (activeEditorID == id && !initial) {
            openInNewTab(path);
        }*/

        if (!initial) {
            addTab(tab);
        }

        initial = false;
    });
</script>

<div class="blank-editor-tabs">
    {#if tabs.length == 0}
        <div></div>
    {/if}

    {#each tabs as currentTab, i}
        <div class="blank-editor-tab" class:selected={ tabIndex == i } on:click={ () => { setTab(i); } }>
            <span class="blank-editor-tab-name">{ currentTab.name }</span>
            <span class="blank-editor-tab-close" on:click={ () => { removeTab(i); } }>&times;</span>
        </div>
    {/each}
</div>

<style>
    @import "../../../utils/colors.css";

    .blank-editor-tabs {
        height: 2.5em;

        flex: 1;

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: end;


        color: var(--color-dark-grey);
    }

    .blank-editor-tab {
        display: inline-block;

        margin: 0 0.25em;
        padding: 0.25em 0.5em;
        border-radius: 0.3em;

        cursor: pointer;
        background-color: var(--color-lighter-grey);
    }
</style>