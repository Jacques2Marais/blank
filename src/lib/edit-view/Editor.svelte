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
    import { each } from "svelte/internal";
    import { get } from "svelte/store";

    // Internal variables
    let textarea = null;
    let preElement = null;
    let lineNums = null;

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
            path: "",
            lineNumbers: 0,
            saved: false
        }
    ];

    // Currently opened tab in this editor
    let currentTabID = 0;
    // let cu;
    // $: if (currentTabID > -1) {
    //     tabs[currentTabID] = tabs[currentTabID];
        
    //     syntaxHighlight();
    //     getCurrentLineCount();
    // }

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

    // Get name of file given path
    function getFileNameFromPath(path) {
        return path.split("/").at(-1);
    }

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

    function tabUpdated() {
        syntaxHighlight();
        updateCurrentLineCount();
    }

    // Load tab given its id
    function loadTab(tabID) {
        currentTabID = tabID;

        tabUpdated();
    }

    // Close tab given its id
    function closeTab(tabID) {
        if (currentTabID >= tabID) {
            currentTabID--;
        }

        tabs = tabs.filter((tab, i) => {
            return i != tabID;
        });

        tabs = tabs;
    }

    // Open a new tab in the current editor
    function openNewTab(name = "Untitled") {
        setEditorID(id);

        tabs.push({
            name,
            content: "",
            language: "Text",
            syntaxHighlighted: "",
            path: "",
            lineNumbers: 0,
            saved: false
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
        if (tab > -1) {
            loadTab(tab);
            return;
        }

        openNewTab(getFileNameFromPath(file));

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
        if (!tabs[currentTabID]) {
            return;
        }

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
    // Sync the scroll values of the textarea and the pre element
    function scrollSync() {
        if (!textarea || !preElement || !lineNums) {
            return;
        }

        preElement.scrollTop = textarea.scrollTop;
        preElement.scrollLeft = textarea.scrollLeft;

        lineNums.scrollTop = textarea.scrollTop;
    }

    let lineNumbers = [];

    // Update the current line numbers with word wrapping
    function updateCurrentLineCount() {
        lineNumbers = [];
        const lines = tabs[currentTabID].content.split("\n");
        let currentNum = 1;
        let currentLine = 0;

        for (let i = 0; i < lines.length; i++) {
                lineNumbers[currentLine] = "" + currentNum;
                currentLine += 1;
                const numLines = Math.floor(lines[i].length / 80);

                for (let j = 0; j < numLines; j++) {
                    lineNumbers[currentLine] = " ";
                    currentLine += 1;
                }

            currentNum++;
        }
    }

    // Sync the scroll values when the textarea is scrolled
    function textareaChange(e) {
        scrollSync();
        tabUpdated();
        autoComplete(e);

        // Tab is no longer saved
        tabs[currentTabID].saved = false;
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
                    tabs[currentTabID].name = res.split("/").pop();
                    tabs[currentTabID].language = typeFromPath(res);
                    invoke("save_file", { path: tabs[currentTabID].path, contents: tabs[currentTabID].content });

                    tabs[currentTabID].saved = true;
                }
            });
        } else {
            // if path is set, save file to that path
            console.log(tabs[currentTabID].path);
            invoke("save_file", { path: tabs[currentTabID].path, contents: tabs[currentTabID].content });

            tabs[currentTabID].saved = true;
        }
    }

    // Load file in new tab
    function loadFile(path) {
        invoke("load_file", { path }).then((res) => {
            tabs[currentTabID].content = res;
            tabs[currentTabID].path = path;
            tabs[currentTabID].name = getFileNameFromPath(path);
            tabs[currentTabID].language = typeFromPath(path);
            tabs[currentTabID].lineNumbers = res.split("\n").length;
            tabs[currentTabID].saved = true;

            tabUpdated();
        });
    }

    /* Editing tools */
    // Trigger hover events on the textarea on the underlying pre element
    function checkHover(e) {
        let element = document.elementsFromPoint(e.clientX, e.clientY)[1];

        // The element is a syntax highlighted span
        if (element.tagName == "SPAN") {
            editorTools.generalHover(element, tabs[currentTabID].language);
        } else {
            editorTools.generalHover(null, tabs[currentTabID].language);
        }
    }

    // Handle textarea key down presses
    function textareaKeydown(event) {
        const continueWithEditing = handleAutoCompleteKeyDown(event);

        if (!continueWithEditing) {
            return;
        }
        
        editorTools.typing(textarea, event, tabs[currentTabID].language);
    }

    // Handle textarea key up presses
    function textareaKeyup(event) {
        if (event.key == "ArrowDown" || event.key == "ArrowUp" 
            || event.key == "ArrowLeft" || event.key == "ArrowRight"
            || event.key == "Home" || event.key == "End"
            || event.key == "PageUp" || event.key == "PageDown"
            || event.key == "Backspace" || event.key == "Delete") 
        {
            // Arrow keys, home, end, page up/down, backspace, and delete change caret position
            caretMove();
        } else if (event.key == "s" && event.ctrlKey) {
            // Ctrl + S to save
            saveFile();
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
        autoCompleteEntries = editorTools.autoComplete(event, tabs[currentTabID].language);

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
        editorTools[tabs[currentTabID].language + "Selection"](textarea, textarea.value, textarea.selectionStart, textarea.selectionEnd);
    }*/

    // Handle textarea caret movement
    function caretMove(e) {
        editorTools.generalCaret(textarea, textarea.value, textarea.selectionEnd, tabs[currentTabID].language);

        // Trigger toolbar toggle
        toolbarToggle(e);
    }

    /* Toolbar functions */
    let showToolbar = false;
    let toolbarItems = [];
    let toolbarPosition = { x: 0, y: 0 };

    // Show/hide toolbar based on context
    function toolbarToggle(e) {
        [showToolbar, toolbarItems, toolbarPosition] = editorTools.generalToolbar(tabs[currentTabID].language, textarea, textarea.value, textarea.selectionEnd);

        console.log(toolbarPosition, showToolbar);
    }
</script>

{ @html "<" + "style>" + themeCSS + "</style>" }

<!--svelte:document on:selectionchange={ selectionChange } /-->


<span></span>
<main>
    <div class="tabs">
        { #if currentTabID > -1 }
            <div class="toolbar">
                {#each toolbarItems as item, i}
                    <span class="toolbarItem" on:click={ () => { toolbarClick(i) } }>{ item }</span>
                {/each}
            </div>
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
            <div class="linenums" bind:this={ lineNums }>
                {#each lineNumbers as number, i}
                    <span>{number}</span>
                {/each}
            </div>
        { :else }
            <EmptyState text="No tabs open in this editor!"/>
        { /if }
    </div>
    <div class="details">
        {#if tabs[currentTabID]}
        <span class="tabLanguage">
            { tabs[currentTabID].language }
        </span>
        {/if}
        <div class="tabsNav">
            {#each tabs as tab, i}
                <span class="tabControl" class:active={ i == currentTabID }  on:click={ () => { loadTab(i) } }>
                    <button class="tabName">{#if tab.saved}{ tab.name }{:else}{ tab.name }<span class="unsaved">*</span>{/if}
                    </button><button class="tabClose" on:click={ (e) => { closeTab(i); e.stopPropagation() } }>x</button>
                </span>
            {/each}
            <button class="tabAdd" on:click={ () => { openNewTab() } }>+</button>
        </div>
    </div>
</main>

<style>
    @import "/fonts/SpaceMono.css";
    @import "/fonts/Montserrat.css";

    :root {
        --toolbar-space: 3em;
        --linenums-width: 50px;
        --linenums-space: 65px;
    }

    main {
        height: 100%;
        width: 100%;
        position: relative;

        font-family: 'Montserrat', sans-serif;
    }

    div.details {
        background: #f4f4f4;
        line-height: 2em;

        padding: 0.5em 1em;

        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
    }

    div.tabs {
        height: calc(100% - 51px);
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

        margin: 0 0.3em;
        padding: 0em 0.5em;
        border-radius: 0.3em;

        cursor: pointer;
    }

    div.tabsNav span.tabControl:hover, div.tabsNav span.tabControl.active:hover, div.tabsNav button.tabAdd:hover {
        background: #d7d7d7;
    }

    div.tabsNav span.tabControl.active, div.tabsNav button.tabAdd {
        background: #e3e3e3;
    }

    div.tabsNav button {
        border: 0;
        cursor: pointer;

        font-family: 'Montserrat', sans-serif;
        font-weight: 400;
        color: #555;

        position: relative;
    }

    div.tabsNav button.tabName {
        background: transparent;
        margin: 0;
        padding: 0 0.4em;
        padding-left: 0.8em;
    }

    div.tabsNav button span.unsaved {
        color: #999;
        position: absolute;
        top: 3px;
        left: 0px;
    }

    div.tabsNav span.tabControl button.tabClose {
        font-size: 0.8em;
        background: none;

        position: relative;
        top: -2px;
        padding: 0em 0.15em;
    }

    div.tabsNav span.tabControl button.tabClose:hover::before {
        content: "x";
        position: absolute;
        left: 0;
        right: 0;

        background: #ccc;
        border-radius: 0.3em;
    }

    div.tabsNav button.tabAdd {
        margin-left: 0.1em;
        padding: 0.45em 0.6em;

        border-radius: 0.3em;
    }

    textarea, pre {
        /* Both elements need the same text and space styling so they are directly on top of each other */
        display: block;
        
        margin: 0;
        padding: 10px 15px;
        padding-left: var(--linenums-space);
        padding-top: 0;
        margin-top: var(--toolbar-space);
        border: 0;
        height: calc(100% - var(--toolbar-space));
        box-sizing: border-box;

        position: absolute;
        top: 0;
        left: 0;

        overflow: auto;
        white-space: pre-wrap;
    }

    pre {
        width: calc(100%);
        overflow: hidden;
    }

    textarea {
        width: calc(100%);
    }

    textarea, pre, pre * {
        /* Also add text styles to highlighing tokens */
        font-size: 15px;
        font-family: 'SpaceMono', monospace;
        line-height: 20px;
        tab-size: 2;
    }

    .linenums {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;

        max-height: 100%;

        width: 50px;
        padding: 10px 0;
        padding-top: var(--toolbar-space);
        z-index: 3;

        cursor: default;

        background: #fafafa;
        color: #777;

        overflow: hidden;
    }

    .linenums span {
        display: block;
        font-size: 15px;
        font-family: 'SpaceMono', monospace;
        line-height: 20px;
        height: 20px;

        width: 35px;
        text-align: right;
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

    pre * {
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    /* Autocomplete */
    .autocomplete {
        position: absolute;
        z-index: 2;
    }

    /* Inline toolbar */
    .toolbar {
        position: absolute;
        z-index: 2;
        top: 0;
        left: var(--linenums-width);
        box-sizing: border-box;

        padding: 0.5em 0.75em;
        background: #f4f4f4;
        border-bottom: 1px solid #ccc;
    }
</style>

