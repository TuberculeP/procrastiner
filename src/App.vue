<script setup lang="ts">
import { computed, ref } from 'vue'
import BarreOutlook from './components/BarreOutlook.vue'
import JaugeProductivite from './components/JaugeProductivite.vue'
import Planning from './components/Planning.vue'
import { calculerProductivite, relancerBloc, remplirCreneau, type Bloc } from './lib/generateur'
import { DUREE_MAX, formatDuree, formatHeure, lireHeure, maintenantArrondi } from './lib/temps'

/** Par défaut : 18:00, ou dans 2h s'il est déjà tard. */
function heureParDefaut(): string {
  const maintenant = maintenantArrondi()
  return maintenant < 17 * 60 ? '18:00' : formatHeure(Math.min(maintenant + 120, 23 * 60 + 55))
}

const heureFin = ref(heureParDefaut())
const debut = ref(0)
const fin = ref(0)
const blocs = ref<Bloc[]>([])
const erreur = ref('')

const indicateurs = computed(() => calculerProductivite(blocs.value))

function generer() {
  const finSaisie = lireHeure(heureFin.value)
  const maintenant = maintenantArrondi()
  erreur.value = ''
  blocs.value = []

  if (finSaisie === undefined) {
    erreur.value = 'Merci de saisir une heure valide (process RH n°4.2.1).'
    return
  }
  if (finSaisie <= maintenant) {
    erreur.value = 'Tu aurais déjà dû partir. Ferme ton PC et rentre chez toi.'
    return
  }
  const duree = finSaisie - maintenant
  if (duree > DUREE_MAX) {
    erreur.value = `Plus de ${formatDuree(DUREE_MAX)} au bureau ? Même le CODIR ne fait pas ça. Choisis une heure plus raisonnable.`
    return
  }

  debut.value = maintenant
  fin.value = finSaisie
  blocs.value = remplirCreneau(duree)
}

function relancer(id: string) {
  blocs.value = relancerBloc(blocs.value, id)
}

const nbActivites = computed(() => {
  const compter = (liste: Bloc[]): number =>
    liste.reduce((n, b) => n + (b.enfants ? compter(b.enfants) : 1), 0)
  return compter(blocs.value)
})

generer()
</script>

<template>
  <BarreOutlook v-model="heureFin" @generer="generer" />

  <main class="contenu">
    <section class="agenda">
      <p v-if="erreur" class="erreur">{{ erreur }}</p>
      <template v-else-if="blocs.length">
        <div class="resume">
          <span>
            <strong>{{ formatHeure(debut) }} → {{ formatHeure(fin) }}</strong>
            · {{ formatDuree(fin - debut) }} à occuper
          </span>
          <span class="badge">{{ nbActivites }} activités à forte valeur ajoutée</span>
        </div>
        <Planning :blocs="blocs" :debut="debut" :fin="fin" @relancer="relancer" />
        <p class="astuce">🎲 sur une activité pour en proposer une autre de même durée.</p>
      </template>
    </section>

    <JaugeProductivite v-if="blocs.length" :indicateurs="indicateurs" class="cote" />
  </main>
</template>

<style scoped>
.contenu {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 16px;
  padding: 16px;
  max-width: 1100px;
  margin: 0 auto;
  align-items: start;
}

.agenda {
  background: var(--fond-carte);
  border: 1px solid var(--bordure);
  border-radius: 8px;
  padding: 16px 16px 12px 8px;
  min-width: 0;
}

.resume {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  margin: 0 0 16px 8px;
  font-size: 14px;
}

.badge {
  background: var(--fond-page);
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 12px;
  color: var(--texte-doux);
}

.erreur {
  margin: 8px;
  font-size: 15px;
}

.astuce {
  margin: 12px 0 0 8px;
  font-size: 12px;
  color: var(--texte-doux);
}

.cote {
  position: sticky;
  top: 16px;
}

@media (max-width: 760px) {
  .contenu {
    grid-template-columns: minmax(0, 1fr);
    padding: 12px 16px;
  }

  .cote {
    position: static;
    order: -1;
  }
}
</style>
