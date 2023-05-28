<script>
    import InputArea from "./parts/InputArea.svelte";
    import Tabs from "./parts/Tabs.svelte";
    import EmptyState from "../../utils/EmptyState.svelte";
    import Tab from "./parts/utils/tab";

    export let id = 0;

    let tab = null;
    let value = "";
    let language = null;

    /**
     * Load the tab's content into the editor
     * @param {Tab} tab The tab to load
     */
    function loadTab(tab) {
        if (tab == null) return;

        value = tab.file.content;
        language = tab.file.language;
    }
    $: loadTab(tab);
</script>

<div class="blank-editor">
    <div class="blank-editor-top">
        {#if tab == null}
            <EmptyState/>
        {:else}
            <InputArea bind:value={ value } bind:language={ language } />
        {/if}
    </div>
    <div class="blank-editor-bottom">
        <Tabs bind:tab />
    </div>
</div>

<style>
    @import "/fonts/Montserrat.css";

    .blank-editor {
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;

        font-family: 'Montserrat', sans-serif;
    }

    .blank-editor-top {
        flex: 1 1 auto;
        max-height: calc(100% - 2.5em);
    }

    .blank-editor-bottom {
        display: flex;
        flex-direction: row;

        height: 2.5em;
        padding: 0 0.5em;

        background: #f4f4f4;
    }
</style>