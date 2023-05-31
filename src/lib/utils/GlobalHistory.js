import TextUtils from "../language-tools/utils";

/** 
 * Class for managing the undo/redo stack
 * 
 * Events are described in the format:
 * @example
 *  {
 *    type: "insert" | "delete",  // The type of event that occurred
 *    start: number | array,      // The index (indices) of the first character(s) that was inserted/deleted
 *    end: number | array,        // The index (indices) of the last character(s) that was inserted/deleted
 *    text: string | array,       // The text(s) that was inserted/deleted
 *  }
 * 
 */
export default class GlobalHistory {

    /** 
     * The undo stack of each Editor (specified by ID as index in the array)
     * @type {Array}
     */
    static #historyPerEditor = [];

    static get history () {
        return this.#historyPerEditor;
    }

    /**
     * The redo stack of each Editor (specified by ID as index in the array)
     * @type {Array}
     */
    static #futurePerEditor = [];

    /**
     * An array of the editors that are currently open
     * @type {Array}
     */
    static #openEditors = [];

    /**
     * Add an editor to the list of open editors
     * @param {number} id The ID of the editor to add
     * @param {HTMLTextAreaElement} textarea The textarea of the editor to add
     */
    static addEditor(id, textarea) {
        this.#openEditors.push({
            id,
            textarea
        });
    }

    /**
     * Refresh the textarea of an editor
     * @param {number} id The ID of the editor to refresh
     * @param {HTMLTextAreaElement} textarea The new textarea of the editor
     */
    static refreshEditor(id, textarea) {
        const editorIndex = this.#openEditors.findIndex(editor => editor.id === id);

        if (editorIndex !== -1) {
            this.#openEditors[editorIndex].textarea = textarea;
        }
    }

    /**
     * Get an editor by ID
     * @param {number} id The ID of the editor to get
     * @returns The ID of the editor
     */
    static getEditor(id) {
        return this.#openEditors.find(editor => editor.id === id);
    }

    /**
     * Add a new event to the undo stack
     * @param {number} editorId The ID of the editor to add the event to
     * @param {object} event The properties of the event to add to the undo stack
     */
    static addHistory(editorId, event, clearRedoStack = true) {
        // If the editor doesn't have a history stack yet, create one
        if (!this.#historyPerEditor[editorId]) {
            this.#historyPerEditor[editorId] = [];
        }

        // Add the event to the undo stack
        this.#historyPerEditor[editorId].push(event);

        if (clearRedoStack) {
            // Clear the redo stack
            this.#futurePerEditor[editorId] = [];
        }
    }

    /**
     * Add a new event to the redo stack
     * @param {number} editorId The ID of the editor to add the event to
     * @param {object} event The properties of the event to add to the redo stack
     */
    static addFuture(editorId, event) {
        // If the editor doesn't have a future stack yet, create one
        if (!this.#futurePerEditor[editorId]) {
            this.#futurePerEditor[editorId] = [];
        }

        // Add the event to the redo stack
        this.#futurePerEditor[editorId].unshift(event);
    }

    /**
     * Get the last event from the undo stack
     * @param {number} editorId The ID of the editor to get the last event from
     * @returns {object} The last event from the undo stack
     */
    static lastHistory(editorId) {
        // If the editor doesn't have a history stack yet, return null
        if (!this.#historyPerEditor[editorId]) {
            return null;
        }

        // Get the last event from the undo stack
        return this.#historyPerEditor[editorId].pop();
    }

    /**
     * Get the first event from the redo stack
     * @param {number} editorId The ID of the editor to get the first event from
     * @returns {object} The first event from the redo stack
     */
    static firstFuture(editorId) {
        // If the editor doesn't have a future stack yet, return null
        if (!this.#futurePerEditor[editorId]) {
            return null;
        }

        // Get the first event from the redo stack
        return this.#futurePerEditor[editorId].shift();
    }

    /**
     * Undo the last event
     * @param {number} editorId The ID of the editor to undo the last event for
     * @returns {object} The last event from the undo stack
     * @throws {Error} If the last event is null
     */
    static undo(editorId) {
        // Get the last event from the undo stack
        const event = this.lastHistory(editorId);

        // If the last event is null, throw an error
        if (!event) {
            throw new Error("No event to undo");
        }

        // Add the event to the redo stack
        this.addFuture(editorId, event);

        // If the event is an insert, delete the text
        if (event.type === "insert") {
            this.deleteText(editorId, event.start, event.end);
        } else if (event.type === "delete") {
            this.insertText(editorId, event.start, event.text);
        }

        // Return the event
        return event;
    }

    /**
     * Redo the first future event
     * @param {number} editorId The ID of the editor to undo the last event for
     * @returns {object} The first event from the redo stack
     * @throws {Error} If the first event is null
     */
    static redo(editorId) {
        // Get the first event from the redo stack
        const event = this.firstFuture(editorId);

        // If the first event is null, throw an error
        if (!event) {
            throw new Error("No event to redo");
        }

        // Add the event to the undo stack
        this.addHistory(editorId, event, false);

        // If the event is an insert, insert the text
        if (event.type === "insert") {
            this.insertText(editorId, event.start, event.text);
        }  else if (event.type === "delete") {
            this.deleteText(editorId, event.start, event.end);
        }

        // Return the event
        return event;
    }

    // Some quick functions to change textarea values
    /**
     * Delete text from the textarea of a given editor
     * @param {number} id The ID of the editor to delete text from
     * @param {number} start The index of the first character to delete
     * @param {number} end The index of the last character to delete
     */
    static deleteText(id, start, end) {
        const value = this.getEditor(id).textarea.value;

        console.log(value.substring(0, start - 1) 
        + value.substring(end));

        this.getEditor(id).textarea.value = value.substring(0, start) 
            + value.substring(end);

        this.getEditor(id).textarea.selectionEnd = start;
    }


    /**
     * Insert text into the textarea of a given editor
     * @param {number} id The ID of the editor to insert text into
     * @param {number} index The index to insert the text at
     * @param {string} text The text to insert
     */
    static insertText(id, index, text) {
        const value = this.getEditor(id).textarea.value;

        this.getEditor(id).textarea.value = value.substring(0, index) 
            + text + value.substring(index);

        this.getEditor(id).textarea.selectionEnd = index + text.length;
    }
}