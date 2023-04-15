export const editorTools = {
    /* Utilities */
    getNextElementWithClass(firstElement, className) {
        let element = firstElement.nextElementSibling;
        let nextParent = firstElement.parentElement.nextElementSibling;

        // Check inside current parent
        while (element && !element.classList.contains(className)) {
            element = element.nextElementSibling;
        }

        while (nextParent && !nextParent.classList.contains("blank-editor-basic")) {
            // Search inside next parent
            while (nextParent && !nextParent.querySelector("." + className)) {
                nextParent = nextParent.nextElementSibling;
            }

            if (nextParent.querySelector("." + className)) {
                element = nextParent.querySelector("." + className);
                break;
            } else {
                nextParent = nextParent.parentElement.nextElementSibling;
            }
        }

        return element;
    },
    getPreviousElementWithClass(firstElement, className) {
        let element = firstElement.previousElementSibling;
        let prevParent = firstElement.parentElement.previousElementSibling;

        // Check inside current parent
        while (element && !element.classList.contains(className)) {
            element = element.previousElementSibling;
        }

        while (prevParent && !prevParent.classList.contains("blank-editor-basic")) {
            // Search inside previous parent
            while (prevParent && !prevParent.querySelector("." + className)) {
                prevParent = prevParent.previousElementSibling;
            }

            if (prevParent.querySelector("." + className)) {
                element = prevParent.querySelector("." + className);
                break;
            } else {
                prevParent = prevParent.parentElement.previousElementSibling;
            }
        }

        return element;
    },

    hoveredTags: [],
    // Remove hover classes from all tags
    removeHoverClassesFromAllTags() {
        for (let i = 0; i < this.hoveredTags.length; i++) {
            this.hoveredTags[i].classList.remove("blank-editor-tag-hovered");
        }

        this.hoveredTags = [];
    },

    // Keep a temporary reference to the previous element to avoid unnecessary work
    prevElement: null,

    // HTML language editor tools
    HTML(element) {
        // If the element is null, reset and return
        if (element == null) {
            this.resetHTML();
            return;
        }

        // If the element is the same as the previous element, return
        if (element.isSameNode(this.prevElement)) {
            return;
        } else {
            // Else, reset (start from scratch)
            this.resetHTML();
        }

        // Update the previous element
        this.prevElement = element;

        // Is the element an HTML tag name syntax definition?
        const isTagName = element.classList.contains("blank-editor-name");
        const isEndTag = isTagName && element.previousElementSibling && element.previousElementSibling.textContent == "</";
        const isStartTag = isTagName && !isEndTag;

        if (element.classList.contains('blank-editor-html')) {
            if (isStartTag || isEndTag) {
                // Get corresponding tag
                const correspondingTag = isStartTag ? this.getNextElementWithClass(element, "blank-editor-name") : this.getPreviousElementWithClass(element, "blank-editor-name");

                // Add hover class to begin and end tag
                element.classList.add("blank-editor-tag-hovered");
                correspondingTag.classList.add("blank-editor-tag-hovered");

                // Add hovered tags to array
                this.hoveredTags.push(element);
                this.hoveredTags.push(correspondingTag);
            }
        }
    },

    // Remove all additions made to the editor
    resetHTML() {
        this.removeHoverClassesFromAllTags();
        this.prevElement = null;
    }
}