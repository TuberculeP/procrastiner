<script setup lang="ts">
const heureFin = defineModel<string>({ required: true })
const emit = defineEmits<{ generer: [] }>()

const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
</script>

<template>
  <header class="barre">
    <div class="marque">
      <span class="grille" aria-hidden="true">⋮⋮⋮</span>
      <span class="nom">Calendrier</span>
      <span class="recherche">🔍 Rechercher une raison d’exister</span>
    </div>
  </header>

  <div class="outils">
    <div class="date">
      <strong>Aujourd’hui</strong>
      <span class="jour">{{ date }}</span>
    </div>
    <form class="formulaire" @submit.prevent="emit('generer')">
      <label>
        Je pars à
        <input v-model="heureFin" type="time" required step="300" />
      </label>
      <button type="submit" class="generer">Générer mon planning</button>
    </form>
  </div>
</template>

<style scoped>
.barre {
  background: var(--accent);
  color: #fff;
  padding: 0 16px;
  height: 48px;
  display: flex;
  align-items: center;
}

.marque {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
}

.grille {
  letter-spacing: -3px;
  font-weight: 700;
}

.nom {
  font-weight: 600;
  font-size: 16px;
}

.recherche {
  margin-left: auto;
  background: rgba(255, 255, 255, 0.92);
  color: #616161;
  font-size: 13px;
  padding: 5px 12px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.outils {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: var(--fond-carte);
  border-bottom: 1px solid var(--bordure);
}

.date {
  display: flex;
  flex-direction: column;
}

.jour {
  font-size: 13px;
  color: var(--texte-doux);
  text-transform: capitalize;
}

.formulaire {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

input {
  font: inherit;
  padding: 5px 8px;
  border: 1px solid var(--bordure);
  border-radius: 4px;
  background: var(--fond-page);
  color: var(--texte);
}

.generer {
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 7px 14px;
  cursor: pointer;
}

.generer:hover {
  background: var(--accent-fort);
}

@media (max-width: 560px) {
  .recherche {
    display: none;
  }
}
</style>
