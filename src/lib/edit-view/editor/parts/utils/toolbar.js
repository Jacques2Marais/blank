import EditorActions from "./actions";
import EditorShortcuts from "./shortcuts";

export default class EditorToolbar {
    #items = [];
    
    constructor (items) {
        this.#items = items;
    }

    get items () {
        return this.#items;
    }

    /**
     * Return a button for the toolbar
     * @param {string} icon The icon to use
     * @param {string} title The title of the button
     * @param {function} action The action to execute when the button is clicked
     */
    static button (icon, title, action) {
        return {
            type: "button",
            icon,
            title,
            action
        }
    }
}