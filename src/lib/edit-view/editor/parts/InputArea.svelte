<script>
    import LineNumbers from "./LineNumbers.svelte";
    import Prism from 'prismjs';
    import 'prism-svelte';

    // Language tools
    import Language from "../../../language-tools/language.js";
    import TypingEvent from "../../../language-tools/events/typing.js";
    import EditorToolbar from "./utils/toolbar";

    // Autocomplete
    import CodeComplete from "./CodeComplete.svelte";
    import CodeCompletionController from "./utils/codecomplete";

    // Shortcut Keys
    import EditorShortcuts from "./utils/shortcuts.js";

    import { createEventDispatcher } from "svelte/internal";
    const dispatch = createEventDispatcher();

    // Elements
    let pre = null;
    let textarea = null;
    let lineNumbersDiv = null;
    let codeCompleteComponent;

    // Props
    export let value = "";
    export let theme = "Solarized (light)";
    export let language = "Text";
    export let editorID = 0;

    // Other variables
    let syntaxHighlightedValue = "";
    let lineNumbersArray = ["1"];
    let languageTools;
    let toolbar = null;

    let codeComplete;
    let codeCompleteOptions = { show: false, left: 0, top: 0, entries: [], value: "" };

    let shortcuts;
    $: if (textarea) {
        shortcuts = new EditorShortcuts(editorID, textarea);
    }

    // GlobalHistory
    import GlobalHistory from "../../../utils/GlobalHistory.js";
    import Toolbar from "./Toolbar.svelte";

    $: if (textarea) {
        GlobalHistory.addEditor(editorID, textarea);
    }

    export const tabLoaded = function() {
        GlobalHistory.refreshEditor(editorID, textarea);
    };
    

    // Events
    function keydown(event) {
        // If shortcut key was pressed, return
        if (shortcuts.shortcut(event)) {
            event.preventDefault();
            textarea.dispatchEvent(new Event("input"));

            return;
        }

        const typingEvent = new TypingEvent({
            textarea,
            event,
            editorID
        });

        if (event.key == "Enter" && codeCompleteOptions.show) {
            event.preventDefault();

            const lastWord = languageTools.context.getContext("last-word");
            const completion = codeCompleteOptions.value.substring(lastWord.length);

            typingEvent.utils.insertAtCaret(completion, "end");
            typingEvent.utils.trigger("input");
            codeCompleteOptions.show = false;

            return;
        } else if (event.key == "ArrowDown" && codeCompleteOptions.show) {
            event.preventDefault();
            codeCompleteComponent.nextEntry();

            return;
        } else if (event.key == "ArrowUp" && codeCompleteOptions.show) {
            event.preventDefault();
            codeCompleteComponent.previousEntry();

            return;
        } else if (event.key == "Escape" && codeCompleteOptions.show) {
            event.preventDefault();
            codeCompleteOptions.show = false;

            return;
        }

        if (typingEvent.deletedCharacter) {
            GlobalHistory.addHistory(editorID, {
                type: "delete",
                text: typingEvent.deletedCharacter,
                start: typingEvent.deletedIndex,
                end: typingEvent.deletedIndex
            });
        }

        languageTools.typing(typingEvent);
        codeCompletion(typingEvent);
    }

    function keyup() {

    }

    function input(event) {
        valueChanged();

        if (event.inputType == "insertText") {
            GlobalHistory.addHistory(editorID, {
                type: "insert",
                text: event.data,
                start: textarea.selectionEnd - event.data.length,
                end: textarea.selectionEnd
            });
        }
    }

    function focus() {
        dispatch("focus");
    }

    function mouseup() {

    }

    function paste() {

    }

    function scroll() {
        syncScroll();
    }

    function mousemove() {

    }

    function mousedown() {
        codeCompleteOptions.show = false;
    }

    // Functions
    /**
     * Called when the value of the textarea changes
     */
    function valueChanged() {
        setLineNumbersArray();
        syntaxHighlight();
    }

    /** Execute code completion */
    $: if (textarea) {
        codeComplete = new CodeCompletionController(textarea);
    }

    function codeCompletion(typingEvent) {
        if (!codeComplete) {
            return;
        }

        codeComplete.moveToCaret();
        codeComplete.entries = languageTools.codeComplete(typingEvent);
        codeCompleteOptions = codeComplete.options;
    }

    /** 
     * Update the line numbers array; insert empty spaces for lines that are wrapped
     * @param {boolean} wrap Whether or not to insert empty spaces for wrapped lines
    */
    function setLineNumbersArray(wrap = true) {
        lineNumbersArray = [];
        
        const lines = value.split("\n");
        let currentNumber = 1;
        let currentIndex = 0;

        for (let line = 0; line < lines.length; line++) {
            lineNumbersArray[currentIndex] = "" + currentNumber;
            currentIndex++;

            if (wrap) {
                const numWraps = Math.floor(lines[line].length / 76);
                for (let j = 0; j < numWraps; j++) {
                    lineNumbersArray[currentIndex] = "&nbsp;";
                    currentIndex++;
                }
            }

            currentNumber++;
        }
    }

    /**
     * Syntax highlight the value of the textarea
     */
    function syntaxHighlight() {
        if (language == "Text") {

            let lastNewLine = '';
            if (value.at(-1) == '\n') {
                lastNewLine = '<br/>&nbsp;';
            }

            syntaxHighlightedValue = escapeHTML(value) + lastNewLine;
            syncScroll();

            return;
        }

        const languageLowercase = language.toLowerCase();
        syntaxHighlightedValue = Prism.highlight(value, Prism.languages[languageLowercase], languageLowercase);
    }

    /**
     * Escape HTML: replace &, <, >, ", ' with their HTML entities
     * @param {string} unsafeHTML
     * @returns {string} Escaped HTML
     */
    function escapeHTML(unsafeHTML) {
        return unsafeHTML
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Sync the scroll of the textarea and the pre
     */
    function syncScroll() {
        if (!textarea || !pre || !lineNumbersDiv) {
            return;
        }

        setTimeout(() => {
            pre.scrollTop = textarea.scrollTop;
            pre.scrollLeft = textarea.scrollLeft;
            lineNumbersDiv.scrollTop = textarea.scrollTop;
        });
    }

    // Bindings
    function updateToolbar() {
        if (languageTools) {
            toolbar = languageTools.toolbar();
        } else {
            toolbar = null;
        }
    }

    $: if (Language.isSupported(language)) {
        import(`../../../language-tools/${language}/${language}.js`).then((module) => {
            languageTools = module.default;
            updateToolbar();
        });
    } else {
        console.log(`Language ${language} is not supported`);
        languageTools = null;
        updateToolbar();
    }

    /*let syntaxHighlightingThemeCSS = "";
    $: BackendComm.request("get_syntax_highlighted_theme_css", {
        theme
    }).then((response) => {
        syntaxHighlightingThemeCSS = response;
    });*/

    $: if (value != "") {
        valueChanged();
    }
</script>

<!-- Include the CSS of the current syntax highlighting theme
{ @html "<" + "style>" + syntaxHighlightingThemeCSS + "</style>" }-->
<svelte:head>
  <link href="../../../src/prism-themes/base16-ateliersulphurpool.light.css" rel="stylesheet" />
</svelte:head>

<main>
    <!--{#if toolbar}
        <div class="blank-editor-toolbar">
            <Toolbar bind:toolbar={ toolbar }/>
        </div>
    {/if}-->
    <div class="blank-editor-main">
        <div class="blank-editor-line-numbers-area">
            <LineNumbers bind:lineNumbersDiv={ lineNumbersDiv } bind:lineNumbersArray />
        </div>
        <div class="blank-editor-input-area">
            <pre bind:this={ pre } class="blank-editor-code"><code class="blank-editor-code">{ @html syntaxHighlightedValue }</code></pre>

            <textarea class="blank-editor-code" spellcheck="false" bind:this={ textarea } bind:value
                on:keydown={ keydown } on:mousemove={ mousemove } on:scroll={ scroll } on:input={ input }
                on:focus={ focus } on:mouseup={ mouseup } on:keyup={ keyup } on:paste={ paste } 
                on:mousedown={ mousedown }></textarea>
        </div>
    </div>
    {#if codeCompleteOptions.show}
        <div class="blank-editor-autocomplete" style="left: {codeCompleteOptions.left}; top: {codeCompleteOptions.top}">
            <CodeComplete bind:this={ codeCompleteComponent } 
                bind:entries={ codeCompleteOptions.entries } bind:value={ codeCompleteOptions.value } />
        </div>
    {/if}
</main>

<style>
    @import "./utils/variables.css";

    main {
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;

        position: relative;
    }

    .blank-editor-toolbar {
        flex: 0 0 auto;
        height: 2.5em;
    }

    .blank-editor-main {
        flex: 1 1 auto;
        max-height: calc(100% - 2.5em);

        display: flex;
        flex-direction: row;
    }

    .blank-editor-input-area {
        flex: 1 1 auto;
        height: 100%;
        position: relative;

        font-family: 'Montserrat', sans-serif;
    }

    .blank-editor-line-numbers-area {
        flex: 0 0 auto;
        height: 100%;

        position: relative;
    }

    .blank-editor-autocomplete {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
    }

    textarea, pre {
        /* Both elements need the same text and space styling so they are directly on top of each other */
        display: block;
        
        margin: 0;
        padding: 1em 1.5em;
        border: 0;
        height: 100%;
        box-sizing: border-box;

        position: absolute;
        top: 0;
        left: 0;

        overflow: auto;
        white-space: pre-wrap;

        width: 100%;
    }

    textarea, pre, pre * {
        /* Also add text styles to highlighing tokens */
        font-size: 15px;
        font-family: 'SpaceMono', monospace;
        line-height: 20px;
        tab-size: 2;
    }

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
</style>