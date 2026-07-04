# DESIGN-SYSTEM — MeetingFlash

Référence permanente. Toute modification visuelle future se conforme à ce fichier. En cas de conflit avec une "décision assumée" antérieure de CLAUDE.md (emojis de blocs, opacité des blobs), ce fichier prime une fois validé — mettre CLAUDE.md à jour à ce moment-là.

**L'idée directrice** : MeetingFlash vend un *deliverable* fini, pas un jouet IA. La D.A. doit donc ressembler à de l'éditorial premium (serif display, encre profonde, une seule couleur signature, icônes dessinées) — pas à un dashboard SaaS généré.

---

## 1. Typographie

Deux voix, déjà chargées (zéro dépendance nouvelle) :

| Rôle | Police | Usage |
|---|---|---|
| **Titres (display)** | **Instrument Serif** (400, roman + italique) | H1, H2, chiffres de prix, note du fondateur. C'est la voix éditoriale du site — aujourd'hui elle est gâchée sur un badge. |
| **Corps + UI** | **Plus Jakarta Sans** (400/500/600/700 — retirer les graisses 300/800 du chargement) | Tout le reste : paragraphes, H3, boutons, nav, cards. |
| Données | JetBrains Mono (400/500) | Uniquement dans les mockups produit et les valeurs chiffrées de pack. |

Règles :
- H1/H2 en Instrument Serif 400, `letter-spacing: -0.01em` max. **Jamais de tracking en px.**
- Le gras des titres ne vient plus de `font-weight: 800` mais du contraste serif/sans et de la taille.
- L'italique serif est autorisé pour UN mot d'accent par titre, à la place du gradient text.
- Graisse 700 Jakarta réservée aux boutons et H3 ; le corps ne dépasse jamais 600.

### Échelle typographique (tokens — les seules tailles autorisées)

```css
--text-xs:      12px;   /* légendes, kickers uppercase */
--text-sm:      14px;   /* meta, footer, labels */
--text-base:    16px;   /* corps (remonter body de 15 → 16) */
--text-lg:      18px;   /* sous-titres hero, ledes */
--text-xl:      22px;   /* H3 */
--text-2xl:     28px;   /* H2 mobile / titres de cards larges */
--display-sm:   clamp(30px, 4vw, 40px);   /* H2 */
--display-md:   clamp(38px, 5vw, 52px);   /* H1 pages internes */
--display-lg:   clamp(42px, 5.5vw, 64px); /* H1 home uniquement */
```

Line-heights : display 1.08 · titres 1.2 · corps 1.6. Interdit : toute valeur hors liste (les 10.5 / 13.5 / 14.5px actuels disparaissent).

---

## 2. Palette (tokens complets)

Principe : **une seule couleur signature**, propriétaire (pas un hex Tailwind), et des états sémantiques tokenisés. Le fond quitte le slate pour une encre bleue légèrement plus profonde et chaude.

### Dark (défaut)

```css
/* Fonds */
--bg:            #0A101F;   /* encre — remplace #060C18 */
--bg2:           #0E1628;
--surface:       #131C31;
--surface2:      #18233C;
--lift:          #1F2C4A;

/* Texte */
--text:          #EDF1F9;
--muted:         #98A4BC;
--faint:         #5C6A85;   /* réservé aux tailles ≥ 18px (contraste) */

/* Bordures */
--border:        rgba(230,237,250,0.08);
--border2:       rgba(230,237,250,0.14);
--border3:       rgba(230,237,250,0.22);

/* Signature — "Flash Blue", propriétaire */
--accent:        #2E62FF;   /* boutons, liens, focus */
--accent-hover:  #234FDB;
--accent-text:   #7C9BFF;   /* accent lisible sur fond sombre */
--accent-soft:   rgba(46,98,255,0.14);  /* fonds teintés, pills */

/* Le "flash" — UNE dose par page maximum */
--spark:         #FFC53D;   /* moment de génération, éclair du logo, rien d'autre */

/* États sémantiques (remplacent les 69 hex en dur) */
--success:       #2FBF71;  --success-text: #7FE0AC;  --success-soft: rgba(47,191,113,0.12);
--warning:       #E8A13C;  --warning-text: #F3C879;  --warning-soft: rgba(232,161,60,0.12);
--danger:        #E5484D;  --danger-text:  #F09A9D;  --danger-soft:  rgba(229,72,77,0.12);

/* Nav */
--nav-bg:        rgba(10,16,31,0.88);
--nav-text:      rgba(237,241,249,0.55);
```

### Light (`[data-theme="light"]`)

```css
--bg: #FAFBFD;  --bg2: #F2F5FA;  --surface: #FFFFFF;  --surface2: #F6F8FC;  --lift: #EDF2FF;
--text: #101827;  --muted: #4C5A73;  --faint: #8B96AC;
--border: rgba(16,24,39,0.08);  --border2: rgba(16,24,39,0.13);  --border3: rgba(16,24,39,0.2);
--accent: #1E4FD6;  --accent-hover: #16409F;  --accent-text: #1E4FD6;  --accent-soft: rgba(30,79,214,0.10);
--spark: #B7791F;
--success: #1E9E5A; --success-text: #157347; --warning: #B45309; --warning-text: #92400E;
--danger: #D3363C; --danger-text: #B91C1C;
--nav-bg: rgba(255,255,255,0.88);  --nav-text: rgba(16,24,39,0.65);
```

Règles :
- **Aucun hex hors de globals.css.** Les modules CSS ne référencent que des tokens. (Règle déjà dans CLAUDE.md — désormais sans exception, y compris les tints `rgba(239,68,68,…)`.)
- `--spark` est budgété : un seul usage par vue. S'il apparaît deux fois, l'un des deux est faux.
- Suppression des alias historiques `--blue/--blue2/--blue3` après migration (mapper : `--blue`→`--accent`, `--blue2`→`--accent-hover` ou `--accent`, `--blue3`→`--accent-text`).

---

## 3. Espacement

Échelle en base 4, tokens :

```css
--space-1: 4px;  --space-2: 8px;  --space-3: 12px;  --space-4: 16px;
--space-5: 24px; --space-6: 32px; --space-7: 48px;  --space-8: 64px;
--space-9: 96px; --space-10: 128px;
```

- Padding vertical de section : `--space-9` desktop / `--space-8` mobile. Toutes les sections, même valeur — le rythme varie par le layout, pas par le padding.
- Gap de grille : `--space-4` ou `--space-5`, rien d'autre.
- Interdit : valeur d'espacement hors échelle (`18px 22px`, `margin: 40px auto 0`…).

## 4. Rayons & ombres

```css
--radius-sm: 8px;    /* boutons, inputs, pills carrées */
--radius-md: 14px;   /* cards, mockups, FAQ */
--radius-full: 999px;/* badges pilule, avatars (avec 50% pour les cercles) */
```
Trois valeurs. Les 6/10/12/16/20px actuels migrent vers la plus proche.
Ombres : deux niveaux max (`--shadow-card`, `--shadow-float`), définis une fois dans globals.css. Les box-shadow multi-couches improvisées par composant disparaissent.

---

## 5. Icônes

- **Lucide uniquement** (`lucide-react`). Aucune autre source, et **jamais d'emoji** dans l'UI marketing.
- Tailles fixes : **18px** dans le texte et les boutons · **20px** dans la nav · **24px** en tête de card. Aucune autre taille.
- `strokeWidth={1.75}` partout, sans exception.
- Couleur : `currentColor` par défaut ; `var(--accent-text)` quand l'icône est le point focal d'une card.
- Toujours `aria-hidden="true"` + le sens porté par le texte adjacent.
- Correspondances de migration : ⚡→`Zap` (réservé au flash moment, couleur `--spark`) · 🧠→`Brain` · 🔒→`Lock` · 🌍→`Globe` · 📋→`ClipboardList` · 🔍→`Search` · 🎯→`Target` · 🔁→`RefreshCw` · ⏱→`Timer` · 📤→`Send` · 📊→`BarChart3` · 📝→`PenLine` · 📎→`Paperclip` · ✓→`Check` · →/↓ des CTA→`ArrowRight`/`ArrowDown` · ▾→`ChevronDown` · ☀/☾→`Sun`/`Moon`.

---

## 6. Rédaction des titres

Le ton : un artisan qui connaît son métier, pas un pitch deck.

**Règles :**
1. Un titre est une phrase avec un verbe, en sentence case. Max 12 mots.
2. **Interdit : le staccato en fragments** ("Simple. Honest. No surprises." / "One tool. Every meeting type." / "Raw notes in. Action items out."). Deux phrases courtes consécutives de moins de 4 mots = réécrire.
3. Interdit en titre : *honest, simple, powerful, effortless, seamless, supercharge, unlock, elevate, revolutionize, game-changer, built differently*. Si le produit est simple, le titre le montre en étant concret.
4. Tout chiffre annoncé doit être défendable (20 secondes : oui ; "join teams who…" sans teams nommées : non).
5. Pas de `<br />` manuel dans un heading — `max-width` gère les césures.
6. Un seul signe de ponctuation forte par titre. L'em-dash n'apparaît pas dans les H1/H2.
7. Ne jamais nommer un concurrent dans un H2 pour l'attaquer ; la comparaison se fait en corps de texte, factuellement.
8. Chaque page a un H1 unique sur le site (pas de copy réutilisée entre home et pages ICP).

Exemples de conversion :
- "Simple. Honest. No surprises." → "One price, and the free plan actually stays free."
- "One tool. Every meeting type." → "Every meeting an agency runs, handled by the same tool."
- "Raw notes in. Action items out." → "Paste raw notes, get action items with owners and deadlines."

---

## 7. Patterns INTERDITS (liste de contrôle avant tout commit visuel)

1. Emoji utilisé comme icône, puce ou ornement (marketing : interdit dès maintenant ; produit /app + /dashboard : à migrer, ne pas en ajouter de nouveaux).
2. Tableau comparatif ✕ concurrent / ✓ nous.
3. Trust strip "✓ item ✓ item ✓ item" sous le hero.
4. Gradient text (`background-clip: text`) — remplacé par l'italique serif d'accent.
5. Plus d'un effet de glow/blob par page ; jamais dans les sections de contenu.
6. Hex ou rgba de couleur hors de globals.css.
7. `style={{}}` inline dans les pages marketing (tolérance : valeurs calculées dynamiquement uniquement).
8. Nouvelle CSS var hors de ce fichier ; police non chargée.
9. `letter-spacing` en px ; `font-size` hors échelle §1 ; radius hors §4.
10. `<br />` dans un heading ; titre staccato ; vocabulaire interdit §6.3.
11. Flèches unicode (→ ↓ ▾) dans les composants — Lucide only. (Le texte de contenu/blog peut garder ses em-dashes.)
12. Claims sociaux invérifiables ("join teams", "loved by", étoiles décoratives) tant qu'il n'y a pas de vrais témoignages nommés.
13. Deux implémentations du même bloc (pricing, mockup, FAQ) — tout bloc répété sur 2+ pages devient un composant.
14. `target="_blank"` sur des liens internes.
15. Section construite au moule kicker + H2 deux lignes + grille de 3 cards plus de deux fois par page.
