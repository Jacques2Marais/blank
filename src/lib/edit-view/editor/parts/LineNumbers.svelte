<script>
    export let lineNumbersArray = [];
    export let lineNumbersDiv = null;
</script>

<div class="blank-editor-line-numbers" bind:this={ lineNumbersDiv }>
    {#each lineNumbersArray as number, i}
        <span class="blank-editor-line-number">{@html number}</span>
    {/each}
</div>

<style>
    @import "./utils/variables.css";

    .blank-editor-line-numbers {
        width: var(--line-numbers-width);
        max-height: 100%;
        min-height: 100%;
        position: relative;

        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-end;

        padding: 1em 1.2em;
        box-sizing: border-box;

        cursor: default;

        background: #fafafa;
        color: #777;

        overflow: hidden;
    }

    .blank-editor-line-number {
        display: block;
        font-size: 15px;
        font-family: 'SpaceMono', monospace;
        line-height: 20px;
        height: 20px;

        width: 35px;
        text-align: right;
    }
</style>