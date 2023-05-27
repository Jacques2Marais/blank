import Language from "../language-tools/language.js";
import BackendComm from "./backend-comm.js";

export default class File {
    #content = "";
    #path = "";
    #loaded = false;
    #loadEventTarget = new EventTarget();

    constructor(path) {
        this.path = path;
    }

    /**
     * Update the path of the file
     * @param {string} path The new path of the file
     */
    set path(path) {
        this.#path = path;

        this.#loaded = false;
        this.load();
    }

    /**
     * Get the name of the file
     * @returns {string} The name of the file
     * @readonly
     */
    get name() {
        return this.path.split("/").pop();
    }

    /**
     * Get the extension of the file
     * @returns {string} The extension of the file
     * @readonly
     */
    get extension() {
        return this.name.split(".").pop();
    }

    /**
     * Get the language of the file
     * @returns {string} The language of the file
     * @readonly
     */
    get language() {
        return Language.languageFromFileName(this.name);
    }

    /**
     * Get the content of the file
     * @returns {string} The content of the file
     * @readonly
     */
    get content() {
        return this.#content;
    }

    /**
     * Load file contents from back-end
     * @returns {Promise<File>} Self
     */
    async load() {
        BackendComm.request("get_file_contents", {
            path: this.path
        }).then(content => {
            this.#loaded = true;
            this.#loadEventTarget.dispatchEvent(new Event("loadedFile"));
            this.#content = content;
        });

        return this;
    }

    /**
     * Attach an event listener for when the file is loaded
     * @param {EventListener} callback The callback to execute
     * @returns {File} Self
     */
    onLoad(callback) {
        this.#loadEventTarget.addEventListener("loadedFile", callback);

        return this;
    }
}