import TextUtils from "../utils";

export default class EditorEvent {
    #originalCaretPosition = -1;
    #utils = null;

    /**
     * Construct a new event
     * @constructor
     * @param {object} properties
     */
    constructor(properties = {}) {
        this.properties = {
            textarea: null,
            event: null,
            ...properties
        };

        if (this.properties.textarea) {
            this.#originalCaretPosition = this.properties.textarea.selectionEnd;

            // Setup a new TextUtils instance
            this.#utils = new TextUtils(this.properties.textarea);
        }
    }

    /**
     * Get the TextUtils instance for the event
     * @returns {TextUtils} The TextUtils instance
     */
    get utils() {
        return this.#utils;
    }

    /**
     * Get the original event fired by the browser
     * @returns {Event}
     */
    get originalEvent() {
        return this.properties.event;
    }

    /** 
     * Prevent the default action of the original event
     * @returns {EditorEvent} Self
     */
    preventDefault() {
        this.originalEvent.preventDefault();

        return this;
    }

}