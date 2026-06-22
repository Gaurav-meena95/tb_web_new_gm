-- Run on PostgreSQL (write instance). Stores each user's onboarding skill
-- selection as a single row keyed by user_id. The user picks 1-3 skills:
-- skill_1 is mandatory, skill_2 and skill_3 are optional and stay NULL when
-- fewer than three are chosen. Re-running the onboarding step upserts the row.
--
-- Skills are stored as stable numeric codes (the Flutter screen's _SkillItem.code),
-- not the internal string ids:
--   1 photographer   2 chef          3 developer    4 designer      5 educator
--   6 guide          7 journalist    8 musician     9 entrepreneur 10 athlete
--  11 artist        12 medic        13 engineer    14 adventure    15 researcher
--  16 instructor    17 content      18 architect   19 consultant   20 volunteer
--  21 student       22 retired

CREATE TABLE IF NOT EXISTS user_skills (
    user_id     BIGINT PRIMARY KEY,
    skill_1     INT    NOT NULL,
    skill_2     INT,
    skill_3     INT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
