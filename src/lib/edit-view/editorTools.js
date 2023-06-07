import { HTMLCompletions, CSSCompletions } from "../utilities/autoCompleteData";

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
        if (element == null) {
            return false;
        }

        return element.classList.contains("blank-editor-name");
    },

    // Check whether given element is a self-closing tag
    isSelfClosingTag(element) {
        if (element == null) {
            return false;
        }

        return this.isTagName(element) && this.getNextElementWithClass(element, "blank-editor-end").textContent.endsWith("/>");
    },

    // Check whether a given element represents the start of a tag
    isEndTag(element) {
        return !this.isSelfClosingTag(element) && this.isTagName(element) && element.previousElementSibling && element.previousElementSibling.textContent == "</";
    },

    // Check whether a given element represents the end of a tag
    isStartTag(element) {
        return this.isTagName(element) && !this.isEndTag(element) && !this.isSelfClosingTag(element);
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
    generalHover(element, language) {
        if (language == "HTML") {
            this.HTMLHover(element);
        } else if (language == "CSS") {
            //this.CSSHover(element);
        }
    },

    // HTML language editor tools
    HTMLHover(element) {
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

        for (let i = 0; i < this.generalContext.tabDepth + extraTabs; i++) {
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

    autoIndent(textarea, event) {
        // Get cursor position
        const cursorPosition = textarea.selectionEnd;

        // Insert newline
        this.insertAtCursor(textarea, cursorPosition, "\n", "end");

        // Insert tabs
        const tabDepthString = this.getTabDepthString();
        this.insertAtCursor(textarea, cursorPosition + 1, tabDepthString, "end");

        // Prevent default newline, but trigger input event for syntax highlighting
        event.preventDefault();
        this.triggerInputEvent(textarea);
    },

    autoIndentNewLine(textarea, event) {
        // Get cursor position
        const cursorPosition = textarea.selectionEnd;

        this.generalContext.tabDepth++;
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
    },

    /* Typing tools for specific languages */
    // CONTEXTS
    generalContext: {
        // Tab depth
        tabDepth: 0,

        // Is at the start of a newline?
        isAtLineStart: false,
    },

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

        // Is inside of a pair of empty quotes? 
        isInsideEmptyQuotes: ""
    },

    // FUNCTIONS
    typing(textarea, event, language) {
        // Get the current cursor position
        const cursorPosition = textarea.selectionEnd;

        if (event.key == "Tab") {
            // Prevent default tab
            event.preventDefault();

            // Insert tab
            this.insertAtCursor(textarea, cursorPosition, "\t");
            this.moveCursor(textarea, cursorPosition, 1);

            if (this.generalContext.isAtLineStart) {
                this.generalContext.tabDepth++;
            }

            this.triggerInputEvent(textarea);
        }

        if (language == "HTML") {
            return this.HTMLTyping(textarea, event);
        } else if (language == "CSS") {
            return this.CSSTyping(textarea, event);
        }
    },

    // HTML language editor tools
    HTMLTyping(textarea, event) {
        // Get the current cursor position
        const cursorPosition = textarea.selectionEnd;

        // Auto close tags
        if (event.key == ">") {
            if (this.HTMLContext.inOpeningTag && !this.HTMLContext.inSelfClosingTag) {
                if (this.HTMLContext.currentTagName.length == 0) {
                    // Set tag name
                    this.HTMLContext.currentTagName = this.getCurrentTagName(textarea, cursorPosition);
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
                this.autoIndentNewLine(textarea, event);

                // Set context
                this.HTMLContext.inEmptyElementBody = false;
            } else {
                this.autoIndent(textarea, event);
            }

            // Set context
            this.generalContext.isAtLineStart = true;
        } else if (event.key == '"' || event.key == "'") {
            // Auto close quote pairs
            this.insertAtCursor(textarea, cursorPosition, event.key);
        } else if (event.key == "Backspace") {
            // Remove tab if at line start
            if (this.generalContext.isAtLineStart) {
                this.generalContext.tabDepth--;
            }
        }

        if (event.key != "Enter" && event.key != "Tab") {
            this.generalContext.isAtLineStart = false;
        }

        // Ensure it is a self-closing tag and not a random "/"
        if (this.HTMLContext.inSelfClosingTag && event.key != ">" && event.key != "/") {
            this.HTMLContext.inSelfClosingTag = false;
        }
    },

    CSSContext: {
        // Is the cursor inside a CSS property?
        inProperty: false,

        // Is the cursor inside a CSS value?
        inValue: false,

        // Is the cursor inside a CSS block?
        inBlock: false,

        // Is the cursor inside a CSS empty block?
        inEmptyBlock: false,

        // Current property name
        currentPropertyName: "",
    },

    // CSS language editor tools
    CSSTyping(textarea, event) {
        // Get the current cursor position
        const cursorPosition = textarea.selectionEnd;

        // Auto close brackets
        if (event.key == "{") {
            // Insert closing bracket after cursor if the cursor was in an opening bracket
            this.insertAtCursor(textarea, cursorPosition, "}");

            // Set context
            if (!this.CSSContext.inBlock) {
                this.CSSContext.inBlock = true;
                this.CSSContext.inEmptyBlock = true;
                this.CSSContext.inProperty = false;
                this.CSSContext.inValue = false;
            }
        } else if (event.key == "}") {
            // Set context
            this.CSSContext.inBlock = false;
            this.CSSContext.inProperty = false;
            this.CSSContext.inValue = false;
        } else if (event.key == ":") {
            // Set context
            this.CSSContext.inProperty = false;
            this.CSSContext.inValue = true;

            // Get name of property
            this.CSSContext.currentPropertyName = this.getMatchingBeforeCursor(textarea, cursorPosition, /[\w-]+/);
        } else if (event.key == ";") {
            // Set context
            this.CSSContext.inValue = false;
        } else if (event.key == "Enter") {
            if (this.CSSContext.inEmptyBlock) {
                this.autoIndentNewLine(textarea, event);

                // Set context
                this.CSSContext.inEmptyBlock = false;
            } else {
                this.autoIndent(textarea, event);
            }
        } else if (/[a-zA-Z]/.test(event.key) && this.CSSContext.inBlock && !this.CSSContext.inProperty && !this.CSSContext.inValue) {
            // Set context
            this.CSSContext.inProperty = true;
        }
    },

    /* Caret movement tools for specific languages */
    /* Utilities */

    // Get the number of characters before & after the caret
    getSurroundingCharacters(textarea, position, numCharacters, numCharactersForward = 0) {
        if (numCharactersForward == 0) {
            return textarea.value.substring(position - numCharacters, position + numCharacters);
        } else {
            return textarea.value.substring(position - numCharacters, position + numCharactersForward);
        }
    },

    // Get the start position of the current line the caret is on
    getLineStartPosition(textarea, position) {
        return textarea.value.lastIndexOf("\n", position - 1) + 1;
    },

    // Get the tab depth of the current line the caret is on
    getLineTabDepth(textarea, position) {
        const lineStartPosition = this.getLineStartPosition(textarea, position);

        let tabDepth = 0;

        for (let i = lineStartPosition; i < position; i++) {
            if (textarea.value[i] == "\t") {
                tabDepth++;
            } else {
                break;
            }
        }

        return tabDepth;
    },

    // Is at the start of a line?
    isAtLineStart(textarea, position) {
        let lineStartPosition = this.getLineStartPosition(textarea, position);

        if (lineStartPosition == position) {
            return true;
        } 
        
        while (lineStartPosition < position) {
            if (textarea.value[lineStartPosition] != "\t") {
                return false;
            }

            lineStartPosition++;
        }

        return true;
    },

    // Is in a pair of opening/closing delimiters?
    inDelimiters(textarea, position, openingDelimiter, closingDelimiter) {
        return textarea.value.lastIndexOf(openingDelimiter, position - 1) > textarea.value.lastIndexOf(closingDelimiter, position - 1)
            && textarea.value.lastIndexOf(openingDelimiter, position - 1) < textarea.value.indexOf(closingDelimiter, position - 1);
    },

    // Is in an opening tag?
    inOpeningTag(textarea, position) {
        if (this.inDelimiters(textarea, position, "<", ">") && this.getSurroundingCharacters(textarea, position, 2) != "</" && !this.inDelimiters(textarea, position, "</", ">")) {
            return true;
        }

        return false;
    },

    cssPropertyName(textarea, position) {
        const colonIndex = textarea.value.lastIndexOf(":", position - 1);

        return this.getMatchingBeforeCursor(textarea, colonIndex, /[\w-]+/);
    },

    /* Tools */
    generalCaret(textarea, value, position, language) {
        // Set the tab depth accordingly
        this.generalContext.tabDepth = this.getLineTabDepth(textarea, position);

        // If at the start of a line, set the context
        if (this.isAtLineStart(textarea, position)) {
            this.generalContext.isAtLineStart = true;
        }

        if (language == "HTML") {
            this.HTMLCaret(textarea, value, position);
        } else if (language == "CSS") {
            this.CSSCaret(textarea, value, position);
        }
    },

    HTMLCaret(textarea, value, position) {
        // If the caret is inside an empty element body, set the HTML context
        if (this.getSurroundingCharacters(textarea, position, 1, 2) == "></") {
            this.HTMLContext.inEmptyElementBody = true;
        } else {
            this.HTMLContext.inEmptyElementBody = false;
        }

        // If the caret is inside an opening tag, set the HTML context
        if (this.inOpeningTag(textarea, position)) {
            this.HTMLContext.inOpeningTag = true;
        } else {
            this.HTMLContext.inOpeningTag = false;
        }
    },

    CSSCaret(textarea, value, position) {
        // If the caret is inside a CSS block, set the CSS context
        if (this.inDelimiters(textarea, position, "{", "}")) {
            this.CSSContext.inBlock = true;
        } else {
            this.CSSContext.inBlock = false;
        }

        // If the caret is inside a CSS value, set the CSS context
        if (this.inDelimiters(textarea, position, ":", ";")) {
            this.CSSContext.inValue = true;
            this.CSSContext.inProperty = false;

            // Get name of property
            this.CSSContext.currentPropertyName = this.cssPropertyName(textarea, position);
        } else if (this.getMatchingBeforeCursor(textarea, position, /[\w-]+/).length > 0) {
            this.CSSContext.inValue = false;
            this.CSSContext.inProperty = true;
        }
    },

    /* Autocompletion */
    currentWord: "",

    getMatchingBeforeCursor(textarea, position, regex) {
        let matching = "";

        for (let i = position - 1; i >= 0; i--) {
            if (regex.test(textarea.value[i])) {
                matching = textarea.value[i] + matching;
            } else {
                break;
            }
        }
        
        return matching;
    },

    validAutoCompleteChars: {
        HTML: /[a-zA-Z_\-]/,
        CSS: /[a-zA-Z_\-\#]/
    },

    autoComplete(event, language) {
        if (!this.validAutoCompleteChars[language].test(event.data)) {
            this.currentWord = "";

            return [];
        } else if (event.data == null && event.inputType == "deleteContentBackward") {
            this.currentWord = this.currentWord.slice(0, -1);

            if (this.currentWord == "") {
                return [];
            }
        } else if (event.data == null && typeof event.data == "undefined") {
            this.currentWord = "";

            return [];
        } else {
            this.currentWord += event.data;
        }

        if (language == "HTML") {
            return this.HTMLAutoComplete(event);
        } else if (language == "CSS") {
            return this.CSSAutoComplete(event);
        }
    },

    HTMLAutoComplete(event) {
        if (this.HTMLContext.inOpeningTag && this.HTMLContext.currentTagName == "") {
            return this.objectKeysStartingWith(HTMLCompletions.tagsWithAttributes, this.currentWord);
        } else if (this.HTMLContext.inOpeningTag && this.HTMLContext.currentTagName != "") {
            let attributes = [];

            attributes = HTMLCompletions.tagsWithAttributes[this.HTMLContext.currentTagName];
            attributes = attributes.concat(HTMLCompletions.globalAttributes);

            return attributes.filter(attribute => attribute.startsWith(this.currentWord))
                .sort((a, b) => a.localeCompare(b));
        }

        return [];
    },

    CSSAutoComplete(event) {
        if (this.CSSContext.inBlock && this.CSSContext.inProperty) {
            return this.objectKeysStartingWith(CSSCompletions, this.currentWord);
        } else if (this.CSSContext.inBlock && this.CSSContext.inValue) {
            return this.arrayValuesStartingWith(CSSCompletions[this.CSSContext.currentPropertyName].values, this.currentWord);
        }

        return [];
    },

    /* Inline Toolbar */
    hasAttribute(textarea, position, attribute) {
        const openingTagIndex = textarea.value.lastIndexOf("<", position - 1);

        if (this.HTMLContext.inOpeningTag) {
            const attributeIndex = textarea.value.lastIndexOf(" " + attribute + "=", position - 1);

            if (attributeIndex > openingTagIndex) {
                return true;
            }
        }

        return false;
    },

    addAttribute(textarea, position, attribute, noValue = false) {
        const openingTagIndex = textarea.value.lastIndexOf("<", position - 1);

        if (this.HTMLContext.inOpeningTag) {
            const attributeIndex = textarea.value.lastIndexOf(" " + attribute + "=", position - 1);

            if (attributeIndex > openingTagIndex) {
                return attributeIndex + 1;
            }
        }

        const closingTagIndex = textarea.value.indexOf(">", openingTagIndex);
        let attributeString = " " + attribute;

        if (!noValue) {
            attributeString += "=\"\"";
        }

        textarea.value = textarea.value.slice(0, closingTagIndex) + attributeString + textarea.value.slice(closingTagIndex);

        return closingTagIndex + attributeString.length - (noValue ? 1 : 0);
    },

    addClass(textarea, position, className) {
        const classAttributeIndex = this.addAttribute(textarea, position, "class");

        textarea.value = textarea.value.slice(0, classAttributeIndex - 1) + className + textarea.value.slice(classAttributeIndex - 1);
    },

    xyFromIndex(textarea, index) {
        const lines = textarea.value.slice(0, index).split("\n");

        const span = document.createElement("span");
        span.style.font = window.getComputedStyle(textarea).font;
        span.style.visibility = "hidden";
        document.body.appendChild(span);

        span.textContent = "a";

        const charWidth = span.getBoundingClientRect().width;
        const lineHeight = span.getBoundingClientRect().height;
        
        return {
            x: lines[lines.length - 1].length * charWidth + 60, // 47 is the padding
            y: (lines.length) * lineHeight + 12 // 10 is the padding
        };
    },

    generalToolbar(language, textarea, value, position) {
        if (language == "HTML") {
            return this.HTMLToolbar(textarea, value, position);
        } else if (language == "CSS") {
            return this.CSSToolbar();
        }
    },

    HTMLToolbar(textarea, value, position) {
        if (this.HTMLContext.inOpeningTag) {
            const tagStartPosition = textarea.value.lastIndexOf("<", position - 1);
            const xy = this.xyFromIndex(textarea, tagStartPosition);

            console.log(xy);
            
            return [true, [
                {
                    // Add class to HTML element
                    type: "button",
                    text: ".",
                    action() {
                        const className = prompt("Class name:");

                        if (className != null) {
                            this.addClass(textarea, position, className);
                        }
                    },
                }
            ], xy];
        }

        return [false, [], {x: 0, y: 0}];
    }
}