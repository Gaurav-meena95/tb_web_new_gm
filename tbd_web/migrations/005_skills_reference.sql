-- Run on PostgreSQL (write instance). Adds a reference (lookup) table that
-- gives meaning to the numeric skill codes stored in user_skills.skill_1/2/3.
--
-- WHY: user_skills already stores skills as INT codes, so structurally it can
-- already hold ANY skill in numerical format. This table is what lets the
-- backend/DB *interpret* those numbers — validate that a code exists, render a
-- human label (JOIN), and add new skills in one central place. Keep `code` and
-- `slug` in sync with the Flutter catalog (lib/features/skills/data/skill_catalog.dart).
--
-- Re-runnable: upserts on code, so editing a label here and re-running updates it.

CREATE TABLE IF NOT EXISTS skills (
    code        SMALLINT     PRIMARY KEY,
    slug        VARCHAR(48)  NOT NULL UNIQUE,
    name        VARCHAR(64)  NOT NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- This table is fully derived from the app catalog, so reseed from a clean
-- slate. Required when re-running after an earlier seed used different
-- code<->slug pairings: ON CONFLICT (code) below can't resolve a UNIQUE(slug)
-- collision when a slug has moved to a new code. (If you later add the optional
-- FKs at the bottom, use TRUNCATE ... CASCADE or clear user_skills first.)
DELETE FROM skills;

INSERT INTO skills (code, slug, name) VALUES
    (1,   'photographer',     'Photographer'),
    (2,   'chef',             'Chef/Foodie'),
    (3,   'developer',        'Software Developer'),
    (4,   'designer',         'Designer'),
    (5,   'educator',         'Teacher/Educator'),
    (6,   'guide',            'Tour Guide'),
    (7,   'journalist',       'Writer/Journalist'),
    (8,   'musician',         'Musician'),
    (9,   'entrepreneur',     'Entrepreneur'),
    (10,  'athlete',          'Athlete'),
    (11,  'artist',           'Artist'),
    (12,  'medic',            'Medical Professional'),
    (13,  'engineer',         'Engineer'),
    (14,  'adventure',        'Adventure Enthusiast'),
    (15,  'researcher',       'Researcher/Scientist'),
    (16,  'instructor',       'Fitness Instructor'),
    (17,  'content',          'Content Creator'),
    (18,  'architect',        'Architect'),
    (19,  'consultant',       'Business Consultant'),
    (20,  'volunteer',        'Volunteer/NGO'),
    (21,  'student',          'Student'),
    (22,  'retired',          'Retired Professional'),
    (23,  'ai_engineer',      'AI Engineer'),
    (24,  'data_scientist',   'Data Scientist'),
    (25,  'web_developer',    'Web Developer'),
    (26,  'mobile_developer', 'Mobile Developer'),
    (27,  'devops',           'DevOps Engineer'),
    (28,  'cybersecurity',    'Cybersecurity Expert'),
    (29,  'blockchain',       'Blockchain Developer'),
    (30,  'product_manager',  'Product Manager'),
    (31,  'ux_designer',      'UX/UI Designer'),
    (32,  'game_developer',   'Game Developer'),
    (33,  'filmmaker',        'Filmmaker'),
    (34,  'animator',         'Animator'),
    (35,  'actor',            'Actor'),
    (36,  'dancer',           'Dancer'),
    (37,  'singer',           'Singer'),
    (38,  'dj',               'DJ'),
    (39,  'producer',         'Producer'),
    (40,  'editor',           'Editor'),
    (41,  'sound_engineer',   'Sound Engineer'),
    (42,  'podcaster',        'Podcaster'),
    (43,  'streamer',         'Streamer'),
    (44,  'influencer',       'Influencer'),
    (45,  'comedian',         'Comedian'),
    (46,  'poet',             'Poet'),
    (47,  'storyteller',      'Storyteller'),
    (48,  'model',            'Model'),
    (49,  'fashion_designer', 'Fashion Designer'),
    (50,  'makeup_artist',    'Makeup Artist'),
    (51,  'barber',           'Barber/Stylist'),
    (52,  'public_speaker',   'Public Speaker'),
    (53,  'marketer',         'Marketing Specialist'),
    (54,  'sales',            'Sales Professional'),
    (55,  'investor',         'Investor'),
    (56,  'trader',           'Trader'),
    (57,  'economist',        'Economist'),
    (58,  'lawyer',           'Lawyer'),
    (59,  'mentor',           'Mentor'),
    (60,  'coach',            'Coach'),
    (61,  'crypto',           'Crypto Enthusiast'),
    (62,  'nurse',            'Nurse'),
    (63,  'paramedic',        'Paramedic'),
    (64,  'psychologist',     'Psychologist'),
    (65,  'therapist',        'Therapist'),
    (66,  'nutritionist',     'Nutritionist'),
    (67,  'veterinarian',     'Veterinarian'),
    (68,  'yoga',             'Yoga Instructor'),
    (69,  'electrician',      'Electrician'),
    (70,  'plumber',          'Plumber'),
    (71,  'carpenter',        'Carpenter'),
    (72,  'mechanic',         'Mechanic'),
    (73,  'baker',            'Baker'),
    (74,  'archaeologist',    'Archaeologist'),
    (75,  'geologist',        'Geologist'),
    (76,  'marine_biologist', 'Marine Biologist'),
    (77,  'historian',        'Historian'),
    (78,  'linguist',         'Linguist'),
    (79,  'philosopher',      'Philosopher'),
    (80,  'astronaut',        'Astronaut'),
    (81,  'firefighter',      'Firefighter'),
    (82,  'police_officer',   'Police Officer'),
    (83,  'soldier',          'Soldier'),
    (84,  'social_worker',    'Social Worker'),
    (85,  'humanitarian',     'Humanitarian'),
    (86,  'activist',         'Activist'),
    (87,  'environmentalist', 'Environmentalist'),
    (88,  'farmer',           'Farmer'),
    (89,  'gardener',         'Gardener'),
    (90,  'pilot',            'Pilot'),
    (91,  'sailor',           'Sailor'),
    (92,  'mountaineer',      'Mountaineer'),
    (93,  'surfer',           'Surfer'),
    (94,  'skater',           'Skater'),
    (95,  'biker',            'Biker'),
    (96,  'racer',            'Racer'),
    (97,  'explorer',         'Explorer'),
    (98,  'backpacker',       'Backpacker'),
    (99,  'traveler',         'Traveler'),
    (100, 'survivalist',      'Survivalist'),
    (101, 'wildlife',         'Wildlife Enthusiast'),
    (102, 'gamer',            'Gamer'),
    (103, 'collector',        'Collector'),
    (104, 'reviewer',         'Reviewer'),
    (105, 'luxury',           'Luxury Traveler')
ON CONFLICT (code) DO UPDATE
    SET slug = EXCLUDED.slug,
        name = EXCLUDED.name,
        is_active = TRUE;

-- OPTIONAL — enforce that only known skill codes can be saved. Run only after
-- the skills table is seeded AND all existing user_skills rows use valid codes,
-- otherwise these will fail. Safe to skip; the app already validates codes.
--
-- ALTER TABLE user_skills
--   ADD CONSTRAINT fk_user_skills_skill_1 FOREIGN KEY (skill_1) REFERENCES skills (code),
--   ADD CONSTRAINT fk_user_skills_skill_2 FOREIGN KEY (skill_2) REFERENCES skills (code),
--   ADD CONSTRAINT fk_user_skills_skill_3 FOREIGN KEY (skill_3) REFERENCES skills (code);
