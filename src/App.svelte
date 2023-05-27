<script>
    import Editor from './lib/edit-view/editor/Editor.svelte';
    import Renderer from './lib/edit-view/Renderer.svelte';
    import Sidebar from './lib/sidebar/Sidebar.svelte';
</script>

<main class="container">
    <div class="sidebar-container">
        <!-- The left sidebar -->
        <Sidebar/>
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
                    <Editor id={0}/>
                </div>
                <div>
                    <Editor id={1}/>
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
        border-right: 4px solid #f6f6f6;

        background-color: #f4f4f4;
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

        max-height: 50vh;
    }

    .column-divider > div, .row-divider > div {
        flex: 1;

        width: 100%;
        height: 100%;
    }

    .column-divider > div:not(:last-child) {
        border-bottom: 4px solid #f6f6f6;
    }

    .row-divider > div:not(:last-child) {
        border-right: 4px solid #f6f6f6;
    }
</style>
