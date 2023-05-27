<script>
    import InputArea from "./parts/InputArea.svelte";
    import Tabs from "./parts/Tabs.svelte";

    export let id = 0;
</script>

<div class="blank-editor">
    <div class="blank-editor-top">
        <InputArea />
    </div>
    <div class="blank-editor-bottom">
        <Tabs />
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