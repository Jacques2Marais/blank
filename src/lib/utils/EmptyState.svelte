<script>
    export let text = "";
</script>

<div class="empty-state">
    <img src="/public/hand.png" alt="stop. wait a minute." class="stophand">

    {#if text}
        <p>{ text }</p>
    {:else}
        <p>No content to display.</p>
    {/if}
</div>

<style>
    @import "/fonts/Montserrat.css";

    .empty-state {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;

        background: #fafafa;;
        color: #ccc;

        font-family: 'Montserrat', sans-serif;
        font-weight: 600;
    }

    .empty-state p {
        margin: 0;
        width: 12em;
        text-align: center;

        font-size: 0.8em;
        text-transform: uppercase;
    }

    .empty-state img {
        width: 5em;
        margin-bottom: 1.5em;
        margin-left: 1em;

        filter: grayscale(100%) opacity(0.2);
        transition: filter 0.2s ease-in-out;
    }

    .empty-state img:hover {
        filter: grayscale(100%) opacity(0.3);
    }
</style>