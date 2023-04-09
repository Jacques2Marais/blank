<script>
    import EmptyState from "../utilities/EmptyState.svelte";

    import { renderedURL } from "./render";
    import { invoke } from "@tauri-apps/api/tauri"
    import { typeFromPath } from "./filetypes";

    let content = "";
    let frame = null;
    let interval = null;

    $: if (frame != null) {
        frame.srcdoc = content;
    }

    renderedURL.subscribe((url) => {
        if (typeFromPath(url) != "HTML") {
            return;
        }

        if (interval != null) {
            clearInterval(interval);
        }

        interval = setInterval(() => {
            invoke("inline_html", { file: url }).then((res) => {
                content = res;
            });
        }, 1000);
    });
</script>
{#if content.length > 0}
    <iframe frameborder="0" bind:this={ frame } title="page preview frame"></iframe>
{:else}
    <div id="nopage">
        <EmptyState text="No page selected for preview."/>
    </div>
{/if}

<style>
    iframe {
        width: 100%;
        height: 100%;
    }

    #nopage {
        height: 100%;
    }
</style>