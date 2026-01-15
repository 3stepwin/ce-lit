-- 20260113_000005_viral_seed_bank_v2.sql
-- MIGRATION: Viral Seed Bank v2 (Expansion: Dark, Gen-Z, Celebrity-Coded)
-- AUTHOR: User / Antigravity
-- DATE: 2026-01-13

-- PACK 1 — DARKER / PSYCHOLOGICAL
insert into public.celit_premises (category, sketch_type, role_hint, premise, weight) values
('work','memory_orientation','facilitator','A calm orientation video explains some memories may be reassigned for efficiency.',19),
('work','exit_interview','HR interviewer','An exit interview begins by thanking you for already leaving.',18),
('work','compliance_warning','compliance officer','A warning states that curiosity is permitted only during approved windows.',18),
('life','system_update','system voice','A system update announces emotional adjustments have been applied successfully.',17),
('life','intake_form','intake coordinator','An intake form auto-fills your answers and thanks you for honesty.',17),
('random','processing_notice','processing agent','A notice explains processing will continue regardless of participation.',17),
('work','performance_review','HR manager','A performance review locks mid-sentence and marks the outcome satisfactory.',16),
('life','confirmation_loop','automated system','A confirmation message repeats until it feels correct.',16),
('random','archive_entry','archivist','An archivist catalogs your presence as historical fact.',15),
('work','policy_training','training narrator','A policy training clarifies rules apply retroactively.',15),
('life','silence_record','automated voice','A system records your silence as agreement.',15),
('random','procedure_brief','briefing officer','A briefing explains no action is required because action was implied.',14),
('work','badge_activation','security administrator','A badge activation confirms access was granted earlier.',14),
('life','monitoring_notice','system alert','A monitoring notice reassures you observation is minimal.',14),
('random','finalization_step','process narrator','A finalization step thanks you for completion before beginning.',14)
on conflict do nothing;

-- PACK 2 — GEN-Z / YOUTH-CODED
insert into public.celit_premises (category, sketch_type, role_hint, premise, weight) values
('feed','algorithm_update','platform narrator','An update explains your preferences were inferred from hesitation.',19),
('feed','content_warning','content moderator','A content warning thanks you for continuing anyway.',18),
('feed','creator_guidelines','guidelines voice','Creator guidelines clarify authenticity must follow format.',18),
('life','notification_stack','automated assistant','Notifications stack until one thanks you for engagement.',17),
('feed','trend_mandate','trend analyst','A trend explainer clarifies participation is assumed.',17),
('random','engagement_report','analytics voice','An engagement report praises your passive interaction.',17),
('feed','shadowban_notice','platform voice','A notice reassures you visibility was adjusted gently.',16),
('life','recommendation_engine','system recommender','Recommendations apologize for knowing you so well.',16),
('feed','apology_refresh','creator voice','An apology video refreshes itself and continues.',15),
('random','metrics_brief','data analyst','Metrics confirm you reacted appropriately.',15),
('feed','terms_popup','system popup','A popup closes itself and confirms acceptance.',15),
('life','feed_summary','platform narrator','A daily feed summary includes moments you don’t recall.',14),
('random','auto_caption','caption system','Auto-captions correct your intent.',14),
('feed','story_timeout','platform alert','A story times out and thanks you for viewing.',14),
('life','profile_sync','system assistant','Profile sync completes using inferred values.',14)
on conflict do nothing;

-- PACK 3 — “CELEBRITY-CODED WITHOUT NAMING”
insert into public.celit_premises (category, sketch_type, role_hint, premise, weight) values
('random','prestige_trailer','trailer narrator','A prestige trailer reveals the hero was chosen by process, not destiny.',19),
('random','superhero_briefing','command voice','A heroic briefing clarifies powers were assigned administratively.',18),
('feed','late_night_monologue','host','A monologue delivers jokes that never arrive but still land.',18),
('random','origin_story','narrator','An origin story explains the transformation was procedural.',17),
('feed','award_acceptance','award recipient','An acceptance speech thanks the system for the outcome.',17),
('random','vigilante_notice','authority voice','A notice explains vigilantism is approved in limited contexts.',17),
('feed','press_junket','interviewer','A press junket asks questions already answered.',16),
('random','final_battle_brief','operations lead','A final battle briefing confirms victory conditions were met earlier.',16),
('feed','opening_cold','announcer','A cold open establishes stakes that never change.',15),
('random','training_montage','trainer','A training montage confirms readiness without effort.',15),
('feed','reboot_announcement','studio voice','A reboot announcement thanks you for nostalgia.',15),
('random','mentor_scene','mentor figure','A mentor speech skips advice and approves progress.',14),
('feed','franchise_update','studio announcer','A franchise update confirms continuation regardless of response.',14),
('random','after_credits_notice','system voice','An after-credits notice thanks you for staying.',14),
('feed','legacy_statement','official narrator','A legacy statement reassures you this was always intended.',14)
on conflict do nothing;
