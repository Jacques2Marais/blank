<script>
    import Editor from './lib/edit-view/Editor.svelte';
    import Renderer from './lib/edit-view/Renderer.svelte';

    import Sidebar from './lib/sidebar/Sidebar.svelte';

    let html = '<h1>Hello, world!</h1>';
    let css = 'h1 { color: red; }';

    let editors = [];
</script>

<main class="container">
    <div class="sidebar-container">
        <Sidebar editors={ editors } />
    </div>
    <div class="edit-view-container">
        <div class="column-divider">
            <!-- A Renderer is a block in which a web page can be rendered. -->
            <div class="row-divider">
                <div>
                    <Renderer>
                    </Renderer>
                </div>
            </div>

            <div class="row-divider">
                <div>
                    <!-- An Editor is a block in which code can be inputted. -->
                    <Editor id={0} bind:this={ editors[0] } />
                </div>
                <div>
                    <Editor id={1} bind:this={ editors[1] } />
                </div>
            </div>
        </div>
    </div>
</main>

<style>
    .container {
        display: flex;
        flex-direction: row;
    }

    .sidebar-container {
        width: 20em;
        border-right: 1px solid black;
    }

    .edit-view-container {
        flex-grow: 1;
    }

    .edit-view-container > .column-divider {
        height: 100vh;
    }

    .column-divider {
        display: flex;
        flex-direction: column;
    }

    .row-divider {
        display: flex;
        flex-direction: row;
    }

    .column-divider > div, .row-divider > div {
        flex: 1;

        width: 100%;
        height: 100%;
    }

    .column-divider > div:not(:last-child) {
        border-bottom: 1px solid black;
    }

    .row-divider > div:not(:last-child) {
        border-right: 1px solid black;
    }
</style>
