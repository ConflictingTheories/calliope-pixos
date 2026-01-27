/**
 * ---------------------------------------------------------------
 *                AI Generator - Game Templates
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Pre-built game templates that users can generate with one click.
 * Each template includes an optimized prompt and expected outcomes.
 */

/**
 * Game template categories
 */
export const TEMPLATE_CATEGORIES = {
  FANTASY: 'fantasy',
  SCIFI: 'sci-fi',
  MODERN: 'modern',
  HORROR: 'horror',
  COMEDY: 'comedy',
  EDUCATIONAL: 'educational',
};

/**
 * Template complexity levels
 */
export const COMPLEXITY = {
  STARTER: 'starter', // ~5 assets, 2-3 minutes
  STANDARD: 'standard', // ~10 assets, 5-7 minutes
  ADVANCED: 'advanced', // ~20 assets, 10-15 minutes
};

/**
 * Pre-built game templates
 */
export const GAME_TEMPLATES = [
  // ═══════════════════════════════════════════════════════════════
  // STARTER TEMPLATES (Quick demos, perfect for first-time users)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'hello-world',
    name: '👋 Hello World',
    description: 'The simplest possible game - just walk around a room and talk to an NPC.',
    category: TEMPLATE_CATEGORIES.FANTASY,
    complexity: COMPLEXITY.STARTER,
    estimatedTime: '1-2 minutes',
    estimatedAssets: 5,
    tags: ['beginner', 'tutorial', 'simple'],
    prompt: `Create a simple "Hello World" game with:
- A small village room (8x8 tiles)
- A player character (young adventurer)
- One friendly NPC (village elder) who says "Welcome to PixoSpritz!"
- Simple tileset with grass floor and wooden walls
- A short intro cutscene welcoming the player`,
    expectedAssets: [
      'sprites/player/player.json',
      'sprites/player/player.png',
      'sprites/elder/elder.json',
      'sprites/elder/elder.png',
      'maps/village/map.json',
      'maps/village/cells.json',
      'cutscenes/intro.pxc',
      'tilesets/common.json',
      'manifest.json',
    ],
  },

  {
    id: 'collect-the-coins',
    name: '🪙 Coin Collector',
    description: 'Collect 5 coins scattered around a maze. Simple but satisfying!',
    category: TEMPLATE_CATEGORIES.FANTASY,
    complexity: COMPLEXITY.STARTER,
    estimatedTime: '2-3 minutes',
    estimatedAssets: 7,
    tags: ['beginner', 'collectibles', 'maze'],
    prompt: `Create a coin collection game with:
- A hedge maze room (12x12 tiles)
- A player character (treasure hunter)
- 5 collectible gold coins as interactive objects
- Simple grass and hedge tileset
- A victory cutscene when all coins are collected
- Script to track coin collection with a counter`,
    expectedAssets: [
      'sprites/player/player.json',
      'sprites/player/player.png',
      'sprites/coin/coin.json',
      'sprites/coin/coin.png',
      'maps/maze/map.json',
      'maps/maze/cells.json',
      'cutscenes/victory.pxc',
      'callbacks/coin_collect.pxs',
      'tilesets/common.json',
      'manifest.json',
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // STANDARD TEMPLATES (Full mini-games)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'crystal-quest',
    name: '💎 Crystal Quest',
    description: 'Collect 4 elemental crystals from different dungeons. A classic adventure!',
    category: TEMPLATE_CATEGORIES.FANTASY,
    complexity: COMPLEXITY.STANDARD,
    estimatedTime: '5-7 minutes',
    estimatedAssets: 15,
    tags: ['adventure', 'quest', 'dungeons'],
    featured: true,
    prompt: `Create a fantasy RPG called "Crystal Quest" where a young mage must collect 4 elemental crystals from different dungeons.

Characters:
- Player: Young mage apprentice with blue robes
- Mentor: Wise old wizard in the starting village
- Guardian 1: Fire elemental boss
- Guardian 2: Water elemental boss

Locations:
- Starting village with mentor NPC
- Fire dungeon with lava tiles
- Water dungeon with water tiles

Story elements:
- Intro cutscene: Mentor explains the quest
- Victory cutscene: Player returns with all crystals
- Each crystal collected triggers a short celebration`,
    expectedAssets: [
      'sprites/player/player.json',
      'sprites/player/player.png',
      'sprites/mentor/mentor.json',
      'sprites/mentor/mentor.png',
      'sprites/fire-guardian/fire-guardian.json',
      'sprites/fire-guardian/fire-guardian.png',
      'sprites/water-guardian/water-guardian.json',
      'sprites/water-guardian/water-guardian.png',
      'maps/village/map.json',
      'maps/village/cells.json',
      'maps/fire-dungeon/map.json',
      'maps/fire-dungeon/cells.json',
      'cutscenes/intro.pxc',
      'cutscenes/victory.pxc',
      'callbacks/crystal_collect.pxs',
      'tilesets/common.json',
      'manifest.json',
    ],
  },

  {
    id: 'merchant-life',
    name: '🏪 Merchant Life',
    description: 'Run a medieval shop! Buy low, sell high, and become the richest merchant.',
    category: TEMPLATE_CATEGORIES.FANTASY,
    complexity: COMPLEXITY.STANDARD,
    estimatedTime: '5-7 minutes',
    estimatedAssets: 12,
    tags: ['simulation', 'trading', 'economy'],
    prompt: `Create a merchant simulation game called "Merchant Life" where you run a medieval shop.

Characters:
- Player: Clever young merchant
- Farmer: Sells raw goods cheaply
- Noble: Buys finished goods at premium
- Blacksmith: Trades metal items

Locations:
- Your shop (main room)
- Town square with NPCs

Features:
- Buy items from farmer
- Sell items to noble for profit
- Dialogue system with price negotiation
- Intro cutscene explaining the trading mechanics`,
    expectedAssets: [
      'sprites/player/player.json',
      'sprites/player/player.png',
      'sprites/farmer/farmer.json',
      'sprites/farmer/farmer.png',
      'sprites/noble/noble.json',
      'sprites/noble/noble.png',
      'maps/shop/map.json',
      'maps/shop/cells.json',
      'maps/square/map.json',
      'maps/square/cells.json',
      'cutscenes/intro.pxc',
      'callbacks/trade.pxs',
      'tilesets/common.json',
      'manifest.json',
    ],
  },

  {
    id: 'haunted-mansion',
    name: '👻 Haunted Mansion',
    description: 'Escape from a haunted mansion by solving puzzles. Spooky but not too scary!',
    category: TEMPLATE_CATEGORIES.HORROR,
    complexity: COMPLEXITY.STANDARD,
    estimatedTime: '5-7 minutes',
    estimatedAssets: 12,
    tags: ['horror', 'puzzle', 'escape'],
    prompt: `Create a spooky escape room game called "Haunted Mansion".

Characters:
- Player: Brave investigator with flashlight
- Ghost Butler: Gives cryptic hints
- Friendly Ghost: Helps if you find their lost item

Locations:
- Mansion entrance hall (dark tiles)
- Library with bookcases
- Cellar with the exit

Story:
- Intro: Player gets locked in mansion
- Puzzle: Find 3 keys hidden in different rooms
- Each ghost gives a clue about key locations
- Victory: Escape through cellar door`,
    expectedAssets: [
      'sprites/player/player.json',
      'sprites/player/player.png',
      'sprites/ghost-butler/ghost-butler.json',
      'sprites/ghost-butler/ghost-butler.png',
      'sprites/friendly-ghost/friendly-ghost.json',
      'sprites/friendly-ghost/friendly-ghost.png',
      'maps/entrance/map.json',
      'maps/entrance/cells.json',
      'maps/library/map.json',
      'maps/library/cells.json',
      'cutscenes/intro.pxc',
      'cutscenes/escape.pxc',
      'callbacks/key_collect.pxs',
      'tilesets/common.json',
      'manifest.json',
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // ADVANCED TEMPLATES (Full featured games)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'epic-adventure',
    name: '⚔️ Epic Adventure',
    description: 'A full RPG with multiple zones, NPCs, enemies, and a branching story.',
    category: TEMPLATE_CATEGORIES.FANTASY,
    complexity: COMPLEXITY.ADVANCED,
    estimatedTime: '10-15 minutes',
    estimatedAssets: 25,
    tags: ['rpg', 'adventure', 'story', 'combat'],
    featured: true,
    prompt: `Create an epic fantasy RPG called "The Lost Kingdom" with:

Main Characters:
- Hero: Young knight with sword and shield (full 8-direction sprite)
- Princess: Rescued from the dark castle
- Mentor Knight: Trains the hero, gives main quest
- Merchant: Sells potions and equipment
- Mysterious Stranger: Gives side quest hints

Enemies:
- Goblin: Basic enemy in forest
- Skeleton: Dungeon enemy
- Dark Knight: Final boss

Locations (4 zones):
1. Village: Starting area with mentor and merchant
2. Forest: Path to castle, contains goblins
3. Castle Entrance: Transition zone with puzzles
4. Throne Room: Final boss battle area

Story Flow:
1. Intro Cutscene: Village under attack, hero called to action
2. Training sequence with mentor
3. Journey through forest (enemy encounters)
4. Castle infiltration
5. Boss battle with Dark Knight
6. Victory cutscene with princess rescue

Game Features:
- Health tracking
- Gold collection
- Simple inventory
- Save points at each zone`,
    expectedAssets: [
      // Player
      'sprites/hero/hero.json',
      'sprites/hero/hero.png',
      'sprites/hero/portrait.png',
      // NPCs
      'sprites/mentor/mentor.json',
      'sprites/mentor/mentor.png',
      'sprites/merchant/merchant.json',
      'sprites/merchant/merchant.png',
      'sprites/princess/princess.json',
      'sprites/princess/princess.png',
      // Enemies
      'sprites/goblin/goblin.json',
      'sprites/goblin/goblin.png',
      'sprites/skeleton/skeleton.json',
      'sprites/skeleton/skeleton.png',
      'sprites/dark-knight/dark-knight.json',
      'sprites/dark-knight/dark-knight.png',
      // Maps
      'maps/village/map.json',
      'maps/village/cells.json',
      'maps/forest/map.json',
      'maps/forest/cells.json',
      'maps/castle-entrance/map.json',
      'maps/castle-entrance/cells.json',
      'maps/throne-room/map.json',
      'maps/throne-room/cells.json',
      // Cutscenes
      'cutscenes/intro.pxc',
      'cutscenes/training.pxc',
      'cutscenes/boss-battle.pxc',
      'cutscenes/victory.pxc',
      // Scripts
      'callbacks/enemy_encounter.pxs',
      'callbacks/merchant_shop.pxs',
      'callbacks/save_game.pxs',
      // Core
      'tilesets/common.json',
      'manifest.json',
    ],
  },

  {
    id: 'space-odyssey',
    name: '🚀 Space Odyssey',
    description: 'Explore a space station, meet aliens, and save the galaxy!',
    category: TEMPLATE_CATEGORIES.SCIFI,
    complexity: COMPLEXITY.ADVANCED,
    estimatedTime: '10-15 minutes',
    estimatedAssets: 20,
    tags: ['sci-fi', 'space', 'exploration'],
    prompt: `Create a sci-fi adventure game called "Space Odyssey" where you explore a space station.

Characters:
- Captain: The player character (space suit, 8 directions)
- AI Companion: Holographic helper
- Engineer: Human crew member who needs help
- Alien Ambassador: Friendly alien diplomat
- Space Pirate: Enemy character

Locations:
- Bridge: Command center, starting area
- Engine Room: Puzzle zone (fix the engines)
- Hangar Bay: Where pirates attack
- Alien Quarters: Diplomatic zone

Story:
- Distress signal received
- Pirates attacking the station
- Must repair engines while fending off pirates
- Alien ambassador offers help
- Victory: Station saved, pirates defeated`,
    expectedAssets: [
      'sprites/captain/captain.json',
      'sprites/captain/captain.png',
      'sprites/ai-companion/ai-companion.json',
      'sprites/ai-companion/ai-companion.png',
      'sprites/engineer/engineer.json',
      'sprites/engineer/engineer.png',
      'sprites/alien/alien.json',
      'sprites/alien/alien.png',
      'sprites/pirate/pirate.json',
      'sprites/pirate/pirate.png',
      'maps/bridge/map.json',
      'maps/bridge/cells.json',
      'maps/engine-room/map.json',
      'maps/engine-room/cells.json',
      'maps/hangar/map.json',
      'maps/hangar/cells.json',
      'cutscenes/intro.pxc',
      'cutscenes/pirate-attack.pxc',
      'cutscenes/victory.pxc',
      'callbacks/repair_engine.pxs',
      'tilesets/common.json',
      'manifest.json',
    ],
  },

  {
    id: 'visual-novel-romance',
    name: '💕 Coffee Shop Romance',
    description:
      'A cozy visual novel about working at a coffee shop and meeting interesting people.',
    category: TEMPLATE_CATEGORIES.MODERN,
    complexity: COMPLEXITY.STANDARD,
    estimatedTime: '5-7 minutes',
    estimatedAssets: 15,
    tags: ['visual-novel', 'romance', 'story'],
    prompt: `Create a visual novel called "Coffee Shop Romance" about a barista meeting interesting customers.

Characters (all need portraits):
- Barista: The player character (friendly, apron)
- Mysterious Writer: Comes in every day, always writing
- Cheerful Regular: Bright personality, loves chatting
- Grumpy Boss: Strict but secretly caring

Locations:
- Coffee shop counter
- Back room / break area

Story Structure:
- Day 1: Introduction, meet the writer
- Day 2: Chat with the regular, learn about town
- Day 3: Writer opens up about their novel
- Ending: Writer dedicates book to the barista

Focus on dialogue and character interactions rather than puzzles.`,
    expectedAssets: [
      'sprites/barista/barista.json',
      'sprites/barista/barista.png',
      'sprites/barista/portrait.png',
      'sprites/writer/writer.json',
      'sprites/writer/writer.png',
      'sprites/writer/portrait.png',
      'sprites/regular/regular.json',
      'sprites/regular/regular.png',
      'sprites/regular/portrait.png',
      'maps/counter/map.json',
      'maps/counter/cells.json',
      'cutscenes/day1.pxc',
      'cutscenes/day2.pxc',
      'cutscenes/day3.pxc',
      'cutscenes/ending.pxc',
      'tilesets/common.json',
      'manifest.json',
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // EDUCATIONAL TEMPLATES
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'math-quest',
    name: '🔢 Math Quest',
    description: 'An educational adventure where solving math problems unlocks doors!',
    category: TEMPLATE_CATEGORIES.EDUCATIONAL,
    complexity: COMPLEXITY.STARTER,
    estimatedTime: '3-4 minutes',
    estimatedAssets: 8,
    tags: ['educational', 'math', 'kids'],
    prompt: `Create an educational game called "Math Quest" for young learners.

Characters:
- Student: Young adventurer with a calculator badge
- Professor Owl: Wise owl who gives math challenges
- Number Monster: Friendly creature made of numbers

Gameplay:
- Professor Owl asks math questions
- Correct answers unlock new areas
- Number Monster celebrates correct answers
- Simple addition and subtraction problems

Locations:
- Classroom starting area
- Math Garden (unlocked after 3 correct answers)

Keep it encouraging and fun! Wrong answers get hints, not penalties.`,
    expectedAssets: [
      'sprites/student/student.json',
      'sprites/student/student.png',
      'sprites/owl/owl.json',
      'sprites/owl/owl.png',
      'sprites/number-monster/number-monster.json',
      'sprites/number-monster/number-monster.png',
      'maps/classroom/map.json',
      'maps/classroom/cells.json',
      'cutscenes/intro.pxc',
      'cutscenes/correct.pxc',
      'callbacks/math_question.pxs',
      'tilesets/common.json',
      'manifest.json',
    ],
  },
];

/**
 * Get template by ID
 * @param {string} id
 * @returns {object|null}
 */
export function getTemplateById(id) {
  return GAME_TEMPLATES.find(t => t.id === id) || null;
}

/**
 * Get templates by category
 * @param {string} category
 * @returns {array}
 */
export function getTemplatesByCategory(category) {
  return GAME_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get templates by complexity
 * @param {string} complexity
 * @returns {array}
 */
export function getTemplatesByComplexity(complexity) {
  return GAME_TEMPLATES.filter(t => t.complexity === complexity);
}

/**
 * Get featured templates (for homepage/showcase)
 * @returns {array}
 */
export function getFeaturedTemplates() {
  return GAME_TEMPLATES.filter(t => t.featured);
}

/**
 * Get starter templates (recommended for first-time users)
 * @returns {array}
 */
export function getStarterTemplates() {
  return GAME_TEMPLATES.filter(t => t.complexity === COMPLEXITY.STARTER);
}

/**
 * Search templates by tag
 * @param {string} tag
 * @returns {array}
 */
export function searchTemplatesByTag(tag) {
  const lowerTag = tag.toLowerCase();
  return GAME_TEMPLATES.filter(t =>
    t.tags.some(templateTag => templateTag.toLowerCase().includes(lowerTag))
  );
}

/**
 * Get all unique tags
 * @returns {array}
 */
export function getAllTags() {
  const tags = new Set();
  GAME_TEMPLATES.forEach(t => t.tags.forEach(tag => tags.add(tag)));
  return Array.from(tags).sort();
}

export default {
  GAME_TEMPLATES,
  TEMPLATE_CATEGORIES,
  COMPLEXITY,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByComplexity,
  getFeaturedTemplates,
  getStarterTemplates,
  searchTemplatesByTag,
  getAllTags,
};
