// Catalogue des modèles d'activités.
// Les {clés} sont remplacées par des mots du lexique (voir lexique.ts).

export type Categorie = 'reunion' | 'pause' | 'admin' | 'faux-travail' | 'social' | 'attente'

/** Type de sous-activités qu'accepte un conteneur. */
export type Ambiance = 'solo' | 'groupe'

export interface ModeleActivite {
  id: string
  texte: string
  categorie: Categorie
  /** Durée minimale et maximale en minutes (multiples de 5). */
  min: number
  max: number
  /** Probabilité relative d'être tiré. */
  poids: number
  /** Si présent, l'activité contient des sous-activités de cette ambiance. */
  conteneur?: Ambiance
  /** Dans quels conteneurs l'activité peut apparaître comme sous-activité. */
  dans?: Ambiance[]
}

type Options = Partial<Pick<ModeleActivite, 'poids' | 'conteneur' | 'dans'>>

let compteur = 0
function a(categorie: Categorie, min: number, max: number, texte: string, options: Options = {}): ModeleActivite {
  compteur += 1
  return { id: `a${compteur}`, texte, categorie, min, max, poids: options.poids ?? 1, ...options }
}

const SOLO: Ambiance[] = ['solo']
const GROUPE: Ambiance[] = ['groupe']
const PARTOUT: Ambiance[] = ['solo', 'groupe']

export const activites: ModeleActivite[] = [
  // ——— Conteneurs (activités avec sous-activités) ———
  a('reunion', 30, 240, 'Réunion avec soi-même dans une salle fermée pour : {pretexte}', { conteneur: 'solo', poids: 2 }),
  a('reunion', 30, 180, 'Réservation de {lieu} pour un « {pretexte} » en solo', { conteneur: 'solo' }),
  a('faux-travail', 45, 240, 'Bloc « Focus time » dans le calendrier (statut : Ne pas déranger)', { conteneur: 'solo', poids: 1.5 }),
  a('faux-travail', 30, 120, 'Télétravail improvisé depuis {lieu}', { conteneur: 'solo' }),
  a('social', 60, 240, 'Séminaire off-site dans {lieu} : {pretexte}', { conteneur: 'groupe' }),
  a('reunion', 45, 180, 'Atelier post-its « {pretexte} » animé par {collegue}', { conteneur: 'groupe', poids: 1.5 }),
  a('reunion', 60, 240, 'COPIL élargi sur {sujet}', { conteneur: 'groupe' }),
  a('social', 30, 120, 'Journée de cohésion d’équipe (version courte) : {pretexte}', { conteneur: 'groupe' }),
  a('reunion', 45, 150, 'Visio « 5 minutes » avec {collegue} qui dérape', { conteneur: 'groupe' }),

  // ——— Réunions ———
  a('reunion', 15, 60, 'Réunion pour {verbe} {sujet} avec {collegue}', { poids: 3, dans: GROUPE }),
  a('reunion', 10, 30, 'Point flash (qui ne sera pas flash) sur {sujet}', { poids: 2, dans: GROUPE }),
  a('reunion', 30, 90, 'Réunion de préparation de la réunion de demain', { poids: 2, dans: GROUPE }),
  a('reunion', 15, 45, 'Daily meeting où personne ne dit ce qu’il fait', { dans: GROUPE }),
  a('reunion', 30, 60, 'Rétrospective de la rétrospective', { dans: GROUPE }),
  a('reunion', 20, 60, 'Call avec {collegue} pour {verbe} {sujet} (caméra coupée)', { poids: 2, dans: GROUPE }),
  a('reunion', 15, 45, 'Réunion annulée mais quand même maintenue « au cas où »', { dans: GROUPE }),
  a('reunion', 30, 90, 'Brainstorming sur le nom du prochain brainstorming', { dans: GROUPE }),
  a('reunion', 10, 30, 'Tour de table « météo des émotions »', { dans: GROUPE }),
  a('reunion', 20, 60, 'Démo d’un outil que personne n’utilisera : {outil}', { dans: GROUPE }),
  a('reunion', 15, 40, 'Réunion de debrief de la réunion d’avant', { dans: GROUPE }),
  a('reunion', 30, 120, 'Comité de pilotage du comité de pilotage', { dans: GROUPE }),
  a('reunion', 10, 25, 'Synchro rapide avec {collegue} dans le couloir', { dans: GROUPE }),
  a('reunion', 20, 50, 'Présentation de {livrable} à {collegue}', { dans: GROUPE }),
  a('reunion', 15, 30, 'Attendre que l’organisateur partage son écran', { dans: GROUPE }),
  a('reunion', 5, 15, '« Vous m’entendez ? » — « Tu es en mute »', { dans: GROUPE }),
  a('reunion', 10, 20, 'Débat sur qui prend les notes', { dans: GROUPE }),
  a('reunion', 15, 45, 'Réunion de cadrage du périmètre du cadrage', { dans: GROUPE }),

  // ——— Faux travail ———
  a('faux-travail', 15, 60, 'Rédiger {livrable} sur {sujet}', { poids: 2, dans: PARTOUT }),
  a('faux-travail', 10, 40, 'Changer la police de {livrable} trois fois', { dans: PARTOUT }),
  a('faux-travail', 20, 60, 'Réorganiser ses dossiers dans {outil}', { poids: 2, dans: SOLO }),
  a('faux-travail', 10, 30, 'Mettre à jour son statut {outil} en « Très occupé »', { dans: SOLO }),
  a('faux-travail', 15, 45, 'Faire défiler un fichier Excel avec un air concentré', { poids: 2, dans: SOLO }),
  a('faux-travail', 20, 90, 'Veille stratégique (LinkedIn)', { poids: 2, dans: SOLO }),
  a('faux-travail', 10, 30, 'Renommer {livrable} en _v2_final_def', { dans: SOLO }),
  a('faux-travail', 15, 60, 'Benchmark concurrentiel (lire des articles au hasard)', { dans: SOLO }),
  a('faux-travail', 10, 30, 'Choisir un fond d’écran Teams professionnel', { dans: SOLO }),
  a('faux-travail', 20, 60, 'Créer un template pour {livrable}', { dans: SOLO }),
  a('faux-travail', 15, 40, 'Taper fort sur le clavier quand le manager passe', { dans: SOLO }),
  a('faux-travail', 10, 30, 'Prendre de la hauteur sur {sujet} (regarder par la fenêtre)', { dans: SOLO }),
  a('faux-travail', 15, 45, 'Colorier les cellules d’un tableau en vert, puis en bleu', { dans: SOLO }),
  a('faux-travail', 20, 60, 'Mettre en forme les conditionnelles d’un fichier inutile', { dans: SOLO }),
  a('faux-travail', 5, 20, 'Ouvrir {outil}, le refermer, le rouvrir', { dans: SOLO }),
  a('faux-travail', 15, 45, 'Lire en diagonale un document de 80 pages sur {sujet}', { dans: PARTOUT }),
  a('faux-travail', 10, 30, 'Rajouter des flèches et des pictos à {livrable}', { dans: PARTOUT }),
  a('faux-travail', 20, 60, 'Construire un dashboard pour suivre le dashboard', { dans: SOLO }),
  a('faux-travail', 10, 25, 'Relire un mail de deux lignes pendant vingt minutes', { dans: SOLO }),
  a('faux-travail', 15, 50, 'Formaliser une méthodologie pour {verbe} {sujet}', { dans: PARTOUT }),
  a('faux-travail', 10, 40, 'Faire semblant de comprendre un graphique de {collegue}', { dans: GROUPE }),
  a('faux-travail', 15, 45, 'Dessiner un schéma avec plein de cercles sur Miro', { dans: PARTOUT }),
  a('faux-travail', 10, 30, 'Écrire « à creuser » dans la marge', { dans: PARTOUT }),

  // ——— Admin ———
  a('admin', 15, 45, 'Remplir sa note de frais de mars', { poids: 2, dans: SOLO }),
  a('admin', 10, 30, 'Trier sa boîte mail par couleur', { poids: 2, dans: SOLO }),
  a('admin', 10, 40, 'Répondre « Bien reçu, merci » à 14 mails', { dans: SOLO }),
  a('admin', 15, 45, 'Formation e-learning obligatoire sur la cybersécurité (en fond)', { dans: SOLO }),
  a('admin', 10, 30, 'Poser un jour de congé dans {outil} (6 étapes)', { dans: SOLO }),
  a('admin', 10, 25, 'Déclarer ses heures de la semaine (de mémoire)', { dans: SOLO }),
  a('admin', 15, 40, 'Mettre à jour son profil sur l’intranet', { dans: SOLO }),
  a('admin', 5, 20, 'Accepter des invitations sans lire l’objet', { dans: SOLO }),
  a('admin', 10, 30, 'Chercher la bonne version d’un fichier dans SharePoint', { poids: 2, dans: SOLO }),
  a('admin', 10, 30, 'Ranger son bureau en flex office (déplacer un stylo)', { dans: SOLO }),
  a('admin', 15, 45, 'Répondre au sondage d’engagement collaborateur', { dans: SOLO }),
  a('admin', 10, 20, 'Supprimer les newsletters internes non lues', { dans: SOLO }),
  a('admin', 10, 30, 'Réserver {lieu} pour une réunion hypothétique', { dans: SOLO }),
  a('admin', 15, 30, 'Mettre un message d’absence alors qu’on est là', { dans: SOLO }),
  a('admin', 10, 25, 'Mettre à jour le planning des congés de l’équipe', { dans: PARTOUT }),

  // ——— Attente ———
  a('attente', 5, 30, 'Attendre le mail de réinitialisation de mot de passe', { poids: 2, dans: SOLO }),
  a('attente', 10, 30, 'Attendre que le PC redémarre (mises à jour 1/347)', { poids: 2, dans: SOLO }),
  a('attente', 5, 20, 'Attendre l’ascenseur (exprès le plus lent)', { dans: PARTOUT }),
  a('attente', 10, 40, 'Attendre une validation de {collegue}', { poids: 2, dans: PARTOUT }),
  a('attente', 5, 25, 'Attendre que le VPN se connecte', { dans: SOLO }),
  a('attente', 5, 15, 'Attendre que l’imprimante se réveille', { dans: PARTOUT }),
  a('attente', 10, 30, 'Attendre le retour de l’équipe offshore', { dans: SOLO }),
  a('attente', 5, 20, 'Attendre le chargement de {outil}', { dans: SOLO }),
  a('attente', 10, 30, 'Attendre que quelqu’un parle en premier', { dans: GROUPE }),
  a('attente', 5, 20, 'Attendre que {lieu} se libère', { dans: PARTOUT }),
  a('attente', 15, 45, 'Attendre la fin du téléchargement de {livrable}', { dans: SOLO }),

  // ——— Pauses ———
  a('pause', 5, 20, 'Pause café', { poids: 3, dans: PARTOUT }),
  a('pause', 10, 40, 'Pause toilette stratégique', { poids: 2, dans: SOLO }),
  a('pause', 10, 30, 'Pause clope (sans fumer)', { dans: PARTOUT }),
  a('pause', 5, 15, 'Remplir sa gourde (aller-retour par le 5e étage)', { dans: SOLO }),
  a('pause', 10, 30, 'Promenade digestive dans les couloirs avec un dossier sous le bras', { poids: 2, dans: SOLO }),
  a('pause', 5, 20, 'Pause étirements recommandée par la médecine du travail', { dans: PARTOUT }),
  a('pause', 10, 25, 'Pause snack au distributeur (bloqué sur le Twix)', { dans: PARTOUT }),
  a('pause', 5, 20, 'Méditation de pleine conscience (sieste les yeux ouverts)', { dans: SOLO }),
  a('pause', 10, 30, 'Pause tisane dans {lieu}', { dans: PARTOUT }),
  a('pause', 5, 15, 'Regarder la météo de la semaine prochaine', { dans: SOLO }),
  a('pause', 10, 20, 'Pause', { poids: 2, dans: PARTOUT }),

  // ——— Social ———
  a('social', 30, 90, 'Team Building : concours de blagues dans l’open space', { poids: 2, dans: GROUPE }),
  a('social', 15, 45, 'Discussion à la machine à café sur le dernier match', { poids: 2, dans: GROUPE }),
  a('social', 10, 30, 'Commenter le pot de départ de la semaine dernière', { dans: GROUPE }),
  a('social', 15, 40, 'Organiser la cagnotte pour l’anniversaire de {collegue}', { dans: GROUPE }),
  a('social', 20, 60, 'Networking interne avec {collegue}', { dans: GROUPE }),
  a('social', 10, 30, 'Liker tous les posts LinkedIn de la direction', { dans: SOLO }),
  a('social', 15, 45, 'Team Building : débat sur {sujetPasPro}', { poids: 2, dans: GROUPE }),
  a('social', 10, 30, 'Faire le tour des bureaux pour dire bonjour', { dans: GROUPE }),
  a('social', 20, 60, 'Partie de baby-foot « pour la cohésion »', { dans: GROUPE }),
  a('social', 10, 25, 'Râler sur la clim avec {collegue}', { dans: GROUPE }),
  a('social', 15, 45, 'Préparer le quiz du prochain afterwork', { dans: PARTOUT }),
  a('social', 10, 30, 'Rumeurs de réorganisation avec {collegue}', { dans: GROUPE }),
  a('social', 20, 50, 'Mentorat informel du stagiaire (lui montrer les raccourcis clavier)', { dans: GROUPE }),
]
