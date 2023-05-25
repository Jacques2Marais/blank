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
    get cursorPosition() {
        return this.properties.textarea.selectionEnd;
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
     * Get the value of the textarea
     * @returns {string}
     * @readonly
     */
    get textValue() {
        return this.textarea.value;
    }
}