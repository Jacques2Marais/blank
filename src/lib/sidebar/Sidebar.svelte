<script>
    import FileTree from "./FileTree.svelte";
    import { editorID } from "../edit-view/edit";

    let fileTree = null;

    export let editors = [];
    let editor = null;

    editorID.subscribe((id) => {
        editor = editors[id];
    });

    function chooseDirectory () {
        fileTree.chooseDirectory();
    }

    function newFile () {
        console.log(editor);
        editor.openInNewTab();
    }
</script>

<main>
    <button on:click={ chooseDirectory }>Choose Directory</button>
    <button on:click={ newFile }>Create New File</button>
    <FileTree bind:this={ fileTree } editor={ editor } />
</main>