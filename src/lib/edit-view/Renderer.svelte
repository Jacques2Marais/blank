<script>
    import { renderedURL } from "./render";
    import { invoke } from "@tauri-apps/api/tauri"
    import { typeFromPath } from "./filetypes";

    let content = "";
    let frame = null;
    let interval = null;

    $: if (frame != null) {
        frame.srcdoc = content;
        /*frame.contentWindow.document.open();
        frame.contentWindow.document.write(content);
        frame.contentWindow.document.close();*/
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
                console.log("Content: ", content);
            });
        }, 1000);
    });
</script>

<iframe frameborder="0" bind:this={ frame }>Hi</iframe>

<style>
    iframe {
        width: 100%;
        height: 100%;
    }
</style>