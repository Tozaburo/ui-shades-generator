<script lang="ts">
    import Palette from "./Palette.svelte";
    import { defaultSetting } from "./defaultSetting";

    let { colorSettings = $bindable(), selectedIndex = $bindable() } = $props();

    function onclick() {
        colorSettings = [...colorSettings, defaultSetting];
        selectedIndex = colorSettings.length - 1;
    }
</script>

<div class="palettes flexF flexC">
    {#each colorSettings as colorSetting, index (index)}
        <Palette {colorSetting} bind:selectedIndex {index} />
    {/each}
    <button class="add" {onclick}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
            ><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path
                d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"
            /></svg
        >
    </button>
</div>

<style>
    .palettes {
        height: calc(100vh - 30vmin);
        width: 100%;
        overflow: visible;
        overflow-y: scroll;
        padding: 2vmin;
        min-height: 0;
        gap: 3vmin;

        .add {
            background-color: black;
            padding: 2vmin;
            border: none;
            border-radius: 2vmin;
            cursor: pointer;
            height: 7vmin;
            width: 7vmin;
            box-shadow: 0 0 3vmin -1vmin rgba(0, 0, 0, 0.4);

            transition:
                background-color 0.2s ease,
                border-radius 0.2s ease;

            svg {
                fill: white;
                aspect-ratio: 1;
                transition: fill 0.2s ease;
            }

            &:hover {
                border-radius: 3.5vmin;
            }
        }
    }
</style>
