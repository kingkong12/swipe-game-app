-- Seed data for Swipe Game D1 Database
-- Run with: wrangler d1 execute swipe-game-db --file=./seed.sql

-- Create default scenario set
INSERT OR IGNORE INTO scenario_sets (id, name, description, is_active) 
VALUES ('default', 'Selfless Service', 'Scenarios exploring selfless love and seva', 1);

-- Insert scenarios
INSERT OR IGNORE INTO scenarios (id, set_id, text, short_label, category, sort_order, is_active) VALUES
('1', 'default', 'Your first salary is $5,000. Someone you trust asks for $4,000. You will struggle for the rest of the month. Would you still give it?', 'First salary sacrifice', 'Generosity', 1, 1),
('2', 'default', 'The person next to you unknowingly rests their chair leg on your foot. It''s uncomfortable, but they don''t realize it. Would you still feel pleasant toward them?', 'Silent discomfort', 'Patience', 2, 1),
('3', 'default', 'You live with your family in a 3-BHK apartment. During COVID, a distant friend asks if they can stay in your extra room. There is health risk, inconvenience, and uncertainty. Would you still allow them to stay?', 'Risky hospitality', 'Sacrifice', 3, 1),
('4', 'default', 'You are offered a role or responsibility that helps many people, but it requires you to delay marriage, social life, and personal plans for several years. There is no public recognition and no guarantee of reward. Would you still accept it?', 'Delayed life plans', 'Sacrifice', 4, 1),
('5', 'default', 'You quietly support someone''s growth for years. They eventually succeed, but no one knows your role. Would you still do it again?', 'Unrecognized support', 'Selfless Service', 5, 1),
('6', 'default', 'Someone repeatedly fails even after being shown the right path. You feel irritation more than compassion now. Would you distance yourself from them?', 'Persistent failure', 'Acceptance', 6, 1),
('7', 'default', 'You notice a serious mistake someone made. Pointing it out now would embarrass them deeply. Would you stay silent and wait?', 'Protecting dignity', 'Compassion', 7, 1),
('8', 'default', 'A person drains your emotional energy, yet you know they are struggling internally. Would you still stay kind?', 'Emotional drain', 'Patience', 8, 1),
('9', 'default', 'Someone you know has failed before. Everyone advises you not to rely on them again. Would you still trust and stand by them?', 'Second chance trust', 'Trust', 9, 1),
('10', 'default', 'You notice someone silently struggling, but helping them will add responsibility to your life. Would you step in?', 'Added responsibility', 'Service', 10, 1),
('11', 'default', 'Caring for someone means adjusting your routine every day. No appreciation. No recognition. Would you still do it?', 'Daily adjustment', 'Selfless Service', 11, 1);

-- Insert reveal slides
INSERT OR IGNORE INTO reveal_slides (id, set_id, title, body, image_url, quote, quote_author, sort_order) VALUES
('r1', 'default', 'The Seeds You Plant', 'Every "yes" you gave wasn''t just an answer—it was a glimpse into your heart''s capacity for love.

These small acts of kindness ripple outward in ways we rarely see. A single moment of compassion can change someone''s entire day, or even their life.', NULL, 'The best way to find yourself is to lose yourself in the service of others.', 'Mahatma Gandhi', 1),

('r2', 'default', 'Beyond the Self', 'The scenarios you encountered represent an ancient practice known as **Seva** — selfless service performed without attachment to results.

When we give freely, without expecting recognition or reward, something remarkable happens: we transcend the boundaries of our small self and connect with something much larger.', NULL, NULL, NULL, 2),

('r3', 'default', 'The Science of Giving', 'Research shows that acts of generosity activate the brain''s reward centers—the same areas triggered by food and other pleasures.

But there''s something deeper at work. When we serve others, we experience what scientists call the "helper''s high" — a state of elevated well-being that lasts far longer than material pleasures.', NULL, 'We make a living by what we get, but we make a life by what we give.', 'Winston Churchill', 3),

('r4', 'default', 'Your Hidden Nature', 'Every scenario was designed to reveal something you already possess: an innate capacity for compassion that doesn''t need to be created—only uncovered.

The sages of many traditions teach that our deepest nature is love itself. The practice of seva helps us remember who we truly are.', NULL, NULL, NULL, 4),

('r5', 'default', 'The Path Forward', 'This isn''t about being perfect or saying yes to everything. It''s about cultivating awareness—noticing opportunities to serve that align with your unique gifts and circumstances.

**Start small. Start today.** Perhaps hold a door for someone. Listen deeply to a friend. Let someone go ahead of you in line.', NULL, NULL, NULL, 5),

('r6', 'default', 'A Living Tradition', 'What you''ve experienced today is rooted in teachings that span thousands of years and countless wisdom traditions.

From the Buddhist concept of **Dana** (generosity) to the Christian practice of **Agape** (unconditional love), from the Islamic principle of **Zakat** (charitable giving) to the Hindu tradition of **Seva** (selfless service)—humanity has always recognized that giving is receiving.', NULL, 'In giving you receive.', 'Francis of Assisi', 6),

('r7', 'default', 'Thank You', 'Thank you for taking this journey of self-discovery.

May the seeds of compassion planted today blossom into a lifetime of meaningful connection and joyful service.

🙏', NULL, 'Be the change you wish to see in the world.', 'Mahatma Gandhi', 7);

-- Create a test room
INSERT OR IGNORE INTO rooms (id, code, title, set_id, allow_insights, is_active)
VALUES ('room1', 'TEST01', 'Test Room', 'default', 1, 1);
