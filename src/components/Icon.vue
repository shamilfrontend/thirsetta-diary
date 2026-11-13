<script setup lang="ts">
defineProps<{
  name:
    | 'back'
    | 'chevron'
    | 'close'
    | 'pencil'
    | 'sliders'
    | 'trash'
    | 'arrowDown'
    | 'arrowUp'
    | 'syringe'
    | 'person'
    | 'ruler'
    | 'flag'
    | 'scale'
    | 'tape'
    | 'gear'
    | 'book'
    | 'flask'
    | 'calendar'
    | 'alert'
  size?: number
}>()
</script>

<template>
  <svg
    :width="size ?? 22"
    :height="size ?? 22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-if="name === 'back'" d="M15 5 L8 12 L15 19" />
    <path v-else-if="name === 'chevron'" d="M9 5 L16 12 L9 19" />
    <path v-else-if="name === 'close'" d="M6 6 L18 18 M18 6 L6 18" />
    <path v-else-if="name === 'pencil'" d="M4 20 L8.2 19.1 L18.6 8.7 a1.8 1.8 0 0 0 0-2.5 l-1.8-1.8 a1.8 1.8 0 0 0-2.5 0 L4 14.8 Z M13.5 5.5 L18.5 10.5" />
    <g v-else-if="name === 'sliders'">
      <path d="M4 8 H20 M4 16 H20" />
      <circle cx="9" cy="8" r="2.2" fill="#0e1a2b" />
      <circle cx="15" cy="16" r="2.2" fill="#0e1a2b" />
    </g>
    <g v-else-if="name === 'trash'">
      <path d="M5 7 H19 M9 7 V5 H15 V7 M8 7 L8.8 19 H15.2 L16 7" />
    </g>
    <path v-else-if="name === 'arrowDown'" d="M12 5 V19 M6 13 L12 19 L18 13" />
    <path v-else-if="name === 'arrowUp'" d="M12 19 V5 M6 11 L12 5 L18 11" />
    <g v-else-if="name === 'syringe'">
      <path d="M15 4 L20 9 M14 6 L18 10 M7 13 L15 5 M6.2 13.8 L4 20 L10.2 17.8 M5 15 L9 19" />
    </g>
    <g v-else-if="name === 'person'">
      <circle cx="12" cy="7" r="3" />
      <path d="M6 20 V17 a6 6 0 0 1 12 0 V20" />
    </g>
    <path v-else-if="name === 'ruler'" d="M5 8 H19 V16 H5 Z M8 8 V11 M12 8 V12 M16 8 V11" />
    <path v-else-if="name === 'flag'" d="M6 4 V20 M6 5 H16 L13.5 8.5 L16 12 H6" />
    <g v-else-if="name === 'scale'">
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <path d="M8 14 H16 M9 17 H15 M12 7 V11" />
    </g>
    <g v-else-if="name === 'tape'">
      <circle cx="7" cy="12" r="4" />
      <path d="M11 12 H20 M14 10 V14 M17 10.5 V13.5" />
    </g>
    <g v-else-if="name === 'flask'">
      <path d="M9 3 H15 M10 3 V8.5 L5.2 18.2 A2.8 2.8 0 0 0 7.8 22 H16.2 A2.8 2.8 0 0 0 18.8 18.2 L14 8.5 V3 M8 14.5 H16" />
    </g>
    <g v-else-if="name === 'calendar'">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3.5 V7 M16 3.5 V7 M4 10.5 H20" />
    </g>
    <g v-else-if="name === 'alert'">
      <path d="M12 3.5 L21.5 20 H2.5 Z" />
      <path d="M12 9 V13.5" />
      <path d="M12 16.8 V17.3" stroke-width="2.4" />
    </g>
    <g v-else-if="name === 'book'">
      <path d="M4 5.5 A2 2 0 0 1 6 3.5 H12 V20.5 H6 A2 2 0 0 0 4 18.5 Z" />
      <path d="M20 5.5 A2 2 0 0 0 18 3.5 H12 V20.5 H18 A2 2 0 0 1 20 18.5 Z" />
    </g>
    <g v-else-if="name === 'gear'">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </g>
  </svg>
</template>
