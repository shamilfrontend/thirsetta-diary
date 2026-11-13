<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useToast } from '../composables/useToast'

const route = useRoute()
const { message } = useToast()
</script>

<template>
  <p v-if="message" class="toast" :class="{ 'toast--low': route.name === 'settings' }" role="status">
    {{ message }}
  </p>
</template>
