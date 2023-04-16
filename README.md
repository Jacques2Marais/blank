# Blank
A work-in-progress attempt at building an IDE focused on front-end development using Rust (Tauri) and Svelte.

## Setup
To setup and run the project: clone, change directory into base folder and then

    npm install
    npm run tauri dev
    
## To-do
- [x] Basic functionality: file tree, edit and save files, syntax highlighting, editors with tabs for multiple open files, preview web pages.
- [ ] Clean-up code: improve structure, add comments, use more global stores and events.
- [ ] Sync workflow between HTML, CSS and JavaScript: sync scrolling on web page and HTML, simple navigation between elements and their CSS selectors (idea: click button to add selector and styles for element).
- [ ] Add more front-end specific features to IDE.
- [ ] Multiple themes, user config.
- [ ] Improve performance: line-by-line syntax highlighting (idea: highlight current line as user types), threading.

## Example Video
https://user-images.githubusercontent.com/88091427/232338157-3d299a0e-028b-46ff-913e-690d6d9f5929.mp4

## Release
The first version -- version 1.0.0 -- has also been released. You can find it [here](https://github.com/Jacques2Marais/blank/releases/tag/v1.0.0)!
