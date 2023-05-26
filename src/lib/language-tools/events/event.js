export default class EditorEvent {
    /**
     * Construct a new event
     * @constructor
     * @param {object} properties
     */
    constructor(properties = {}) {
        this.properties = properties;
    }

    /**
     * Get the current cursor position
     * @returns {number}
     * @readonly
     */
    get caretPosition() {
        return this.properties.textarea.selectionEnd;
    }

    /**
     * Set the current cursor position
     * @param {number} position The new cursor position
     */
    set caretPosition(position) {
        this.properties.textarea.selectionStart = this.properties.textarea.selectionEnd = position;
    }

    /**
     * Get the textarea element
     * @returns {HTMLTextAreaElement}
     * @readonly
     */
    get textarea() {
        return this.properties.textarea;
    }

    /**
     * Trigger an event on the textarea
     * @param {string} eventType The event to trigger
     * @param {object} [eventProperties={}] The properties of the event
     * @returns {Event} The event that was triggered
     */
    triggerTextareaEvent(eventType, eventProperties = {}) {
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
    get textValue() {
        return this.textarea.value;
    }

    /**
     * Get the original event fired by the browser
     * @returns {Event}
     */
    get originalEvent() {
        return this.properties.originalEvent;
    }

    /** 
     * Prevent the default action of the original event
     * @returns {EditorEvent} Self
     */
    preventDefault() {
        this.originalEvent.preventDefault();

        return this;
    }

    /**
     * Get a substring of the textarea value
     * @param {string} substring The substring to get: "beforeCursor", "afterCursor", or "all"
     * @returns {string}
     */
    textValueSubstring(substring = null) {
        if (substring == "beforeCursor") {
            return this.textValue.substring(0, this.caretPosition);
        } else if (substring == "afterCursor") {
            return this.textValue.substring(this.caretPosition);
        }

        return this.textValue;
    }

    /**
     * Set the value of the textarea
     * @param {string} value The new value of the textarea
     */
    set textValue(value) {
        this.textarea.value = value;
    }

    /**
     * Insert a string at a specific position
     * @param {string} stringToInsert The string to insert
     * @param {number} position Where to insert the string
     * @returns {EditorEvent} Self
     */
    insertAt(stringToInsert, position) {
        this.textValue = this.textValue.substring(0, position)
            + stringToInsert
            + this.textValue;

        return this;
    }

    /**
     * Insert a string at the caret position
     * @param {string} stringToInsert The string to insert
     * @param {string} [moveCursorTo=start] Where to move the cursor to after inserting the string: "start" or "end"
     * @returns {EditorEvent} Self
     */
    insertAtCaret(stringToInsert, moveCursorTo = "start") {
        this.insertAt(stringToInsert, this.caretPosition);

        if (moveCursorTo == "start") {
            this.moveCaret(0)
        } else if (moveCursorTo == "end") {
            this.moveCaret(stringToInsert.length);
        }

        return this;
    }

    /**
     * Move caret forward or backward by a given number of characters
     * @param {number} numCharacters The number of characters to move the cursor by
     * @returns {EditorEvent} Self
     */
    moveCaret(numCharacters) {
        this.caretPosition = this.caretPosition + numCharacters;

        return this;
    }

    /**
     * Get the start of the current line caret is in
     * @returns {number} The start position of the current line, relative to the textarea value
     */
    get lineStart() {
        let lineStart = this.caretPosition;
        while (lineStart > 0 && this.textValue[lineStart - 1] != "\n") {
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

        while (this.textValue[this.lineStart + tabDepth] == "\t") {
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
     * @returns {EditorEvent} Self
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
            this.insertAt(tabDepthString, this.lineStart);
        }

        // Trigger input event for browser to know about the change
        this.triggerTextareaEvent("input");

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

}