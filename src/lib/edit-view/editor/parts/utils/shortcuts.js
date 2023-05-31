import EditorActions from "./actions";

export default class EditorShortcuts {
    #editorID;
    #textarea;
    #actions;

    constructor (editorID, textarea) {
        this.#editorID = editorID;
        this.#textarea = textarea;
        this.#actions = new EditorActions(editorID, textarea);
    }

    shortcut (event) {
        if (event.ctrlKey) {
            // Ctrl + Z
            if (event.key == "z") {
                this.#actions.undo();

                return true;
            } else if (event.key == "y") {
                this.#actions.redo();

                return true;
            }
        }

        return false;
    }
}

