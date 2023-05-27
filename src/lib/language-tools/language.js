export default class Language {
    static extensions = {
        "html": "HTML",
    }

    /**
     * Get the language of a file from its extension
     * @param {string} fileName The name of the file
     * @returns The language of the file or "Text" if the language is unknown
     */
    static languageFromFileName(fileName) {
        const extension = fileName.split(".").pop();

        return this.extensions[extension] || "Text";
    }
}