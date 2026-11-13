import { createRouter, createWebHistory } from 'vue-router'
import { useInjectionsStore } from '../stores/injections'
import { useProfileStore } from '../stores/profile'
import BodyView from '../views/BodyView.vue'
import HomeView from '../views/HomeView.vue'
import InstructionsView from '../views/InstructionsView.vue'
import OnboardingView from '../views/OnboardingView.vue'
import SettingsView from '../views/SettingsView.vue'
import WeightSettingsView from '../views/WeightSettingsView.vue'

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    { path: '/onboarding', name: 'onboarding', component: OnboardingView },
    { path: '/', name: 'home', component: HomeView },
    { path: '/body', name: 'body', component: BodyView },
    { path: '/body/settings', name: 'settings', component: WeightSettingsView },
    { path: '/instructions', name: 'instructions', component: InstructionsView },
    { path: '/settings', name: 'preferences', component: SettingsView },
  ],
})

router.beforeEach((to) => {
  const profile = useProfileStore()
  if (!profile.onboardingDone) {
    const injections = useInjectionsStore()
    const started = injections.count > 0 || profile.courseStart != null || profile.doseMg != null
    if (started) profile.completeOnboarding()
  }
  if (!profile.onboardingDone && to.name !== 'onboarding') return { name: 'onboarding' }
})
