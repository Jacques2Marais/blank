import { getCaretCoordinates } from "../../../../../lib/utils/getCaretPosition";

export default class CodeCompletionController {
    #entries = [];
    #position = [0, 0];
    #textarea;

    constructor(textarea) {
        this.#textarea = textarea;
    }

    get entries() {
        return this.#entries;
    }

    set entries(entries) {
        this.#entries = entries;
    }

    get x() {
        return this.#position[0];
    }

    get y() {
        return this.#position[1];
    }

    set x(x) {
        this.#position[0] = x;
    }

    set y(y) {
        this.#position[1] = y;
    }

    moveToCaret() {
        const [ x, y, lineHeight ] = getCaretCoordinates(this.#textarea, this.#textarea.selectionEnd);

        this.x = x + 64;
        this.y = y + lineHeight;
    }

    get show() {
        return this.#entries.length > 0;
    }

    get options() {
        return {
            entries: this.entries,
            top: this.cssPosition.top,
            left: this.cssPosition.left,
            show: this.show
        }
    }

    /**
     * Get the CSS position values of the code completion box
     */
    get cssPosition() {
        return {
            left: `${this.x}px`,
            top: `${this.y}px`
        };
    }

    get loaded() {
        return true;
    }
}