// Mock data for development - simulates D1 database
// This allows running the app locally without Cloudflare setup
// Uses globalThis to persist data across Next.js hot module reloads

export interface Character {
  name: string;
  title: string;
  emoji: string;
  color: string;
  bgGradient: string;
}

export interface MockScenario {
  id: string;
  text: string;
  shortLabel: string | null;
  category: string | null;
  isActive: boolean;
  character: Character;
}

// Character definitions based on emotional themes
export const CHARACTERS: Record<string, Character> = {
  Generosity: {
    name: 'Mr. Generous',
    title: 'The Giver',
    emoji: '🎁',
    color: '#F59E0B',
    bgGradient: 'from-amber-500/20 to-orange-500/20',
  },
  Patience: {
    name: 'Mr. Patience',
    title: 'The Calm One',
    emoji: '🧘',
    color: '#8B5CF6',
    bgGradient: 'from-violet-500/20 to-purple-500/20',
  },
  Sacrifice: {
    name: 'Mr. Sacrifice',
    title: 'The Selfless',
    emoji: '💝',
    color: '#EC4899',
    bgGradient: 'from-pink-500/20 to-rose-500/20',
  },
  'Selfless Service': {
    name: 'Mr. Seva',
    title: 'The Silent Helper',
    emoji: '🙏',
    color: '#14B8A6',
    bgGradient: 'from-teal-500/20 to-cyan-500/20',
  },
  Acceptance: {
    name: 'Mr. Acceptance',
    title: 'The Understanding',
    emoji: '🤗',
    color: '#06B6D4',
    bgGradient: 'from-cyan-500/20 to-blue-500/20',
  },
  Compassion: {
    name: 'Mr. Compassion',
    title: 'The Empathetic',
    emoji: '💗',
    color: '#F43F5E',
    bgGradient: 'from-rose-500/20 to-red-500/20',
  },
  Trust: {
    name: 'Mr. Trust',
    title: 'The Believer',
    emoji: '🤝',
    color: '#3B82F6',
    bgGradient: 'from-blue-500/20 to-indigo-500/20',
  },
  Service: {
    name: 'Mr. Service',
    title: 'The Helper',
    emoji: '🌟',
    color: '#10B981',
    bgGradient: 'from-emerald-500/20 to-green-500/20',
  },
};

export interface MockRevealSlide {
  id: string;
  title: string;
  body: string | null;
  imageUrl: string | null;
  quote: string | null;
  quoteAuthor: string | null;
}

export interface MockRoom {
  id: string;
  code: string;
  title: string;
  setId: string;
  scenarioIds: string[];
  allowInsights: boolean;
  isActive: boolean;
  createdAt: string;
}

// Admin password (in production, use environment variable)
export const ADMIN_PASSWORD = 'admin123';

// Test room code
export const TEST_ROOM_CODE = 'TEST01';

// ============ Persistent store via globalThis ============
// This ensures data survives Next.js hot module reloads during development

interface MockStore {
  scenarios: MockScenario[];
  slides: MockRevealSlide[];
  rooms: MockRoom[];
  revealTriggered: boolean;
  gameState: {
    answers: Map<string, { scenarioId: string; answer: 'yes' | 'no' }[]>;
    aggregates: Map<string, { yes: number; no: number }>;
  };
}

const STORE_KEY = '__swipe_app_mock_store__';

function getStore(): MockStore {
  const g = globalThis as unknown as Record<string, MockStore>;
  if (!g[STORE_KEY]) {
    g[STORE_KEY] = {
      scenarios: createInitialScenarios(),
      slides: createInitialSlides(),
      rooms: createInitialRooms(),
      revealTriggered: false,
      gameState: {
        answers: new Map(),
        aggregates: new Map(),
      },
    };
  }
  return g[STORE_KEY];
}

function createInitialScenarios(): MockScenario[] {
  return [
    {
      id: '1',
      text: 'You wake up with a sore back. After a long night of heavy snowfall, your neighbor knocks overwhelmed \u2013 asking for help clearing the snow. You\'re hurting, and he\'s struggling. Will you dare to help him?',
      shortLabel: 'Neighbor in snow',
      category: 'Sacrifice',
      isActive: true,
      character: CHARACTERS['Sacrifice'],
    },
    {
      id: '2',
      text: 'You\'re at work when a client storms in and turns on you. The mistake isn\'t yours \u2013 it\'s your subordinate\'s \u2013 yet the blame settles quietly on your shoulders. Will you dare to stand there and take one for him?',
      shortLabel: 'Taking the blame',
      category: 'Sacrifice',
      isActive: true,
      character: CHARACTERS['Sacrifice'],
    },
    {
      id: '3',
      text: 'You\'re leading a critical presentation to the board when a major data discrepancy is exposed. The error was in the analysis run by your junior colleague, but all eyes are on you. Do you apologize for the oversight and own the mistake in the moment, or do you clarify whose work it was?',
      shortLabel: 'Owning the mistake',
      category: 'Compassion',
      isActive: true,
      character: CHARACTERS['Compassion'],
    },
    {
      id: '4',
      text: 'You recently moved in with your cousins \u2013 one moves as slow as a buffering video on hotel Wi-Fi, the other rushes around like the house is on fire while it\'s just a toast in the toaster. You are constantly wedged between "hold on\u2026" and "hurry up!". Will you dare to stay with them?',
      shortLabel: 'Living with cousins',
      category: 'Patience',
      isActive: true,
      character: CHARACTERS['Patience'],
    },
    {
      id: '5',
      text: 'Your friend \u2013 not so close, texts you this late at night, asking if you can be available at random times\u20142 AM, while you\'re working, anytime they need to talk. You value the friendship but it has started affecting your personal goals and tasks. Will you be always there for him?',
      shortLabel: 'Always available friend',
      category: 'Selfless Service',
      isActive: true,
      character: CHARACTERS['Selfless Service'],
    },
    {
      id: '6',
      text: 'Your co-founder presents this as the new "founder\'s pact" for the next three years to save the failing start-up. It\'s no longer about effort, but about total personal surrender. Do you sign over your entire life to the venture, or do you walk away to preserve your sanity?',
      shortLabel: 'Founder\'s pact',
      category: 'Sacrifice',
      isActive: true,
      character: CHARACTERS['Sacrifice'],
    },
  ];
}

// Expose mutable references that always point to the persistent store
export function getMockScenarios(): MockScenario[] {
  return getStore().scenarios;
}

function createInitialSlides(): MockRevealSlide[] {
  return [
    {
      id: 'r1',
      title: 'The Seeds You Plant',
      body: `Every "yes" you gave wasn't just an answer\u2014it was a glimpse into your heart's capacity for love.\n\nThese small acts of kindness ripple outward in ways we rarely see. A single moment of compassion can change someone's entire day, or even their life.`,
      imageUrl: null,
      quote: 'The best way to find yourself is to lose yourself in the service of others.',
      quoteAuthor: 'Mahatma Gandhi',
    },
    {
      id: 'r2',
      title: 'Beyond the Self',
      body: `The scenarios you encountered represent an ancient practice known as **Seva** \u2014 selfless service performed without attachment to results.\n\nWhen we give freely, without expecting recognition or reward, something remarkable happens: we transcend the boundaries of our small self and connect with something much larger.`,
      imageUrl: null,
      quote: null,
      quoteAuthor: null,
    },
    {
      id: 'r3',
      title: 'The Science of Giving',
      body: `Research shows that acts of generosity activate the brain's reward centers\u2014the same areas triggered by food and other pleasures.\n\nBut there's something deeper at work. When we serve others, we experience what scientists call the "helper's high" \u2014 a state of elevated well-being that lasts far longer than material pleasures.`,
      imageUrl: null,
      quote: 'We make a living by what we get, but we make a life by what we give.',
      quoteAuthor: 'Winston Churchill',
    },
    {
      id: 'r4',
      title: 'Your Hidden Nature',
      body: `Every scenario was designed to reveal something you already possess: an innate capacity for compassion that doesn't need to be created\u2014only uncovered.\n\nThe sages of many traditions teach that our deepest nature is love itself. The practice of seva helps us remember who we truly are.`,
      imageUrl: null,
      quote: null,
      quoteAuthor: null,
    },
    {
      id: 'r5',
      title: 'The Path Forward',
      body: `This isn't about being perfect or saying yes to everything. It's about cultivating awareness\u2014noticing opportunities to serve that align with your unique gifts and circumstances.\n\n**Start small. Start today.** Perhaps hold a door for someone. Listen deeply to a friend. Let someone go ahead of you in line.`,
      imageUrl: null,
      quote: null,
      quoteAuthor: null,
    },
    {
      id: 'r6',
      title: 'A Living Tradition',
      body: `What you've experienced today is rooted in teachings that span thousands of years and countless wisdom traditions.\n\nFrom the Buddhist concept of **Dana** (generosity) to the Christian practice of **Agape** (unconditional love), from the Islamic principle of **Zakat** (charitable giving) to the Hindu tradition of **Seva** (selfless service)\u2014humanity has always recognized that giving is receiving.`,
      imageUrl: null,
      quote: 'In giving you receive.',
      quoteAuthor: 'Francis of Assisi',
    },
    {
      id: 'r7',
      title: 'Thank You',
      body: `Thank you for taking this journey of self-discovery.\n\nMay the seeds of compassion planted today blossom into a lifetime of meaningful connection and joyful service.\n\n\uD83D\uDE4F`,
      imageUrl: null,
      quote: 'Be the change you wish to see in the world.',
      quoteAuthor: 'Mahatma Gandhi',
    },
  ];
}

function createInitialRooms(): MockRoom[] {
  return [
    {
      id: 'room1',
      code: 'DEFAULT',
      title: 'Default Room',
      setId: 'default',
      scenarioIds: ['1', '2', '3', '4', '5', '6'],
      allowInsights: true,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

// Legacy exports that point to the persistent store
export function getMockSlides(): MockRevealSlide[] {
  return getStore().slides;
}

export function getMockRooms(): MockRoom[] {
  return getStore().rooms;
}

function getGameState() {
  return getStore().gameState;
}

// ============ Scenario Functions ============

export function getActiveScenarios(): MockScenario[] {
  return getMockScenarios().filter(s => s.isActive);
}

export function getAllScenarios(): MockScenario[] {
  return [...getMockScenarios()];
}

export function getScenarioById(id: string): MockScenario | undefined {
  return getMockScenarios().find(s => s.id === id);
}

export function addScenario(scenario: Omit<MockScenario, 'id' | 'character'> & { character?: Character }): MockScenario {
  const store = getStore();
  const category = scenario.category || 'Service';
  const newScenario: MockScenario = {
    ...scenario,
    id: `scenario-${Date.now()}`,
    character: scenario.character || CHARACTERS[category] || CHARACTERS['Service'],
  };
  store.scenarios.push(newScenario);
  return newScenario;
}

export function updateScenario(id: string, updates: Partial<MockScenario>): MockScenario | null {
  const store = getStore();
  const index = store.scenarios.findIndex(s => s.id === id);
  if (index === -1) return null;

  // If category changed, update the character too
  if (updates.category) {
    updates.character = CHARACTERS[updates.category] || CHARACTERS['Service'];
  }

  store.scenarios[index] = { ...store.scenarios[index], ...updates };
  return store.scenarios[index];
}

export function deleteScenario(id: string): boolean {
  const store = getStore();
  const index = store.scenarios.findIndex(s => s.id === id);
  if (index === -1) return false;

  store.scenarios.splice(index, 1);
  return true;
}

export function reorderScenarios(orderedIds: string[]): void {
  const store = getStore();
  const reordered: MockScenario[] = [];
  for (const id of orderedIds) {
    const scenario = store.scenarios.find(s => s.id === id);
    if (scenario) reordered.push(scenario);
  }
  for (const scenario of store.scenarios) {
    if (!orderedIds.includes(scenario.id)) {
      reordered.push(scenario);
    }
  }
  store.scenarios = reordered;
}

// ============ Reveal Slide Functions ============

export function getAllRevealSlides(): MockRevealSlide[] {
  return [...getMockSlides()];
}

export function getRevealSlideById(id: string): MockRevealSlide | undefined {
  return getMockSlides().find(s => s.id === id);
}

export function addRevealSlide(slide: Omit<MockRevealSlide, 'id'>): MockRevealSlide {
  const store = getStore();
  const newSlide: MockRevealSlide = {
    ...slide,
    id: `slide-${Date.now()}`,
  };
  store.slides.push(newSlide);
  return newSlide;
}

export function updateRevealSlide(id: string, updates: Partial<MockRevealSlide>): MockRevealSlide | null {
  const store = getStore();
  const index = store.slides.findIndex(s => s.id === id);
  if (index === -1) return null;

  store.slides[index] = { ...store.slides[index], ...updates };
  return store.slides[index];
}

export function deleteRevealSlide(id: string): boolean {
  const store = getStore();
  const index = store.slides.findIndex(s => s.id === id);
  if (index === -1) return false;

  store.slides.splice(index, 1);
  return true;
}

export function reorderRevealSlides(orderedIds: string[]): void {
  const store = getStore();
  const reordered: MockRevealSlide[] = [];
  for (const id of orderedIds) {
    const slide = store.slides.find(s => s.id === id);
    if (slide) reordered.push(slide);
  }
  for (const slide of store.slides) {
    if (!orderedIds.includes(slide.id)) {
      reordered.push(slide);
    }
  }
  store.slides = reordered;
}

// ============ Room Functions ============

export function getAllRooms(): MockRoom[] {
  return [...getMockRooms()];
}

export function getRoomByCode(code: string): MockRoom | undefined {
  return getMockRooms().find(r => r.code === code && r.isActive);
}

export function createRoom(title: string, scenarioIds?: string[]): MockRoom {
  const store = getStore();
  const code = generateRoomCode();
  const newRoom: MockRoom = {
    id: `room-${Date.now()}`,
    code,
    title,
    setId: 'default',
    scenarioIds: scenarioIds || [],
    allowInsights: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  store.rooms.push(newRoom);
  return newRoom;
}

export function updateRoom(id: string, updates: Partial<Pick<MockRoom, 'title' | 'scenarioIds' | 'isActive'>>): MockRoom | null {
  const store = getStore();
  const room = store.rooms.find(r => r.id === id);
  if (!room) return null;
  if (updates.title !== undefined) room.title = updates.title;
  if (updates.scenarioIds !== undefined) room.scenarioIds = updates.scenarioIds;
  if (updates.isActive !== undefined) room.isActive = updates.isActive;
  return room;
}

export function deleteRoom(id: string): boolean {
  const store = getStore();
  const index = store.rooms.findIndex(r => r.id === id);
  if (index === -1) return false;
  store.rooms.splice(index, 1);
  return true;
}

export function closeRoom(id: string): boolean {
  const store = getStore();
  const room = store.rooms.find(r => r.id === id);
  if (!room) return false;
  room.isActive = false;
  return true;
}

export function getScenariosForRoom(roomCode: string): MockScenario[] {
  const room = getRoomByCode(roomCode);
  if (!room) return [];
  if (room.scenarioIds.length === 0) return getActiveScenarios();
  return room.scenarioIds
    .map(id => getMockScenarios().find(s => s.id === id))
    .filter((s): s is MockScenario => s !== undefined && s.isActive);
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ============ Answer Functions ============

export function getSessionAnswers(sessionId: string) {
  return getGameState().answers.get(sessionId) || [];
}

export function setAnswer(sessionId: string, scenarioId: string, answer: 'yes' | 'no') {
  const state = getGameState();
  const existing = state.answers.get(sessionId) || [];
  const existingIndex = existing.findIndex(a => a.scenarioId === scenarioId);

  if (existingIndex >= 0) {
    const old = existing[existingIndex];
    existing[existingIndex] = { scenarioId, answer };

    const agg = state.aggregates.get(scenarioId) || { yes: 0, no: 0 };
    if (old.answer === 'yes') agg.yes = Math.max(0, agg.yes - 1);
    if (old.answer === 'no') agg.no = Math.max(0, agg.no - 1);
    if (answer === 'yes') agg.yes++;
    if (answer === 'no') agg.no++;
    state.aggregates.set(scenarioId, agg);
  } else {
    existing.push({ scenarioId, answer });

    const agg = state.aggregates.get(scenarioId) || { yes: 0, no: 0 };
    if (answer === 'yes') agg.yes++;
    if (answer === 'no') agg.no++;
    state.aggregates.set(scenarioId, agg);
  }

  state.answers.set(sessionId, existing);
}

export function removeAnswer(sessionId: string, scenarioId: string) {
  const state = getGameState();
  const existing = state.answers.get(sessionId) || [];
  const answer = existing.find(a => a.scenarioId === scenarioId);

  if (answer) {
    state.answers.set(
      sessionId,
      existing.filter(a => a.scenarioId !== scenarioId)
    );

    const agg = state.aggregates.get(scenarioId) || { yes: 0, no: 0 };
    if (answer.answer === 'yes') agg.yes = Math.max(0, agg.yes - 1);
    if (answer.answer === 'no') agg.no = Math.max(0, agg.no - 1);
    state.aggregates.set(scenarioId, agg);
  }
}

export function getAggregates() {
  const state = getGameState();
  const result: Record<string, { yes: number; no: number }> = {};
  state.aggregates.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

// ============ Reveal Trigger Functions ============

export function getRevealTriggered(): boolean {
  return getStore().revealTriggered;
}

export function setRevealTriggered(triggered: boolean): void {
  getStore().revealTriggered = triggered;
}

// Legacy compatibility aliases
export const MOCK_REVEAL_SLIDES_GENTLE = getMockSlides();
