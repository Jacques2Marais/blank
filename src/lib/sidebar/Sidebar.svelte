<script>
    import FileTree from "./FileTree.svelte";
    import { openFile } from "../stores/edit";

    let fileTree = null;

    function chooseDirectory () {
        fileTree.chooseDirectory();
    }

    function newFile () {
        openFile();
    }
</script>

<main>
    <ul class="menu">
        <li><button on:click={ chooseDirectory }>
            <span class="material-symbols-outlined icon">
                folder_open
            </span>
        </button></li>
        <li><button on:click={ newFile }>
            <span class="material-symbols-outlined icon">
                note_add
            </span>
        </button></li>
    </ul>
    <FileTree bind:this={ fileTree } />
</main>

<style>
    @import "/fonts/Montserrat.css";

    main {
        display: flex;
        flex-direction: column;

        padding: 1em;
        text-align: center;

        font-family: 'Montserrat', sans-serif;
    }

    ul.menu {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        list-style: none;
        padding: 0;
        margin: 0;
    }

    ul.menu button {
        border: 0;
        cursor: pointer;

        color: #555;
        background: #e3e3e3;

        display: inline-block;
        margin: 0 0.3em;
        padding: 0.5em;
        border-radius: 0.3em;
        cursor: pointer;
    }

    ul.menu button:hover {
        background: #d7d7d7;
    }

    div.tabsNav button.tabName {
        background: transparent;
        margin: 0;
        padding: 0 0.4em;
    }
</style>