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
}