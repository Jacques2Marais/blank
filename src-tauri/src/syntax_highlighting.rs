use syntect::highlighting::ThemeSet;
use syntect::html::{ClassedHTMLGenerator, ClassStyle, css_for_theme_with_class_style};
use syntect::parsing::SyntaxSet;
use syntect::util::LinesWithEndings;

// Setup prefixed class names for syntax highlighting
pub const PREFIXED_HIGHLIGHT: ClassStyle = ClassStyle::SpacedPrefixed { prefix: "blank-editor-" };

// Syntax highlight the given code
#[tauri::command]
pub fn get_syntax_highlighted_html(value: &str, language: &str) -> String {
    // if code length = 0, return empty string
    if value.len() == 0 {
        return String::from("");
    }

    print!("Language: {}", language);

    let syntax_set = SyntaxSet::load_defaults_newlines();
    let syntax = syntax_set.find_syntax_by_name(language).unwrap();

    let mut html_generator = ClassedHTMLGenerator::new_with_class_style(syntax, &syntax_set, PREFIXED_HIGHLIGHT);
    for line in LinesWithEndings::from(value) {
        html_generator.parse_html_for_line_which_includes_newline(line).unwrap();
    }

    let mut last_newline = "";
    if value.ends_with('\n') {
        last_newline = "<br/>&nbsp;";
    }
    
    html_generator.finalize().replace("\n", "<br/>") + last_newline
}

#[tauri::command]
pub fn get_syntax_highlighted_theme_css(theme: &str) -> String {
    let ts = ThemeSet::load_defaults();
    let theme = &ts.themes[theme];
    
    css_for_theme_with_class_style(theme, PREFIXED_HIGHLIGHT).unwrap()
}