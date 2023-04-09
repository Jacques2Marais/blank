<script>
    import FileTree from "./FileTree.svelte";
    import { editor } from "../edit-view/edit";

    let fileTree = null;

    function chooseDirectory () {
        fileTree.chooseDirectory();
    }

    function newFile () {
        $editor.openInNewTab();
    }
</script>

<main>
    <button on:click={ chooseDirectory }>Choose Directory</button>
    <button on:click={ newFile }>Create New File</button>
    <FileTree bind:this={ fileTree } />
</main>

<style>
    main {
        display: flex;
        flex-direction: column;

        padding: 1em;
        text-align: center;
    }
</style>