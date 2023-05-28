<script>
    import EmptyState from "../utils/EmptyState.svelte";

    import { renderedURL } from "../stores/render";
    import { invoke } from "@tauri-apps/api/tauri";

    let content = "";
    let interval = null;

    // Update the iframe element's contents when the content variable changes
    let frame = null;
    $: if (frame) frame.srcdoc = content;

    // Update the content variable when the renderedURL changes, and
    // check for changes every second
    renderedURL.subscribe((url) => {
        // Clear the interval if it's already running
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