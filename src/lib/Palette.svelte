<script lang="ts">
    import {
        basicToString,
        basicToHex,
        basicToRgb,
        basicToHsl,
        toBasic,
        fallbackBasic,
    } from "./colors";
    import type ColorSetting from "./OklchColor";

    let {
        colorSetting,
        selectedIndex = $bindable(),
        index,
    } = $props<{
        colorSetting: ColorSetting;
        selectedIndex: number;
        index: number;
    }>();

    let isSelected = $derived(selectedIndex === index);

    const {
        baseColor,
        colorNum,
        colorName,
        minL,
        maxL,
        factor,
        outputMode,
        fallbackOutputMode,
        showColorValue,
        lightnessMode,
        centerL,
    } = $derived(colorSetting);

    // C = C_max × √(L/100)
    const hex = $derived(basicToHex(baseColor));
    const basicOklch = $derived(toBasic(hex));
    const lBase = $derived(basicOklch.l);
    const cBase = $derived(basicOklch.c);
    const cMax = $derived(cBase / (4 * lBase * (1 - lBase)) || 0);

    let shades = $derived(
        Array.from({ length: colorNum }, (_, i) => {
            let l: number = 0;
            if (lightnessMode === "gamma") {
                const t = i / (colorNum - 1);
                l = (minL + (maxL - minL) * (1 - t ** factor)) / 100;
            } else if (lightnessMode === "sigmoid") {
                const t = (colorNum - i - 1) / (colorNum - 1);
                const bias = (maxL - centerL) / (centerL - minL);
                // const f = t ** factor / (t ** factor + (1 - t) ** factor);
                const f = 1 / (1 + ((1 - t) / t) ** factor * bias);

                l = (minL + (maxL - minL) * f) / 100;
            }

            // Best
            const c = 4 * cMax * l * (1 - l);

            // const c = cMax * Math.sin(Math.PI * l) ** 0.9;
            // const c = cBase;

            const h = baseColor.h;
            const basic = { l, c, h };

            return fallbackBasic(basic, outputMode, fallbackOutputMode);
        }),
    );

    let cssCode = $derived(
        shades
            .map((shade, index) => {
                const basic = toBasic(shade);
                return `--${colorName}-${index * 100 + 100}: ${shade};`;
            })
            .join("\n"),
    );

    // console.log(fallbackBasic(toBasic("oklch(0.56 0.3019 215.36)"), "string"));
    // Expected: #0085a0
    // oklch(0.57 0.102859 218.7572)

    // Actual: #008299
    // oklch(0.56 0.0991 215.36)

    // P3: #0085a0
    // oklch(0.56 0.1316 215.36)

    // SRGB: #018299
    // oklch(0.56 0.099 215.36)

    async function copyToClipboard(text: string) {
        await navigator.clipboard.writeText(text);
    }

    function onclick() {
        selectedIndex = index;
    }

    $effect(() => {
        if (isSelected) {
            const root = document.querySelector(":root") as HTMLElement;
            if (root) {
                shades.forEach((shade, index) => {
                    root.style.setProperty(
                        `--color-${index * 100 + 100}`,
                        shade,
                    );
                });
            }
        }
    });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="palette {isSelected ? 'selected' : ''}" {onclick}>
    <div class="shades">
        {#each shades as shade}
            <div
                class="shade"
                style:background-color={shade}
                style:width={100 / colorNum + "%"}
                onclick={() => copyToClipboard(shade)}
            >
                {#if showColorValue}
                    {#if toBasic(shade).l > 0.5}
                        <p style:color="black">{shade}</p>
                    {:else}
                        <p style:color="white">{shade}</p>
                    {/if}
                {/if}
            </div>
        {/each}
    </div>
    <button
        class="download-palette flexB flexC"
        onclick={() => copyToClipboard(cssCode)}
    >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
            ><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path
                d="M208 0L332.1 0c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9L448 336c0 26.5-21.5 48-48 48l-192 0c-26.5 0-48-21.5-48-48l0-288c0-26.5 21.5-48 48-48zM48 128l80 0 0 64-64 0 0 256 192 0 0-32 64 0 0 48c0 26.5-21.5 48-48 48L48 512c-26.5 0-48-21.5-48-48L0 176c0-26.5 21.5-48 48-48z"
            /></svg
        >
        <p>Copy</p>
    </button>
</div>

<style>
    .palette {
        display: grid;
        grid-template-columns: 1fr 8vw;
        background-color: white;
        box-shadow: 0 0 1vmin rgba(0, 0, 0, 0.1);
        height: 15vmin;
        min-height: 15vmin;
        border-radius: 3vmin;
        padding: 2vmin;
        width: 100%;

        &.selected {
            outline: 0.3vmin solid var(--color-500);
        }

        .shades {
            height: 100%;
            width: 100%;
            display: flex;
            .shade {
                container-type: inline-size;

                height: 100%;
                transition: transform 0.2s ease-in-out;
                display: flex;
                cursor: pointer;

                justify-content: center;
                align-items: flex-end;

                &:first-child {
                    border-radius: 1vmin 0 0 1vmin;
                }

                &:last-child {
                    border-radius: 0 1vmin 1vmin 0;
                }

                p {
                    font-size: 10cqw;
                    margin: 3cqw;
                }
            }
        }

        .download-palette {
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: transparent;
            border: none;
            cursor: pointer;
            gap: 0.5vmin;
            border-radius: 1vmin;
            padding: 1vmin;
            transition: transform 0.2s ease;

            &:hover {
                transform: scale(1.1);
            }

            &:active {
                transform: scale(0.9);
            }

            svg {
                height: 2.5vmin;
            }

            p {
                font-size: 1.5vmin;
            }
        }
    }
</style>
