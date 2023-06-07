<script>
    export let toolbar;

    function itemClick(item) {
        return function() {
            item.action();
        }
    }
</script>

<main>
    <ul>
        {#if toolbar}
            {#each toolbar.items as item}
                <li>
                    {#if item.type == "button"}
                        <button bind:this={ item.button } on:click={ itemClick(item) } title={ item.title }>
                            { item.icon }
                        </button>
                    {/if}
                </li>
            {/each}
        {/if}
    </ul>
</main>

<style>
    main {
        display: flex;
        width: 100%;
        height: 100%;

        flex-direction: column;
        justify-content: center;

        background: #fafafa;
        color: #777;
    }
    
    ul {
        display: block;
        width: 100%;

        margin: 0;
        padding: 0;
    }

    li {
        display: inline-block;
        margin: 0 0.5em;
    }
</style>