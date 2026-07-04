#!/usr/bin/env node
/**
 * Test de non-régression — calcul du coefficient de consanguinité
 * Outil de correspondance génétique Humming Cob
 *
 * USAGE :
 *   node test-consanguinite.js
 *   node test-consanguinite.js chemin/vers/genetic-match-prototype.html
 *
 * Ce test lit le VRAI fichier HTML, en extrait l'algorithme (computeGenerations,
 * additiveRelationship, inbreedingCoefficient, byId) et le fait tourner sur des
 * pedigrees dont la réponse est connue et prouvée. Il teste donc le code réellement
 * déployé, pas une copie — si quelqu'un casse l'algo, ce test le détecte.
 *
 * Les valeurs attendues sont des vérités mathématiques (méthode de Wright /
 * matrice de Henderson), vérifiées à la main et par 3 méthodes indépendantes
 * (chemins, tabulaire, gene dropping) le 2 juillet 2026.
 */

const fs = require('fs');
const path = require('path');

// ---- 1. Localiser et lire le fichier HTML ----
const htmlPath = process.argv[2] || path.join(__dirname, 'genetic-match-prototype.html');
if (!fs.existsSync(htmlPath)) {
  console.error(`\n❌ Fichier introuvable : ${htmlPath}`);
  console.error(`   Lance : node test-consanguinite.js chemin/vers/genetic-match-prototype.html\n`);
  process.exit(1);
}
const html = fs.readFileSync(htmlPath, 'utf8');

// ---- 2. Extraire les fonctions de calcul du fichier ----
function extract(re, label) {
  const m = html.match(re);
  if (!m) {
    console.error(`\n❌ Impossible de trouver "${label}" dans le fichier.`);
    console.error(`   L'algorithme a peut-être été renommé ou restructuré.\n`);
    process.exit(1);
  }
  return m[0];
}

const byIdFn   = extract(/function byId\([\s\S]*?\n\}/, 'byId');
const genFn    = extract(/function computeGenerations\(\)\{[\s\S]*?\n\}/, 'computeGenerations');
const arFn     = extract(/function additiveRelationship\([\s\S]*?\n\}/, 'additiveRelationship');
const icFn     = extract(/function inbreedingCoefficient\([\s\S]*?\n\}/, 'inbreedingCoefficient');

// `horses` est une variable globale utilisée par byId. On la déclare mutable
// pour pouvoir injecter des pedigrees de test.
let horses = [];
eval(byIdFn + '\n' + genFn + '\n' + arFn + '\n' + icFn);

// ---- 3. Helper : construit un pedigree de test et calcule F ----
// pairs = liste [id, sire|null, dam|null]. On fabrique des chevaux minimalistes.
function F(pedigree, sireId, damId) {
  horses = pedigree.map(([id, sire, dam]) => ({
    id, name: id, sex: 'stallion', sire: sire || null, dam: dam || null
  }));
  return inbreedingCoefficient(sireId, damId) * 100;
}

// ---- 4. Cas de test à réponse connue ----
// Chaque cas : description, pedigree, couple testé, valeur attendue (%).
const EPS = 0.001; // tolérance (arrondi flottant)

const P_SIBLINGS = [
  ['S', null, null], ['D', null, null],
  ['B1', 'S', 'D'], ['B2', 'S', 'D'],
];
const P_PARENT_CHILD = [
  ['A', null, null], ['B', null, null], ['C', 'A', 'B'],
];
// double cousins germains : deux couples de parents, chacun 2 pleins frères
const P_DOUBLE_COUSINS = [
  ['GA', null, null], ['GB', null, null], ['GC', null, null], ['GD', null, null],
  ['P1', 'GA', 'GB'], ['P2', 'GA', 'GB'],
  ['P3', 'GC', 'GD'], ['P4', 'GC', 'GD'],
  ['X', 'P1', 'P3'], ['Y', 'P2', 'P4'],
];
// ancêtre commun en 3e génération des deux côtés (une seule ligne)
const P_GP3 = [
  ['GP1', null, null], ['GP2', null, null], ['GP3', null, null],
  ['GP4', null, null], ['GP5', null, null],
  ['PX', 'GP1', 'GP2'], ['MX', 'GP3', 'GP4'],
  ['PY', 'GP1', 'GP5'], ['MY', null, null],
  ['X', 'PX', 'MX'], ['Y', 'PY', 'MY'],
];
// ancêtre commun CONSANGUIN (le cas piège : facteur 1+F_A) — F_A=25%, résultat attendu 15.625%
const P_INBRED_ANCESTOR = [
  ['R1', null, null], ['R2', null, null],
  ['Q1', 'R1', 'R2'], ['Q2', 'R1', 'R2'],
  ['A', 'Q1', 'Q2'],
  ['M1', null, null], ['M2', null, null],
  ['X', 'A', 'M1'], ['Y', 'A', 'M2'],
];
// ancêtres imbriqués (le bug historique ×2) : un ancêtre commun parent d'un autre ancêtre commun
const P_NESTED = [
  ['G', null, null], ['H', null, null],
  ['CC', 'G', 'H'],          // CC = enfant de G
  ['MX', null, null], ['MY', null, null],
  ['PX', 'CC', 'MX'],        // PX enfant de CC (donc petit-enfant de G)
  ['PY', 'G', 'MY'],         // PY enfant de G directement
  ['X', 'PX', null], ['Y', 'PY', null],
];

const TESTS = [
  ['Plein frère × pleine sœur',                    P_SIBLINGS,         'B1', 'B2', 25.0],
  ['Parent × enfant',                              P_PARENT_CHILD,     'A',  'C',  25.0],
  ['Double cousins germains',                      P_DOUBLE_COUSINS,   'X',  'Y',  12.5],
  ['Ancêtre commun en 3e génération (1 ligne)',    P_GP3,              'X',  'Y',  3.125],
  ['Ancêtre commun CONSANGUIN (facteur 1+F_A)',    P_INBRED_ANCESTOR,  'X',  'Y',  15.625],
  ['Ancêtres imbriqués (anti-régression bug ×2)',  P_NESTED,           'X',  'Y',  1.5625],
  ['Consanguinité propre d\'un fondateur',         P_SIBLINGS,         'S',  'D',  0.0],
];

// ---- 5. Exécution ----
console.log(`\n🧬 Test de non-régression — ${path.basename(htmlPath)}\n`);
let pass = 0, fail = 0;

for (const [desc, ped, s, d, expected] of TESTS) {
  const got = F(ped, s, d);
  if (expected === null) {
    // cas informatif : on affiche la valeur pour vérification humaine
    console.log(`   ℹ️  ${desc.padEnd(46)} = ${got.toFixed(4)}%  (valeur de référence à figer si OK)`);
    continue;
  }
  const ok = Math.abs(got - expected) < EPS;
  if (ok) {
    pass++;
    console.log(`   ✅ ${desc.padEnd(46)} = ${got.toFixed(4)}%`);
  } else {
    fail++;
    console.log(`   ❌ ${desc.padEnd(46)} = ${got.toFixed(4)}%  (attendu ${expected}%)`);
  }
}

console.log(`\n   ${pass} réussi(s), ${fail} échec(s).`);
if (fail > 0) {
  console.log(`\n   ⚠️  L'algorithme de consanguinité ne donne plus les bonnes valeurs.`);
  console.log(`      Voir FIX_BUG_CONSANGUINITE.md pour le principe (toujours étendre`);
  console.log(`      l'individu le plus récent, jamais un ancêtre).\n`);
  process.exit(1);
} else {
  console.log(`\n   Tout est bon. L'algorithme calcule correctement.\n`);
  process.exit(0);
}
