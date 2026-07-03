// Base de données des chevaux — Humming Cob
//
// Modifiable directement par Alice : un objet par ligne, un cheval par ligne.
// Champs : id (interne, unique, JAMAIS le nom — évite les doublons/homonymes),
// name, sex ('stallion'|'mare'), sire/dam (id du parent, ou null si inconnu),
// lineage (note libre), source ('site hummingcob.fr' / 'infochevaux IFCE' /
// 'saisie manuelle' / autre), strain ('sancler'|'sd'|'cairnview'|'autre'|
// 'inconnue' — élevage/souche D'ORIGINE du cheval, sert uniquement au code
// couleur), owned (true = cheval Humming Cob, reproducteur ou poulain ;
// absent/false = ancêtre de référence hors élevage), synthetic (bool, champ
// hérité — non utilisé actuellement).
//
// ⚠️ ATTENTION À NE PAS CONFONDRE (point clarifié le 2 juillet 2026) :
// `strain` = élevage/souche D'ORIGINE (qui a élevé ce cheval : Cairnview,
// San Cler, SD...). Ce n'est PAS une parenté documentée. Deux chevaux tagués
// strain:'cairnview' peuvent venir du même élevage SANS être parents connus
// l'un de l'autre — c'est justement le cas de Cairnview Famous (sire de
// Kuarahy) par rapport à Archy : même élevage d'origine, mais aucun lien de
// parenté connu entre eux (pas de sire/dam commun renseigné dans nos
// données). Le VRAI lien de parenté, c'est uniquement les champs `sire`/`dam`
// de chaque cheval (le graphe utilisé par le calcul de consanguinité) — pas
// le `strain`. Les blocs ci-dessous suivent l'ascendance documentée
// (sire/dam), pas le strain, pour éviter cette confusion.
//
// Chargé par V2026-07-02.1.html via <script src="donnees-chevaux.js">, AVANT
// le script principal (qui lit HORSES_BASE au démarrage pour construire la
// liste de travail `horses`). Un .js classique fonctionne aussi bien en local
// (file://) qu'en ligne — contrairement à un .json chargé par fetch(), bloqué
// par le navigateur en local (erreur CORS).
//
// Important : les chevaux ajoutés dans l'outil pendant une session
// (source:'saisie manuelle', créés via la modale "arbre généalogique") ne sont
// PAS écrits ici automatiquement — ils restent en mémoire le temps de la
// session (voir panneau "Sauvegarder mes chevaux" / export JSON dans l'outil).
// Pour les intégrer durablement à la base de référence, les copier ici à la
// main une fois validés (et retirer/adapter leur `source`).
//
// --- Organisation du fichier (réorganisé le 2 juillet 2026, séance Cowork) ---
// L'ordre des chevaux dans le tableau n'a AUCUN effet fonctionnel (recherche
// par id, pas par position) — c'est purement pour la lisibilité au fil de la
// croissance du cheptel. Les blocs suivent l'ASCENDANCE DOCUMENTÉE (sire/dam
// connus) de nos reproducteurs, PAS le strain/élevage d'origine — un cheval
// peut partager le même élevage d'origine qu'Archy (ex: Cairnview Famous)
// sans être un ascendant documenté d'Archy, et se retrouve donc dans le
// bloc 5, pas le bloc 2. 5 blocs, dans cet ordre :
//   1. ÉLEVAGE HUMMING COB           — nos reproducteurs + poulains (owned:true)
//   2. ASCENDANCE CONNUE D'ARCHY     — élevage d'origine : Cairnview
//   3. ASCENDANCE CONNUE D'AVANTGARDE — élevage d'origine : San Cler
//   4. ASCENDANCE CONNUE DE SUZIE / SAKURA / RUBY JANE — élevage d'origine : SD
//   5. HORS ASCENDANCE DIRECTE / DIVERS — chevaux sans parenté documentée
//      avec nos 5 reproducteurs, même s'ils partagent parfois le même
//      élevage d'origine (ex : Kuarahy, étalon extérieur utilisé pour des
//      poulains HC, et son père Cairnview Famous) + réserve pour de futurs
//      chevaux emblématiques de la race, sans lien de parenté avec notre
//      cheptel.

const HORSES_BASE = [

  // ============================================================
  // 1. ÉLEVAGE HUMMING COB — reproducteurs et poulains (owned:true)
  // ============================================================
  {id:'archy', name:'Cairnview Archy', sex:'stallion', sire:'llewelyn', dam:'kessia', lineage:'Cairnview · Irish Tinker — reproducteur Humming Cob', source:'site hummingcob.fr', strain:'cairnview', owned:true},
  {id:'avantgarde', name:'San Cler Avantgarde', sex:'stallion', sire:'talkofthetown', dam:'uptowngirl', lineage:'San Cler · Gypsy Vanner — reproducteur Humming Cob', source:'site hummingcob.fr', strain:'sancler', owned:true},
  {id:'suzie', name:'SD Suzie', sex:'mare', sire:'woollymammoth', dam:'olivia', lineage:'Gypsy Vanner · 2010 — mère de Sakura et Ruby Jane', source:'site hummingcob.fr', strain:'sd', owned:true},
  {id:'sakura', name:'SD Sakura', sex:'mare', sire:'flashharry', dam:'suzie', lineage:'Gypsy Vanner — reproductrice Humming Cob', source:'site hummingcob.fr', strain:'sd', owned:true},
  {id:'rubyjane', name:'SD Ruby Jane', sex:'mare', sire:'flashharry', dam:'suzie', lineage:'Gypsy Vanner — reproductrice Humming Cob, pleine sœur de Sakura', source:'site hummingcob.fr', strain:'sd', owned:true},
  {id:'nashi', name:'Nashi', sex:'stallion', sire:'archy', dam:'sakura', lineage:'Gypsy Vanner — poulain Humming Cob (Archy x Sakura)', source:'site hummingcob.fr', strain:'hc', owned:true},
  {id:'quercuskaeru', name:'Quercus Kaeru', sex:'stallion', sire:'avantgarde', dam:'suzie', lineage:'Gypsy Vanner — poulain Humming Cob (Avantgarde x Suzie)', source:'site hummingcob.fr', strain:'hc', owned:true},
  {id:'omamori', name:'Omamori', sex:'stallion', sire:'kuarahy', dam:'suzie', lineage:'Gypsy Vanner — poulain Humming Cob (Kuarahy x Suzie)', source:'site hummingcob.fr', strain:'hc', owned:true},
  {id:'orion', name:'Orion', sex:'stallion', sire:'kuarahy', dam:'rubyjane', lineage:'Gypsy Vanner — poulain Humming Cob (Kuarahy x Ruby Jane)', source:'site hummingcob.fr', strain:'hc', owned:true},

  // ============================================================
  // 2. ASCENDANCE CONNUE D'ARCHY (élevage d'origine : Cairnview)
  // ============================================================
  {id:'llewelyn', name:'Cairnview Llewelyn', sex:'stallion', sire:'mrmorris', dam:'carrigburns', lineage:'Noir Tobiano · Irish Tinker · 2004 · 158cm · ICS', source:'site hummingcob.fr', strain:'cairnview'},
  {id:'kessia', name:'Cairnview Kessia', sex:'mare', sire:null, dam:null, lineage:'Irish Tinker · ~2004 · Élevage Cairnview', source:'site hummingcob.fr', strain:'cairnview'},
  {id:'mrmorris', name:'Mr. Morris', sex:'stallion', sire:null, dam:null, lineage:'Noir Pinto · Gypsy Vanner · 1996 · IRL', source:'site hummingcob.fr', strain:'cairnview'},
  {id:'carrigburns', name:'Carrigburns Lady', sex:'mare', sire:null, dam:null, lineage:'Noir Tobiano · Gypsy Vanner · 1998 · IRL', source:'site hummingcob.fr', strain:'cairnview'},

  // ============================================================
  // 3. ASCENDANCE CONNUE D'AVANTGARDE (élevage d'origine : San Cler)
  // ============================================================
  {id:'talkofthetown', name:'San Cler Talk Of The Town', sex:'stallion', sire:'milkybarkid', dam:'orangepop', lineage:'Chestnut HZ Pearl · Gypsy Vanner · 2018 · 14hh', source:'site hummingcob.fr', strain:'sancler'},
  {id:'uptowngirl', name:'San Cler Uptown Girl', sex:'mare', sire:'razzamataz', dam:'coffeecreme', lineage:'Black HZ Pearl Tobiano · Gypsy Vanner · 2018', source:'site hummingcob.fr', strain:'sancler'},
  {id:'milkybarkid', name:'The Milky Bar Kid', sex:'stallion', sire:'cremedream', dam:null, lineage:'Gypsy Vanner · 2016', source:'site hummingcob.fr', strain:'sancler'},
  {id:'cremedream', name:'San Cler Creme Dream', sex:'stallion', sire:'sanclertoby', dam:'foundationmare', lineage:'Tobie · 2009', source:'site hummingcob.fr', strain:'sancler'},
  {id:'sanclertoby', name:'San Cler Toby', sex:'stallion', sire:null, dam:null, lineage:'Buck tob · 2005 · fondateur San Cler Stud', source:'site hummingcob.fr', strain:'sancler'},
  {id:'foundationmare', name:'Foundation Mare UK', sex:'mare', sire:null, dam:null, lineage:'Blk tob', source:'site hummingcob.fr', strain:'sancler'},
  {id:'orangepop', name:'San Cler Orange Pop', sex:'mare', sire:'creamcracker', dam:null, lineage:'Chestnut · Gypsy Vanner · 2014', source:'site hummingcob.fr', strain:'sancler'},
  {id:'creamcracker', name:'San Cler Cream Cracker', sex:'stallion', sire:'cimlajimboy', dam:'oldpalominomare', lineage:'Pal Pearl Tobiano · 14.1hh · 2010', source:'site hummingcob.fr', strain:'sancler'},
  {id:'cimlajimboy', name:'Cimla Jimboy', sex:'stallion', sire:'oldjim', dam:'oldpatsancler', lineage:'Black Tobiano Pearl · 2007', source:'site hummingcob.fr', strain:'sancler'},
  {id:'oldjim', name:'Old Jim', sex:'stallion', sire:null, dam:null, lineage:'Blk tob · 1990', source:'site hummingcob.fr', strain:'sancler'},
  {id:'oldpatsancler', name:'Old Pat of San Cler', sex:'mare', sire:null, dam:null, lineage:'Buck · 2002', source:'site hummingcob.fr', strain:'sancler'},
  {id:'oldpalominomare', name:'The Old Palomino Mare (Molly UK)', sex:'mare', sire:null, dam:null, lineage:'1990', source:'site hummingcob.fr', strain:'sancler'},
  {id:'razzamataz', name:'San Cler Razzamataz', sex:'stallion', sire:'creamcracker', dam:'butterscotch', lineage:'Buckskin Pearl · Gypsy Vanner · 2015', source:'site hummingcob.fr', strain:'sancler'},
  {id:'butterscotch', name:'San Cler Butterscotch', sex:'mare', sire:'sanclertoby', dam:'nutmeg', lineage:'Buckskin Pearl · 2010', source:'site hummingcob.fr', strain:'sancler'},
  {id:'nutmeg', name:'San Cler Nutmeg', sex:'mare', sire:null, dam:null, lineage:'Buck pearl · 2007', source:'site hummingcob.fr', strain:'sancler'},
  {id:'coffeecreme', name:'San Cler Coffee Creme', sex:'mare', sire:'cimlajimboy', dam:'blackshirley', lineage:'Black Pearl Tobiano · Gypsy Vanner · 2010', source:'site hummingcob.fr', strain:'sancler'},
  {id:'blackshirley', name:'Black Shirley', sex:'mare', sire:null, dam:null, lineage:'San Cler Stud · 2000', source:'site hummingcob.fr', strain:'sancler'},

  // ============================================================
  // 4. ASCENDANCE CONNUE DE SUZIE / SAKURA / RUBY JANE (élevage d'origine : SD)
  // ============================================================
  {id:'woollymammoth', name:'SD Woolly Mammoth', sex:'stallion', sire:'samsonofwales', dam:'sovereign', lineage:'Black · Gypsy Vanner · 2002 · 13.3hh · GVHS GV04025', source:'site hummingcob.fr', strain:'sd'},
  {id:'olivia', name:'SD Olivia', sex:'mare', sire:null, dam:null, lineage:'Chestnut · Gypsy Vanner · origines non documentées', source:'site hummingcob.fr', strain:'sd'},
  {id:'samsonofwales', name:'Samson of Wales', sex:'stallion', sire:'oldhorsewales', dam:'sweepermare', lineage:'Black Tobiano · Gypsy Vanner · ~2000', source:'site hummingcob.fr', strain:'sd'},
  {id:'oldhorsewales', name:'The Old Horse of Wales', sex:'stallion', sire:null, dam:null, lineage:'Black Tobiano · 15hh · 1984 · IRL', source:'site hummingcob.fr', strain:'sd'},
  {id:'sweepermare', name:'The Sweeper Mare', sex:'mare', sire:'oldblackbob', dam:'vinesmare', lineage:'Black Tobiano · ~1990', source:'site hummingcob.fr', strain:'sd'},
  {id:'sovereign', name:'Sovereign', sex:'mare', sire:'bobblagdon', dam:'pricesredwhite', lineage:'Black Tobiano · Gypsy Vanner · 1998 · GVHS GV00053F', source:'site hummingcob.fr', strain:'sd'},
  {id:'bobblagdon', name:'Bob The Blagdon', sex:'stallion', sire:'lobearedhorse', dam:'horseshoemare', lineage:'Black · 145.5cm · ~1994 · IRL', source:'site hummingcob.fr', strain:'sd'},
  {id:'pricesredwhite', name:"Price's Red & White Mare", sex:'mare', sire:null, dam:null, lineage:'Bay Tobiano · 1994', source:'site hummingcob.fr', strain:'sd'},
  {id:'lobearedhorse', name:'The Lob Eared Horse', sex:'stallion', sire:null, dam:null, lineage:'1978', source:'site hummingcob.fr', strain:'sd'},
  {id:'horseshoemare', name:'The Horseshoe Mare', sex:'mare', sire:null, dam:null, lineage:'', source:'site hummingcob.fr', strain:'sd'},
  {id:'oldblackbob', name:'Old Black Bob', sex:'stallion', sire:null, dam:null, lineage:'', source:'site hummingcob.fr', strain:'sd'},
  {id:'vinesmare', name:'A Vines Mare', sex:'mare', sire:null, dam:null, lineage:'', source:'site hummingcob.fr', strain:'sd'},
  {id:'flashharry', name:'SD Flash Harry', sex:'stallion', sire:'sdjim', dam:'pinkpalomino', lineage:'Bay Sabino · Gypsy Vanner · 2005 · 14hh · GVHS GV13705P', source:'site hummingcob.fr', strain:'sd'},
  {id:'sdjim', name:'SD Jim (aka Nero)', sex:'stallion', sire:'bobblagdon', dam:'sweepermare', lineage:'Black · Gypsy Vanner · 2003 · 15hh', source:'site hummingcob.fr', strain:'sd'},
  {id:'pinkpalomino', name:'SD Pink Palomino', sex:'mare', sire:null, dam:null, lineage:'Chestnut · Gypsy Vanner · origines non documentées', source:'site hummingcob.fr', strain:'sd'},

  // ============================================================
  // 5. HORS ASCENDANCE DIRECTE / DIVERS — chevaux sans parenté documentée
  // avec nos 5 reproducteurs. Kuarahy et son père Cairnview Famous (IRL)
  // sont bien issus du même élevage Cairnview qu'Archy (même souche
  // d'origine, strain:'cairnview'), mais AUCUNE parenté connue ne les relie
  // à Archy dans nos données (pas de sire/dam commun renseigné) — d'où leur
  // rangement ici, et pas dans le bloc 2. Réserve aussi pour de futurs
  // chevaux emblématiques de la race, sans lien de parenté avec notre cheptel.
  // ============================================================
  {id:'cairnviewfamous', name:'Cairnview Famous (IRL)', sex:'stallion', sire:null, dam:null, lineage:'IC · 2015 · UELN 372414020161574', source:'infochevaux IFCE', strain:'cairnview'},
  {id:'gazelle', name:'Gazelle', sex:'mare', sire:null, dam:null, lineage:'ONCS · 2016 · UELN 250001527782570', source:'infochevaux IFCE', strain:'autre'},
  {id:'kuarahy', name:'Kuarahy OMD', sex:'stallion', sire:'cairnviewfamous', dam:'gazelle', lineage:'Origine Constatée · Café au Lait · 2020 · UELN 25000120252807D', source:'infochevaux IFCE', strain:'cairnview'}

];
