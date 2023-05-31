export default class Language {
    static extensions = {
        "html": "HTML",
        "css": "CSS",
        "js": "JavaScript",
        "svelte": "Svelte",
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

    static supportedLanguages = [
        "HTML",
    ]

    /**
     * Check whether a language has a set of language tools
     */
    static isSupported(language) {
        return this.supportedLanguages.includes(language);
    }
}