export default class TextUtils {
    #originalCaretPosition = -1;
    #textarea = null;
    #originalSelection = null;

    constructor (textarea) {
        this.#textarea = textarea;
        this.#originalCaretPosition = this.caretPosition;
        this.#originalSelection = this.selection;
    }

    /**
     * Get the original caret position when class was instantiated
     * @returns {number}
     * @readonly
     */
    get originalCaretPosition() {
        return this.#originalCaretPosition;
    }

    /**
     * Get original selection when class was instantiated
     * @returns {object} The original selection's start and finish
     * @readonly
     */
    get originalSelection() {
        return this.#originalSelection;
    }

    /**
     * Get the latest caret position
     * @returns {number}
     * @readonly
     */
    get caretPosition() {
        return this.textarea.selectionEnd;
    }

    /**
     * Update the caret position
     * @param {number} position The new caret position
     */
    set caretPosition(position) {
        this.textarea.selectionStart = this.textarea.selectionEnd = position;
    }

    /**
     * Get the textarea element
     * @returns {HTMLTextAreaElement}
     * @readonly
     */
    get textarea() {
        return this.#textarea;
    }

    /**
     * Trigger an event on the textarea
     * @param {string} eventType The event to trigger
     * @param {object} [eventProperties={}] The properties of the event
     * @returns {Event} The event that was triggered
     */
    trigger(eventType, eventProperties = {}) {
        const event = new Event(eventType, {
            bubbles: true,
            cancelable: true,
            ...eventProperties
        });

        this.textarea.dispatchEvent(event);

        return event;
    }

    /**
     * Get the value of the textarea
     * @returns {string}
     * @readonly
     */
    get value() {
        return this.textarea.value;
    }

    /**
     * Get a substring of the textarea value
     * @param {string} substring The substring to get: "beforeCaret", "afterCaret", or "all"
     * @returns {string}
     */
    substring(substring = null) {
        if (substring == "beforeCaret") {
            return this.value.substring(0, this.originalCaretPosition);
        } else if (substring == "afterCaret") {
            return this.value.substring(this.originalCaretPosition);
        }

        return this.value;
    }

    /**
     * Set the value of the textarea
     * @param {string} value The new value of the textarea
     */
    set value(value) {
        this.textarea.value = value;
    }

    /** 
     * Get character at given position
     * @param {number} position The position to get the character at
     * @returns {string} The character at the given position
     */
    charAt(position) {
        return this.value.charAt(position);
    }

    /**
     * Remove character at certain position
     * @param {number} position The position to remove the character at
     * @param {string} [character] The character to remove; null if any character
     * @returns {TextUtils} Self
     */
    removeAt(position, character = null) {
        if (character === null || this.charAt(position) == character) {
            this.value = this.value.substring(0, position)
                + this.value.substring(position + 1);
        }

        return this;
    }

    /**
     * Insert a string at a specific position
     * @param {number} position Where to insert the string
     * @param {string} stringToInsert The string to insert
     * @returns {TextUtils} Self
     */
    insertAt(position, stringToInsert) {
        this.value = this.value.substring(0, position)
            + stringToInsert
            + this.value.substring(position);

        return this;
    }

    /**
     * Insert a string at the caret position
     * @param {string} stringToInsert The string to insert
     * @param {string} [moveCursorTo=start] Where to move the cursor to after inserting the string: "start" or "end"
     * @returns {TextUtils} Self
     */
    insertAtCaret(stringToInsert, moveCursorTo = "start") {
        this.insertAt(this.originalCaretPosition, stringToInsert);

        if (moveCursorTo == "start") {
            this.moveCaret(0);
        } else if (moveCursorTo == "end") {
            this.moveCaret(stringToInsert.length);
        }

        return this;
    }

    /**
     * Move caret forward or backward by a given number of characters
     * @param {number} numCharacters The number of characters to move the cursor by
     * @returns {TextUtils} Self
     */
    moveCaret(numCharacters) {
        this.caretPosition = this.originalCaretPosition + numCharacters;

        return this;
    }

    /**
     * Get the start of the current line caret is in
     * @returns {number} The start position of the current line, relative to the textarea value
     */
    get lineStart() {
        let lineStart = this.originalSelection.start;
        while (lineStart > 0 && this.value[lineStart - 1] != "\n") {
            lineStart--;
        }
        
        return lineStart;
    }

    /**
     * Get the tab depth of the currently focused line
     * @returns {number} The tab depth of the current line
     */
    get lineTabDepth() {
        let tabDepth = 0;

        while (this.value[this.lineStart + tabDepth] == "\t") {
            tabDepth++;
        }

        return tabDepth;
    }

    /**
     * Get string representing a given tab depth
     * @param {number} tabDepth The tab depth to use
     * @returns {string} String representing the given tab depth
     */
    tabDepthString(tabDepth) {
        let tabDepthString = "";

        for (let i = 0; i < tabDepth; i++) {
            tabDepthString += "\t";
        }

        return tabDepthString;
    }

    /**
     *  Get string representing the currently focused line's tab depth
     * @returns {string} String representing the current line's tab depth
     */
    get lineTabDepthString() {
        return this.tabDepthString(this.lineTabDepth);
    }

    /**
     * Automatically indent current/new line
     * @param {object} [options={}] Options for auto-indenting
     * @param {boolean} [options.breakLine=false] Whether to break the line before indenting
     * @param {number} [options.tabDepth=-1] The tab depth to use for the new line. If -1, use the current line's tab depth
     * @param {number} [options.extraTabs=0] The number of extra tabs to add to the new line
     * @returns {TextUtils} Self
     */
    autoIndent({breakLine = false, tabDepth = -1, extraTabs = 0} = {}) {
        let tabDepthString;

        if (tabDepth > -1) {
            tabDepthString = this.tabDepthString(tabDepth);
        } else {
            tabDepthString = this.lineTabDepthString;
        }

        // Add extra tabs
        tabDepthString += this.tabDepthString(extraTabs);

        if (breakLine) {
            this.insertAtCaret("\n" + this.lineTabDepthString, "end");
        } else {
            this.insertAt(this.lineStart, tabDepthString);
        }

        // Trigger input event for browser to know about the change
        this.trigger("input");

        return this;
    }

    /*autoIndentNewLine(textarea, event) {
        // Get cursor position
        const cursorPosition = textarea.selectionEnd;

        this.generalContext.tabDepth++;
        const tabDepthString = this.getTabDepthString();
        const closingTabDepthString = this.getTabDepthString(-1);
        const moveCursorBy = tabDepthString.length + 1;

        const stringToInsert = `\n${tabDepthString}\n${closingTabDepthString}`;

        // Insert tabs
        this.insertAtCursor(textarea, cursorPosition, stringToInsert, "begin");
        this.moveCursor(textarea, cursorPosition, moveCursorBy);

        // Prevent default newline, but trigger input event for syntax highlighting
        event.preventDefault();
        this.triggerInputEvent(textarea);
    }*/

    /** 
     * Unindent the current line, keeping caret position
     * @returns {TextUtils} Self
     */
    unindent() {
        // Keep track of original selection & amount of tabs removed
        const selectionBefore = this.selection;
        let overflowTabs = 0;

        // Indent all selected lines
        for (let line of this.selectedLines) {
            this.removeAt(line - overflowTabs, "\t");
            overflowTabs++;
        }

        // Trigger input event for browser to know about the change
        this.trigger("input");

        // Preserve selection
        selectionBefore.start -= 1;
        selectionBefore.end -= overflowTabs;
        this.selection = selectionBefore;

        return this;
    }

    /** 
     * Indent the current line, keeping caret position
     * @returns {TextUtils} Self
     */
    indent() {
        // Keep track of original selection & amount of tabs removed
        const selectionBefore = this.selection;
        let overflowTabs = 0;

        // Indent all selected lines
        for (let line of this.selectedLines) {
            this.insertAt(line + overflowTabs, "\t");
            overflowTabs++;
        }

        // Trigger input event for browser to know about the change
        this.trigger("input");

        // Preserve selection
        selectionBefore.start += 1;
        selectionBefore.end += overflowTabs;
        this.selection = selectionBefore;

        return this;
    }

    // Selection
    /**
     * Get the current selection
     * @returns {object} Object with start, length and end properties representing the selection
     */
    get selection() {
        return {
            start: this.textarea.selectionStart,
            end: this.textarea.selectionEnd,
            length: this.textarea.selectionEnd - this.textarea.selectionStart
        };
    }

    /**
     * Set the current selection
     * @param {object} selection Object with start, length and end properties representing the selection
     */
    set selection(selection) {
        this.setSelection(selection.start, selection.end);
    }

    /**
     * Update the user's selection
     * @param {number} start The start of the selection
     * @param {number} end The end of the selection
     * @returns {TextUtils} Self
     */
    setSelection(start, end) {
        this.textarea.selectionStart = start;
        this.textarea.selectionEnd = end;

        return this;
    }

    /** 
     * Get the start indices of the lines that fall in the current selection
     */
    get selectedLines() {
        let nextNewline = this.value.indexOf("\n", this.selection.start);
        let lines = [this.lineStart];

        while (nextNewline < this.selection.end && nextNewline > -1) {
            lines.push(nextNewline + 1);

            nextNewline = this.value.indexOf("\n", nextNewline + 1);
        }

        console.log(lines);

        return lines;
    }
}