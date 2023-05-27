<script>
    import Tab from "./utils/tab.js";

    let tabIndex = 0;
    export let tabs = [new Tab()];
    export let tab = tabs[tabIndex];
    $: tab = tabs[tabIndex];

    function addTab() {
        tabs.push(new Tab());
    }

    function removeTab(index) {
        tabs.splice(index, 1);
        tabs = tabs;
    }

    function setTab(index) {
        tabIndex = index;
    }
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
    @import "/src/lib/utils/colors.css";

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