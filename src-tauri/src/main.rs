// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::io::Write;
use std::path::Path;

use syntect::highlighting::ThemeSet;
use syntect::html::{ClassedHTMLGenerator, ClassStyle, css_for_theme_with_class_style};
use syntect::parsing::SyntaxSet;
use syntect::util::LinesWithEndings;
use tauri::regex::Regex;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
// Count the number of words given a string and return an integer
#[tauri::command]
fn count_words(value: &str) -> i32 {
    value.split_whitespace().count() as i32
}

// Get a list of all files & folders in a given directory
#[tauri::command]
fn get_files(directory: &str) -> Vec<String> {
    print!("Directory: {}", directory);

    let paths = fs::read_dir(directory).unwrap();

    let mut files = Vec::new();
    for entry in paths {
        let entry = entry.unwrap();
        let mut path = entry.path().display().to_string();

        // Add a trailing slash to directories for clarity in the JS
        if entry.metadata().unwrap().is_dir() {
            path = path + "/";
        }

        files.push(path);
    }

    // Return Vector of Strings
    files
}

// Save a file to the given path, given its contents
#[tauri::command]
fn save_file(path: &str, contents: &str) -> bool {
    let mut file = fs::File::create(path).unwrap();
    file.write_all(contents.as_bytes()).unwrap();

    true
}

// Load a file from given path, return its contents
#[tauri::command]
fn load_file(path: &str) -> String {
    let contents = fs::read_to_string(path).unwrap();

    // Return String
    contents
}

/*// Serve static files from given path
#[tauri::command]
fn serve_static_files(path: &str) -> () {
    FileServer::http("127.0.0.1:9080")
        .expect("Server should be created")
        .run(path)
        .expect("Server should start");
}*/

// Make a path to a file absolute
fn absolutize(path: &str, base: &str) -> String {
    let path = Path::new(path);
    let base = Path::new(base);

    if path.is_absolute() {
        path.to_str().unwrap().to_string()
    } else {
        base.join(path).to_str().unwrap().to_string()
    }
}

// Take HTML code and make external libraries inline
#[tauri::command]
fn inline_html(file: &str) -> String {
    if file == "" {
        return String::from("");
    }

    println!("File: {}", file);
    let file_path = Path::new(file);
    let file_dir = file_path.parent().unwrap();

    // Read HTML file
    let html = fs::read_to_string(file).unwrap();
    let mut new_html = html.clone();

    let dom = tl::parse(&html, Default::default()).unwrap();
    let parser = dom.parser();

    let scripts = dom.query_selector("script").unwrap();

    // Inline scripts
    for script in scripts {
        let script = script.get(parser).unwrap().as_tag().unwrap();
        let src = script.attributes().get("src").unwrap().unwrap().try_as_utf8_str().unwrap();
        let abs_src = absolutize(src, file_dir.to_str().unwrap());

        // Does the file exist?
        if !Path::new(&abs_src).exists() {
            continue;
        }

        let contents = fs::read_to_string(abs_src.clone()).unwrap();
        let re = Regex::new(&format!(r#"<script (.*)src="{}"(.*)></script>"#, src)).unwrap();

        new_html = re.replace(&new_html, &format!(r#"<script>{}</script>"#, contents)).to_string();
    }

    let links = dom.query_selector("link").unwrap();

    // Inline styles (link elements)
    for link in links {
        let link = link.get(parser).unwrap().as_tag().unwrap();
        let href = link.attributes().get("href").unwrap().unwrap().try_as_utf8_str().unwrap();
        let abs_href = absolutize(href, file_dir.to_str().unwrap());

        // Does the file exist?
        if !Path::new(&abs_href).exists() {
            continue;
        }

        let contents = fs::read_to_string(abs_href.clone()).unwrap();
        let re = Regex::new(&format!(r#"<link (.*)href="{}"(.*)/?>(</link>)?"#, href)).unwrap();
        new_html = re.replace(&new_html, &format!(r#"<style>{}</style>"#, contents)).to_string();
    }

    new_html
}


// Setup prefixed class names for syntax highlighting
pub const PREFIXED_HIGHLIGHT: ClassStyle = ClassStyle::SpacedPrefixed { prefix: "blank-editor-" };

// Syntax highlight the given code
#[tauri::command]
fn syntax_highlight(code: &str, language: &str) -> String {
    // if code length = 0, return empty string
    if code.len() == 0 {
        return String::from("");
    }

    print!("Language: {}", language);

    let syntax_set = SyntaxSet::load_defaults_newlines();
    let syntax = syntax_set.find_syntax_by_name(language).unwrap();

    let mut html_generator = ClassedHTMLGenerator::new_with_class_style(syntax, &syntax_set, PREFIXED_HIGHLIGHT);
    for line in LinesWithEndings::from(code) {
        html_generator.parse_html_for_line_which_includes_newline(line).unwrap();
    }

    let mut last_newline = "";
    if code.ends_with('\n') {
        last_newline = "<br/>&nbsp;";
    }
    
    html_generator.finalize().replace("\n", "<br/>") + last_newline
}

#[tauri::command]
fn load_syntax_highlight_theme_css(theme: &str) -> String {
    let ts = ThemeSet::load_defaults();
    let theme = &ts.themes[theme];
    
    css_for_theme_with_class_style(theme, PREFIXED_HIGHLIGHT).unwrap()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![count_words, get_files, syntax_highlight, load_syntax_highlight_theme_css, save_file, load_file, inline_html])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
