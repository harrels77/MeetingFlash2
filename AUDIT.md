# AUDIT — MeetingFlash (juillet 2026)

Audit direction artistique + front-end. Aucun fichier modifié. Verdict global d'abord, détail ensuite.

**Verdict en une phrase : le site est techniquement propre (SEO, tokens de thème, dark/light) mais visuellement, c'est un template "AI SaaS 2024" sans une seule décision de design propriétaire — palette Tailwind copiée à la main, emojis en guise d'icônes, titres staccato générés, et le même squelette de section cloné sur 8 pages.**

---

## 0. Structure réelle du site

**Stack** : Next.js 14 App Router, TypeScript, CSS Modules (pas de Tailwind installé — mais voir §1). 3 polices Google : Plus Jakarta Sans, Instrument Serif, JetBrains Mono.

**Pages marketing** (surface de l'audit) :
- `/` — landing 604 lignes, entièrement `'use client'` ([page.tsx](src/app/page.tsx) + [page.module.css](src/app/page.module.css), 1322 lignes)
- `/pricing` — serveur + îlot client ([PricingClient.tsx](src/app/pricing/PricingClient.tsx))
- `/for-agencies`, `/for-product-teams`, `/for-freelancers` — clones structurels sur [marketing.module.css](src/styles/marketing.module.css)
- `/tools/*` (3 pages) — même moule
- `/blog` + `/blog/[slug]` — 14 articles statiques
- `/login`, `/signup`, `/share/[token]`, `/privacy`, `/terms`, `not-found.tsx`

**Produit** : `/app` (flash tool, 1020 lignes), `/dashboard/*` (packs, projets, search, settings).

**Composants partagés** : MobileNav (la vraie nav), HeroCta, FooterAccount, ProductShowcase, ActionTiers, QuestionsView, RisksView, OutcomePill, ThemeToggle, SwRegister.

**Code mort découvert** :
- [Nav.tsx](src/components/Nav.tsx) + Nav.module.css — une DEUXIÈME nav complète, jamais importée nulle part, avec des liens vers des ancres `#how` / `#pack` qui n'existent plus, un logo "meetingflash" en minuscules et un carré placeholder. C'est la "nav dupliquée" signalée.
- [Ticker.tsx](src/components/Ticker.tsx) + Ticker.module.css — jamais importés.
- Classes `.testimonialStars` / `.testimonialCard` / `.testimonialText` dans [page.module.css:751](src/app/page.module.css:751) — vestiges des faux témoignages supprimés. La classe `.testimonials` sert encore de conteneur… à la section Outcomes ET à la FAQ ([page.tsx:381](src/app/page.tsx:381), [page.tsx:505](src/app/page.tsx:505)).

---

## 1. Direction artistique : quasi tout est "défaut", rien n'est signé

### Couleurs — la palette Tailwind sans Tailwind
Le projet n'a pas Tailwind, mais **chaque couleur de [globals.css](src/styles/globals.css) est un hex Tailwind par défaut recopié** :

| Token | Valeur | = Tailwind |
|---|---|---|
| `--blue` | #2563EB | blue-600 |
| `--blue2` | #3B82F6 | blue-500 |
| `--blue3` | #60A5FA | blue-400 |
| `--text` | #F8FAFC | slate-50 |
| `--muted` | #94A3B8 | slate-400 |
| `--faint` | #475569 | slate-600 |
| `--green` / `--amber` / `--red` | #22C55E / #F59E0B / #EF4444 | green/amber/red-500 |

Idem en light mode (#0F172A = slate-900, #1D4ED8 = blue-700…) et dans les 69 hex codés en dur des modules CSS (#FCA5A5 = red-300, #FCD34D = amber-300, #B91C1C = red-700…). **Zéro couleur propriétaire sur tout le site.** C'est LE marqueur n°1 du look généré : n'importe quel autre produit vibe-codé cette année a exactement ces hex.

Le bon point : le système de tokens existe et le light mode fonctionne. Le problème n'est pas l'architecture, ce sont les valeurs.

### Typographie — 3 polices chargées, 1 seule vraiment utilisée
- **29 tailles de police distinctes** entre page.module.css et marketing.module.css seulement — dont 10.5px, 13.5px et 14.5px. Aucune échelle, chaque valeur est une improvisation.
- **Instrument Serif est chargée en entier (roman + italique) pour ~4 usages** : le badge hero italique et deux accents. Un serif payé au prix réseau plein pour un rôle de sticker. Soit on l'assume comme voix display, soit on la retire.
- `letter-spacing` en px absolus (`-2px` sur des titres qui descendent à 30–38px en mobile — proportionnellement le tracking se resserre quand le titre rétrécit, l'inverse de ce qu'il faut). [marketing.module.css:63](src/styles/marketing.module.css:63), [page.module.css:89](src/app/page.module.css:89).
- Corps en 15px ([globals.css:57](src/styles/globals.css:57)), sous-titres hero à 18/19px, cards à 14px, footers à 13px : lisible mais serré, typique du "tout doit tenir".
- Plus Jakarta Sans 800 avec tracking négatif + gradient text sur le H1 = la formule exacte du hero SaaS généré.

### Espacements & rayons
- **9 border-radius différents** (6, 8, 10, 12, 14, 16, 20, 999px, 50%). Trois suffisent.
- Paddings/margins arbitraires partout (`padding: 18px 22px`, `margin: 40px auto 0`, `gap: 12`), beaucoup en styles inline. Aucune échelle d'espacement.

### Iconographie — inexistante
**253 lignes contiennent des emojis ou glyphes texte utilisés comme icônes.** ⚡🧠🔒🌍📋🔍🎯🔁⏱📤📊📝📎💭🚨✉💬📅📁☀☾▾→↓✓✕. Conséquences :
- Rendu différent selon l'OS (emojis Apple vs Windows vs Android) — vous ne contrôlez ni la couleur, ni le style, ni l'alignement optique.
- Aucune icône ne peut suivre le thème dark/light.
- C'est le signal "généré par IA" le plus visible pour un œil entraîné, avant même de lire le texte.

### Effets — la trifecta du hero IA
Blobs de glow ambiants + gradient text sur la moitié du H1 + badge pilule avec shimmer + cartes "bento" ([page.tsx:142-145](src/app/page.tsx:142), `.h1Accent`, `.heroBadgeSerif`). Chacun est défendable seul ; les quatre ensemble sur la même page, c'est le moodboard par défaut de tous les générateurs. Note : CLAUDE.md verrouille l'opacité des blobs à 0.22 comme "décision assumée" — je la conteste dans FIXES.md, à vous d'arbitrer.

### Ce qui EST une décision assumée (à garder)
- Le parti pris "pas de faux témoignages" + note du fondateur signée. Rare et juste.
- Le positionnement copy agency-first du hero.
- Dark-first avec light mode complet fonctionnel.
- Les mockups produit (ProductShowcase, Discovery Pack) construits en vraies cartes thémées plutôt qu'en screenshots.

---

## 2. Marqueurs "site IA" — inventaire fichier par fichier

### 2.1 Titres staccato en fragments (le tic LLM "X. Y. Z.")
- [page.tsx:426](src/app/page.tsx:426) — **"Simple. Honest. No surprises."** (le pire du lot)
- [page.tsx:263-264](src/app/page.tsx:263) — "ChatGPT writes. / MeetingFlash executes."
- [page.tsx:507](src/app/page.tsx:507) — "Honest answers, before you ask."
- [page.tsx:600](src/app/page.tsx:600) — footer "**Built differently.**"
- [for-agencies/page.tsx:111](src/app/for-agencies/page.tsx:111) — "One tool. Every meeting type."
- [for-product-teams/page.tsx:105](src/app/for-product-teams/page.tsx:105) — "One tool. Every recurring meeting." (le même, décliné)
- [for-freelancers/page.tsx:237](src/app/for-freelancers/page.tsx:237) — "Charge for delivery. / Skip the paperwork."
- [pricing/page.tsx:132](src/app/pricing/page.tsx:132) — "Honest answers." ; [:149](src/app/pricing/page.tsx:149) — "Try one Pack free. / No credit card."
- [tools/follow-up-email-generator/page.tsx:148](src/app/tools/follow-up-email-generator/page.tsx:148) — "Three steps. 20 seconds total."
- [tools/meeting-action-items-extractor/page.tsx:143](src/app/tools/meeting-action-items-extractor/page.tsx:143) — "Raw notes in. Action items out."
- [tools/discovery-call-recap-tool/page.tsx:147](src/app/tools/discovery-call-recap-tool/page.tsx:147) — "Six outputs from one paste."
- [blog/page.tsx:28](src/app/blog/page.tsx:28) — "Better meetings, better execution."

L'insistance sur "Honest" (3 occurrences en titre) est un tell : un produit honnête ne le répète pas, il le montre.

### 2.2 Emojis-icônes (lignes vérifiées, comptage exhaustif par fichier)
- [page.tsx](src/app/page.tsx) — 29 lignes : bento :216 ⚡, :228 🧠, :234 🔒, :240 🌍, :246 📋, :252 🔍 ; agency pains :312 🎯, :321 📋, :330 🔁 ; outcomes :388 ⏱, :395 🎯, :402 📤 ; mini-demo :119 ⚡, :125 📌, :128 ⚠
- [for-agencies/page.tsx](src/app/for-agencies/page.tsx) — 17 lignes (:118 🎯, :125 📋, :132 🔁, :139 📊, :160 📤, :167 🧠, :174 🌍, :181 📎)
- [for-product-teams/page.tsx](src/app/for-product-teams/page.tsx) — 18 lignes ; [for-freelancers/page.tsx](src/app/for-freelancers/page.tsx) — 16 lignes
- [tools/*] — 13 à 15 lignes chacune (ex. [follow-up:152](src/app/tools/follow-up-email-generator/page.tsx:152) 📝, :166 📤)
- [ProductShowcase.tsx:23](src/components/ProductShowcase.tsx:23) — onglet "⚡ Flash tool", :120 "⚡ Your Execution Pack"
- [MobileNav.tsx:129](src/components/MobileNav.tsx:129) et :229 — "⚡ New Flash" ; :161 — toggle thème en glyphes texte ☀/☾ ; :93/:118/:210 — chevrons "▾" texte
- Produit : [app/page.tsx](src/app/app/page.tsx) — 35 lignes ; [dashboard/page.tsx](src/app/dashboard/page.tsx) — 14 ; not-found — 6. Blocs de pack : 📋🎯💭🚨✉💬📅 (décision CLAUDE.md "Per-block emoji icons" — à re-arbitrer).

### 2.3 Le tableau comparatif ✕/✓
[page.tsx:267-296](src/app/page.tsx:267) — deux colonnes "ChatGPT / Generic AI" avec ✕ rouges vs "MeetingFlash" avec ✓ verts. Format auto-congratulatoire vu sur des milliers de landings générées ; il prêche les convertis et insulte l'intelligence du visiteur.

### 2.4 Trust strips "✓ ✓ ✓"
[for-agencies:99-101](src/app/for-agencies/page.tsx:99) (`✓ 20 seconds per recap ✓ Project memory ✓ EN/FR/ES/DE`) et équivalents sur les 2 autres ICP + tools.

### 2.5 Claims sans preuve, ton marketing génératif
- [page.tsx:553](src/app/page.tsx:553) — "**Join teams who** never leave a meeting without a complete execution plan." Quelles teams ? Le site refuse par ailleurs les faux témoignages — cette phrase est un faux témoignage diffus.
- [page.tsx:405](src/app/page.tsx:405) — "Clients perceive you differently when you respond **at machine speed**."
- [page.tsx:567](src/app/page.tsx:567) — footer "Built for teams who believe every meeting should end with **total clarity**" ; répété en CTA banner :549 "ends with total clarity".
- [blog/page.tsx:58](src/app/blog/page.tsx:58) — "Turn meeting notes into execution — instantly."

### 2.6 Flèches et glyphes texte dans les CTA
`→` dans ~tous les boutons du site, `↓` ([page.tsx:169](src/app/page.tsx:169)), `+` FAQ ([page.tsx:531](src/app/page.tsx:531)) qui ne devient jamais `−` à l'ouverture. Les flèches unicode ne s'alignent pas optiquement avec le texte et signent le prototypage.

### 2.7 Rythme de section cloné
Chaque section de chaque page marketing = `sectionPill` (kicker uppercase) + H2 en 2 lignes coupées par un `<br />` manuel + grille de cards. Vérifié sur : home (6 sections), 3 ICP, 3 tools, pricing. Les `<br />` forcés dans les H2 : [page.tsx:211, 263, 303, 384, 549](src/app/page.tsx:211), [for-agencies:154](src/app/for-agencies/page.tsx:154), etc. — ils cassent en responsive et trahissent une mise en page "figée au prompt".

### 2.8 Contenu dupliqué à l'identique
- Le H1 "…before they finish their coffee" est sur la home ([page.tsx:158](src/app/page.tsx:158)) ET sur /for-agencies ([for-agencies:89](src/app/for-agencies/page.tsx:89)) — mot pour mot.
- Le mockup "Discovery call · Acme Corp" (Sarah, $48k, 12 semaines, SOW lundi) est copié-collé dans [page.tsx:340-371](src/app/page.tsx:340) et [for-agencies:189-218](src/app/for-agencies/page.tsx:189), avec **deux jeux de classes CSS dupliqués** (`agencyMockup/agencyBlock*` dans page.module.css vs `mockup/mockBlock*` dans marketing.module.css).

---

## 3. UX / Conversion

1. **Incohérence de prix visible en 2 clics** : la landing annonce "Save **20%**" ([page.tsx:438](src/app/page.tsx:438)), /pricing annonce "Save **33%**" ([PricingClient.tsx:45](src/app/pricing/PricingClient.tsx:45)). Le vrai chiffre pour $12→$8 est 33%. Un visiteur qui compare les deux pages voit un site qui ne connaît pas ses propres prix.
2. **Deux implémentations du pricing** : la section pricing de la home a son propre toggle + appel checkout inline ([page.tsx:429-501](src/app/page.tsx:429)) sans état loading ni gestion d'erreur, pendant que PricingClient a les deux. Elles ont déjà divergé (le 20/33%) et divergeront encore.
3. **Hero encombré** : la rangée `heroStats` intercale le composant MiniBeforeAfter *entre* la stat "20s" et les deux autres stats ([page.tsx:172-189](src/app/page.tsx:172)) — trois stats + une démo compressée dans une bande, personne ne lit rien. La stat "0 setup needed" est du remplissage.
4. **Verbes CTA incohérents** : "Try with sample notes →" (nav), "Try it free →" (ICP), "Run your first Flash free →" (CTA banner ICP), "Start free →" (pricing), "Go Pro →", "Get your pack →" (nav morte), "Continue Flashing →" (HeroCta guest per CLAUDE.md). Aucune hiérarchie verbale ; le produit s'appelle tantôt "pack", tantôt "Flash", tantôt rien.
5. **Nav** : "Home" en premier lien desktop ([MobileNav.tsx:84](src/components/MobileNav.tsx:84)) — le logo fait déjà ce travail. Le menu mobile pointe vers `#features` ([MobileNav.tsx:182](src/components/MobileNav.tsx:182)) : ancre morte sur toute page ≠ home.
6. **Footer** : liens Privacy/Terms en `target="_blank"` ([page.tsx:593-594](src/app/page.tsx:593)) sans raison ; deux systèmes de footer (footer complet home vs `miniFooter` ICP/tools) ; logo footer = carré bleu `.footerLogoMark` ([page.tsx:563](src/app/page.tsx:563), [page.module.css:1036](src/app/page.module.css:1036)) alors que la règle projet est "logo.png partout".
7. **FAQ** : le "+" ne pivote pas en "−" ; tout le style est inline ; pas d'animation d'ouverture. Fonctionnel, pas fini.
8. La section Compare arrive avant que le produit soit prouvé — attaquer ChatGPT en section 3 est défensif. L'ordre Features → Compare → Agencies → Outcomes dilue : Agencies (le vrai différenciateur ICP) devrait remonter.

---

## 4. Cohérence / dette CSS

1. **69 hex codés en dur** dans les modules CSS (hors globals) — surtout les états sémantiques : #FCA5A5 (danger-texte) répété dans 8 fichiers, #FCD34D (warning) dans 5, avec leurs overrides light (#B91C1C, #B45309) redéclarés à chaque fois. Il manque simplement les tokens `--danger-*` / `--warning-*` / `--success-*`.
2. **~130 blocs `style={{}}` inline** dans les .tsx (29 dans dashboard/page.tsx, 25 dans page.tsx, 18 dans app/page.tsx). Sur la home : tout le toggle pricing, toute la FAQ, toute la note fondateur sont inline — trois sections entières hors du système de style.
3. **Composants dupliqués** : le mockup Acme (cf. §2.8), le pattern FAQ (implémenté 3 fois : inline home, `.faqItem` marketing, JSON-LD dupliqué), les cartes pricing (2 fois), la nav (2 fois dont 1 morte).
4. **Nommage mensonger** : `.testimonials` contient les Outcomes et la FAQ ; `.agencyPain*` vs `.pain*` pour le même pattern.
5. Un seul breakpoint (880px) pour tout le marketing ; `.h1` de marketing.module.css en **56px fixes** (pas de clamp) jusqu'à 880px — à 900px de viewport le titre est disproportionné.

---

## 5. Technique rapide

### SEO — le point fort du site
Canonical www partout, JSON-LD (Organization, WebSite, SoftwareApplication, FAQPage, BreadcrumbList), sitemap/robots corrects, noindex propre sur les pages privées, OG image dynamique. Deux réserves : le H1 dupliqué home//for-agencies (§2.8) affaiblit la page agencies sur sa propre requête ; et `openGraph` ne déclare pas d'image sur les pages qui overrident les metadata (elles héritent de la convention `opengraph-image` racine — à vérifier en prod avec un débogueur OG).

### Accessibilité
- Emojis-icônes sans `aria-hidden` : les lecteurs d'écran lisent "high voltage sign Execution Pack".
- `--faint` #475569 sur fond #060C18 ≈ 3.2:1, utilisé en 14px (`.footerTagline`) → échec AA (4.5:1 requis).
- Bons points : `prefers-reduced-motion` géré, `aria-expanded` sur le dropdown For, `aria-label` sur burger/toggle, FAQ en `<details>` natif.
- Dropdown "For" : pas de fermeture Escape ni de gestion focus.

### Bugs visibles
1. **[page.tsx:128](src/app/page.tsx:128)** — `style={{color:'#FCD34D)'}}` : parenthèse en trop → couleur invalide, la ligne "⚠ Interview timeline tight" du mini-demo hero s'affiche sans sa couleur ambre. Sur le hero. Depuis un moment.
2. **[middleware.ts](src/middleware.ts)** — s'exécute sur *toutes* les requêtes (matcher quasi-global), crée un client Supabase et `await getSession()`… avec le client standard sans pont de cookies (`createClient` nu, pas `@supabase/ssr` + cookie handlers). Il ne rafraîchit donc aucune session côté serveur : c'est un no-op qui ajoute de la latence à chaque page, y compris marketing et blog.
3. Nav dupliquée morte + Ticker mort (§0) — pas visibles, mais chaque futur contributeur (humain ou IA) risque de modifier la mauvaise nav.
4. La home 'use client' de 604 lignes embarque tout le JS de la page dans le bundle initial ; pas bloquant pour le SEO (SSR initial) mais coûteux en LCP/TBT sur mobile.

---

## Synthèse

Le socle technique (thème, tokens, SEO, architecture serveur Phase 11) est au-dessus de la moyenne des projets solo. La couche visible est en dessous : elle empile tous les défauts par défaut de la génération assistée — palette d'emprunt, emojis, staccato, sections clonées — et deux incohérences qui coûtent de la confiance (prix 20/33%, bug couleur sur le hero). La bonne nouvelle : le site utilise déjà des CSS variables partout, donc 80% de la correction DA passe par `globals.css` + un remplacement mécanique des icônes et des titres. Voir [FIXES.md](FIXES.md) pour l'ordre d'attaque et [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) pour la cible.
