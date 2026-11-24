# Phase 2 review checklist

- Public site only. Preserve artwork, logo, Sapphire Veil and full capture/scan/success/landing timings. Legacy hero styles are untouched for fallback; the active homepage loads their original cascade in hero-motion.css with a proportional scanner and explicit skip/playback controls.
- Review all eight pages at widths 320, 375, 390, 620, 768, 900, 1024, 1100, 1280 and 1440 CSS pixels. Check page overflow, readable copy, line breaks, navigation open/close, focus, footer links and code sample horizontal scroll.
- Check first visit full intro, skip click/keyboard, session replay, reduced motion, resize, scan landmarks and paused scan/phone motion. Verify the borderless artwork is unchanged and the handoff is seamless.
- Test Chrome, Safari and Firefox on real desktop/mobile devices or equivalent browser runners before merge. Do not mark visual QA complete based on source inspection.
- Phase 1 contact/legal changes are deliberately excluded; this branch is based on production main. Reconcile PRs before merging.
