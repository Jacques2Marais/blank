import Context from '../context/context.js'
import EditorEvent from '../events/event.js';
import GlobalHistory from '../../utils/GlobalHistory.js';
import CommonUtils from '../../utils/CommonUtils.js';

// Events
import TypingEvent from '../events/typing.js'
import EditorToolbar from '../../edit-view/editor/parts/utils/toolbar.js';

// Autocomplete
import { HTMLCompletions } from './autoCompleteData.js';

export default {
    // The current context of the user in the HTML file
    context: new Context('HTML', {
        // Is the cursor inside an opening tag?
        "in-opening-tag": false,

        // Is the cursor inside a self-closing tag?
        'in-self-closing-tag': false,

        // In tag name?
        'in-tag-name': '',

        // Is inside an element's body?
        'in-element-body': false,

        // Is inside an empty element?
        'in-empty-element-body' : false,

        // Is inside of a pair of empty quotes? 
        'in-empty-quotes': '',

        // Is inside of a pair of quotes (single or double)?
        'in-quotes': '', // ' or "

        // The last word for autocomplete
        'last-word': '',

        // The last typed character
        'last-char': ''
    }),

    /** 
     * Triggered when the user presses a keyboard key
     * @param {TypingEvent} typingEvent The custom TypingEvent that contains information about what was typed and where
     */
    typing(typingEvent) {
        // Detect shift+tab for unindenting
        if (typingEvent.code == "Tab" && typingEvent.isMod("Shift")) {
            // Unindent
            typingEvent.utils.unindent();
            typingEvent.preventDefault();

            return;
        }

        if (typingEvent.key == ">") {
            // Auto close an opening tag
            if (this.context.in("opening-tag") && this.context.getContext("last-char") != "/") {
                // Set tag name context if not already set
                if (typeof this.context.in("tag-name") != "string" || this.context.in("tag-name").length == 0) {
                    this.context.setContext("in-tag-name", this.getTagName(typingEvent));
                }

                const closingTag = `</${this.context.in("tag-name")}>`;

                // Auto-close an opening tag
                typingEvent.utils.insertAtCaret(closingTag);

                GlobalHistory.addHistory(typingEvent.editorID, {
                    type: "insert",
                    text: closingTag,
                    start: typingEvent.utils.caretPosition - closingTag.length,
                    end: typingEvent.utils.caretPosition
                });

                // Reset & set context
                this.context.setContext({
                    "in-opening-tag": false,
                    "in-self-closing-tag": false,
                    "in-element-body": true,
                    "in-empty-element-body": true
                });
            }
        } else if (typingEvent.key == "<") {
            // Set context
            this.context.setContext({
                "in-element-body": false,
                "in-tag-name": true,
                "in-empty-element-body": false,
                "in-opening-tag": true
            });
        } else if (typingEvent.key == " ") {
            // Set tag name if not set
            if (this.context.in("opening-tag") 
                && (typeof this.context.in("tag-name") != "string" || this.context.in("tag-name").length == 0)) {
                this.context.setContext("in-tag-name", this.getTagName(typingEvent));
            } else if (this.context.in("attribute-value") && !this.context.in("quotes")) {
                // Set context
                this.context.setContext("in-attribute-value", false);
            }
        } else if (typingEvent.key == "Tab") {
            if (typingEvent.utils.selection.length > 0) {
                // Indent selection
                typingEvent.utils.indent();
                typingEvent.preventDefault();
            } else {
                typingEvent.utils.insertAtCaret(`\t`, "end");
                typingEvent.preventDefault();
                typingEvent.utils.trigger("input");
            }
        } else if (typingEvent.key == "Enter") {
            if (this.context.in("empty-element-body")) {
                /* TODO: Auto indent empty element body */
                //this.autoIndentNewLine(textarea, event);

                // Set context
                //this.HTMLContext.inEmptyElementBody = false;
            } else {
                // Auto indent
                if (this.context.in("element-body") && this.context.getContext("last-char") == ">") {
                    // ... with extra tabs if next to closing bracket of opening tag
                    typingEvent.utils.autoIndent({extraTabs: 1, breakLine: true});
                    typingEvent.preventDefault();
                } else {
                    typingEvent.utils.autoIndent({breakLine: true});
                    typingEvent.preventDefault();
                }
            }

            // Set context
            //this.generalContext.isAtLineStart = true;
        } else if (typingEvent.key == '"' || typingEvent.key == "'") {
            // Auto close quote pairs
            typingEvent.utils.insertAtCaret(typingEvent.key);

            if (this.context.in("quotes") == typingEvent.key) {
                // Reset context
                this.context.setContext({
                    "in-quotes": '',
                    "in-empty-quotes": false
                });
            }
        } else if (typingEvent.key == "Backspace") {
            // TODO: Remove tab if at line start
            /*if (this.generalContext.isAtLineStart) {
                this.generalContext.tabDepth--;
            }*/
        } else if (typingEvent.isAlphabetKey) {
            // This is an opening tag
            if (this.context.getContext("last-char") == "<") {
                this.context.setContext("in-opening-tag", true);
            } else if (this.context.in("opening-tag") && !this.context.in("quotes")) {
                this.context.setContext("in-attribute-name", typingEvent.key);
            }
        } else if (typingEvent.key == "=") {
            if (this.context.in("opening-tag") && !this.context.in("quotes")) {
                this.context.setContext({
                    "in-attribute-value": true,
                    "in-attribute-name": false
                });
            }
        }

        if (typingEvent.key != "Enter" && typingEvent.key != "Tab") {
            this.context.setContext("is-at-line-start", false);
        }

        // DEPRECATED: Ensure it is a self-closing tag and not a random "/"
        /**if (this.HTMLContext.inSelfClosingTag && typingEvent.key != ">" && typingEvent.key != "/") {
            this.HTMLContext.inSelfClosingTag = false;
        }*/

        // Set context of last character
        this.context.setContext("last-char", typingEvent.key);
    },

    /**
     * Create a toolbar for the HTML language
     */
    toolbar() {
        if (this.context.in("opening-tag")) {
            return new EditorToolbar([
                EditorToolbar.button("add-class", "Add Class", function(button) {
                    button.inputPopup("Class name", "The name of the class to add");
                })
            ]);
        }

        return new EditorToolbar([
            EditorToolbar.button("add-tag", "Add Tag", function(button) {
                button.inputPopup("Tag name", "The name of the tag to add");
            })
        ]);
    },

    /**
     * Code completion
     */
    validRegex: /[a-zA-Z0-9\-_]/,

    codeComplete(typingEvent) {
        if (!this.validRegex.test(typingEvent.key) || typingEvent.key.length > 1) {
            this.context.setContext("last-word", "");

            return [];
        } else {
            if (this.context.getContext("last-word") == "") {
                const lastWord = typingEvent.utils.getMatchingBeforeCaret(this.validRegex);

                if (lastWord != "") {
                    this.context.setContext("last-word", lastWord);
                }
            }

            // Set context
            this.context.appendToContext("last-word", typingEvent.key);
        }

        const lastWord = this.context.getContext("last-word");

        if (this.context.in("tag-name")) {
            return CommonUtils.objectKeysStartingWith(HTMLCompletions.tagsWithAttributes, lastWord);
        } else if (this.context.in("attribute-name")) {
            const tagName = this.context.in("tag-name");

            return CommonUtils.arrayValuesStartingWith(HTMLCompletions.tagsWithAttributes[tagName], lastWord);
        }
            

        return [];
    },


    /* Some general functions */

    /**
     * Get the tag name of the current element in which the caret appears
     * @param {EditorEvent} event The original event that triggered the function's call
     */
    getTagName(event) {
        // Get the text between the last "<" and the cursor position if function was caused by typing event
        if (event instanceof TypingEvent) {
            const openBracketIndex = event.utils.value.lastIndexOf("<", event.utils.originalCaretPosition - 1);

            return event.utils.value.substring(openBracketIndex + 1, event.utils.originalCaretPosition);
        }

        return null;
    },
}