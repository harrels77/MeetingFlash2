# FIXES — plan priorisé (classé par ratio impact/effort)

**Statut 2026-07-04 : les 15 items sont livrés** (commits `13ab85e` → `cf39814`).
Restes ouverts, hors périmètre de cette passe :
- ~~Migration Lucide des emojis dans le produit~~ — FAIT 2026-07-10 (BlockIcon + passe complète /app, dashboard, pack, share, search, project, settings)
- Variation de layout des sections (item 11, partie "2 layouts par page") — fait a minima (br supprimés, trust strips sobres) ; une vraie alternance de layouts mérite sa propre passe de design
- Item 15 : letter-spacing en em fait sur les surfaces marketing ; les modules du produit (dashboard/pack/settings) gardent quelques valeurs px

Référence cible : [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md). Détail des constats : [AUDIT.md](AUDIT.md).

1. ✅ **[Impact: haut] [Effort: 0.5h] [src/app/page.tsx]** — Corriger les 3 bugs de confiance : `'#FCD34D)'` → couleur valide (ligne 128) ; "Save 20%" → "Save 33%" (ligne 438) ; lien mobile `#features` → `/#features` dans MobileNav.tsx:182.

2. ✅ **[Impact: moyen] [Effort: 0.5h] [src/components/Nav.tsx, Nav.module.css, Ticker.tsx, Ticker.module.css, page.module.css]** — Supprimer le code mort : les deux composants jamais importés + les classes `.testimonial*` orphelines. Renommer `.testimonials` → `.section` là où elle sert à Outcomes/FAQ.

3. ✅ **[Impact: haut] [Effort: 1.5h] [globals.css + les 12 fichiers listés en AUDIT §4.1]** — Poser les tokens du design system (accent signature, échelle typo/espacement/radius, tokens sémantiques `--danger-*`/`--warning-*`/`--success-*` avec variantes light) et remplacer les 69 hex codés en dur. Prérequis des items suivants.

4. ✅ **[Impact: haut] [Effort: 1h] [pages listées en AUDIT §2.1]** — Réécrire les ~13 titres staccato selon les règles de rédaction du design system. Pur changement de copy, zéro CSS. Supprimer au passage "Built differently.", "Join teams who…", "at machine speed".

5. ✅ **[Impact: haut] [Effort: 2.5h] [installer lucide-react ; page.tsx, for-*/page.tsx, tools/*/page.tsx, ProductShowcase.tsx, MobileNav.tsx, not-found.tsx]** — Remplacer tous les emojis-icônes de la surface marketing par Lucide (règles : DESIGN-SYSTEM §Icônes). Inclut ☀/☾ → Sun/Moon, ▾ → ChevronDown, → dans les CTA → ArrowRight.

6. ✅ **[Impact: haut] [Effort: 1h] [src/app/page.tsx:259-297, page.module.css]** — Tuer le tableau ✕/✓. Remplacer par le pattern "sans / avec" factuel (deux scénarios racontés : "ta soirée après un call, avant / après") ou intégrer la comparaison en une phrase dans la section Agencies. Pas de croix rouges sur les concurrents.

7. ✅ **[Impact: haut] [Effort: 1h] [src/app/page.tsx:423-502, src/app/pricing/PricingClient.tsx]** — Une seule source de vérité pricing : extraire `<PricingCards />` partagé (ou réduire la section home à un teaser 2 lignes + lien /pricing). Élimine structurellement les divergences type 20/33%.

8. ✅ **[Impact: moyen] [Effort: 1h] [src/app/page.tsx:340-371, for-agencies/page.tsx:189-218, page.module.css, marketing.module.css]** — Extraire le mockup "Discovery call · Acme Corp" en composant unique `<DiscoveryMockup />` ; supprimer le doublon de classes `agencyBlock*`/`mockBlock*`.

9. ✅ **[Impact: moyen] [Effort: 0.5h] [src/app/for-agencies/page.tsx:89]** — Dédupliquer le H1 de /for-agencies (identique à la home). Nouveau H1 orienté requête : ex. "The meeting recap tool built for agency client work." Garde "coffee" à la home uniquement.

10. ✅ **[Impact: moyen] [Effort: 2h] [src/app/page.tsx:409-543]** — Sortir les 3 sections 100% inline (toggle pricing, FAQ, note fondateur) vers page.module.css. FAQ : + → − à l'ouverture (`details[open]`), transition. Note fondateur : la traiter en vraie signature éditoriale (serif, respiration) — c'est l'atout confiance du site, il est stylé comme un div de debug.

11. ✅ **[Impact: moyen] [Effort: 1.5h] [page.tsx, for-*, tools/*]** — Casser le rythme cloné : retirer tous les `<br />` des H2 (laisser `max-width` faire les césures), varier 2 layouts de section par page (une pleine largeur éditoriale, une split), réduire les trust strips "✓ ✓ ✓" à une ligne de texte sobre.

12. ✅ **[Impact: moyen] [Effort: 0.5h] [src/middleware.ts]** — Supprimer le middleware (no-op coûteux : client Supabase sans pont cookies, exécuté sur toutes les routes). Si un refresh de session serveur est réellement voulu un jour, le refaire avec `@supabase/ssr` et un matcher restreint aux routes produit.

13. ✅ **[Impact: moyen] [Effort: 1h] [page.tsx:559-601, for-*, tools/*, blog]** — Footer unique : `/logo.png` au lieu du carré bleu, retirer `target="_blank"` sur Privacy/Terms, fusionner footer/miniFooter en un composant, retirer "Home" de la nav desktop.

14. ✅ **[Impact: moyen] [Effort: 1h] [tous les CTA marketing]** — Hiérarchie verbale unique : primaire = "Try it free" (invités) / "Continue" (connectés) ; secondaire = "See pricing". Un seul nom pour l'objet produit : "Execution Pack". Supprimer "Get your pack", "Run your first Flash", etc.

15. ✅ **[Impact: bas] [Effort: 1h] [globals.css, MobileNav.tsx, page.module.css]** — Passe a11y : `aria-hidden` sur icônes décoratives (transitoire tant que les emojis restent côté produit), éclaircir `--faint` ou le réserver aux tailles ≥18px, fermeture Escape du dropdown "For", letter-spacing en `em`.

**Ordre conseillé** : 1–2 (quick wins, 1h) → 3 (fondation) → 4–5–6 (le visage du site) → 7–8–9 (cohérence) → 10–15.
**Hors périmètre volontaire** : refonte des emojis dans /app et /dashboard (📋🎯💭… des blocs de pack) — décision produit verrouillée dans CLAUDE.md, à re-arbitrer séparément après la surface marketing.
