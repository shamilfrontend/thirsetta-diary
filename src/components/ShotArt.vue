<script setup lang="ts">
import type { ShotArtName } from '../content/injection'

defineProps<{ name: ShotArtName }>()
</script>

<template>
  <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
    <template v-if="name === 'uncap'">
      <rect class="device" x="30" y="4" width="20" height="36" rx="6" />
      <rect class="screen" x="35" y="10" width="10" height="16" rx="2" />
      <rect class="liquid" x="37" y="16" width="6" height="8" rx="1" />
      <path class="hot" d="M40 42 V52" />
      <path class="hot-fill" d="M33.5 51 h13 l-6.5 8 z" />
      <rect class="cap" x="32" y="64" width="16" height="12" rx="3" />
    </template>

    <template v-else-if="name === 'fold'">
      <path class="skin" d="M6 63c14-8 54-8 68 0v11H6V63z" />
      <path class="skin-fold" d="M29 62c2-16 20-16 22 0-6-5-16-5-22 0z" />
      <path class="hot" d="M36 55c2.6-5 5.4-5 8 0" />
      <circle class="skin" cx="16" cy="38" r="8" />
      <path class="skin" d="M22 34c10-2 16 8 16 16-6 1-10-4-12-8-2-3-3-6-4-8z" />
      <path class="skin" d="M14 44c8 4 16 8 18 14-6 2-12-1-16-6-2-3-3-6-2-8z" />
      <circle class="skin" cx="64" cy="38" r="8" />
      <path class="skin" d="M58 34c-10-2-16 8-16 16 6 1 10-4 12-8 2-3 3-6 4-8z" />
      <path class="skin" d="M66 44c-8 4-16 8-18 14 6 2 12-1 16-6 2-3 3-6 2-8z" />
    </template>

    <template v-else-if="name === 'press90'">
      <path class="skin" d="M2 70h76v7H2z" />
      <path class="skin-fold" d="M18 70c8-26 36-26 44 0-12-8-32-8-44 0z" />
      <rect class="device" x="32" y="8" width="16" height="50" rx="5" />
      <rect class="screen" x="36" y="16" width="8" height="20" rx="1.5" />
      <rect class="liquid" x="38" y="24" width="4" height="10" rx="1" />
      <path class="hot" d="M60 56v14h12" />
      <text x="62" y="52">90°</text>
    </template>

    <template v-else-if="name === 'window'">
      <rect class="device" x="16" y="8" width="34" height="64" rx="8" />
      <rect class="screen" x="24" y="18" width="18" height="38" rx="2" />
      <rect class="liquid" x="26" y="40" width="14" height="14" rx="1" />
      <path class="hot" d="M26 40h14" />
      <path class="hot" d="M56 30c7 4 7 10 0 14" />
      <path class="hot" d="M62 24c10 6 10 16 0 22" />
    </template>

    <template v-else-if="name === 'discard'">
      <path class="bin" d="M44 32h30l-3.5 38H48z" />
      <path class="bin" d="M40 32h38" />
      <rect class="bin" x="52" y="24" width="14" height="8" rx="2" />
      <g transform="rotate(-36 30 44)">
        <rect class="device" x="20" y="26" width="16" height="32" rx="4" />
        <rect class="cap" x="22" y="54" width="12" height="10" rx="2" />
      </g>
      <path class="hot-fill" d="M22 16h12l-6 10z" />
    </template>

    <template v-else-if="name === 'needle'">
      <rect class="device" x="22" y="4" width="22" height="36" rx="6" />
      <rect class="screen" x="28" y="12" width="10" height="14" rx="2" />
      <rect class="hot-fill" x="28" y="40" width="10" height="9" rx="2" />
      <path class="needle" d="M33 49v20" />
      <path class="hot" d="M48 50a13 13 0 1 1 8-14" />
      <path class="hot-fill" d="M54 32l8 1-6 6z" />
    </template>

    <template v-else-if="name === 'prime'">
      <circle class="hot-fill" cx="36" cy="7" r="3.2" />
      <path class="needle" d="M36 11v9" />
      <rect class="device" x="31" y="20" width="10" height="6" rx="1" />
      <rect class="device" x="26" y="26" width="20" height="30" rx="6" />
      <rect class="screen" x="31" y="32" width="10" height="14" rx="1.5" />
      <rect class="hot-fill" x="31" y="54" width="10" height="8" rx="2" />
      <ellipse class="skin" cx="36" cy="72" rx="11" ry="6" />
      <path class="hot" d="M54 74V62" />
      <path class="hot-fill" d="M49.5 64h9l-4.5-7z" />
    </template>

    <template v-else-if="name === 'dial'">
      <rect class="device" x="26" y="16" width="22" height="46" rx="6" />
      <rect class="device" x="31" y="7" width="12" height="11" rx="3" />
      <rect class="screen" x="30" y="32" width="14" height="16" rx="2" />
      <text x="37" y="43" text-anchor="middle">2,5</text>
      <path class="needle" d="M37 62v12" />
      <path class="hot" d="M46 10a12 12 0 0 1 12 11" />
      <path class="hot-fill" d="M56 19l8 2-4-7z" />
    </template>

    <template v-else-if="name === 'hold'">
      <path class="skin" d="M4 64h72v10H4z" />
      <rect class="device" x="30" y="20" width="16" height="32" rx="4" />
      <rect class="hot-fill" x="33" y="14" width="10" height="8" rx="2" />
      <ellipse class="skin" cx="38" cy="11" rx="11" ry="7" />
      <path class="needle" d="M38 52v16" />
      <text x="54" y="36">10</text>
    </template>

    <template v-else-if="name === 'twist'">
      <rect class="device" x="16" y="8" width="20" height="5" rx="1.5" />
      <rect class="device" x="24" y="13" width="4" height="7" />
      <rect class="device" x="18" y="20" width="16" height="28" rx="2" />
      <rect class="liquid" x="21" y="26" width="10" height="16" rx="1" />
      <path class="needle" d="M26 48v10" />
      <rect class="cap" x="46" y="52" width="24" height="12" rx="3" />
      <path class="hot" d="M34 58h12" />
      <path class="hot" d="M52 46a10 8 0 0 1 16 4" />
      <path class="hot-fill" d="M66 46l7 6-8 1z" />
    </template>

    <template v-else-if="name === 'bubbles'">
      <rect class="device" x="34" y="6" width="18" height="5" rx="1.5" />
      <rect class="device" x="41" y="11" width="4" height="7" />
      <rect class="device" x="32" y="18" width="22" height="44" rx="2" />
      <rect class="liquid" x="35" y="30" width="16" height="28" rx="1" />
      <path class="tick" d="M30 32h5M30 40h5M30 48h5M30 56h5" />
      <circle class="hot-fill" cx="41" cy="40" r="2.5" />
      <circle class="hot-fill" cx="46" cy="48" r="1.7" />
      <path class="hot" d="M16 32v18" />
      <path class="hot-fill" d="M11 33h10l-5-9z" />
    </template>

    <template v-else-if="name === 'angle'">
      <path class="skin" d="M2 66h76v8H2z" />
      <rect class="device" x="14" y="30" width="12" height="24" rx="2" />
      <rect class="liquid" x="17" y="34" width="6" height="14" />
      <path class="needle" d="M20 54v14" />
      <text x="28" y="28">90°</text>
      <g transform="rotate(-45 58 68)">
        <rect class="device" x="52" y="44" width="12" height="16" rx="2" />
        <rect class="liquid" x="55" y="47" width="6" height="9" />
        <path class="needle" d="M58 60v8" />
      </g>
      <text x="62" y="36">45°</text>
    </template>

    <template v-else-if="name === 'push'">
      <ellipse class="skin" cx="32" cy="14" rx="11" ry="7" />
      <path class="hot-fill" d="M28.5 22h7l-3.5 7z" />
      <rect class="device" x="22" y="32" width="20" height="22" rx="2" />
      <rect class="liquid" x="25" y="38" width="14" height="12" />
      <rect class="hot-fill" x="26" y="32" width="12" height="6" rx="1.5" />
      <path class="needle" d="M32 54v10" />
      <path class="skin" d="M4 66h72v8H4z" />
      <text class="small" x="48" y="42">2–5 с</text>
    </template>

    <template v-else-if="name === 'dab'">
      <path class="skin" d="M4 58h72v14H4z" />
      <circle class="hot-fill" cx="22" cy="65" r="2.2" />
      <ellipse class="device" cx="30" cy="54" rx="13" ry="8" />
      <ellipse class="skin" cx="30" cy="45" rx="7" ry="5.5" />
      <path class="hot" d="M48 30h16M64 40H48" />
      <path class="hot-fill" d="M62 26.5 70 30l-8 3.5zM50 36.5 42 40l8 3.5z" />
      <circle class="hot" cx="59" cy="35" r="14" />
      <path class="hot" d="M49 25 69 45" />
    </template>
  </svg>
</template>
