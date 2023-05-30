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
    let mut syntax_set = SyntaxSet::load_defaults_newlines();
    let mut syntax = syntax_set.find_syntax_by_name(language);

    // Check if syntax is found
    if syntax.is_none() {
        syntax_set = SyntaxSet::load_from_folder("syntect-resources/syntaxes").unwrap();
        syntax = syntax_set.find_syntax_by_name(language);
    }

    let syntax = syntax.unwrap();

    //syntax = syntax;

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
    //let ts = ThemeSet::load_defaults();
    let ts = ThemeSet::load_from_folder("syntect-resources/themes").unwrap();
    let theme = &ts.themes[theme];

    // Print list of themes
    // for (name, _) in ts.themes.iter() {
    //     println!("{}", name);
    // }

    let syntax_set = SyntaxSet::load_from_folder("syntect-resources/syntaxes").unwrap();
    // Print list of syntaxes
    println!("Syntaxes: ");
    for syntax in syntax_set.syntaxes() {
        println!("{}", syntax.name);
    }
    
    css_for_theme_with_class_style(theme, PREFIXED_HIGHLIGHT).unwrap()
}