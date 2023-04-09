<script>
    import { invoke } from "@tauri-apps/api/tauri";
    import DirectoryView from "./DirectoryView.svelte";
    import { setRenderedURL } from "../edit-view/render";
    import { editor } from "../edit-view/edit";

    // The directory to display on current level
    export let directory = "";

    // Extract the directory name from the path
    let directoryName = "";
    $: directoryName = directory.split("/").at(-2);

    // The list of files in the current directory
    let files = [];

    // Are the files under the current directory visible?
    let directoryVisible = false;

    // Toggle the visibility of the files in the directory
    function toggle() {
        if (!directoryVisible) {
            load();
        } else {
            files = [];
        }

        directoryVisible = !directoryVisible;
    }

    // Load the list of files in the directory from the backend
    export function load() {
        invoke("get_files", { directory }).then((res) => {
            files = res;
        });
    }

    function fileClick(file) {
        setRenderedURL(file);

        if ($editor) {
            $editor.openInNewTab(file);
        }
    }
</script>

<li>
    <span on:click={ toggle }>
        <span class="toggleOpenIcon" class:down={ directoryVisible }>&#8227;</span>
        { directoryName }
    </span>
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

<style>
    ul {
        padding: 0 0 0 1.5em;
    }

    li {
        list-style-type: none;
        text-align: left;
    }

    span {
        cursor: pointer;
        text-overflow: ellipsis;

        display: inline-block;
    }

    span:not(.toggleOpenIcon) {
        width: 100%;
    }

    span.toggleOpenIcon {
        transform: rotate(0deg);
        transition: transform 0.15s;

        font-size: 1.2em;

        position: relative;
        top: 1px;
    }

    span.toggleOpenIcon.down {
        transform: rotate(90deg);
    }
</style>