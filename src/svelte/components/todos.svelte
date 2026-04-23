<script>
    import { flip } from "svelte/animate";
    import { quintOut } from "svelte/easing";
    import { crossfade } from "svelte/transition";

    const [send, receive] = crossfade({
        fallback(node, params) {
            const style = getComputedStyle(node);
            const transform = style.transform === "none" ? "" : style.transform;

            return {
                duration: 600,
                easing: quintOut,
                css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`,
            };
        },
    });

    let todos = $state([
        { id: 1, done: false, description: "write some docs" },
        { id: 2, done: false, description: "start writing JSConf talk" },
        { id: 3, done: true, description: "buy some milk" },
        { id: 4, done: false, description: "mow the lawn" },
        { id: 5, done: false, description: "feed the turtle" },
        { id: 6, done: false, description: "fix some bugs" },
    ]);

    // svelte-ignore state_referenced_locally
    let uid = todos.length + 1;

    function add(input) {
        const todo = {
            id: uid++,
            done: false,
            description: input.value,
        };

        todos = [todo, ...todos];
        input.value = "";
    }

    function remove(todo) {
        todos = todos.filter((t) => t !== todo);
    }
</script>

<div class="board">
    <input
        class="new-todo"
        placeholder="what needs to be done?"
        onkeydown={(event) => event.key === "Enter" && add(event.target)}
    />

    <div class="left">
        <h2>todo</h2>
        {#each todos.filter((t) => !t.done) as todo (todo.id)}
            <label
                in:receive={{ key: todo.id }}
                out:send={{ key: todo.id }}
                animate:flip
            >
                <input type="checkbox" bind:checked={todo.done} />
                {todo.description}
                <button onclick={() => remove(todo)}>x</button>
            </label>
        {/each}
    </div>

    <div class="right">
        <h2>done</h2>
        {#each todos.filter((t) => t.done) as todo (todo.id)}
            <label
                in:receive={{ key: todo.id }}
                out:send={{ key: todo.id }}
                animate:flip
            >
                <input type="checkbox" bind:checked={todo.done} />
                {todo.description}
                <button onclick={() => remove(todo)}>x</button>
            </label>
        {/each}
    </div>

    <div class="clear"></div>
</div>

<style>
    .new-todo {
        margin: 0.5em 0;
        width: 100%;
        font-size: 1.4em;
    }

    .board {
        margin: 0 auto;
    }

    .left,
    .right {
        float: left;
        box-sizing: border-box;
        padding: 0 1em 0 0;
        width: 50%;
    }

    h2 {
        font-weight: 200;
        font-size: 2em;
        user-select: none;
    }

    label {
        display: block;
        top: 0;
        left: 0;
        margin: 0 0 0.5em 0;
        border-radius: 2px;
        background-color: #eee;
        padding: 0.5em;
        width: 100%;
        color: black;
        font-size: 1em;
        line-height: 1;
        text-align: left;
    }

    input {
        margin: 0;
    }

    .right label {
        background-color: rgb(180, 240, 100);
    }

    button {
        float: right;
        opacity: 0;
        transition: opacity 0.2s;
        box-sizing: border-box;
        border: none;
        background-color: transparent;
        padding: 0 0.5em;
        height: 1em;
        color: rgb(170, 30, 30);
        line-height: 1;
    }

    label:hover button {
        opacity: 1;
    }

    .clear {
        clear: left;
    }
</style>
