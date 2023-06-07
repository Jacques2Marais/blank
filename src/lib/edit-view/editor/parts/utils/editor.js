import Tab from "./tab";

export default class Editor {
    #textarea;
    #id;
    #tab;

    constructor ({
        textarea = null,
        id = -1,
        tab = null
    } = {}) {
        this.#textarea = textarea;
        this.#id = id;
        this.#tab = tab;
    }

    /**
     * Get the textarea
     * @returns {HTMLTextAreaElement}
     */
    get textarea () {
        return this.#textarea;
    }

    /**
     * Get the editor's ID
     * @returns {number}
     */
    get id () {
        return this.#id;
    }

    /**
     * Get the editor's current tab
     * @returns {Tab}
     */
    get tab () {
        return this.#tab;
    }
}