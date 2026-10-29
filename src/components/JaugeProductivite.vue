<script setup lang="ts">
import type { Indicateur } from '../lib/generateur'

defineProps<{ indicateurs: Indicateur[] }>()
</script>

<template>
  <aside class="jauges">
    <h2>Tableau de bord RH</h2>
    <p class="sous-titre">Indicateurs calculés par une IA propriétaire</p>

    <div v-for="ind in indicateurs" :key="ind.libelle" class="indicateur">
      <div class="ligne">
        <span class="libelle">{{ ind.libelle }}</span>
        <span class="valeur">{{ ind.valeur }}{{ ind.unite }}</span>
      </div>
      <div class="barre">
        <div class="remplissage" :style="{ width: `${Math.min(100, (ind.valeur / ind.max) * 100)}%` }" />
      </div>
      <span class="commentaire">{{ ind.commentaire }}</span>
    </div>

    <p class="mention">Données non contractuelles. Ne pas transférer au N+1.</p>
  </aside>
</template>

<style scoped>
.jauges {
  background: var(--fond-carte);
  border: 1px solid var(--bordure);
  border-radius: 8px;
  padding: 16px;
}

h2 {
  margin: 0;
  font-size: 15px;
}

.sous-titre {
  margin: 2px 0 14px;
  font-size: 12px;
  color: var(--texte-doux);
}

.indicateur {
  margin-bottom: 14px;
}

.ligne {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.libelle {
  font-weight: 600;
}

.valeur {
  font-variant-numeric: tabular-nums;
  color: var(--accent);
  font-weight: 700;
}

.barre {
  height: 6px;
  margin: 5px 0 3px;
  background: var(--fond-page);
  border-radius: 3px;
  overflow: hidden;
}

.remplissage {
  height: 100%;
  background: var(--accent);
  border-radius: 3px;
  transition: width 0.6s ease;
}

.commentaire {
  font-size: 11px;
  color: var(--texte-doux);
  font-style: italic;
}

.mention {
  margin: 8px 0 0;
  font-size: 10px;
  color: var(--texte-doux);
}
</style>
