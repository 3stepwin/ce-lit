-- 20260113_000004_viral_seed_bank.sql
-- MIGRATION: Viral Seed Bank v1 (SNL / Deadpool / Severance Energy)
-- AUTHOR: User / Antigravity
-- DATE: 2026-01-13

-- Clear existing starter premises to avoid duplicates if needed, or just insert on conflict
-- Using INSERT... ON CONFLICT DO NOTHING to be safe.

-- CATEGORY: WORK (Institutional Satire Core)
insert into public.celit_premises (category, sketch_type, role_hint, premise, weight) values
('work','orientation','training facilitator','A mandatory orientation video calmly explains that your position was ceremonial and the real role began before hiring.',18),
('work','meeting_ritual','project lead','A kickoff meeting where the agenda slowly replaces objectives with loyalty metrics.',17),
('work','customer_support','support agent','A support agent confirms your issue was resolved retroactively and thanks you for patience you never expressed.',18),
('work','compliance_portal','portal narrator','A compliance portal congratulates you for full completion before any steps appear.',17),
('work','performance_review','HR manager','A performance review praises your enthusiasm while quietly noting your autonomy score is below threshold.',16),
('work','corporate_psa','corporate narrator','A safety PSA calmly warns against independent thought during active hours.',16),
('work','termination_notice','HR compliance officer','A termination notice explains employment was symbolic and your access expired earlier.',15),
('work','training_video','training narrator','A training module repeats instructions that never arrive, marking each section complete.',15),
('work','meeting_minutes','clerical assistant','Meeting minutes are read aloud describing decisions no one remembers making.',14),
('work','onboarding_followup','HR coordinator','A follow-up onboarding video thanks you for agreeing and apologizes for the lack of options.',14)
on conflict do nothing;

-- CATEGORY: FEED / MEDIA (SNL + Deadpan Broadcast)
insert into public.celit_premises (category, sketch_type, role_hint, premise, weight) values
('feed','breaking_news','news anchor','A breaking news alert announces widespread participation and reminds viewers action is unnecessary.',18),
('feed','weekend_update','news correspondent','A Weekend Update-style segment calmly reports that consent was inferred from continued viewing.',17),
('feed','apology_statement','media personality','An apology video thanks viewers for forgiveness regarding an incident that has not occurred.',17),
('feed','documentary_trailer','documentary narrator','A prestige documentary trailer reveals the movement was a product and the product already shipped.',16),
('feed','press_conference','spokesperson','A press conference avoids questions by reading prepared answers to things not asked.',16),
('feed','public_address','official announcer','A public address reassures viewers everything is normal while reclassifying them as participants.',15),
('feed','award_show_intro','ceremony host','An award show intro thanks nominees for attendance and compliance.',15),
('feed','media_psa','PSA narrator','A public service announcement clarifies that ignoring the message counts as acceptance.',14),
('feed','trend_explainer','content analyst','A trend explainer calmly states the trend is mandatory.',14),
('feed','special_report','field reporter','A special report concludes before beginning and signs off with enrollment confirmation.',14)
on conflict do nothing;

-- CATEGORY: LIFE (Deadpool-style Personal Implication)
insert into public.celit_premises (category, sketch_type, role_hint, premise, weight) values
('life','fake_commercial','brand representative','A luxury commercial thanks you for subscribing and explains cancellation was ceremonial.',18),
('life','receipt_notice','clerical officer','A formal receipt prints itself for a service you don’t recall requesting.',17),
('life','checklist','intake coordinator','A checklist calmly verifies harmless facts before confirming your continued presence.',17),
('life','security_notice','security officer','A security notice explains your location was logged as agreement.',16),
('life','system_status','system voice','A system status update announces normal operation and confirms your inclusion.',16),
('life','cancellation_ritual','account specialist','A cancellation flow requests proof of intent and a witness statement.',15),
('life','terms_update','policy announcer','A terms update explains acceptance occurred during routine activity.',15),
('life','subscription_followup','account manager','A follow-up message thanks you for renewing something you never saw.',14),
('life','notification_alert','automated voice','A notification alerts you that silence has been recorded.',14),
('life','confirmation_message','automated system','A confirmation message reassures you nothing further is required from you.',14)
on conflict do nothing;

-- CATEGORY: RANDOM / CULTURAL COLLISION (In Living Color Energy)
insert into public.celit_premises (category, sketch_type, role_hint, premise, weight) values
('random','institutional_sketch','authority figure','An official announcement explains the process is voluntary in tone only.',18),
('random','meta_trailer','narrator','A trailer explains you are watching a trailer and the decision was already logged.',17),
('random','bodycam_procedural','officer','A procedural recording documents cooperation without requests.',16),
('random','therapy_intake','intake counselor','A therapy intake session skips questions and thanks you for honesty.',16),
('random','public_notice','announcer','A public notice repeats itself until it feels correct.',15),
('random','training_tape','instructional voice','An instructional tape warns not to rewind or reconsider.',15),
('random','portal_welcome','system greeter','A portal welcomes you back despite first entry.',14),
('random','status_briefing','briefing officer','A status briefing ends with confirmation of compliance.',14),
('random','orientation_loop','facilitator','An orientation loop restarts just before clarity.',14),
('random','final_notice','official voice','A final notice explains this is not the final notice.',14)
on conflict do nothing;
