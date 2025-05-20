<script lang="ts">
    import {
        basicToHex,
        basicToRgb,
        basicToHsl,
        basicToString,
        toBasic,
        isValidColor,
    } from "./colors";
    import {
        defaultSetting,
        setDefaultSetting,
        originalDefaultSetting,
        type ColorSetting,
    } from "./defaultSetting";

    let settingMode = $state("basic");

    let {
        selectedColorSetting = $bindable(),
        selectedIndex = $bindable(),
        colorSettings = $bindable(),
    } = $props();

    let baseColorInputMode = $state("hex");

    // selectedColorSetting.baseColor = {l: 0, c: 0, h: 0};

    let baseColorValue = $derived.by(() => {
        switch (baseColorInputMode) {
            case "hex":
                return basicToHex(selectedColorSetting.baseColor);
            case "rgb":
                return basicToRgb(selectedColorSetting.baseColor);
            case "hsl":
                return basicToHsl(selectedColorSetting.baseColor);
            case "oklch":
                return basicToString(selectedColorSetting.baseColor);
            default:
                return "";
        }
    });

    function oninput() {
        if (isValidColor(baseColorValue, baseColorInputMode)) {
            selectedColorSetting.baseColor = toBasic(baseColorValue);
        }
    }

    function onColorInput(event: Event) {
        const input = event.target as HTMLInputElement;
        const colorValue = input.value;
        console.log(colorValue);

        if (isValidColor(colorValue, "hex")) {
            selectedColorSetting.baseColor = toBasic(colorValue);
        }
    }

    function deleteColor() {
        if (colorSettings.length > 1) {
            colorSettings.splice(selectedIndex, 1);
            selectedIndex = Math.max(selectedIndex - 1, 0);
        }
    }

    function updateParams() {
        const settingsData = colorSettings.flatMap(
            (colorSetting: ColorSetting) => [
                colorSetting.baseColor.l,
                colorSetting.baseColor.c,
                colorSetting.baseColor.h,
                colorSetting.colorNum,
                colorSetting.colorName,
                colorSetting.outputMode,
                colorSetting.factor,
                colorSetting.minL,
                colorSetting.maxL,
                colorSetting.centerL,
                colorSetting.fallbackOutputMode,
                colorSetting.lightnessMode,
                colorSetting.showColorValue,
            ],
        );

        const defaultSettingData = [
            defaultSetting.baseColor.l,
            defaultSetting.baseColor.c,
            defaultSetting.baseColor.h,
            defaultSetting.colorNum,
            defaultSetting.colorName,
            defaultSetting.outputMode,
            defaultSetting.factor,
            defaultSetting.minL,
            defaultSetting.maxL,
            defaultSetting.centerL,
            defaultSetting.fallbackOutputMode,
            defaultSetting.lightnessMode,
            defaultSetting.showColorValue,
        ];

        const data: string = [...defaultSettingData, ...settingsData].map(data => encodeURIComponent(data)).join(",");

        updateQueryParam("settings", data);
    }

    $effect(updateParams);

    function updateQueryParam(key: string, value: string) {
        const url = new URL(window.location.href);
        const searchParams = new URLSearchParams(window.location.search);
        url.searchParams.set(key, value);
        window.history.pushState({}, "", url);
    }

    function random() {
        const randomColor = Math.floor(Math.random() * (2 ** 24 - 1)).toString(
            16,
        );
        selectedColorSetting.baseColor = toBasic(`#${randomColor}`);
    }

    function setAsDefault() {
        setDefaultSetting(selectedColorSetting);
        updateParams();
    }

    function resetThisSetting() {
        selectedColorSetting = defaultSetting;
    }

    function resetDefaultSetting() {
        setDefaultSetting(originalDefaultSetting);
        updateParams();
    }

    function resetAll() {
        setDefaultSetting(originalDefaultSetting);
        colorSettings = [defaultSetting];
        selectedIndex = 0;
        updateParams();
    }
</script>

<div class="setting-wrapper">
    <div class="switch-advanced flexB">
        <button
            onclick={() => {
                settingMode = "basic";
            }}
            class={settingMode === "basic" ? "selected" : ""}>Basic</button
        >
        <button
            onclick={() => {
                settingMode = "advanced";
            }}
            class={settingMode === "advanced" ? "selected" : ""}
            >Advanced</button
        >

        <button
            onclick={() => {
                settingMode = "other";
            }}
            class={settingMode === "other" ? "selected" : ""}>Other</button
        >
    </div>
    <div class="setting flexB flexC {settingMode}">
        {#if settingMode === "basic"}
            <label>
                Base Color:
                <div class="input-select">
                    <input
                        type="text"
                        bind:value={baseColorValue}
                        {oninput}
                        class={isValidColor(baseColorValue, baseColorInputMode)
                            ? ""
                            : "invalid"}
                    />
                    <select bind:value={baseColorInputMode}>
                        <option value="hex">Hex</option>
                        <option value="rgb">RGB</option>
                        <option value="hsl">HSL</option>
                        <option value="oklch">OKLCH</option>
                    </select>
                    <button class="random flexB" onclick={random}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            ><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path
                                d="M403.8 34.4c12-5 25.7-2.2 34.9 6.9l64 64c6 6 9.4 14.1 9.4 22.6s-3.4 16.6-9.4 22.6l-64 64c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6l0-32-32 0c-10.1 0-19.6 4.7-25.6 12.8L284 229.3 244 176l31.2-41.6C293.3 110.2 321.8 96 352 96l32 0 0-32c0-12.9 7.8-24.6 19.8-29.6zM164 282.7L204 336l-31.2 41.6C154.7 401.8 126.2 416 96 416l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c10.1 0 19.6-4.7 25.6-12.8L164 282.7zm274.6 188c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6l0-32-32 0c-30.2 0-58.7-14.2-76.8-38.4L121.6 172.8c-6-8.1-15.5-12.8-25.6-12.8l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c30.2 0 58.7 14.2 76.8 38.4L326.4 339.2c6 8.1 15.5 12.8 25.6 12.8l32 0 0-32c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l64 64c6 6 9.4 14.1 9.4 22.6s-3.4 16.6-9.4 22.6l-64 64z"
                            /></svg
                        >
                    </button>
                </div>
                <label>
                    <input
                        type="color"
                        oninput={onColorInput}
                        value={basicToHex(selectedColorSetting.baseColor)}
                    />
                    <div
                        class="color-sample"
                        style:background-color={baseColorValue}
                    ></div>
                </label>
            </label>
            <label>
                Number of Colors: {selectedColorSetting.colorNum}
                <input
                    type="range"
                    bind:value={selectedColorSetting.colorNum}
                    min="5"
                    max="12"
                    step="1"
                />
            </label>

            <label>
                Color Name:
                <input
                    type="text"
                    bind:value={selectedColorSetting.colorName}
                />
            </label>

            <label>
                Output Mode:
                <select bind:value={selectedColorSetting.outputMode}>
                    <option value="hex">Hex</option>
                    <option value="rgb">RGB</option>
                    <option value="hsl">HSL</option>
                    <option value="string">OKLCH</option>
                </select>
            </label>

            <button onclick={deleteColor} class="delete">Delete</button>
        {:else if settingMode === "advanced"}
            <label>
                Factor Value: {selectedColorSetting.factor}
                <input
                    type="range"
                    bind:value={selectedColorSetting.factor}
                    min="0.1"
                    max="3"
                    step="0.01"
                />
            </label>

            <label>
                Minimum Lightness: {selectedColorSetting.minL}%
                <input
                    type="range"
                    bind:value={selectedColorSetting.minL}
                    min="0"
                    max="100"
                    step="1"
                />
            </label>

            <label>
                Maximum Lightness: {selectedColorSetting.maxL}%
                <input
                    type="range"
                    bind:value={selectedColorSetting.maxL}
                    min="0"
                    max="100"
                    step="1"
                />
            </label>

            {#if selectedColorSetting.lightnessMode === "sigmoid"}
                <label>
                    Center Lightness: {selectedColorSetting.centerL}%
                    <input
                        type="range"
                        bind:value={selectedColorSetting.centerL}
                        min="0"
                        max="100"
                        step="1"
                    />
                </label>
            {/if}

            <label>
                Fallback output Mode:
                <select bind:value={selectedColorSetting.fallbackOutputMode}>
                    <option value="hex">Hex</option>
                    <option value="rgb">RGB</option>
                    <option value="hsl">HSL</option>
                    <option value="string">OKLCH</option>
                </select>
            </label>

            <label>
                L Calculation Mode:
                <select bind:value={selectedColorSetting.lightnessMode}>
                    <option value="gamma">Gamma</option>
                    <option value="sigmoid">Sigmoid</option>
                </select>
            </label>

            <!-- Add show color value check box -->
            <label style:cursor="pointer">
                <span
                    class="strike {selectedColorSetting.showColorValue
                        ? 'on'
                        : 'off'}">Show Color Value</span
                >
                <input
                    type="checkbox"
                    bind:checked={selectedColorSetting.showColorValue}
                />
            </label>
        {:else if settingMode === "other"}
            <button onclick={setAsDefault}>Set this as a default setting</button
            >
            <button onclick={resetThisSetting}>Reset this setting</button>
            <button onclick={resetDefaultSetting}
                >Reset a default setting</button
            >

            <button onclick={resetAll}>Reset <b>all</b></button>
        {/if}
    </div>
</div>

<style>
    .setting-wrapper {
        display: grid;
        grid-template-rows: 10vmin 1fr;
        place-items: center;
        place-content: center;
        container-type: inline-size;

        height: 100%;
        width: 100%;
        box-shadow:
            0 0 10vmin -4vmin color-mix(in srgb, var(--color-500) 25%, transparent),
            0 0 1vmin -0.1vmin color-mix(in srgb, var(--color-500) 25%, transparent);
        border: solid 0.1vmin var(--color-500);

        border-radius: 3vmin;

        .switch-advanced {
            gap: 2vmin;
            width: 90cqw;

            button {
                background-color: white;
                color: var(--color-500);
                border: solid 0.1vmin var(--color-500);
                border-radius: 1vmin;
                cursor: pointer;
                width: 20cqw;
                height: 8cqw;
                font-size: 3cqw;
                transition:
                    background-color 0.2s ease-in-out,
                    color 0.2s ease-in-out;

                &:hover {
                    background-color: white;
                    color: var(--color-500);
                }

                &.selected {
                    background-color: var(--color-500);
                    color: white;
                }
            }
        }

        .setting {
            height: 100%;
            width: 100%;
            gap: 4vmin;

            &.advanced {
                gap: 3.5vmin;
            }

            &.other {
                gap: 6vmin;

                button {
                    background-color: white;
                    color: var(--color-500);
                    border: solid 0.1vmin var(--color-500);
                    border-radius: 1vmin;
                    cursor: pointer;
                    width: 80cqw;
                    height: 8cqw;
                    font-size: 3cqw;
                    transition:
                        background-color 0.2s ease-in-out,
                        color 0.2s ease-in-out;

                    &:hover {
                        background-color: var(--color-500);
                        color: white;
                    }
                }
            }

            label {
                width: 80cqw;

                display: block;
                font-size: 5cqw;

                color: var(--color-800);

                .strike {
                    position: relative;

                    &::after {
                        content: "";
                        position: absolute;
                        left: 0;
                        top: 50%;
                        width: 0;
                        height: 2px;
                        background: var(--color-800);
                        transform: translateY(-50%);
                        transition: width 0.2s ease;
                    }

                    &.off::after {
                        width: 100%;
                    }

                    &.on::after {
                        width: 0%;
                    }
                }

                & > select {
                    margin-top: 1vmin;
                    border-radius: 1vmin;

                    transition: border 0.2s ease-in-out;
                    outline: none;
                    border: solid 0.1vmin #bababa;
                    &:focus {
                        border: solid 0.1vmin var(--color-500);
                    }
                }

                --select-width: 22.5cqw;
                --button-width: 15cqw;

                select {
                    width: var(--select-width);
                    font-size: 2vmin;
                    padding: 0.5vmin;
                    font-size: 4cqw;
                }

                .input-select {
                    display: flex;
                    width: 80cqw;
                    margin-top: 1vmin;

                    input {
                        display: block;
                        width: calc(
                            80cqw - var(--select-width) - var(--button-width)
                        );
                        border-radius: 1vmin 0 0 1vmin;
                    }

                    select {
                        border-radius: 0 1vmin 1vmin 0;

                        background-color: var(--color-500);
                        border: solid 0.1vmin var(--color-500);

                        color: white;
                    }

                    .random {
                        width: var(--button-width);
                        border: none;
                        background-color: transparent;
                        cursor: pointer;
                        transition: transform 0.2s ease;

                        svg {
                            width: 6cqw;
                            fill: var(--color-800);
                        }

                        &:hover {
                            transform: scale(1.1);
                        }
                    }
                }

                input[type="color"] {
                    appearance: none;
                    opacity: 0;
                    position: absolute;
                }

                .color-sample {
                    width: 80cqw;
                    height: 10cqw;
                    margin-top: 3cqw;
                    border-radius: 1vmin;
                    border: solid 0.1vmin #bababa;
                    cursor: pointer;
                }

                & > input {
                    width: 80cqw;
                    margin-top: 1vmin;
                    border-radius: 1vmin;
                }

                input {
                    display: block;

                    &[type="text"] {
                        border: solid 0.1vmin #bababa;
                        outline: none;
                        font-size: 4cqw;
                        padding: 1cqw;
                        padding-left: 2cqw;
                        transition: border 0.2s ease-in-out;

                        &:focus {
                            border: solid 0.1vmin var(--color-700);
                        }

                        &.invalid {
                            border: solid 0.1vmin #ff9385;
                            color: #a60006;
                        }
                    }

                    &[type="checkbox"] {
                        appearance: none;
                        height: 0;
                        width: 0;
                    }
                }
            }

            .delete {
                width: 80cqw;

                display: block;
                font-size: 5cqw;

                background-color: white;
                color: oklch(0.6 0.1824 28.31);
                border: solid 0.1vmin oklch(0.6 0.1824 28.31);
                border-radius: 1vmin;
                cursor: pointer;
                height: 8cqw;
                font-size: 3cqw;
                transition:
                    background-color 0.2s ease-in-out,
                    color 0.2s ease-in-out;

                &:hover {
                    background-color: oklch(0.6 0.1824 28.31);
                    color: white;
                }
            }
        }
    }
</style>
