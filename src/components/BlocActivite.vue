<script setup lang="ts">
import { computed } from 'vue'
import type { Bloc } from '../lib/generateur'
import { formatDuree, formatHeure } from '../lib/temps'

const props = defineProps<{
  bloc: Bloc
  /** Heure de début du bloc, en minutes depuis minuit. */
  debut: number
  /** Pixels par minute. */
  echelle: number
}>()

const emit = defineEmits<{ relancer: [id: string] }>()

const hauteur = computed(() => props.bloc.duree * props.echelle)
const compact = computed(() => hauteur.value < 44)
const horaire = computed(
  () => `${formatHeure(props.debut)} – ${formatHeure(props.debut + props.bloc.duree)}`,
)

/** Heure de début de chaque sous-bloc. */
const debutsEnfants = computed(() => {
  let t = props.debut
  return (props.bloc.enfants ?? []).map((enfant) => {
    const d = t
    t += enfant.duree
    return d
  })
})
</script>

<template>
  <div class="emplacement" :style="{ height: `${hauteur}px` }">
    <div
      class="carte"
      :class="[`cat-${bloc.categorie}`, { compact, conteneur: bloc.enfants }]"
      :title="`${horaire} · ${formatDuree(bloc.duree)}\n${bloc.texte}`"
    >
      <div class="entete">
        <div class="infos">
          <span class="horaire">{{ horaire }} · {{ formatDuree(bloc.duree) }}</span>
          <span class="texte">{{ bloc.texte }}</span>
        </div>
        <button class="de" type="button" title="Proposer autre chose" @click="emit('relancer', bloc.id)">🎲</button>
      </div>

      <div v-if="bloc.enfants" class="enfants">
        <BlocActivite
          v-for="(enfant, i) in bloc.enfants"
          :key="enfant.id"
          :bloc="enfant"
          :debut="debutsEnfants[i] ?? debut"
          :echelle="echelle"
          @relancer="(id) => emit('relancer', id)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.emplacement {
  box-sizing: border-box;
  padding: 1px 0;
  min-height: 0;
}

.carte {
  --fond: #e8f1fb;
  --trait: #0f6cbd;
  box-sizing: border-box;
  height: 100%;
  display: flex;
  gap: 6px;
  background: var(--fond);
  border-left: 4px solid var(--trait);
  border-radius: 4px;
  padding: 4px 6px 4px 8px;
  overflow: hidden;
  color: var(--texte);
}

.carte.conteneur {
  padding-right: 3px;
}

.entete {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.conteneur > .entete {
  flex: 0 0 38%;
  flex-direction: column;
  border-right: 1px dashed color-mix(in srgb, var(--trait) 40%, transparent);
  padding-right: 6px;
}

.infos {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.horaire {
  font-size: 11px;
  color: var(--texte-doux);
  white-space: nowrap;
}

.texte {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
}

.compact {
  padding-top: 0;
  padding-bottom: 0;
  align-items: center;
}

.compact .entete {
  align-items: center;
}

.compact .infos {
  flex-direction: row;
  gap: 6px;
  align-items: baseline;
  white-space: nowrap;
  overflow: hidden;
}

.compact .texte {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.de {
  flex: none;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 2px;
  border-radius: 4px;
  opacity: 0.55;
  transition: opacity 0.15s, transform 0.2s;
}

.de:hover {
  opacity: 1;
  transform: rotate(20deg) scale(1.15);
  background: color-mix(in srgb, var(--trait) 15%, transparent);
}

.compact .de {
  font-size: 11px;
  padding: 0 2px;
}

.enfants {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  /* compense le padding vertical de la carte pour garder les hauteurs exactes */
  margin: -4px 0;
}

.cat-reunion { --fond: var(--cat-reunion-fond); --trait: var(--cat-reunion); }
.cat-pause { --fond: var(--cat-pause-fond); --trait: var(--cat-pause); }
.cat-admin { --fond: var(--cat-admin-fond); --trait: var(--cat-admin); }
.cat-faux-travail { --fond: var(--cat-faux-travail-fond); --trait: var(--cat-faux-travail); }
.cat-social { --fond: var(--cat-social-fond); --trait: var(--cat-social); }
.cat-attente { --fond: var(--cat-attente-fond); --trait: var(--cat-attente); }
</style>
