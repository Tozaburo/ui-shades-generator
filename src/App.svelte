<script lang="ts">
  import Palettes from "./lib/Palettes.svelte";
  import Setting from "./lib/Setting.svelte";
  import {
    cloneColorSetting,
    defaultSetting,
    setDefaultSetting,
  } from "./lib/defaultSetting";
  import type { ColorSetting, ShadeMode } from "./lib/defaultSetting";

  let colorSettings: ColorSetting[] = $state([]);
  let selectedIndex: number = $state(0);

  const LEGACY_CHUNK = 12;
  const CURRENT_CHUNK = 13;

  const toNum = (v: string, d = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  };

  const toBool = (v: string) => /^true$/i.test(v);

  const toShadeMode = (v: string | undefined): ShadeMode =>
    v === "19" ? 19 : 11;

  const isShadeModeToken = (v: string | undefined): boolean =>
    v === "11" || v === "19";

  const buildSetting = (
    chunk: string[],
    includeShadeMode: boolean,
  ): ColorSetting => ({
    baseColor: {
      l: toNum(chunk[0]),
      c: toNum(chunk[1]),
      h: toNum(chunk[2]),
    },
    // colorNum: toNum(chunk[3]),
    colorName: chunk[3] ?? "",
    outputMode: chunk[4] ?? "",
    factor: toNum(chunk[5]),
    minL: toNum(chunk[6]),
    maxL: toNum(chunk[7]),
    centerL: toNum(chunk[8]),
    fallbackOutputMode: chunk[9] ?? "",
    lightnessMode: chunk[10] === "sigmoid" ? "sigmoid" : "gamma",
    showColorValue: toBool(chunk[11]),
    shadeMode: includeShadeMode ? toShadeMode(chunk[12]) : 11,
  });

  const parseByChunk = (
    values: string[],
    chunkSize: number,
    includeShadeMode: boolean,
  ) => {
    const parsedDefaultSetting = buildSetting(
      values.slice(0, chunkSize),
      includeShadeMode,
    );
    const parsedColorSettings: ColorSetting[] = [];

    for (let i = chunkSize; i < values.length; i += chunkSize) {
      const slice = values.slice(i, i + chunkSize);
      if (slice.length === chunkSize) {
        parsedColorSettings.push(buildSetting(slice, includeShadeMode));
      }
    }

    return {
      defaultSetting: parsedDefaultSetting,
      colorSettings: parsedColorSettings,
    };
  };

  const hasValidShadeModes = (values: string[]) => {
    for (let i = CURRENT_CHUNK - 1; i < values.length; i += CURRENT_CHUNK) {
      if (!isShadeModeToken(values[i])) return false;
    }
    return true;
  };

  export const parseSettings = (data: string) => {
    if (typeof data !== "string")
      return { defaultSetting: null, colorSettings: [] };

    const values = data.split(",");

    const isCurrentFormat =
      values.length >= CURRENT_CHUNK &&
      values.length % CURRENT_CHUNK === 0 &&
      hasValidShadeModes(values);

    if (isCurrentFormat) {
      return parseByChunk(values, CURRENT_CHUNK, true);
    }

    const isLegacyFormat =
      values.length >= LEGACY_CHUNK && values.length % LEGACY_CHUNK === 0;
    if (isLegacyFormat) {
      return parseByChunk(values, LEGACY_CHUNK, false);
    }

    return { defaultSetting: null, colorSettings: [] };
  };

  const searchParams = new URLSearchParams(window.location.search);
  let params = Object.fromEntries(searchParams.entries());

  try {
    const data: string = decodeURIComponent(params.settings);

    const { defaultSetting: _defaultSetting, colorSettings: _colorSettings } = parseSettings(data);

    if (_defaultSetting && _colorSettings.length > 0) {
      colorSettings = _colorSettings;
      setDefaultSetting(_defaultSetting);
    } else {
      colorSettings = [cloneColorSetting(defaultSetting)];
    }
  } catch (e) {
    colorSettings = [cloneColorSetting(defaultSetting)];
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
