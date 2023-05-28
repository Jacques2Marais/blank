import File from "../../../../utils/file.js";

export default class Tab {
    static #lastID = 0;

    constructor({
        id = -1,
        name = "Untitled",
        content = "",
        language = "HTML",
        isSaved = false,
        file = null
    } = {}) {
        this.id = id == -1 ? Tab.#lastID++ : id;
        this.name = name;
        this.content = content;
        this.language = language;
        this.isSaved = isSaved;
        this.file = file;

        if (this.file != null) {
            this.load(this.file);
        }
    }

    /**
     * Load a new file into the tab
     * @param {File} file The file to load
     * @returns {Tab} Self
     */
    load(file) {
        this.file = file;
        this.name = file.name;
        this.language = file.language;

        return this;
    }
}