// Mock data for development - simulates D1 database
// This allows running the app locally without Cloudflare setup

export interface MockScenario {
  id: string;
  text: string;
  shortLabel: string | null;
  category: string | null;
  isActive: boolean;
}

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
  allowInsights: boolean;
  isActive: boolean;
  createdAt: string;
}

// Admin password (in production, use environment variable)
export const ADMIN_PASSWORD = 'admin123';

// Test room code
export const TEST_ROOM_CODE = 'TEST01';

// Seed data: Selfless Love / Seva themed scenarios
export let MOCK_SCENARIOS: MockScenario[] = [
  {
    id: '1',
    text: 'Would you give up your seat on a crowded bus for a stranger who looks tired?',
    shortLabel: 'Bus seat',
    category: 'Daily Kindness',
    isActive: true,
  },
  {
    id: '2', 
    text: 'Would you spend your weekend helping a neighbor move without expecting anything in return?',
    shortLabel: 'Helping neighbor',
    category: 'Community',
    isActive: true,
  },
  {
    id: '3',
    text: 'Would you anonymously pay for a stranger\'s groceries if you saw them struggling at checkout?',
    shortLabel: 'Anonymous giving',
    category: 'Generosity',
    isActive: true,
  },
  {
    id: '4',
    text: 'Would you volunteer your professional skills for free to help a nonprofit organization?',
    shortLabel: 'Pro bono work',
    category: 'Service',
    isActive: true,
  },
  {
    id: '5',
    text: 'Would you stop to help someone change a flat tire on a rainy day?',
    shortLabel: 'Roadside help',
    category: 'Daily Kindness',
    isActive: true,
  },
  {
    id: '6',
    text: 'Would you give away something you love if you knew it would bring great joy to someone else?',
    shortLabel: 'Letting go',
    category: 'Generosity',
    isActive: true,
  },
  {
    id: '7',
    text: 'Would you spend time visiting and talking to elderly residents at a care home?',
    shortLabel: 'Elder care',
    category: 'Community',
    isActive: true,
  },
  {
    id: '8',
    text: 'Would you cook meals for a sick neighbor\'s family for a week?',
    shortLabel: 'Meal prep',
    category: 'Service',
    isActive: true,
  },
  {
    id: '9',
    text: 'Would you mentor a young person in your field without any compensation?',
    shortLabel: 'Mentoring',
    category: 'Service',
    isActive: true,
  },
  {
    id: '10',
    text: 'Would you stay late at work to help a colleague meet their deadline, even if you get no credit?',
    shortLabel: 'Supporting colleagues',
    category: 'Daily Kindness',
    isActive: true,
  },
  {
    id: '11',
    text: 'Would you donate blood regularly even though it takes time from your busy schedule?',
    shortLabel: 'Blood donation',
    category: 'Community',
    isActive: true,
  },
  {
    id: '12',
    text: 'Would you pick up litter in a park even though you didn\'t put it there?',
    shortLabel: 'Environmental care',
    category: 'Community',
    isActive: true,
  },
  {
    id: '13',
    text: 'Would you give your umbrella to a stranger caught in the rain, leaving yourself to get wet?',
    shortLabel: 'Umbrella sharing',
    category: 'Daily Kindness',
    isActive: true,
  },
  {
    id: '14',
    text: 'Would you regularly check in on a neighbor living alone just to make sure they\'re okay?',
    shortLabel: 'Neighbor check-ins',
    category: 'Community',
    isActive: true,
  },
  {
    id: '15',
    text: 'Would you forgive someone who wronged you, not for them, but to free yourself from resentment?',
    shortLabel: 'Forgiveness',
    category: 'Inner Work',
    isActive: true,
  },
  {
    id: '16',
    text: 'Would you put your phone away completely during a conversation to give someone your full attention?',
    shortLabel: 'Present attention',
    category: 'Daily Kindness',
    isActive: true,
  },
  {
    id: '17',
    text: 'Would you share your meal with someone who has none, even if it means you\'ll be hungry?',
    shortLabel: 'Sharing meals',
    category: 'Generosity',
    isActive: true,
  },
  {
    id: '18',
    text: 'Would you defend someone being treated unfairly, even if it made you uncomfortable?',
    shortLabel: 'Standing up',
    category: 'Service',
    isActive: true,
  },
];

// Reveal slides - connecting scenarios to deeper teachings
export let MOCK_REVEAL_SLIDES: MockRevealSlide[] = [
  {
    id: 'r1',
    title: 'The Seeds You Plant',
    body: `Every "yes" you gave wasn't just an answer—it was a glimpse into your heart's capacity for love.

These small acts of kindness ripple outward in ways we rarely see. A single moment of compassion can change someone's entire day, or even their life.`,
    imageUrl: null,
    quote: 'The best way to find yourself is to lose yourself in the service of others.',
    quoteAuthor: 'Mahatma Gandhi',
  },
  {
    id: 'r2',
    title: 'Beyond the Self',
    body: `The scenarios you encountered represent an ancient practice known as **Seva** — selfless service performed without attachment to results.

When we give freely, without expecting recognition or reward, something remarkable happens: we transcend the boundaries of our small self and connect with something much larger.`,
    imageUrl: null,
    quote: null,
    quoteAuthor: null,
  },
  {
    id: 'r3',
    title: 'The Science of Giving',
    body: `Research shows that acts of generosity activate the brain's reward centers—the same areas triggered by food and other pleasures.

But there's something deeper at work. When we serve others, we experience what scientists call the "helper's high" — a state of elevated well-being that lasts far longer than material pleasures.`,
    imageUrl: null,
    quote: 'We make a living by what we get, but we make a life by what we give.',
    quoteAuthor: 'Winston Churchill',
  },
  {
    id: 'r4', 
    title: 'Your Hidden Nature',
    body: `Every scenario was designed to reveal something you already possess: an innate capacity for compassion that doesn't need to be created—only uncovered.

The sages of many traditions teach that our deepest nature is love itself. The practice of seva helps us remember who we truly are.`,
    imageUrl: null,
    quote: null,
    quoteAuthor: null,
  },
  {
    id: 'r5',
    title: 'The Path Forward',
    body: `This isn't about being perfect or saying yes to everything. It's about cultivating awareness—noticing opportunities to serve that align with your unique gifts and circumstances.

**Start small. Start today.** Perhaps hold a door for someone. Listen deeply to a friend. Let someone go ahead of you in line.`,
    imageUrl: null,
    quote: null,
    quoteAuthor: null,
  },
  {
    id: 'r6',
    title: 'A Living Tradition',
    body: `What you've experienced today is rooted in teachings that span thousands of years and countless wisdom traditions.

From the Buddhist concept of **Dana** (generosity) to the Christian practice of **Agape** (unconditional love), from the Islamic principle of **Zakat** (charitable giving) to the Hindu tradition of **Seva** (selfless service)—humanity has always recognized that giving is receiving.`,
    imageUrl: null,
    quote: 'In giving you receive.',
    quoteAuthor: 'Francis of Assisi',
  },
  {
    id: 'r7',
    title: 'Thank You',
    body: `Thank you for taking this journey of self-discovery.

May the seeds of compassion planted today blossom into a lifetime of meaningful connection and joyful service.

🙏`,
    imageUrl: null,
    quote: 'Be the change you wish to see in the world.',
    quoteAuthor: 'Mahatma Gandhi',
  },
];

// Mock rooms
export let MOCK_ROOMS: MockRoom[] = [
  {
    id: 'room1',
    code: TEST_ROOM_CODE,
    title: 'Test Room',
    setId: 'default',
    allowInsights: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

// In-memory storage for game state
interface GameState {
  answers: Map<string, { scenarioId: string; answer: 'yes' | 'no' }[]>;
  aggregates: Map<string, { yes: number; no: number }>;
}

export const mockGameState: GameState = {
  answers: new Map(),
  aggregates: new Map(),
};

// ============ Scenario Functions ============

export function getActiveScenarios(): MockScenario[] {
  return MOCK_SCENARIOS.filter(s => s.isActive);
}

export function getAllScenarios(): MockScenario[] {
  return [...MOCK_SCENARIOS];
}

export function getScenarioById(id: string): MockScenario | undefined {
  return MOCK_SCENARIOS.find(s => s.id === id);
}

export function addScenario(scenario: Omit<MockScenario, 'id'>): MockScenario {
  const newScenario: MockScenario = {
    ...scenario,
    id: `scenario-${Date.now()}`,
  };
  MOCK_SCENARIOS.push(newScenario);
  return newScenario;
}

export function updateScenario(id: string, updates: Partial<MockScenario>): MockScenario | null {
  const index = MOCK_SCENARIOS.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  MOCK_SCENARIOS[index] = { ...MOCK_SCENARIOS[index], ...updates };
  return MOCK_SCENARIOS[index];
}

export function deleteScenario(id: string): boolean {
  const index = MOCK_SCENARIOS.findIndex(s => s.id === id);
  if (index === -1) return false;
  
  MOCK_SCENARIOS.splice(index, 1);
  return true;
}

export function reorderScenarios(orderedIds: string[]): void {
  const reordered: MockScenario[] = [];
  for (const id of orderedIds) {
    const scenario = MOCK_SCENARIOS.find(s => s.id === id);
    if (scenario) reordered.push(scenario);
  }
  // Add any scenarios not in the ordered list
  for (const scenario of MOCK_SCENARIOS) {
    if (!orderedIds.includes(scenario.id)) {
      reordered.push(scenario);
    }
  }
  MOCK_SCENARIOS = reordered;
}

// ============ Reveal Slide Functions ============

export function getAllRevealSlides(): MockRevealSlide[] {
  return [...MOCK_REVEAL_SLIDES];
}

export function getRevealSlideById(id: string): MockRevealSlide | undefined {
  return MOCK_REVEAL_SLIDES.find(s => s.id === id);
}

export function addRevealSlide(slide: Omit<MockRevealSlide, 'id'>): MockRevealSlide {
  const newSlide: MockRevealSlide = {
    ...slide,
    id: `slide-${Date.now()}`,
  };
  MOCK_REVEAL_SLIDES.push(newSlide);
  return newSlide;
}

export function updateRevealSlide(id: string, updates: Partial<MockRevealSlide>): MockRevealSlide | null {
  const index = MOCK_REVEAL_SLIDES.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  MOCK_REVEAL_SLIDES[index] = { ...MOCK_REVEAL_SLIDES[index], ...updates };
  return MOCK_REVEAL_SLIDES[index];
}

export function deleteRevealSlide(id: string): boolean {
  const index = MOCK_REVEAL_SLIDES.findIndex(s => s.id === id);
  if (index === -1) return false;
  
  MOCK_REVEAL_SLIDES.splice(index, 1);
  return true;
}

export function reorderRevealSlides(orderedIds: string[]): void {
  const reordered: MockRevealSlide[] = [];
  for (const id of orderedIds) {
    const slide = MOCK_REVEAL_SLIDES.find(s => s.id === id);
    if (slide) reordered.push(slide);
  }
  for (const slide of MOCK_REVEAL_SLIDES) {
    if (!orderedIds.includes(slide.id)) {
      reordered.push(slide);
    }
  }
  MOCK_REVEAL_SLIDES = reordered;
}

// ============ Room Functions ============

export function getAllRooms(): MockRoom[] {
  return [...MOCK_ROOMS];
}

export function getRoomByCode(code: string): MockRoom | undefined {
  return MOCK_ROOMS.find(r => r.code === code && r.isActive);
}

export function createRoom(title: string): MockRoom {
  const code = generateRoomCode();
  const newRoom: MockRoom = {
    id: `room-${Date.now()}`,
    code,
    title,
    setId: 'default',
    allowInsights: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  MOCK_ROOMS.push(newRoom);
  return newRoom;
}

export function closeRoom(id: string): boolean {
  const room = MOCK_ROOMS.find(r => r.id === id);
  if (!room) return false;
  room.isActive = false;
  return true;
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
  return mockGameState.answers.get(sessionId) || [];
}

export function setAnswer(sessionId: string, scenarioId: string, answer: 'yes' | 'no') {
  const existing = mockGameState.answers.get(sessionId) || [];
  const existingIndex = existing.findIndex(a => a.scenarioId === scenarioId);
  
  if (existingIndex >= 0) {
    const old = existing[existingIndex];
    existing[existingIndex] = { scenarioId, answer };
    
    // Update aggregates
    const agg = mockGameState.aggregates.get(scenarioId) || { yes: 0, no: 0 };
    if (old.answer === 'yes') agg.yes = Math.max(0, agg.yes - 1);
    if (old.answer === 'no') agg.no = Math.max(0, agg.no - 1);
    if (answer === 'yes') agg.yes++;
    if (answer === 'no') agg.no++;
    mockGameState.aggregates.set(scenarioId, agg);
  } else {
    existing.push({ scenarioId, answer });
    
    // Update aggregates
    const agg = mockGameState.aggregates.get(scenarioId) || { yes: 0, no: 0 };
    if (answer === 'yes') agg.yes++;
    if (answer === 'no') agg.no++;
    mockGameState.aggregates.set(scenarioId, agg);
  }
  
  mockGameState.answers.set(sessionId, existing);
}

export function removeAnswer(sessionId: string, scenarioId: string) {
  const existing = mockGameState.answers.get(sessionId) || [];
  const answer = existing.find(a => a.scenarioId === scenarioId);
  
  if (answer) {
    mockGameState.answers.set(
      sessionId,
      existing.filter(a => a.scenarioId !== scenarioId)
    );
    
    // Update aggregates
    const agg = mockGameState.aggregates.get(scenarioId) || { yes: 0, no: 0 };
    if (answer.answer === 'yes') agg.yes = Math.max(0, agg.yes - 1);
    if (answer.answer === 'no') agg.no = Math.max(0, agg.no - 1);
    mockGameState.aggregates.set(scenarioId, agg);
  }
}

export function getAggregates() {
  const result: Record<string, { yes: number; no: number }> = {};
  mockGameState.aggregates.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

// For exports that were referenced
export const MOCK_REVEAL_SLIDES_GENTLE = MOCK_REVEAL_SLIDES;
