<script lang="ts">
  import Palettes from "./lib/Palettes.svelte";
  import Setting from "./lib/Setting.svelte";
  import {
    defaultSetting,
    isDecodedSettings,
    setDefaultSetting,
  } from "./lib/defaultSetting";
  import type { ColorSetting, DecodedSettings } from "./lib/defaultSetting";

  let colorSettings: ColorSetting[] = $state([]);
  let selectedIndex: number = $state(0);

  const CHUNK = 13;

  const toNum = (v: string, d = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  };

  const toBool = (v: string) => /^true$/i.test(v);

  const buildSetting = (chunk: string[]): ColorSetting => ({
    baseColor: {
      l: toNum(chunk[0]),
      c: toNum(chunk[1]),
      h: toNum(chunk[2]),
    },
    colorNum: toNum(chunk[3]),
    colorName: chunk[4] ?? "",
    outputMode: chunk[5] ?? "",
    factor: toNum(chunk[6]),
    minL: toNum(chunk[7]),
    maxL: toNum(chunk[8]),
    centerL: toNum(chunk[9]),
    fallbackOutputMode: chunk[10] ?? "",
    lightnessMode: chunk[11] === "sigmoid" ? "sigmoid" : "gamma",
    showColorValue: toBool(chunk[12]),
  });

  export const parseSettings = (data: string) => {
    if (typeof data !== "string")
      return { defaultSetting: null, colorSettings: [] };

    const values = data.split(",");
    if (values.length < CHUNK || values.length % CHUNK !== 0)
      return { defaultSetting: null, colorSettings: [] };

    const defaultSetting = buildSetting(values.slice(0, CHUNK));
    const colorSettings = [];

    for (let i = CHUNK; i < values.length; i += CHUNK) {
      const slice = values.slice(i, i + CHUNK);
      if (slice.length === CHUNK) colorSettings.push(buildSetting(slice));
    }

    return { defaultSetting, colorSettings };
  };

  const searchParams = new URLSearchParams(window.location.search);
  let params = Object.fromEntries(searchParams.entries());

  try {
    const data: string = decodeURIComponent(params.settings);

    const { defaultSetting: _defaultSetting, colorSettings: _colorSettings } = parseSettings(data);

    if (_defaultSetting && _colorSettings) {
      colorSettings = _colorSettings;
      setDefaultSetting(_defaultSetting);
    } else {
      colorSettings = [defaultSetting];
    }
  } catch (e) {
    colorSettings = [defaultSetting];
  }
</script>

<main>
  <div class="title flexB flexC">
    <h1>OKLCH UI Shades Generator 🎨</h1>
    <p>Generates a color palette from a single color</p>
  </div>
  <div class="main-content">
    <Setting
      bind:selectedColorSetting={colorSettings[selectedIndex]}
      bind:selectedIndex
      bind:colorSettings
    />
    <Palettes bind:colorSettings bind:selectedIndex />
  </div>
</main>

<style>
  main {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 20vmin 1fr;
    gap: 0;
    place-items: center;

    height: 100vh;
    width: 100vw;

    .title {
      h1 {
        font-size: 5vmin;
        letter-spacing: -0.02em;
        color: var(--color-900);
      }

      p {
        font-size: 2vmin;
        color: var(--color-900);
      }
    }

    .main-content {
      height: 100%;
      width: 100%;
      gap: 10vmin;
      padding: 5vmin;

      display: grid;
      grid-template-columns: 25vw 3fr;
      grid-template-rows: 1fr;
      place-items: center;
    }
  }
</style>
