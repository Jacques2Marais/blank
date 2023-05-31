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

    /**
     * Add a new event to the undo stack
     * @param {number} editorId The ID of the editor to add the event to
     * @param {object} event The properties of the event to add to the undo stack
     */
    static add(editorId, event) {
        // If the editor doesn't have a history stack yet, create one
        if (!this.#historyPerEditor[editorId]) {
            this.#historyPerEditor[editorId] = [];
        }

        // Add the event to the undo stack
        this.#historyPerEditor[editorId].push(event);
    }

    /**
     * Get the last event from the undo stack
     * @param {number} editorId The ID of the editor to get the last event from
     * @returns {object} The last event from the undo stack
     */
    static last(editorId) {
        // If the editor doesn't have a history stack yet, return null
        if (!this.#historyPerEditor[editorId]) {
            return null;
        }

        // Get the last event from the undo stack
        return this.#historyPerEditor[editorId].pop();
    }

    /**
     * Undo the last event
     * @param {number} editorId The ID of the editor to undo the last event for
     * @returns {object} The last event from the undo stack
     * @throws {Error} If the last event is null
     */
    static undo(editorId) {
        // Get the last event from the undo stack
        const event = this.last(editorId);

        // If the last event is null, throw an error
        if (!event) {
            throw new Error("No event to undo");
        }

        // Undo the event
        event.undo();

        return event;
    }
}