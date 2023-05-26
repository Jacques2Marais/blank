import EditorEvent from './event.js';

/**
 * Represents a typing event
 * @implements {EditorEvent}
 */
export default class TypingEvent extends EditorEvent {
    /**
     * Get the key that was pressed
     * @returns {string}
     * @readonly
     */
    get key() {
        return this.properties.key;
    }

    /**
     * Is the key that was pressed an alphabet character?
     * @returns {boolean}
     */
    get isAlphabetKey() {
        return this.key.match(/[a-z]/i) !== null;
    }
}