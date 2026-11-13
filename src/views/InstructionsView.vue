<script setup lang="ts">
import { ref } from 'vue'
import Icon from '../components/Icon.vue'
import ShotArt from '../components/ShotArt.vue'
import ShotMap from '../components/ShotMap.vue'
import { injectionChecks, injectionDevices, type InjectionDevice } from '../content/injection'

const device = ref<InjectionDevice>('auto')
</script>

<template>
  <div class="page page--nav stack">
    <header class="brand">
      <h1>Инструкции</h1>
      <p class="muted">Как сделать укол Тирзетты.</p>
    </header>

    <section class="card guide">
      <div class="guide__title">
        <span class="guide__icon"><Icon name="syringe" :size="18" /></span>
        <h2>Как колоть</h2>
      </div>
      <p class="muted block">Подкожно, в любое время суток и не привязано к еде. Каждый раз — другое место.</p>
      <ShotMap />

      <div class="guide__block">
        <h3>Перед уколом</h3>
        <ul class="guide__list">
          <li v-for="(item, index) in injectionChecks" :key="item">
            <span class="guide__index nums">{{ index + 1 }}</span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>

      <div class="segments segments--3 guide__switch" role="tablist" aria-label="Чем колете">
        <button
          v-for="item in injectionDevices"
          :key="item.id"
          type="button"
          role="tab"
          :aria-selected="device === item.id"
          :class="{ active: device === item.id }"
          @click="device = item.id"
        >
          {{ item.label }}
        </button>
      </div>

      <template v-for="item in injectionDevices" :key="item.id">
        <div v-if="device === item.id" class="guide__block">
          <ul class="guide__list">
            <li v-for="(step, index) in item.steps" :key="step.text" class="shot-step">
              <span class="shot-step__art">
                <ShotArt :name="step.art" />
                <span class="shot-step__n nums">{{ index + 1 }}</span>
              </span>
              <span>{{ step.text }}</span>
            </li>
          </ul>
          <p v-if="item.note" class="guide__note">{{ item.note }}</p>
        </div>
      </template>

      <p class="fine">
        Храните в холодильнике при 2–8 °C, в пачке и не у морозилки. Не замораживайте. Вне холодильника, не теплее 30 °C, препарат годен не дольше 21 дня. Если параллельно колете инсулин, для Тирзетты берите другую область.
      </p>
    </section>
  </div>
</template>
