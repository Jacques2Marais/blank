<script>
    import { open } from '@tauri-apps/api/dialog';

    import DirectoryView from "./DirectoryView.svelte";

    let directory = "";
    let directoryView = null;
    export let editor = null;

    export function chooseDirectory () {
        open({
            multiple: false,
            directory: true,
        }).then((selected) => {
            if (Array.isArray(selected)) {
                directory = selected[0] + "/";
            } else if (selected) {
                directory = selected + "/";
            } else {
                return;
            }

            setTimeout(() => {
                directoryView.load();
            });
        });
    }
</script>

<div id="filetree">
    <ul>
        <DirectoryView directory={ directory } editor={ editor } bind:this={ directoryView } />
    </ul>
</div>