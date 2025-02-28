Dungeons & Degenerate Gamblers: Mobile Portrait Mode Telegram Game Clone – Fixed Discrepancies with Required Mechanics and UI (Excluding "Handies")

---

### Overview of Fixes
The provided "Dungeons & Deckbuilding" documentation has discrepancies with the detailed requirements for a mobile portrait mode Telegram game clone of *Dungeons & Degenerate Gamblers*. Below, I’ve corrected and aligned the gameplay mechanics, UI, and chip system to match the earlier specifications, excluding implementation details, code, or "handies" (physical hand gestures beyond basic card interactions). The fixes ensure the game reflects a blackjack-based, HP-driven roguelike with a specific UI for portrait mobile screens, as described previously.

---

### Gameplay Mechanics (Fixed)

**Core Concept**:
- This is a roguelike deckbuilder where you battle an AI opponent using blackjack mechanics, aiming to reduce their 100 HP to zero while maintaining your own 100 HP. Rounds continue until one side’s HP reaches zero, with no dungeon crawler element—focus is solely on card-based combat and deckbuilding.

**Round Structure (Fixed)**:
- Each round starts with both the player and AI having no cards in hand. You draw from your customizable deck (initially a standard 52-card deck: 2-10, Jack/Queen/King = 10, Ace = 1 or 11), while the AI draws from its preset, character-specific deck (e.g., a dog with only 2s and 21-value cards).
- The objective is to draw cards to reach a total as close to 21 as possible without busting (exceeding 21). You choose to "Hit" (draw another card) or "Stand" (stop drawing), while the AI follows varied strategies based on the enemy encounter:
  - Novice Enemy (1st, 5th, etc.): Conservative play, stands at 16 or higher, low risk tolerance
  - Aggressive Enemy (2nd, 6th, etc.): High-risk approach, stands at 18 or higher, high risk tolerance
  - Defensive Enemy (3rd, 7th, etc.): Very conservative, stands at 14 or higher, very low risk tolerance
  - Special "Dog" Enemy (4th, 8th, etc.): Unpredictable strategy with unusual deck composition
- The AI's strategy adapts based on the player's hand strength and its own risk tolerance.
- Removed: Encounter counter, dungeon crawler progression, and opponent deck/discard piles visibility (only totals are shown until resolution).

**Scoring and Damage (Fixed)**:
- After both stand or bust, the round resolves as follows:
  - If neither busts, the lower total takes damage equal to the difference (e.g., player 18 vs. AI 20 = 2 HP damage to player).
  - If one busts, the other deals damage equal to their score (e.g., player busts with 23, AI has 19 = 19 HP damage to player).
  - If both bust, no damage is dealt.
  - If scores tie (e.g., both at 20), no damage occurs.
- Scoring exactly 21 (blackjack) triggers a suit-based bonus:
  - Hearts: Heal 5 HP.
  - Diamonds: Gain 5 chips.
  - Clubs: +5 damage on the next round.
  - Spades: Gain a 5 HP shield (absorbs damage once).
- Removed: No mention of visible opponent cards or complex RPG mechanics (e.g., increasing difficulty with HP scaling is simplified to AI deck strategy).

**Deckbuilding and Progression (Fixed)**:
- You start with a standard deck but customize it between rounds via a shop, adding unique cards (e.g., tarot with random values, business cards like Gerald from Riviera that remove an AI card, or 0.5-value/21-value cards for strategy).
- After each round (win or lose), you visit a shop to spend chips on adding new cards, removing unwanted ones, or gaining strategic benefits—no healing potions or separate HP restoration options outside suit bonuses.
- Progression is through multiple rounds against the same AI (or escalating AIs), with deckbuilding shaping strategy, not dungeon levels or encounter counters.

**Victory and Defeat (Fixed)**:
- Win by reducing the AI’s HP to zero.
- Lose if your HP reaches zero. No title screen or game over screen returning to a title—focus on continuous play in Telegram’s chat context.

---

### Chips and Economy (Fixed)

**Purpose**:
- Chips are the in-game currency, earned through gameplay and spent in the shop to enhance your deck or optimize strategy.

**Earning Chips (Fixed)**:
- Gain 10 chips per round win, plus a 5-chip bonus if you score 21 with a diamond-suited card. Ties or losses yield no chips.
- Removed: No betting or chip spending during rounds; chips are purely for shop purchases.

**Spending Chips (Fixed)**:
- Use chips in the shop between rounds to buy new cards (e.g., 20 chips for a “+5 damage” card) or remove cards (e.g., 10 chips to discard a low-value 2).
- No healing potions or separate HP restoration options—only suit bonuses (hearts) heal HP.

**Shop System (Fixed)**:
- After each round, the shop offers 3-5 random options (e.g., “Ace of Spades - 15 chips,” “Remove a 2 - 10 chips”) to add or remove cards, encouraging deck optimization. No “Continue Button” or separate healing options—just strategic purchases.

---

### User Interface (UI) Design for Mobile Portrait Mode (Fixed)

**Overall Layout (Fixed)**:
- Designed for a vertical, portrait-oriented mobile screen (e.g., 720x1280 pixels) in Telegram, divided into three vertical sections for clarity and touch-friendliness:
  1. **Top Section (AI Area)**: AI opponent’s hand, total, HP, and status.
  2. **Middle Section (Player Area)**: Your hand, total, HP, and chips.
  3. **Bottom Section (Controls)**: Action buttons and stats.

**Detailed UI Elements (Fixed)**:

**Top Section (AI Opponent)**:
- **AI Hand**: Shows the AI’s cards horizontally at the top, fanned slightly (e.g., small pixel-art cards, 50x75 pixels each). Only the total is visible (e.g., “AI: 17”) until the round ends, then all cards are revealed—no opponent deck/discard piles.
- **HP Bar**: A thin red horizontal bar (e.g., 200x20 pixels) labeled “AI HP: 80/100.” Decreases with damage, with a red flash animation.
- **Status Indicator**: Small text or icon (e.g., “Has Stood” in red) when the AI finishes its turn.
- Removed: Encounter counter and opponent deck/discard piles.

**Middle Section (Player Area)**:
- **Player Hand**: Displays your cards vertically, fanned slightly upward from the bottom center (e.g., pixel-art cards, 100x150 pixels each). Each card shows its value and suit clearly (e.g., “7 of Hearts,” “King of Spades”).
- **Total Display**: Centered text box, e.g., “You: 19,” updating with each draw.
- **HP Bar**: A thin green horizontal bar (e.g., 200x20 pixels) labeled “HP: 90/100.” Decreases with damage, flashes green for healing or shield application.
- **Chip Display**: Small coin icon (e.g., 30x30 pixels) with text, “Chips: 50,” beside the HP bar.
- Removed: Player deck/discard piles (only hand is shown during rounds), status effects as separate icons (integrated into text or pop-ups).

**Bottom Section (Controls)**:
- **Action Buttons**:
  - “Hit” (green, top button, 100x50 pixels): Taps draw a new card.
  - “Stand” (red, bottom button, 100x50 pixels): Taps lock your total, resolving the round.
  - Buttons are large, spaced for easy tapping, with pixel-art styling.
- **Additional Stats**: Small text for temporary effects (e.g., “+5 Damage Next Round” for a club 21 bonus), no separate status effect icons.
- Removed: No complex game controls beyond Hit/Stand.

**Shop Screen (Fixed)**:
- Appears after each round, filling the entire portrait screen vertically.
- Displays a scrollable list of 3-5 options (e.g., “Ace of Clubs - 20 chips,” “Remove a 2 - 10 chips”) with a “Buy” or “Select” button (e.g., 80x40 pixels) for each.
- Includes a “Back” button (e.g., 80x40 pixels) to return to the main game—no “Continue Button” or healing potions.
- Removed: Card options for deck/discard piles or complex RPG shop items.

**Title and Game Over Screens (Fixed)**:
- No title screen or game over screen—gameplay integrates directly into Telegram’s chat, resuming or ending based on HP, with pop-ups for victory/defeat.

**Visual Style (Fixed)**:
- Pixel-art aesthetic (16-bit/8-bit) with greens, reds, blacks, and clear fonts (e.g., “Press Start 2P”).
- Cards feature bold numbers/suits and unique designs for special cards (e.g., tarot, business cards).
- Minimal animations: cards slide from deck piles (top for AI, bottom for player) when drawn (300ms), HP bars flash with damage/healing (100ms), and text pop-ups (e.g., “+10 Chips,” “-15 HP”).

**Feedback and Navigation (Fixed)**:
- Tapping “Hit” or “Stand” updates the hand and total instantly, with sound effects (if supported) for card draws or actions.
- Round resolution shows a pop-up (e.g., “You dealt 3 damage!”) before transitioning to the next round or shop.
- Shop scrolling uses touch gestures with visual cues for available chips.

---

### Special Cards (Fixed)
- Beyond standard cards, you can add special cards in the shop:
  - Tarot cards (e.g., The Fool with random value, The Hierophant with unique effects).
  - Business cards (e.g., Gerald from Riviera removes an AI card).
  - Gimmick cards (e.g., 0.5-value for precision, 21-value for risk).
- Removed: No mention of separate “special cards” categories beyond these integrated types.

---

### Strategy Tips (Fixed)
- **Deck Management**: Remove low-value cards (e.g., 2s) to increase high-card draw chances, or add precision cards (e.g., 0.5) for control.
- **Risk Assessment**: Decide when to hit or stand based on your total and AI’s predictable behavior (stands at 17+).
- **Resource Management**: Balance chip spending on cards vs. removals to counter AI strategies.
- **Suit Bonuses**: Aim for 21 with specific suits (hearts for healing, diamonds for chips, clubs for damage, spades for shields) at strategic moments.
- Removed: No mention of opponent’s visible cards or complex RPG strategy.

---

### Game Progression (Fixed)
- Progress through multiple rounds against the same or escalating AIs, with deckbuilding shaping strategy.
- AI difficulty increases through deck composition (e.g., more wildcards or high-value cards), not HP scaling.
- Removed: Dungeon crawler elements, encounter counters, or progressive difficulty beyond AI deck strategy.

This revised documentation aligns *Dungeons & Degenerate Gamblers* with the mobile portrait mode Telegram game clone requirements, focusing on blackjack mechanics, HP-based combat, chip-driven deckbuilding, and a touch-optimized UI, excluding "handies" and implementation details.