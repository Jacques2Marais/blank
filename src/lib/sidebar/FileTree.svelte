<script>
    import { open } from '@tauri-apps/api/dialog';

    import DirectoryView from "./DirectoryView.svelte";

    // The path of the top directory
    let directory = "/home/jacques/apps/blanktest";

    setTimeout(() => {
        topDirectoryView.load();
    });

    // The top DirectoryView component
    let topDirectoryView = null;

    // Open a directory selection dialog and load the selected directory
    export function chooseDirectory () {
        open({
            multiple: false,
            directory: true,
        }).then((selected) => {
            if (Array.isArray(selected)) {
                /* For Svelte type system purposes (unused) */
                directory = selected[0] + "/";
            } else if (selected) {
                directory = selected + "/";
            } else {
                /* No directory selected */
                return;
            }

            setTimeout(() => {
                topDirectoryView.load();
            });
        });
    }
</script>

<div id="fileTree">
    <ul>
        {#if directory.length > 0}
            <DirectoryView directory={ directory } bind:this={ topDirectoryView } />
        {:else}
            <li><span on:click={ chooseDirectory }>No directory selected.</span></li>
        {/if}
    </ul>
</div>

<style>
    #fileTree {
        overflow: auto;
        max-height: 100%;
        
        padding: 1em;
    }

    ul {
        list-style-type: none;
        margin: 1em 0;
        padding: 0;
    }
</style>