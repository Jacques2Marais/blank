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
        if (this.originalEvent instanceof KeyboardEvent) {
            return this.originalEvent.key;
        }

        return null;
    }

    /**
     * Get the code of the key that was pressed
     * @returns {string}
     * @readonly
     */
    get code() {
        if (this.originalEvent instanceof KeyboardEvent) {
            return this.originalEvent.code;
        }

        return null;
    }

    /**
     * Is the key that was pressed an alphabet character?
     * @returns {boolean}
     */
    get isAlphabetKey() {
        return this.key.match(/[a-z]/i) !== null;
    }

    /**
     * Check whether given modifier was also pressed
     * @param {string} modifier The modifier to check
     * @returns {boolean} Whether the modifier was pressed
     */
    isMod(modifier) {
        // Make sure modifier is given in correct case 
        // (for now only those that *start* with uppercase are checked)
        if (!/^\p{Lu}/u.test( modifier )) {
            modifier = modifier[0].toUpperCase();
        }

        if (this.originalEvent instanceof KeyboardEvent) {
            return this.originalEvent.getModifierState(modifier);
        }

        return false;
    }

    get deletedIndex() {
        if (this.key == "Delete") {
            return this.utils.caretPosition;
        } else if (this.key == "Backspace") {
            return this.utils.caretPosition - 1;
        }

        return -1;
    }

    /**
     * Get a backspaced/deleted character or null if none was backspaced/deleted
     * @returns {string|null} The backspaced/deleted character
     * @readonly
     */
    get deletedCharacter() {
        if (this.deletedIndex > -1) {
            return this.utils.charAt(this.deletedIndex);
        }

        return null;
    }
}