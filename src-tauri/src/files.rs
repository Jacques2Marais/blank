use std::fs;
use std::io::Write;
use std::path::Path;

// Save a file to the given path, given its contents
#[tauri::command]
pub fn save_file(path: &str, contents: &str) -> bool {
    let mut file = fs::File::create(path).unwrap();
    file.write_all(contents.as_bytes()).unwrap();

    true
}

// Load a file from given path, return its contents
#[tauri::command]
pub fn get_file_contents(path: &str) -> String {
    if path == "" {
        return String::from("");
    } else if !Path::new(path).exists() {
        return String::from("");
    }

    let contents = fs::read_to_string(path).unwrap();

    // Return String
    contents
}