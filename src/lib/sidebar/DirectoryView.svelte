<script>
    import { invoke } from "@tauri-apps/api/tauri";
    import DirectoryView from "./DirectoryView.svelte";
    import { setRenderedURL } from "../edit-view/render";

    export let directory = "";
    export let editor = null;

    let files = [];

    function toggle() {
        if (files.length == 0 && directory.length > 0) {
            load();
        } else {
            files = [];
        }
    }

    export function load() {
        if (directory.length > 0) {
            invoke("get_files", { directory }).then((res) => {
                files = res;
            });
        }
    }

    function fileClick(file) {
        setRenderedURL(file);

        console.log(editor);

        if (editor) {
            editor.openInNewTab(file);
        }
    }
</script>

<li>
    <span on:click={ toggle } on:keydown={ (e) => { if (e.code == "Space") toggle() } }>{ directory == "" ? "No directory selected.": directory.split("/").at(-2) }</span>
    <ul>
        {#each files as file}
            { #if file.endsWith("/") }
                <DirectoryView directory={ file } />
            {:else}
                <li><span on:click={ () => { fileClick(file) } }>{ file.split("/").pop() }</span></li>
            {/if}
        {/each}
    </ul>
</li>