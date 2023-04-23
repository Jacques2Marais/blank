export const editorTools = {
    /* Hover Utilities */
    // Get the next element with a specific class
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

    // Get the previous element with a specific class
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

    // Get the next element with a specific class and text content
    getNextElementWithClassAndText(firstElement, className, text) {
        let element = this.getNextElementWithClass(firstElement, className);

        while (element && element.textContent != text) {
            element = this.getNextElementWithClass(element, className);
        }

        return element;
    },

    // Get the previous element with a specific class and text content
    getPreviousElementWithClassAndText(firstElement, className, text) {
        let element = this.getPreviousElementWithClass(firstElement, className);

        while (element && element.textContent != text) {
            element = this.getPreviousElementWithClass(element, className);
        }

        return element;
    },

    // Check whether given element is a tag name
    isTagName(element) {
        return element.classList.contains("blank-editor-name");
    },

    // Check whether a given element represents the start of a tag
    isEndTag(element) {
        return this.isTagName(element) && element.previousElementSibling && element.previousElementSibling.textContent == "</";
    },

    // Check whether a given element represents the end of a tag
    isStartTag(element) {
        return this.isTagName(element) && !this.isEndTag(element);
    },

    // Get the corresponding start/end tag of a given tag
    getCorrespondingTag(element) {
        const textContent = element.textContent;
        let numTagJumps = 0;

        let correspondingTag = this.isStartTag(element) ? 
            this.getNextElementWithClassAndText(element, "blank-editor-name", textContent): 
            this.getPreviousElementWithClassAndText(element, "blank-editor-name", textContent);

        if (this.isStartTag(element)) {
            while (this.isStartTag(correspondingTag) || (this.isEndTag(correspondingTag) && numTagJumps > 0)) {
                if (this.isStartTag(correspondingTag)) {
                    numTagJumps++;
                } else if (this.isEndTag(correspondingTag)) {
                    numTagJumps--;
                }

                correspondingTag = this.getNextElementWithClassAndText(correspondingTag, "blank-editor-name", textContent);
            }
        } else if (this.isEndTag(element)) {
            while (this.isEndTag(correspondingTag) || (this.isStartTag(correspondingTag) && numTagJumps > 0)) {
                if (this.isEndTag(correspondingTag)) {
                    numTagJumps++;
                } else if (this.isStartTag(correspondingTag)) {
                    numTagJumps--;
                }

                correspondingTag = this.getPreviousElementWithClassAndText(correspondingTag, "blank-editor-name", textContent);
            }
        }

        /*if (this.isStartTag(element)) {
            while (this.isStartTag(correspondingTag)) {
                numTagJumps++;
                correspondingTag = this.getNextElementWithClassAndText(correspondingTag, "blank-editor-name", textContent);
            }

            console.log("numTagJumps: " + numTagJumps);

            while (this.isEndTag(correspondingTag) && numTagJumps > 0) {
                numTagJumps--;
                correspondingTag = this.getNextElementWithClassAndText(correspondingTag, "blank-editor-name", textContent);
            }
        } else {
            while (this.isEndTag(correspondingTag)) {
                numTagJumps++;
                correspondingTag = this.getPreviousElementWithClassAndText(correspondingTag, "blank-editor-name", textContent);
            }

            while (this.isStartTag(correspondingTag) && numTagJumps > 0) {
                numTagJumps--;
                correspondingTag = this.getPreviousElementWithClassAndText(correspondingTag, "blank-editor-name", textContent);
            }
        }*/

        return correspondingTag;
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

    /* Hover tools for different languages */
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

        // Text content of the element
        const textContent = element.textContent;

        // Is the element an HTML tag name syntax definition?
        const isTagName = this.isTagName(element);
        const isEndTag = this.isEndTag(element);
        const isStartTag = this.isStartTag(element);

        if (element.classList.contains('blank-editor-html')) {
            if (isStartTag || isEndTag) {
                // Get corresponding tag
                //const correspondingTag = isStartTag ? this.getNextElementWithClassAndText(element, "blank-editor-name", textContent) : this.getPreviousElementWithClassAndText(element, "blank-editor-name", textContent);
                const correspondingTag = this.getCorrespondingTag(element);

                // Add hover class to begin and end tag
                element.classList.add("blank-editor-tag-hovered");
                correspondingTag.classList.add("blank-editor-tag-hovered");

                // Add hovered tags to array
                this.hoveredTags.push(element);
                this.hoveredTags.push(correspondingTag);
            }
        }
    },

    /* Typing utilities */
    // Get current tag's name if at the start of a tag
    getCurrentTagName(textarea, cursorPosition) {
        return textarea.value.substring(textarea.value.lastIndexOf("<", cursorPosition - 1) + 1, cursorPosition);
    },

    // Insert a string at the cursor's position
    insertAtCursor(textarea, cursorPosition, string, moveCursorTo = "start") {
        console.log("cursorPosition: " + cursorPosition);
        
        textarea.value = textarea.value.substring(0, cursorPosition)
            + string
            + textarea.value.substring(cursorPosition);

        if (moveCursorTo == "start") {
            textarea.selectionStart = textarea.selectionEnd = cursorPosition;
        } else if (moveCursorTo == "end") {
            textarea.selectionStart = textarea.selectionEnd = cursorPosition + string.length;
        }
    },

    // Move cursor forward or backward by a given number of characters
    moveCursor(textarea, cursorPosition, numCharacters) {
        textarea.selectionStart = textarea.selectionEnd = cursorPosition + numCharacters;
    },

    // Get string representing the current tab depth
    getTabDepthString(extraTabs = 0) {
        let tabDepthString = "";

        for (let i = 0; i < this.HTMLContext.tabDepth + extraTabs; i++) {
            tabDepthString += "\t";
        }

        return tabDepthString;
    },

    // Trigger input event for syntax highlighting
    triggerInputEvent(textarea) {
        var event = new Event('input', {
            bubbles: true,
            cancelable: true,
        });
          
        textarea.dispatchEvent(event);
    },


    // Remove all additions made to the editor
    resetHTML() {
        this.removeHoverClassesFromAllTags();
        this.prevElement = null;
    },

    /* Typing tools for specific languages */
    HTMLContext: {
        // Is the cursor inside an opening tag?
        inOpeningTag: false,

        // Is the cursor inside a self-closing tag?
        inSelfClosingTag: false,

        // Current tag name
        currentTagName: "",

        // Is inside an element's body?
        inElementBody: false,

        // Is inside an empty element?
        inEmptyElementBody : false,

        // Tab depth
        tabDepth: 0
    },



    // HTML language editor tools
    HTMLTyping(textarea, event) {
        // Get the current cursor position
        const cursorPosition = textarea.selectionStart;

        // Auto close tags
        if (event.key == ">") {
            if (this.HTMLContext.inOpeningTag && !this.HTMLContext.inSelfClosingTag) {
                if (this.HTMLContext.currentTagName.length == 0) {
                    // Set tag name
                    this.HTMLContext.currentTagName = this.getCurrentTagName(textarea, cursorPosition);

                    console.log(textarea.value[cursorPosition]);
                }

                // Insert closing tag after cursor if the cursor was in a 
                // non-self-closing, opening tag
                this.insertAtCursor(textarea, cursorPosition, `</${this.HTMLContext.currentTagName}>`);

                // Reset & set context
                this.HTMLContext.inOpeningTag = false;
                this.HTMLContext.inSelfClosingTag = false;
                this.HTMLContext.inElementBody = true;
                this.HTMLContext.inEmptyElementBody = true;
            }
        } else if (event.key == "/") {
            if (this.HTMLContext.inOpeningTag) {
                // Set context
                this.HTMLContext.inSelfClosingTag = true;
            }
        } else if (event.key == "<") {
            // Set context
            this.HTMLContext.inOpeningTag = true;
            this.HTMLContext.inSelfClosingTag = false;
            this.HTMLContext.inElementBody = false;
            this.HTMLContext.currentTagName = "";
        } else if (event.key == " ") {
            if (this.HTMLContext.inOpeningTag && this.HTMLContext.currentTagName.length == 0) {
                // Set tag name
                this.HTMLContext.currentTagName = this.getCurrentTagName(textarea, cursorPosition);
            }
        } else if (event.key == "Enter") {
            if (this.HTMLContext.inEmptyElementBody) {
                this.HTMLContext.tabDepth++;
                const tabDepthString = this.getTabDepthString();
                const closingTabDepthString = this.getTabDepthString(-1);
                const moveCursorBy = tabDepthString.length + 1;

                const stringToInsert = `\n${tabDepthString}\n${closingTabDepthString}`;

                // Insert tabs
                this.insertAtCursor(textarea, cursorPosition, stringToInsert, "begin");
                this.moveCursor(textarea, cursorPosition, moveCursorBy);

                // Prevent default newline, but trigger input event for syntax highlighting
                event.preventDefault();
                this.triggerInputEvent(textarea);

                // 
            }
        }
    },
}