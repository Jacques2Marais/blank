<script>
    import { invoke } from "@tauri-apps/api/tauri";
    import DirectoryView from "./DirectoryView.svelte";
    import { setRenderedURL } from "../stores/render";
    import { openFile } from "../stores/edit";
    import { typeFromPath } from "../edit-view/filetypes";

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

    function fileClick(path) {
        if (typeFromPath(path) == "HTML") {
            setRenderedURL(path);
        }

        openFile(path);
    }
</script>

<li>
    <span on:click={ toggle } class="directoryName">
        <!--span class="toggleOpenIcon" class:down={ directoryVisible }>&#8227;</span-->
        {#if directoryVisible}
            <span class="material-symbols-outlined icon">folder_open</span>
        {:else}
            <span class="material-symbols-outlined icon">folder</span>
        {/if}
        { directoryName }
    </span>
    <ul>
        {#each files as file}
            { #if file.endsWith("/") }
                <DirectoryView directory={ file } />
            {:else}
                <li>
                    <span on:click={ () => { fileClick(file) } }>
                        <span class="material-symbols-outlined icon">
                            description
                        </span>
                        { file.split("/").pop() }
                    </span>
                </li>
            {/if}
        {/each}
    </ul>
</li>

<style>
    ul {
        padding: 0 0 0 1em;
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

    span:not(.icon) {
        width: 100%;

        padding: 0.4em;
        box-sizing: border-box;
    }

    span:not(.toggleOpenIcon):hover {
        background-color: #eee;
    }

    .icon {
        color: #333;
        font-size: 1.2em;

        position: relative;
        top: 2.5px;

        margin-right: 0.2em;
    }
</style>