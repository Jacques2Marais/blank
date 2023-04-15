<script>
    import { EditorState } from '@codemirror/state'
    import { EditorView, keymap } from '@codemirror/view'
    import { javascript } from "@codemirror/lang-javascript";

    import { save } from "@tauri-apps/api/dialog";
    import { invoke } from "@tauri-apps/api/tauri"
    import { editorID, setEditorID, fileToOpen } from "../stores/edit";
    import { typeFromPath } from "./filetypes";
    import { editorTools } from "./editorTools";
    import EmptyState from "../utilities/EmptyState.svelte";

    // Internal variables

    // Exported variables
    //export const language = "HTML"; // language of the code
    export let theme = "Solarized (light)"; // syntax highlighting theme
    export let id = 0; // id of the editor

    let activeEditorID = 0;
    editorID.subscribe((id) => {
        activeEditorID = id;
    });
    //export let value = ""; // editor content/value

    // Count the number of words in the inputted code
    /*$: invoke("count_words", { value }).then((res) => {
        numWords = res;
    });*/

    /* Tab functionality */
    // List of tabs in this editor
    let tabs = [
        {
            name: "index.html",
            content: "<h1>Hello world!</h1>",
            language: "HTML",
            syntaxHighlighted: "",
            path: ""
        }
    ];

    // Currently opened tab in this editor
    let currentTabID = 0;
    let currentTab;
    $: currentTab = tabs[currentTabID];

    // Check for incoming file open requests, and open them
    // if current editor is active. Don't act on
    // initialization of the Svelte store.
    let initial = true;
    fileToOpen.subscribe((path) => {
        if (activeEditorID == id && !initial) {
            openInNewTab(path);
        }

        initial = false;
    });

    // Check if tab with given path is in list of tabs,
    // and if it is return its id
    function tabExists(path) {
        if (path == "" || path == undefined) {
            return -1;
        }

        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].path == path) {

                return i;
            }
        }

        return -1;
    }

    // Load tab given its id
    function loadTab(tabID) {
        currentTabID = tabID;
    }

    // Close tab given its id
    function closeTab(tabID) {
        if (currentTabID >= tabID) {
            currentTabID--;
        }

        console.log("Closing tab", tabID);

        tabs = tabs.filter((tab, i) => {
            return i != tabID;
        });

        console.log(tabs);
    }

    // Open a new tab in the current editor
    function openNewTab(name = "Untitled") {
        setEditorID(id);

        tabs.push({
            name,
            content: "",
            language: "Text",
            syntaxHighlighted: "",
            path: ""
        });

        currentTabID = tabs.length - 1;
    }

    // Open file in current tab
    export function openInCurrentTab(file = "") {
        setEditorID(id);

        loadFile(file);
    }

    // Open file in new tab
    export function openInNewTab(file = "") {
        let tab = tabExists(file);
        console.log("Tab:", tab);
        if (tab > -1) {
            loadTab(tab);
            return;
        }

        openNewTab(file);

        if (file != "") {
            openInCurrentTab(file);
        }

        console.trace();
    }

    /* File functionality */

    // Internal variables
    //let currentFilePath = ""; // path to the file being edited in the current tab

    // Save file in current tab
    function saveFile() {
        if (tabs[currentTabID].path.length == 0) {
            // if no path is set, open a save dialog to save new file
            save({
                filters: [
                    { name: "HTML", extensions: ["html"] },
                    { name: "CSS", extensions: ["css"] },
                    { name: "JavaScript", extensions: ["js"] },
                    { name: "All Files", extensions: ["*"] }
                ]
            }).then((res) => {
                if (res) {
                    tabs[currentTabID].path = res;
                    invoke("save_file", { path: tabs[currentTabID].path, contents: tabs[currentTabID].content });
                }
            });
        } else {
            // if path is set, save file to that path
            invoke("save_file", { path: tabs[currentTabID].path, contents: tabs[currentTabID].content });
        }
    }

    // Load file in current tab
    function loadFile(path) {
        invoke("load_file", { path }).then((res) => {
            tabs[currentTabID].content = res;
            tabs[currentTabID].path = path;
            currentTab.name = path.split("/").pop();
            currentTab.language = typeFromPath(path);
        });
    }

    /* Editor functionality */
    const state = EditorState.create({  })

    const view = new EditorView({ state })

    $: if (currentTabID) document.querySelector('#editor').append(view.dom)
</script>

<main>
    <div class="tabs">
        { #if currentTabID > -1 }
            <div class="tab">
                <div id="editor"></div>
            </div>
        { :else }
            <EmptyState text="No tabs open in this editor!"/>
        { /if }
    </div>
    <div class="details">
        <span class="tabLanguage">
            { tabs[currentTabID].language }
        </span>
        <div class="tabsNav">
            {#each tabs as tab, i}
                <span class="tabControl" class:active={ i == currentTabID }>
                    <button class="tabName" on:click={ () => { loadTab(i) } }>{ tab.name }
                    </button><button class="tabClose" on:click={ () => { closeTab(i) } }>x</button>
                </span>
            {/each}
            <button class="tabAdd" on:click={ () => { openNewTab() } }>+</button>
        </div>
    </div>
</main>

<style>
    main {
        height: 100%;
        width: 100%;
        position: relative;
    }

    div.details {
        background: #ddd;
        line-height: 2em;

        padding: 0 1em;

        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
    }

    div.tabs {
        height: calc(100% - 38px);
        width: 100%;
    }

    span.tabLanguage {
        font-size: 0.8em;
        color: #333;

        position: relative;
        top: 0.2em;
    }

    div.tabsNav {
        float: right;
    }

    div.tabsNav span.tabControl {
        display: inline-block;

        margin: 0;
        padding: 0.2em 0.5em;

        cursor: pointer;
    }

    div.tabsNav span.tabControl:not(.active):hover {
        background: #ccc;
    }

    div.tabsNav span.tabControl.active {
        background: #bbb;
    }

    div.tabsNav button {
        border: 0;
        cursor: pointer;
    }

    div.tabsNav button.tabName {
        background: transparent;
        margin: 0;
        padding: 0 0.4em;
    }

    div.tabsNav span.tabControl button.tabClose {
        font-size: 0.7em;
        background: #aaa;

        position: relative;
        top: -2px;
    }

    div.tabsNav span.tabControl button.tabClose:hover {
        background: #9f9f9f;
    }

    div.tabsNav button.tabAdd {
        margin-left: 0.5em;
    }

    div.tabsNav button.tabAdd:hover {
        background: #b0b0b0;
    }
</style>

