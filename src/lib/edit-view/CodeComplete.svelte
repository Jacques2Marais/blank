<script>
    export let lastWord = "";

    const completions = [
        "hello",
        "world",
        "foo",
        "bar",
        "baz",
        "qux",
        "quux",
        "corge",
        "grault",
        "garply",
        "waldo",
        "fred",
        "plugh",
        "xyzzy",
        "thud",
        "asdf",
        "jkl;",
        "zxcv",
        "bnm,",
        "qwer",
        "tyui",
        "op",
    ];

    export function getCompletions (word) {
        return completions.filter((completion) => {
            return completion.startsWith(word);
        });
    }
</script>

<ul>
    {#each getCompletions() as completion}
        <li>{ completion }</li>
    {/each}
</ul>