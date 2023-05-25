export default class Context {
    context = {}
    language = null

    constructor(language = null, defaults = {}) {
        this.context = {};
        this.language = language;

        // Set the default context values
        for (const [key, value] of Object.entries(defaults)) {
            this.setContext(key, value);
        }
    }

    /**
     * Set a certain context property
     * @param {string|object} context The context property to set
     * @param {any} value The value to set the context property to
     */
    setContext(context, value = null) {
        // If the context is an object, set all of the properties
        if (value === null && typeof context === "object" && context !== null && !Array.isArray(context)) {
            for (const [key, value] of Object.entries(context)) {
                this.setContext(key, value);
            }

            return;
        }

        this.context[context] = value
    }

    /**
     * Get a certain context property
     * @param {string} context The context property to get
     * @returns {any} The value of the context property
     */
    getContext(context) {
        return this.context[context]
    }

    /**
     * Is a specific context property set?
     * @param {string} context The context property to check
     * @returns {boolean} Whether or not the context property is set
     */
    isSet(context) {
        return this.context[context] !== undefined
            && this.context[context] !== null
            && this.context[context].length !== 0
    }

    /**
     * Short-hand to get context property starting with "in-"
     * @param {string} context The context property to check that starts with "in-"
     * @returns {boolean} Whether or not the context property is set
     */
    in(context) {
        return this.getContext(`in-${context}`) === true
    }
}