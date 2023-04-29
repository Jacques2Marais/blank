<script>
    import { save } from "@tauri-apps/api/dialog";
    import { invoke } from "@tauri-apps/api/tauri"
    import { editorID, setEditorID, fileToOpen } from "../stores/edit";
    import { typeFromPath } from "./filetypes";
    import { editorTools } from "./editorTools";
    import EmptyState from "../utilities/EmptyState.svelte";
    
    // Source: https://github.com/component/textarea-caret-position
    import { getCaretCoordinates } from "../utilities/getCaretPosition";
    import CodeComplete from "./CodeComplete.svelte";

    // Internal variables]
    let textarea = null;
    let preElement = null;

    // Exported variables
    export let theme = "Solarized (light)"; // syntax highlighting theme
    export let id = 0; // id of the editor

    let activeEditorID = 0;
    editorID.subscribe((id) => {
        activeEditorID = id;
    });

    /* Tab functionality */
    // List of tabs in this editor
    let tabs = [
        {
            name: "Untitled",
            content: "",
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

        syntaxHighlight();
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

    /* Syntax highlighting */
    let themeCSS = ""; // css for the syntax highlighting theme (classes with corresponding styles)

    // Load syntax highlighting theme's css
    invoke("load_syntax_highlight_theme_css", { theme }).then((res) => {
        themeCSS = res;
    });

    // Escape HTML code
    function escapeHTML(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Syntax highlight the code and sync the scroll values
    // TODO: split syntax highlighting into chunks (e.g. lines or blocks) to prevent lag
    function syntaxHighlight() {
        if (tabs[currentTabID].language == "Text") {
            tabs[currentTabID].syntaxHighlighted = escapeHTML(tabs[currentTabID].content);
            setTimeout(scrollSync);
            return;
        }

        invoke("syntax_highlight", {
            code: tabs[currentTabID].content,
            language: tabs[currentTabID].language,
        }).then((res) => {
            tabs[currentTabID].syntaxHighlighted = res;
            setTimeout(scrollSync);
        });
    }

    syntaxHighlight();


    /* Other functionality */
    // TODO: tab level should be based on the last line
    let tabLevel = 0; // indicates auto-indent level

    /*/ Handle some key presses in textarea
    /function tabCheck(e) {
        if (e.key == "Tab") {
            // tab => insert tab instead of shifting focus to next textarea
            e.preventDefault();

            let start = textarea.selectionStart;
            let end = textarea.selectionEnd;

            // set textarea value to: text before caret + tab + text after caret
            tabs[currentTabID].content = tabs[currentTabID].content.substring(0, start) + "\t" + tabs[currentTabID].content.substring(end);

            // put caret at right position again
            setTimeout(() => {textarea.selectionStart = textarea.selectionEnd = start + 1});

            // increase current tab level
            tabLevel++;
        } else if (e.key == "Enter") {
            setTimeout(() => {
                // TODO: fix auto-indentation
                let indent = "";

                for (let i = 0; i < tabLevel; i++) {
                    indent += "\t";
                }

                let start = textarea.selectionStart;
                let end = textarea.selectionEnd;
                //tabs[currentTab].content = tabs[currentTab].content.substring(0, start) + indent + tabs[currentTab].content.substring(end);

                setTimeout(() => {textarea.selectionStart = textarea.selectionEnd = start + tabLevel});
            });
        } else if (e.key == "s") {
            // ctrl + s => save file
            if (e.ctrlKey) {
                e.preventDefault();
                saveFile();
            }
        }
    }*/

    // Sync the scroll values of the textarea and the pre element
    function scrollSync() {
        if (!textarea || !preElement) {
            return;
        }

        preElement.scrollTop = textarea.scrollTop;
        preElement.scrollLeft = textarea.scrollLeft;
    }

    // Sync the scroll values when the textarea is scrolled
    function textareaChange(e) {
        scrollSync();

        syntaxHighlight();

        autoComplete(e);
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
                    currentTab.name = res.split("/").pop();
                    currentTab.language = typeFromPath(res);
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

            syntaxHighlight();
        });
    }

    /* Editing tools */
    // Trigger hover events on the textarea on the underlying pre element
    function checkHover(e) {
        let element = document.elementsFromPoint(e.clientX, e.clientY)[1];

        // The element is a syntax highlighted span
        if (element.tagName == "SPAN") {
            editorTools[currentTab.language](element);
        } else {
            editorTools[currentTab.language](null);
        }
    }

    // Handle textarea key down presses
    function textareaKeydown(event) {
        const continueWithEditing = handleAutoCompleteKeyDown(event);

        if (!continueWithEditing) {
            return;
        }
        
        editorTools[currentTab.language + "Typing"](textarea, event);
    }

    // Handle textarea key up presses
    function textareaKeyup(event) {
        if (event.key == "ArrowDown" || event.key == "ArrowUp" 
            || event.key == "ArrowLeft" || event.key == "ArrowRight"
            || event.key == "Home" || event.key == "End"
            || event.key == "PageUp" || event.key == "PageDown"
            || event.key == "Backspace" || event.key == "Delete") {
                caretMove();
        }
    }

    let autoCompleteX = 0;
    let autoCompleteY = 0;
    let showAutoComplete = false;
    let autoCompleteEntries = [];
    let autoCompleteIndex = 0;

    $: if (!showAutoComplete) {
        autoCompleteIndex = -1;
    }

    function handleAutoCompleteKeyDown(event) {
        // Down arrow focuses on autocomplete and goes down
        if (showAutoComplete && event.key == "ArrowDown") {
            event.preventDefault();

            autoCompleteIndex++;
            if (autoCompleteIndex >= autoCompleteEntries.length) {
                autoCompleteIndex = 0;
            }

            return false;
        } else if (showAutoComplete && event.key == "ArrowUp") {
            event.preventDefault();

            autoCompleteIndex--;
            if (autoCompleteIndex < 0) {
                autoCompleteIndex = autoCompleteEntries.length - 1;
            }

            return false;
        } else if (showAutoComplete && event.key == "Enter" && autoCompleteIndex >= 0) {
            event.preventDefault();

            if (autoCompleteIndex >= 0) {
                autoCompleteSelect({ detail: { entryValue: autoCompleteEntries[autoCompleteIndex] } });
            }

            return false;
        }

        return true;
    }

    function autoComplete(event) {
        const caretPosition = getCaretCoordinates(textarea, textarea.selectionEnd);

        autoCompleteX = caretPosition.left;
        autoCompleteY = caretPosition.top + caretPosition.height;
        autoCompleteEntries = editorTools[currentTab.language + "AutoComplete"](event);

        // Only show auto complete if entries exist for it
        if (autoCompleteEntries.length == 0) {
            showAutoComplete = false;
        } else {
            showAutoComplete = true;
        }
    }

    function autoCompleteSelect(event) {
        const restOfWord = event.detail.entryValue.substring(editorTools.currentWord.length);

        editorTools.insertAtCursor(textarea, textarea.selectionEnd, restOfWord, "end");
        editorTools.triggerInputEvent(textarea);

        showAutoComplete = false;
    }

    /*// Handle textarea selection changes
    function selectionChange(e) {
        editorTools[currentTab.language + "Selection"](textarea, textarea.value, textarea.selectionStart, textarea.selectionEnd);
    }*/

    // Handle textarea caret movement
    function caretMove(e) {
        editorTools[currentTab.language + "Caret"](textarea, textarea.value, textarea.selectionEnd);
    }
</script>

{ @html "<" + "style>" + themeCSS + "</style>" }

<!--svelte:document on:selectionchange={ selectionChange } /-->


<span></span>
<main>
    <div class="tabs">
        { #if currentTabID > -1 }
            <div class="tab">
                <pre bind:this={ preElement }><code>{ @html tabs[currentTabID].syntaxHighlighted }</code></pre>
                <textarea spellcheck="false" bind:value={ tabs[currentTabID].content }
                on:keydown={ textareaKeydown } bind:this={ textarea } on:mousemove={ checkHover }
                    on:scroll={ scrollSync } on:input={ textareaChange }
                    on:focus={ () => { setEditorID(id); } } on:mouseup={ caretMove } on:keyup={ textareaKeyup }
                    on:paste={ caretMove }></textarea>
            </div>
            <div class="autocomplete" style:left={ autoCompleteX + "px" } style:top={ autoCompleteY + "px" } 
                style:display={ showAutoComplete ? "block": "none" }>
                    <CodeComplete entries={ autoCompleteEntries } on:selectEntry={ autoCompleteSelect } selectedEntry={ autoCompleteIndex }/>
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

        position: relative;
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

    textarea, pre {
        /* Both elements need the same text and space styling so they are directly on top of each other */
        display: block;
        
        margin: 0;
        padding: 10px;
        border: 0;
        width: calc(100%);
        height: calc(100% - 2em);
        box-sizing: border-box;

        position: absolute;
        top: 0;
        left: 0;

        overflow: auto;
        white-space: pre-wrap;
    }

    textarea, pre, pre * {
        /* Also add text styles to highlighing tokens */
        font-size: 15px;
        font-family: monospace;
        line-height: 20px;
        tab-size: 2;
    }


/* Move the textarea in front of the result */

    textarea {
        z-index: 1;

        color: transparent;
        background: transparent;
        caret-color: black;
        outline: none;

        resize: none;
    }

    textarea::-webkit-scrollbar {
        display: none;
    }

    pre {
        z-index: 0;
    }

    /* Autocomplete */
    .autocomplete {
        position: absolute;
        z-index: 2;
    }
</style>

