import GlobalHistory from "../../../../utils/GlobalHistory.js";

export default class EditorActions {
    #textarea;
    #editorID;
    
    constructor(editorID, textarea) {
        this.#editorID = editorID;
        this.#textarea = textarea;
    }

    /**
     * Get textarea
     * @returns {HTMLTextAreaElement}
     */
    get textarea() {
        return this.#textarea;
    }

    /**
     * Undo the last action & update the caret position
     */
    undo() {
        GlobalHistory.undo(this.#editorID);
    }

    /**
     * Redo the last action & update the caret position
     */
    redo() {
        GlobalHistory.redo(this.#editorID);
    }
}