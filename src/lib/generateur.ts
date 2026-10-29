import { activites, type Ambiance, type Categorie, type ModeleActivite } from '../data/activites'
import { lexique, type CleLexique } from '../data/lexique'

export interface Bloc {
  id: string
  modeleId: string
  texte: string
  categorie: Categorie
  duree: number
  /** Ambiance du conteneur parent (absent pour un bloc de premier niveau). */
  contexte?: Ambiance
  enfants?: Bloc[]
}

const PAS = 5
/** Probabilité qu'un seul conteneur couvre tout le créneau. */
const CHANCE_MONOLITHE = 0.15

let prochainId = 0
const nouvelId = () => `b${++prochainId}`

function auHasard<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)] as T
}

function tirerPondere(modeles: ModeleActivite[]): ModeleActivite | undefined {
  const total = modeles.reduce((s, m) => s + m.poids, 0)
  let r = Math.random() * total
  for (const m of modeles) {
    r -= m.poids
    if (r <= 0) return m
  }
  return modeles[modeles.length - 1]
}

/** Durée aléatoire, multiple de 5, entre min et max inclus. */
function dureeAuHasard(min: number, max: number): number {
  const pas = Math.floor((max - min) / PAS)
  return min + PAS * Math.floor(Math.random() * (pas + 1))
}

export function remplirTexte(texte: string): string {
  return texte.replace(/\{(\w+)\}/g, (brut, cle: string) =>
    cle in lexique ? auHasard(lexique[cle as CleLexique]) : brut,
  )
}

/** Modèles utilisables à ce niveau : tout au premier niveau, sinon ceux compatibles avec l'ambiance du conteneur. */
function pool(contexte?: Ambiance): ModeleActivite[] {
  if (!contexte) return activites
  return activites.filter((m) => !m.conteneur && m.dans?.includes(contexte))
}

function creerBloc(modele: ModeleActivite, duree: number, contexte?: Ambiance): Bloc {
  const bloc: Bloc = {
    id: nouvelId(),
    modeleId: modele.id,
    texte: remplirTexte(modele.texte),
    categorie: modele.categorie,
    duree,
    contexte,
  }
  if (modele.conteneur) bloc.enfants = remplirCreneau(duree, modele.conteneur)
  return bloc
}

/**
 * Remplit exactement `duree` minutes avec des blocs.
 * `contexte` = ambiance du conteneur parent quand on remplit un conteneur.
 */
export function remplirCreneau(duree: number, contexte?: Ambiance): Bloc[] {
  const candidats = pool(contexte)

  // Mode monolithe : un seul conteneur pour tout le créneau (premier niveau seulement).
  if (!contexte && Math.random() < CHANCE_MONOLITHE) {
    const geants = candidats.filter((m) => m.conteneur && m.min <= duree && m.max >= duree)
    const choisi = tirerPondere(geants)
    if (choisi) return [creerBloc(choisi, duree)]
  }

  // Dans un conteneur, on plafonne chaque sous-bloc pour en avoir au moins deux.
  const plafond = contexte && duree >= 2 * PAS ? Math.max(PAS, Math.floor((duree * 0.6) / PAS) * PAS) : duree

  const blocs: Bloc[] = []
  let reste = duree - (duree % PAS)
  let precedent: string | undefined

  while (reste >= PAS) {
    const limite = Math.min(reste, plafond)
    const possibles = candidats.filter((m) => m.min <= limite && m.id !== precedent)
    const modele = tirerPondere(possibles)
    if (!modele) break
    const d = dureeAuHasard(modele.min, Math.min(modele.max, limite))
    blocs.push(creerBloc(modele, d, contexte))
    reste -= d
    precedent = modele.id
  }

  // Les minutes restantes (créneau pas multiple de 5, ou rien ne rentre) vont au dernier bloc.
  // Créneau de moins de 5 min : une seule micro-activité.
  if (blocs.length === 0 && duree > 0) {
    const micro = tirerPondere(candidats.filter((m) => m.min <= PAS))
    if (micro) return [creerBloc(micro, duree, contexte)]
  }

  const surplus = duree - blocs.reduce((s, b) => s + b.duree, 0)
  if (surplus > 0) allongerDernier(blocs, surplus)
  return blocs
}

/** Allonge le dernier bloc (et son dernier sous-bloc, pour garder les sommes justes). */
function allongerDernier(blocs: Bloc[], minutes: number) {
  const dernier = blocs[blocs.length - 1]
  if (!dernier) return
  dernier.duree += minutes
  if (dernier.enfants) allongerDernier(dernier.enfants, minutes)
}

/** Remplace le bloc `id` (à n'importe quelle profondeur) par une autre activité de même durée. */
export function relancerBloc(blocs: Bloc[], id: string): Bloc[] {
  return blocs.flatMap((bloc) => {
    if (bloc.id === id) return remplacer(bloc)
    if (bloc.enfants) return [{ ...bloc, enfants: relancerBloc(bloc.enfants, id) }]
    return [bloc]
  })
}

function remplacer(bloc: Bloc): Bloc[] {
  const compatibles = pool(bloc.contexte).filter(
    (m) => m.min <= bloc.duree && m.max >= bloc.duree && m.id !== bloc.modeleId,
  )
  const modele = tirerPondere(compatibles)
  if (modele) return [creerBloc(modele, bloc.duree, bloc.contexte)]
  // Aucune activité ne dure exactement ça : on redécoupe le créneau en plusieurs blocs.
  return remplirCreneau(bloc.duree, bloc.contexte)
}

// ——— Jauges de productivité (totalement bidon) ———

export interface Indicateur {
  libelle: string
  valeur: number
  max: number
  unite: string
  commentaire: string
}

function minutesParCategorie(blocs: Bloc[], acc: Record<Categorie, number>): Record<Categorie, number> {
  for (const b of blocs) {
    if (b.enfants) minutesParCategorie(b.enfants, acc)
    else acc[b.categorie] += b.duree
  }
  return acc
}

const bruit = (amplitude: number) => Math.round((Math.random() - 0.5) * 2 * amplitude)
const borner = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function calculerProductivite(blocs: Bloc[]): Indicateur[] {
  const m = minutesParCategorie(blocs, {
    reunion: 0, pause: 0, admin: 0, 'faux-travail': 0, social: 0, attente: 0,
  })
  const total = Object.values(m).reduce((s, v) => s + v, 0) || 1
  const part = (c: Categorie) => m[c] / total
  const nbConteneurs = blocs.filter((b) => b.enfants).length

  const percue = borner(Math.round(95 + part('reunion') * 120 + part('faux-travail') * 60 + nbConteneurs * 12 + bruit(15)), 60, 250)
  const visibilite = borner(Math.round((part('reunion') + part('social')) * 100 + 20 + bruit(10)), 5, 100)
  const synergie = borner(Math.round(4 + (part('social') + part('reunion')) * 6 + bruit(1)), 1, 10)
  const reelle = borner(Math.round(2 + Math.random() * 6), 0, 100)
  const risque = borner(Math.round((part('pause') + part('attente')) * 100 + bruit(10)), 0, 100)

  return [
    {
      libelle: 'Productivité perçue',
      valeur: percue,
      max: 250,
      unite: '%',
      commentaire: percue > 150 ? 'Promotion envisageable' : 'Dans la moyenne du N+1',
    },
    {
      libelle: 'Visibilité managériale',
      valeur: visibilite,
      max: 100,
      unite: '%',
      commentaire: visibilite > 60 ? 'Tu es partout, tu ne fais rien' : 'Pense à passer devant le bureau du chef',
    },
    {
      libelle: 'Indice de synergie',
      valeur: synergie,
      max: 10,
      unite: '/10',
      commentaire: auHasard(['Synergies transverses activées', 'Alignement en cours', 'Écosystème en tension positive']),
    },
    {
      libelle: 'Productivité réelle',
      valeur: reelle,
      max: 100,
      unite: '%',
      commentaire: 'Donnée confidentielle — ne pas partager',
    },
    {
      libelle: 'Risque de se faire griller',
      valeur: risque,
      max: 100,
      unite: '%',
      commentaire: risque > 40 ? 'Prévois un PowerPoint ouvert en fond' : 'Couverture corporate optimale',
    },
  ]
}
