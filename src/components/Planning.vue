<script setup lang="ts">
import { computed } from 'vue'
import type { Bloc } from '../lib/generateur'
import { formatHeure } from '../lib/temps'
import BlocActivite from './BlocActivite.vue'

const props = defineProps<{
  blocs: Bloc[]
  debut: number
  fin: number
}>()

const emit = defineEmits<{ relancer: [id: string] }>()

const duree = computed(() => props.fin - props.debut)

/** Pixels par minute : assez grand pour lire les petits blocs, sans faire un planning interminable. */
const echelle = computed(() => Math.max(3, Math.min(6, 800 / duree.value)))

const debuts = computed(() => {
  let t = props.debut
  return props.blocs.map((b) => {
    const d = t
    t += b.duree
    return d
  })
})

/** Graduations toutes les 30 minutes. */
const graduations = computed(() => {
  const liste: { minute: number; pleine: boolean }[] = []
  for (let m = Math.ceil(props.debut / 30) * 30; m <= props.fin; m += 30) {
    liste.push({ minute: m, pleine: m % 60 === 0 })
  }
  return liste
})
</script>

<template>
  <div class="planning" :style="{ height: `${duree * echelle}px` }">
    <div
      v-for="g in graduations"
      :key="g.minute"
      class="graduation"
      :class="{ pleine: g.pleine }"
      :style="{ top: `${(g.minute - debut) * echelle}px` }"
    >
      <span v-if="g.pleine" class="etiquette">{{ formatHeure(g.minute) }}</span>
    </div>

    <TransitionGroup name="bloc" tag="div" class="colonne">
      <BlocActivite
        v-for="(bloc, i) in blocs"
        :key="bloc.id"
        :bloc="bloc"
        :debut="debuts[i] ?? debut"
        :echelle="echelle"
        @relancer="(id) => emit('relancer', id)"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.planning {
  position: relative;
  margin-left: 56px;
}

.graduation {
  position: absolute;
  left: -56px;
  right: 0;
  border-top: 1px dotted var(--bordure);
  pointer-events: none;
}

.graduation.pleine {
  border-top-style: solid;
}

.etiquette {
  position: absolute;
  top: -8px;
  left: 0;
  width: 48px;
  font-size: 12px;
  color: var(--texte-doux);
  background: var(--fond-carte);
}

.colonne {
  position: relative;
  display: flex;
  flex-direction: column;
}

.bloc-enter-active {
  transition: opacity 0.3s, transform 0.3s;
}

.bloc-enter-from {
  opacity: 0;
  transform: translateX(12px);
}
</style>
