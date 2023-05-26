import { s } from '@tauri-apps/api/app-373d24a3.js';
import Context from '../context/context.js'
import EditorEvent from '../events/event.js';

// Events
import TypingEvent from '../events/typing.js'

export default {
    // The current context of the user in the HTML file
    context: new Context('HTML', {
        // Is the cursor inside an opening tag?
        "in-opening-tag": false,

        // Is the cursor inside a self-closing tag?
        inSelfClosingTag: false,

        // Current tag name
        'tag-name': '',

        // Is inside an element's body?
        inElementBody: false,

        // Is inside an empty element?
        inEmptyElementBody : false,

        // Is inside of a pair of empty quotes? 
        isInsideEmptyQuotes: ''
    }),

    /** 
     * Triggered when the user presses a keyboard key
     * @param {TypingEvent} typingEvent The custom TypingEvent that contains information about what was typed and where
     */
    typing(typingEvent) {
        if (typingEvent.key == ">") {
            // Auto close an opening tag
            if (this.context.in("opening-tag") && this.context.getContext("last-char") != "/") {
                // Set tag name context if not already set
                if (!this.context.isSet("tag-name")) {
                    this.context.setContext("tag-name", this.getTagName(typingEvent));
                }

                // Auto-close an opening tag
                typingEvent.insertAtCaret(`</${this.HTMLContext.currentTagName}>`);

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
                "tag-name": "",
                "in-empty-element-body": false
            });
        } else if (typingEvent.key == " ") {
            // Set tag name if not set
            if (this.context.in("opening-tag") && !this.context.isSet("tag-name")) {
                this.context.setContext("tag-name", this.getTagName(typingEvent))
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
                    typingEvent.autoIndent({extraTabs: 1});
                } else {
                    typingEvent.autoIndent();
                }
            }

            // Set context
            this.generalContext.isAtLineStart = true;
        } else if (typingEvent.key == '"' || typingEvent.key == "'") {
            // Auto close quote pairs
            typingEvent.insertAtCaret(typingEvent.key);
        } else if (typingEvent.key == "Backspace") {
            // TODO: Remove tab if at line start
            /*if (this.generalContext.isAtLineStart) {
                this.generalContext.tabDepth--;
            }*/
        } else if (typingEvent.isAlphabetKey) {
            // This is an opening tag
            if (this.context.getContext("last-char") == "<") {
                this.setContext("in-opening-tag", true);
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

    /* Some general functions */

    /**
     * Get the tag name of the current element in which the caret appears
     * @param {EditorEvent} event The original event that triggered the function's call
     */
    getTagName(event) {
        // Get the text between the last "<" and the cursor position if function was caused by typing event
        if (event instanceof TypingEvent) {
            const openBracketIndex = event.textValue.lastIndexOf("<", event.caretPosition - 1);

            return event.textValue.substring(openBracketIndex + 1, event.caretPosition);
        }

        return null;
    },
}