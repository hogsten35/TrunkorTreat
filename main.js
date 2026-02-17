/* Trunk or Treat: The Boop Chase (Phaser 3 MVP)
   - Kid-safe: caught = BOOP + respawn
   - 6 rooms, 5 Trick Tokens to win
   - Mechanics: hiding, noise meter, distractions
*/

const W = 960;
const H = 540;

const GAME_TITLE = "Trunk or Treat: The Boop Chase";

const ELEPHANT_LINES = [
  "Truuuunk patrol! Doo-doo-doo!",
  "I smell… candy toes!",
  "Where’d you go, little giggler?",
  "Ears on! I’m listenin’!",
  "Sniff sniff… WHOA! Confetti sneeze!",
  "No running in the haunted house! (…Unless it’s me!)",
  "Boop-a-doop! That’s my signature move!",
  "I heard a clatter! Was that a spooky spoon?",
  "If I find you, you owe me a high-five!",
  "Trunk says: this wayyy! (Maybe!)",
];

const PLAYER_LINES = [
  "Okay… quiet feet, quiet feet.",
  "Hide time! Don’t laugh, don’t laugh…",
  "Whoa! That portrait winked at me!",
  "Distraction deployed! Go investigate, silly!",
  "I found a Trick Token! Shiny!",
  "Squeaky shoes! Elephant incoming!",
  "I’m not scared… I’m just… extra careful.",
  "Candy mission: still possible!",
  "Booped again! That trunk is too bouncy!",
  "Last token! Then I’m outta here!",
];

const DIFFICULTIES = {
  easy: {
    label: "Tiny Toot (Easy)",
    playerWalk: 160,
    playerRun: 240,
    runNoisePerSec: 18,
    walkNoisePerSec: 0,
    quietRecoverPerSec: 22,
    hideRecoverPerSec: 45,
    elephantPatrolSpeed: 105,
    elephantChaseSpeed: 165,
    sightRange: 220,
    hearThreshold: 55,
    sniffChancePerSec: 0.25,
    investigateSeconds: 2.4,
  },
  normal: {
    label: "Spooky Scoot (Normal)",
    playerWalk: 150,
    playerRun: 230,
    runNoisePerSec: 22,
    walkNoisePerSec: 1,
    quietRecoverPerSec: 18,
    hideRecoverPerSec: 40,
    elephantPatrolSpeed: 120,
    elephantChaseSpeed: 185,
    sightRange: 250,
    hearThreshold: 45,
    sniffChancePerSec: 0.32,
    investigateSeconds: 2.8,
  },
  hard: {
    label: "Mega Trunk (Hard)",
    playerWalk: 145,
    playerRun: 225,
    runNoisePerSec: 26,
    walkNoisePerSec: 2,
    quietRecoverPerSec: 14,
    hideRecoverPerSec: 36,
    elephantPatrolSpeed: 135,
    elephantChaseSpeed: 210,
    sightRange: 275,
    hearThreshold: 40,
    sniffChancePerSec: 0.4,
    investigateSeconds: 3.2,
  },
};

// Room layout: simple rectangles for obstacles/hide spots + doors to next/prev.
// Tokens: total 5 across rooms.
// Items: 5 silly unlocks (one each in certain rooms).
const ROOMS = [
  {
    key: "Candy Porch",
    bg: 0x141425,
    spawn: { x: 120, y: 420 },
    elephantSpawn: { x: 820, y: 150 },
    obstacles: [
      { x: 480, y: 100, w: 780, h: 30 },
      { x: 480, y: 520, w: 780, h: 30 },
      { x: 60,  y: 270, w: 30,  h: 420 },
      { x: 900, y: 270, w: 30,  h: 420 },
      { x: 510, y: 300, w: 200, h: 30 }, // porch rail
    ],
    hides: [
      { x: 220, y: 420, w: 80, h: 60, label: "Pumpkin Planter" },
      { x: 740, y: 420, w: 90, h: 60, label: "Coat Pile" },
    ],
    doors: [{ to: 1, x: 930, y: 270, w: 40, h: 140, label: "Door → Hallway" }],
    collectibles: [
      { type: "token", id: "token_1", x: 520, y: 420 },
      { type: "item",  id: "goggles", x: 320, y: 160 },
    ],
    gags: [],
  },
  {
    key: "Wobble Hallway",
    bg: 0x101020,
    spawn: { x: 110, y: 270 },
    elephantSpawn: { x: 830, y: 300 },
    obstacles: [
      { x: 480, y: 70,  w: 820, h: 30 },
      { x: 480, y: 470, w: 820, h: 30 },
      { x: 60,  y: 270, w: 30,  h: 420 },
      { x: 900, y: 270, w: 30,  h: 420 },
      { x: 480, y: 270, w: 60,  h: 220 }, // center coat rack "island"
    ],
    hides: [
      { x: 160, y: 130, w: 90, h: 70, label: "Curtains" },
      { x: 790, y: 130, w: 90, h: 70, label: "Closet" },
      { x: 160, y: 410, w: 90, h: 70, label: "Umbrella Stand" },
    ],
    doors: [
      { to: 0, x: 30,  y: 270, w: 40, h: 140, label: "← Porch" },
      { to: 2, x: 930, y: 270, w: 40, h: 140, label: "→ Kitchen" },
      // Shortcut door becomes active when cape unlocked
      { to: 4, x: 480, y: 50, w: 160, h: 40, label: "Secret Hatch (Cape)", requires: "cape" },
    ],
    collectibles: [
      { type: "token", id: "token_2", x: 720, y: 400 },
      { type: "item",  id: "tracker", x: 240, y: 270 },
    ],
    gags: [
      { type: "portraitSneezes", x: 760, y: 260, w: 90, h: 120 },
    ],
  },
  {
    key: "Giggle Kitchen",
    bg: 0x0f1424,
    spawn: { x: 120, y: 280 },
    elephantSpawn: { x: 820, y: 180 },
    obstacles: [
      { x: 480, y: 70,  w: 820, h: 30 },
      { x: 480, y: 470, w: 820, h: 30 },
      { x: 60,  y: 270, w: 30,  h: 420 },
      { x: 900, y: 270, w: 30,  h: 420 },
      { x: 480, y: 260, w: 300, h: 40 },  // counter
      { x: 260, y: 340, w: 120, h: 40 },  // table
    ],
    hides: [
      { x: 820, y: 410, w: 90, h: 70, label: "Pantry" },
      { x: 260, y: 410, w: 100, h: 70, label: "Big Pot" },
    ],
    doors: [
      { to: 1, x: 30,  y: 270, w: 40, h: 140, label: "← Hallway" },
      { to: 3, x: 930, y: 270, w: 40, h: 140, label: "→ Playroom" },
    ],
    collectibles: [
      { type: "token", id: "token_3", x: 700, y: 160 },
      { type: "item",  id: "spray", x: 560, y: 420 },
    ],
    gags: [],
  },
  {
    key: "Toy Tomb Playroom",
    bg: 0x141a22,
    spawn: { x: 120, y: 300 },
    elephantSpawn: { x: 820, y: 380 },
    obstacles: [
      { x: 480, y: 70,  w: 820, h: 30 },
      { x: 480, y: 470, w: 820, h: 30 },
      { x: 60,  y: 270, w: 30,  h: 420 },
      { x: 900, y: 270, w: 30,  h: 420 },
      { x: 520, y: 320, w: 260, h: 160 }, // block castle maze
    ],
    hides: [
      { x: 220, y: 140, w: 100, h: 70, label: "Toy Tent" },
      { x: 780, y: 140, w: 100, h: 70, label: "Toy Chest" },
      { x: 220, y: 420, w: 100, h: 70, label: "Plush Pile" },
    ],
    doors: [
      { to: 2, x: 30,  y: 270, w: 40, h: 140, label: "← Kitchen" },
      { to: 4, x: 930, y: 270, w: 40, h: 140, label: "→ Bathroom" },
    ],
    collectibles: [
      { type: "item",  id: "banana", x: 740, y: 420 },
    ],
    gags: [
      { type: "toyChestBalloons", x: 760, y: 130, w: 120, h: 120 },
    ],
  },
  {
    key: "Mirror Maze Bathroom",
    bg: 0x0f101c,
    spawn: { x: 120, y: 260 },
    elephantSpawn: { x: 820, y: 260 },
    obstacles: [
      { x: 480, y: 70,  w: 820, h: 30 },
      { x: 480, y: 470, w: 820, h: 30 },
      { x: 60,  y: 270, w: 30,  h: 420 },
      { x: 900, y: 270, w: 30,  h: 420 },
      { x: 480, y: 270, w: 120, h: 260 }, // mirror column
      { x: 260, y: 210, w: 120, h: 120 }, // sink area
    ],
    hides: [
      { x: 780, y: 420, w: 110, h: 70, label: "Shower Curtain" },
      { x: 240, y: 420, w: 110, h: 70, label: "Laundry Basket" },
    ],
    doors: [
      { to: 3, x: 30,  y: 270, w: 40, h: 140, label: "← Playroom" },
      { to: 5, x: 930, y: 270, w: 40, h: 140, label: "→ Attic" },
    ],
    collectibles: [
      { type: "token", id: "token_4", x: 720, y: 420 },
      { type: "item",  id: "cape", x: 260, y: 140 },
    ],
    gags: [
      { type: "bathtubFoamSmile", x: 740, y: 170, w: 160, h: 130 },
    ],
  },
  {
    key: "Attic of Hats",
    bg: 0x0d0d16,
    spawn: { x: 130, y: 420 },
    elephantSpawn: { x: 820, y: 150 },
    obstacles: [
      { x: 480, y: 70,  w: 820, h: 30 },
      { x: 480, y: 470, w: 820, h: 30 },
      { x: 60,  y: 270, w: 30,  h: 420 },
      { x: 900, y: 270, w: 30,  h: 420 },
      { x: 420, y: 260, w: 220, h: 60 }, // costume trunk row
      { x: 640, y: 340, w: 140, h: 60 },
    ],
    hides: [
      { x: 340, y: 420, w: 110, h: 70, label: "Costume Trunk" },
      { x: 780, y: 420, w: 110, h: 70, label: "Hat Stack" },
    ],
    doors: [
      { to: 4, x: 30,  y: 270, w: 40, h: 140, label: "← Bathroom" },
    ],
    collectibles: [
      { type: "token", id: "token_5", x: 520, y: 160 },
    ],
    exit: { x: 860, y: 460, w: 120, h: 60, label: "Candy Chute Exit" },
    gags: [],
  },
];

function randPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

class MenuScene extends Phaser.Scene {
  constructor() { super("Menu"); }
  create() {
    this.cameras.main.setBackgroundColor("#0b0b12");
    const cx = W / 2, cy = H / 2;

    this.add.text(cx, 70, GAME_TITLE, { fontFamily: "Arial", fontSize: "36px", color: "#ffffff" }).setOrigin(0.5);
    this.add.text(cx, 115, "Kid-safe fun horror (6–10): no harm, just BOOPS!", { fontFamily: "Arial", fontSize: "18px", color: "#cfcfe8" }).setOrigin(0.5);

    this.add.text(cx, 170, "Pick Difficulty", { fontFamily: "Arial", fontSize: "22px", color: "#ffffff" }).setOrigin(0.5);

    const buttons = [
      { key: "easy",   y: 240 },
      { key: "normal", y: 305 },
      { key: "hard",   y: 370 },
    ];

    buttons.forEach(b => {
      const d = DIFFICULTIES[b.key];
      const box = this.add.rectangle(cx, b.y, 520, 50, 0x1b1b2f).setStrokeStyle(2, 0x6c6ca8).setInteractive({ useHandCursor: true });
      this.add.text(cx, b.y, d.label, { fontFamily: "Arial", fontSize: "20px", color: "#ffffff" }).setOrigin(0.5);

      box.on("pointerdown", () => {
        this.registry.set("difficultyKey", b.key);
        this.registry.set("tokens", 0);
        this.registry.set("boopsThisRun", 0);
        this.registry.set("unlocks", { goggles: false, tracker: false, spray: false, banana: false, cape: false });
        this.registry.set("tutorialDone", false);
        this.scene.start("Room", { roomIndex: 0 });
      });
    });

    this.add.text(cx, 460,
      "Controls: WASD/Arrows to move • Shift to Run • Space to Hide • Click to Toss Distraction\nTouch: drag to move • tap buttons (added automatically on touch devices)",
      { fontFamily: "Arial", fontSize: "14px", color: "#cfcfe8", align: "center", wordWrap: { width: 800 } }
    ).setOrigin(0.5);
  }
}

class WinScene extends Phaser.Scene {
  constructor() { super("Win"); }
  create() {
    this.cameras.main.setBackgroundColor("#101020");
    const cx = W / 2, cy = H / 2;
    this.add.text(cx, 160, "YOU WIN!", { fontFamily: "Arial", fontSize: "54px", color: "#ffffff" }).setOrigin(0.5);
    this.add.text(cx, 220, "You rode the Candy Chute and escaped the BOOP!", { fontFamily: "Arial", fontSize: "20px", color: "#cfcfe8" }).setOrigin(0.5);

    const boops = this.registry.get("boopsThisRun") ?? 0;
    this.add.text(cx, 270, `Boops this run: ${boops}`, { fontFamily: "Arial", fontSize: "18px", color: "#cfcfe8" }).setOrigin(0.5);

    const btn = this.add.rectangle(cx, 360, 240, 56, 0x1b1b2f).setStrokeStyle(2, 0x6c6ca8).setInteractive({ useHandCursor: true });
    this.add.text(cx, 360, "Play Again", { fontFamily: "Arial", fontSize: "20px", color: "#ffffff" }).setOrigin(0.5);
    btn.on("pointerdown", () => this.scene.start("Menu"));
  }
}

class RoomScene extends Phaser.Scene {
  constructor() { super("Room"); }

  init(data) {
    this.roomIndex = data.roomIndex ?? 0;
  }

  create() {
    this.diffKey = this.registry.get("difficultyKey") || "normal";
    this.diff = DIFFICULTIES[this.diffKey];

    this.room = ROOMS[this.roomIndex];

    this.cameras.main.setBackgroundColor(this.room.bg);

    // --- Generate simple textures once ---
    this.makeTextures();

    // --- World bounds ---
    this.physics.world.setBounds(0, 0, W, H);

    // --- Obstacles (static) ---
    this.walls = this.physics.add.staticGroup();
    this.room.obstacles.forEach(o => {
      const wall = this.add.rectangle(o.x, o.y, o.w, o.h, 0x23233a).setStrokeStyle(2, 0x3b3b5a);
      this.physics.add.existing(wall, true);
      this.walls.add(wall);
    });

    // --- Hiding spots (zones) ---
    this.hideZones = [];
    this.hideZoneGraphics = this.add.graphics();
    this.hideZoneGraphics.setDepth(5);

    this.room.hides.forEach(h => {
      const z = this.add.zone(h.x, h.y, h.w, h.h);
      this.physics.add.existing(z, true);
      z._hideLabel = h.label;
      this.hideZones.push(z);
    });

    // --- Doors (zones) ---
    this.doorZones = [];
    (this.room.doors || []).forEach(d => {
      if (d.requires) {
        const unlocks = this.registry.get("unlocks");
        if (!unlocks?.[d.requires]) return;
      }
      const z = this.add.zone(d.x, d.y, d.w, d.h);
      this.physics.add.existing(z, true);
      z._toRoom = d.to;
      z._label = d.label;
      this.doorZones.push(z);

      const sign = this.add.text(d.x, d.y - 40, "🚪", { fontFamily: "Arial", fontSize: "24px", color: "#ffffff" }).setOrigin(0.5);
      sign.setAlpha(0.8);
    });

    // --- Exit (attic only) ---
    this.exitZone = null;
    if (this.room.exit) {
      const e = this.room.exit;
      this.exitZone = this.add.zone(e.x, e.y, e.w, e.h);
      this.physics.add.existing(this.exitZone, true);
      this.add.text(e.x, e.y - 30, "🍬", { fontFamily: "Arial", fontSize: "28px", color: "#ffffff" }).setOrigin(0.5);
    }

    // --- Player ---
    this.playerHidden = false;
    this.player = this.physics.add.sprite(this.room.spawn.x, this.room.spawn.y, "player");
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(26, 26);

    // --- Elephant ---
    this.elephant = this.physics.add.sprite(this.room.elephantSpawn.x, this.room.elephantSpawn.y, "elephant");
    this.elephant.setCollideWorldBounds(true);
    this.elephant.body.setSize(44, 44);

    // Collisions
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.elephant, this.walls);

    // Boop overlap (safe catch)
    this.physics.add.overlap(this.player, this.elephant, () => this.onBoop(), null, this);

    // --- Collectibles ---
    this.collectGroup = this.physics.add.staticGroup();
    this.spawnCollectibles();

    this.physics.add.overlap(this.player, this.collectGroup, (player, item) => {
      this.pickup(item);
    });

    // --- Distraction "sound pings" ---
    this.distractions = this.add.group();
    this.distractionCharges = 1; // base
    this.lastSoundPoint = null;
    this.soundPingTimer = 0;

    // --- Noise ---
    this.noise = 0; // 0..100
    this.noiseMult = 1;

    // --- AI ---
    this.ai = {
      state: "PATROL",
      patrolPoints: this.makePatrolPoints(),
      patrolIndex: 0,
      investigateTarget: null,
      investigateTimeLeft: 0,
      chaseMemory: 0,
      lastSeen: null,
      tellTimer: 0,
      nextVoice: 0,
    };

    // --- Input ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      SHIFT: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
      E: Phaser.Input.Keyboard.KeyCodes.E,
    });

    // Click to toss distraction
    this.input.on("pointerdown", (p) => {
      // If clicking UI area, ignore
      if (p.y < 90) return;
      this.tryTossDistraction(p.worldX, p.worldY);
    });

    // --- UI ---
    this.ui = {};
    this.ui.title = this.add.text(12, 10, this.room.key, { fontFamily: "Arial", fontSize: "18px", color: "#ffffff" }).setScrollFactor(0);
    this.ui.tokens = this.add.text(12, 34, "", { fontFamily: "Arial", fontSize: "16px", color: "#cfcfe8" }).setScrollFactor(0);
    this.ui.hint = this.add.text(12, 58, "", { fontFamily: "Arial", fontSize: "14px", color: "#cfcfe8" }).setScrollFactor(0);

    this.ui.noiseLabel = this.add.text(W - 240, 10, "Noise", { fontFamily: "Arial", fontSize: "14px", color: "#ffffff" }).setScrollFactor(0);
    this.ui.noiseBarBg = this.add.rectangle(W - 120, 34, 200, 14, 0x20203a).setStrokeStyle(1, 0x5e5e90).setScrollFactor(0);
    this.ui.noiseBar = this.add.rectangle(W - 220, 34, 0, 10, 0x7f7fff).setOrigin(0, 0.5).setScrollFactor(0);

    this.ui.bubble = this.add.text(W / 2, 90, "", { fontFamily: "Arial", fontSize: "18px", color: "#ffffff", align: "center", wordWrap: { width: 860 } })
      .setOrigin(0.5).setScrollFactor(0).setDepth(100).setAlpha(0);

    this.ui.action = this.add.text(W / 2, H - 24, "", { fontFamily: "Arial", fontSize: "14px", color: "#cfcfe8" })
      .setOrigin(0.5).setScrollFactor(0);

    // Touch controls (simple on-screen buttons)
    this.touchUI = this.buildTouchUI();

    // Tutorial (once)
    if (!this.registry.get("tutorialDone")) {
      this.runTutorial();
    } else {
      this.say("Narrator", "Find 5 Trick Tokens 🍬. If you get caught, you’ll just get BOOPED and respawn!");
    }

    // Room gags
    this.gagZones = [];
    (this.room.gags || []).forEach(g => {
      const z = this.add.zone(g.x, g.y, g.w, g.h);
      this.physics.add.existing(z, true);
      z._gagType = g.type;
      z._gagDone = false;
      this.gagZones.push(z);
    });

    // Overlaps for doors / exit / gags
    this.physics.add.overlap(this.player, this.doorZones, (p, z) => this.enterDoor(z), null, this);
    if (this.exitZone) {
      this.physics.add.overlap(this.player, this.exitZone, () => this.tryExit(), null, this);
    }
    if (this.gagZones.length) {
      this.physics.add.overlap(this.player, this.gagZones, (p, z) => this.triggerGag(z), null, this);
    }

    // Unlock effects
    const unlocks = this.registry.get("unlocks") || {};
    this.noiseMult = unlocks.spray ? 0.75 : 1.0; // Squeak-B-Gone reduces noise gain
    this.distractionCharges = 1 + (unlocks.banana ? 1 : 0); // Banana-Phone adds 1 extra distraction charge

    this.updateUI();
  }

  makeTextures() {
    if (this.textures.exists("player")) return;

    // Player: round-ish candy kid
    {
      const g = this.add.graphics();
      g.fillStyle(0x9fe2ff, 1);
      g.fillCircle(16, 16, 14);
      g.fillStyle(0x0b0b12, 1);
      g.fillCircle(11, 13, 2);
      g.fillCircle(21, 13, 2);
      g.lineStyle(2, 0x0b0b12, 1);
      g.beginPath();
      g.arc(16, 19, 6, 0, Math.PI, false);
      g.strokePath();
      g.generateTexture("player", 32, 32);
      g.destroy();
    }

    // Elephant: goofy circle + ears + trunk
    {
      const g = this.add.graphics();
      g.fillStyle(0xb7b7c9, 1);
      g.fillCircle(24, 24, 22);
      // ears
      g.fillStyle(0xa8a8bf, 1);
      g.fillEllipse(6, 24, 14, 18);
      g.fillEllipse(42, 24, 14, 18);
      // trunk
      g.fillStyle(0x9a9ab3, 1);
      g.fillRoundedRect(20, 30, 8, 18, 4);
      // eyes
      g.fillStyle(0x0b0b12, 1);
      g.fillCircle(17, 20, 2);
      g.fillCircle(31, 20, 2);
      // smile
      g.lineStyle(2, 0x0b0b12, 1);
      g.beginPath();
      g.arc(24, 27, 9, 0, Math.PI, false);
      g.strokePath();
      g.generateTexture("elephant", 48, 48);
      g.destroy();
    }

    // Trick Token: little pumpkin coin
    {
      const g = this.add.graphics();
      g.fillStyle(0xffa13a, 1);
      g.fillCircle(12, 12, 10);
      g.fillStyle(0x0b0b12, 1);
      g.fillCircle(8, 10, 2);
      g.fillCircle(16, 10, 2);
      g.lineStyle(2, 0x0b0b12, 1);
      g.beginPath();
      g.arc(12, 14, 6, 0, Math.PI, false);
      g.strokePath();
      g.generateTexture("token", 24, 24);
      g.destroy();
    }

    // Item: little star badge
    {
      const g = this.add.graphics();
      g.fillStyle(0xfff1a6, 1);
      g.fillCircle(12, 12, 10);
      g.fillStyle(0x0b0b12, 1);
      g.fillCircle(12, 12, 3);
      g.generateTexture("item", 24, 24);
      g.destroy();
    }

    // Confetti particle
    {
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 1);
      g.fillRect(0, 0, 4, 4);
      g.generateTexture("confetti", 4, 4);
      g.destroy();
    }
  }

  spawnCollectibles() {
    const unlocks = this.registry.get("unlocks") || {};
    const tokensAlready = this.registry.get("tokenFlags") || {};
    const itemsAlready = this.registry.get("itemFlags") || {};

    this.room.collectibles.forEach(c => {
      if (c.type === "token" && tokensAlready[c.id]) return;
      if (c.type === "item" && itemsAlready[c.id]) return;

      const key = (c.type === "token") ? "token" : "item";
      const s = this.collectGroup.create(c.x, c.y, key);
      s._collectType = c.type;
      s._collectId = c.id;

      // little bob
      this.tweens.add({
        targets: s,
        y: s.y - 6,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });
  }

  pickup(itemSprite) {
    const type = itemSprite._collectType;
    const id = itemSprite._collectId;

    if (type === "token") {
      const flags = this.registry.get("tokenFlags") || {};
      flags[id] = true;
      this.registry.set("tokenFlags", flags);

      const tokens = (this.registry.get("tokens") || 0) + 1;
      this.registry.set("tokens", tokens);

      this.say("Player", randPick(PLAYER_LINES));
    } else {
      const flags = this.registry.get("itemFlags") || {};
      flags[id] = true;
      this.registry.set("itemFlags", flags);

      const unlocks = this.registry.get("unlocks") || { goggles:false, tracker:false, spray:false, banana:false, cape:false };

      // 5 silly items + unlock behavior
      if (id === "goggles") unlocks.goggles = true;           // show hiding outlines
      if (id === "tracker") unlocks.tracker = true;           // arrow to nearest token
      if (id === "spray")   unlocks.spray = true;             // lower noise gain
      if (id === "banana")  unlocks.banana = true;            // +1 distraction charge
      if (id === "cape")    unlocks.cape = true;              // unlock shortcut door in hallway

      this.registry.set("unlocks", unlocks);

      // Apply effects immediately
      this.noiseMult = unlocks.spray ? 0.75 : 1.0;
      this.distractionCharges = 1 + (unlocks.banana ? 1 : 0);

      const itemName = {
        goggles: "Giggle Goggles",
        tracker: "Trick-Token Tracker Tot",
        spray: "Squeak-B-Gone Spray",
        banana: "Banana-Phone (Toy)",
        cape: "Cape of the Brave Jellybean",
      }[id] || "Mystery Thing";

      this.say("Narrator", `You found: ${itemName}!`);
      this.say("Elephant", randPick(ELEPHANT_LINES));
    }

    itemSprite.destroy();
    this.updateUI();
  }

  updateUI() {
    const tokens = this.registry.get("tokens") || 0;
    this.ui.tokens.setText(`Trick Tokens: ${tokens}/5`);

    const unlocks = this.registry.get("unlocks") || {};
    const hints = [];
    hints.push("Shift = Run (louder)");
    hints.push("Space = Hide (in a hide spot)");
    hints.push(`Distractions: ${this.distractionCharges} (click to toss)`);
    if (unlocks.goggles) hints.push("Goggles: Hide spots glow");
    if (unlocks.tracker) hints.push("Tracker: Arrow to nearest token");
    if (unlocks.cape) hints.push("Cape: Secret hatch in hallway!");
    this.ui.hint.setText(hints.join(" • "));
  }

  say(who, text) {
    // quick bubble at top
    this.ui.bubble.setText(`${who}: ${text}`);
    this.ui.bubble.setAlpha(1);
    this.tweens.killTweensOf(this.ui.bubble);
    this.tweens.add({
      targets: this.ui.bubble,
      alpha: 0,
      duration: 1200,
      delay: 1400,
    });
  }

  makePatrolPoints() {
    // a gentle loop around the room
    return [
      { x: 160, y: 140 },
      { x: 800, y: 140 },
      { x: 800, y: 400 },
      { x: 160, y: 400 },
    ];
  }

  canSeePlayer() {
    if (this.playerHidden) return false;
    const dist = Phaser.Math.Distance.Between(this.elephant.x, this.elephant.y, this.player.x, this.player.y);
    if (dist > this.diff.sightRange) return false;

    // Simple line-of-sight: raycast-ish (sample points)
    const steps = 10;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const x = Phaser.Math.Linear(this.elephant.x, this.player.x, t);
      const y = Phaser.Math.Linear(this.elephant.y, this.player.y, t);
      // if the sample point overlaps any wall rectangle, block vision
      const blocked = this.room.obstacles.some(o =>
        x > (o.x - o.w / 2) && x < (o.x + o.w / 2) && y > (o.y - o.h / 2) && y < (o.y + o.h / 2)
      );
      if (blocked) return false;
    }

    return true;
  }

  postSoundPing(x, y, strength = 60) {
    this.lastSoundPoint = { x, y, strength };
    this.soundPingTimer = 0.1; // short memory

    // Elephant reacts if sound is strong enough OR noise is high
    if (strength >= this.diff.hearThreshold) {
      this.ai.state = "INVESTIGATE";
      this.ai.investigateTarget = { x, y };
      this.ai.investigateTimeLeft = this.diff.investigateSeconds;
      if (Math.random() < 0.35) this.say("Elephant", "Huh? A funny sound!");
    }
  }

  tryTossDistraction(x, y) {
    if (this.distractionCharges <= 0) return;

    // Can't toss while hidden (keeps it simple + readable)
    if (this.playerHidden) return;

    this.distractionCharges -= 1;
    this.updateUI();

    this.say("Player", "Distraction deployed!");

    const dot = this.add.circle(x, y, 8, 0xffffff).setAlpha(0.65);
    this.tweens.add({
      targets: dot,
      alpha: 0,
      duration: 800,
      onComplete: () => dot.destroy(),
    });

    // Sound ping at clicked position
    this.postSoundPing(x, y, 80);
  }

  findNearestUncollectedToken() {
    const flags = this.registry.get("tokenFlags") || {};
    // Search remaining tokens in all rooms for a rough direction hint
    let best = null;
    for (let r = 0; r < ROOMS.length; r++) {
      const room = ROOMS[r];
      for (const c of room.collectibles) {
        if (c.type !== "token") continue;
        if (flags[c.id]) continue;
        // If token is in current room, use exact
        const wx = (r === this.roomIndex) ? c.x : (r < this.roomIndex ? 60 : 900);
        const wy = (r === this.roomIndex) ? c.y : 270;
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, wx, wy);
        if (!best || d < best.d) best = { x: wx, y: wy, d };
      }
    }
    return best;
  }

  onBoop() {
    if (this.playerHidden) return;

    // brief invuln to avoid instant double-boops
    if (this._boopCooldown) return;
    this._boopCooldown = true;
    this.time.delayedCall(900, () => (this._boopCooldown = false));

    const boops = (this.registry.get("boopsThisRun") || 0) + 1;
    this.registry.set("boopsThisRun", boops);

    // Confetti puff (harmless)
    const p = this.add.particles(0, 0, "confetti", {
      x: this.player.x,
      y: this.player.y,
      speed: { min: 40, max: 160 },
      lifespan: 500,
      quantity: 25,
      scale: { start: 1, end: 0 },
    });
    this.time.delayedCall(550, () => p.destroy());

    this.say("Elephant", "BOOP-A-DOOP!");
    this.say("Player", "Booped! Respawn time!");

    // Respawn player safely
    this.player.setPosition(this.room.spawn.x, this.room.spawn.y);
    this.playerHidden = false;
    this.player.setAlpha(1);

    // Elephant resets to patrol
    this.ai.state = "PATROL";
    this.ai.investigateTarget = null;
    this.ai.investigateTimeLeft = 0;
    this.ai.chaseMemory = 0;
  }

  enterDoor(zone) {
    // only if player is "trying" (prevents accidental teleport spam)
    if (!this.keys.E.isDown) {
      this.ui.action.setText(`Press E to enter: ${zone._label}`);
      return;
    }
    this.scene.restart({ roomIndex: zone._toRoom });
  }

  tryExit() {
    const tokens = this.registry.get("tokens") || 0;
    if (!this.keys.E.isDown) {
      this.ui.action.setText("Press E to ride the Candy Chute!");
      return;
    }
    if (tokens >= 5) {
      this.scene.start("Win");
    } else {
      this.say("Narrator", `You need ${5 - tokens} more Trick Token(s)!`);
    }
  }

  triggerGag(zone) {
    if (zone._gagDone) return;
    zone._gagDone = true;

    if (zone._gagType === "portraitSneezes") {
      const portrait = this.add.rectangle(zone.x, zone.y, 70, 100, 0x2b2b4a).setStrokeStyle(2, 0x6c6ca8);
      const face = this.add.text(zone.x, zone.y, "😐", { fontFamily: "Arial", fontSize: "32px" }).setOrigin(0.5);
      this.tweens.add({
        targets: [portrait, face],
        x: "+=8",
        yoyo: true,
        repeat: 5,
        duration: 70,
        onComplete: () => {
          face.setText("🤧");
          this.say("Narrator", "The portrait sneezes glitter! ACHOO!");
          const p = this.add.particles(0, 0, "confetti", {
            x: zone.x, y: zone.y,
            speed: { min: 30, max: 120 },
            lifespan: 550,
            quantity: 18,
            scale: { start: 1, end: 0 },
          });
          this.time.delayedCall(600, () => {
            p.destroy(); portrait.destroy(); face.destroy();
          });
        },
      });
    }

    if (zone._gagType === "toyChestBalloons") {
      this.say("Narrator", "The toy chest pops open… BOING!");
      const chest = this.add.rectangle(zone.x, zone.y + 20, 90, 50, 0x3a2b2b).setStrokeStyle(2, 0x6c6ca8);
      const balloons = [];
      for (let i = 0; i < 3; i++) {
        const b = this.add.text(zone.x + (-20 + i * 20), zone.y - 10, "🎈", { fontFamily: "Arial", fontSize: "26px" }).setOrigin(0.5);
        balloons.push(b);
        this.tweens.add({
          targets: b,
          y: b.y - 80,
          duration: 800,
          ease: "Sine.easeOut",
          onComplete: () => b.destroy(),
        });
      }
      this.time.delayedCall(900, () => chest.destroy());
    }

    if (zone._gagType === "bathtubFoamSmile") {
      this.say("Narrator", "A spooky shadow rises… it’s FOAM making a smile!");
      const tub = this.add.rectangle(zone.x, zone.y + 20, 120, 60, 0x23233a).setStrokeStyle(2, 0x6c6ca8);
      const foam = this.add.text(zone.x, zone.y, "☺️", { fontFamily: "Arial", fontSize: "46px" }).setOrigin(0.5);
      const duck = this.add.text(zone.x + 70, zone.y + 30, "🦆", { fontFamily: "Arial", fontSize: "26px" }).setOrigin(0.5);
      this.say("Narrator", "The duck goes: QUACK-BOO!");
      this.tweens.add({
        targets: [foam, duck],
        y: "-=10",
        yoyo: true,
        repeat: 5,
        duration: 120,
      });
      this.time.delayedCall(1400, () => { tub.destroy(); foam.destroy(); duck.destroy(); });
    }
  }

  buildTouchUI() {
    if (!this.sys.game.device.input.touch) return null;

    // Simple D-pad left, buttons right
    const ui = {};

    ui.pad = {
      up: this.add.rectangle(70, H - 120, 48, 48, 0x1b1b2f).setAlpha(0.75).setInteractive(),
      left: this.add.rectangle(22, H - 72, 48, 48, 0x1b1b2f).setAlpha(0.75).setInteractive(),
      right:this.add.rectangle(118, H - 72, 48, 48, 0x1b1b2f).setAlpha(0.75).setInteractive(),
      down: this.add.rectangle(70, H - 24, 48, 48, 0x1b1b2f).setAlpha(0.75).setInteractive(),
    };
    this.add.text(70, H - 120, "↑", { fontFamily: "Arial", fontSize: "22px", color: "#fff" }).setOrigin(0.5);
    this.add.text(22, H - 72, "←", { fontFamily: "Arial", fontSize: "22px", color: "#fff" }).setOrigin(0.5);
    this.add.text(118, H - 72, "→", { fontFamily: "Arial", fontSize: "22px", color: "#fff" }).setOrigin(0.5);
    this.add.text(70, H - 24, "↓", { fontFamily: "Arial", fontSize: "22px", color: "#fff" }).setOrigin(0.5);

    ui.btnRun = this.add.rectangle(W - 90, H - 80, 120, 52, 0x1b1b2f).setAlpha(0.78).setInteractive();
    this.add.text(W - 90, H - 80, "RUN", { fontFamily: "Arial", fontSize: "18px", color: "#fff" }).setOrigin(0.5);

    ui.btnHide = this.add.rectangle(W - 90, H - 24, 120, 52, 0x1b1b2f).setAlpha(0.78).setInteractive();
    this.add.text(W - 90, H - 24, "HIDE", { fontFamily: "Arial", fontSize: "18px", color: "#fff" }).setOrigin(0.5);

    ui.state = { up:false, left:false, right:false, down:false, run:false, hideTap:false };

    const bindHold = (obj, key) => {
      obj.on("pointerdown", () => ui.state[key] = true);
      obj.on("pointerup", () => ui.state[key] = false);
      obj.on("pointerout", () => ui.state[key] = false);
    };

    bindHold(ui.pad.up, "up");
    bindHold(ui.pad.left, "left");
    bindHold(ui.pad.right, "right");
    bindHold(ui.pad.down, "down");
    bindHold(ui.btnRun, "run");

    ui.btnHide.on("pointerdown", () => ui.state.hideTap = true);

    // Fixed to camera
    Object.values(ui.pad).forEach(o => o.setScrollFactor(0).setDepth(200));
    ui.btnRun.setScrollFactor(0).setDepth(200);
    ui.btnHide.setScrollFactor(0).setDepth(200);

    return ui;
  }

  runTutorial() {
    const steps = [
      "Welcome to the Halloween House! Your mission: find 5 Trick Tokens 🍬",
      "Hear squeaky shoes? That means Goofy Elephant is nearby!",
      "Walk to stay quiet. Run (Shift/Run) makes more noise.",
      "Stand in a hiding spot and press Space/Hide. Hold still a moment… shhh!",
      "Click to toss a distraction. The elephant loves funny sounds!",
      "If you get caught, you’ll just get BOOPED and respawn safely. Let’s go!",
    ];
    let i = 0;

    const next = () => {
      if (i >= steps.length) {
        this.registry.set("tutorialDone", true);
        this.ui.action.setText("");
        return;
      }
      this.ui.action.setText("Tap / Click / Space to continue…");
      this.say("Narrator", steps[i]);
      i++;
    };

    next();

    const advance = () => next();
    this.input.once("pointerdown", advance);
    this.input.keyboard.once("keydown-SPACE", advance);

    // Keep listening until tutorial is done
    const loop = () => {
      if (this.registry.get("tutorialDone")) return;
      this.input.once("pointerdown", () => { next(); loop(); });
      this.input.keyboard.once("keydown-SPACE", () => { next(); loop(); });
    };
    loop();
  }

  update(time, deltaMs) {
    const dt = deltaMs / 1000;

    // Action text clears if not near door/exit
    this.ui.action.setText("");

    // Movement input
    let ix = 0, iy = 0;
    const touch = this.touchUI?.state;

    const up = this.cursors.up.isDown || this.keys.W.isDown || touch?.up;
    const down = this.cursors.down.isDown || this.keys.S.isDown || touch?.down;
    const left = this.cursors.left.isDown || this.keys.A.isDown || touch?.left;
    const right = this.cursors.right.isDown || this.keys.D.isDown || touch?.right;

    if (left) ix -= 1;
    if (right) ix += 1;
    if (up) iy -= 1;
    if (down) iy += 1;

    const running = (this.keys.SHIFT.isDown || touch?.run) && !this.playerHidden;
    const speed = running ? this.diff.playerRun : this.diff.playerWalk;

    // Hide toggle
    const wantsHide = Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || (touch?.hideTap);
    if (touch) touch.hideTap = false;

    if (wantsHide) {
      // Can only hide if overlapping a hide zone
      const canHideHere = this.hideZones.some(z => this.physics.overlap(this.player, z));
      if (!this.playerHidden && canHideHere) {
        this.playerHidden = true;
        this.player.setVelocity(0, 0);
        this.player.setAlpha(0.35);
        this.say("Player", "Shhh… hide mode!");
      } else if (this.playerHidden) {
        this.playerHidden = false;
        this.player.setAlpha(1);
        this.say("Player", "Okay… sneaking again!");
      } else {
        this.say("Narrator", "Find a hiding spot first!");
      }
    }

    // Apply movement (no movement while hidden)
    if (this.playerHidden) {
      this.player.setVelocity(0, 0);
    } else {
      const v = new Phaser.Math.Vector2(ix, iy);
      if (v.lengthSq() > 0) v.normalize().scale(speed);
      this.player.setVelocity(v.x, v.y);
    }

    // Noise meter
    const moving = (ix !== 0 || iy !== 0) && !this.playerHidden;
    if (running && moving) this.noise += this.diff.runNoisePerSec * this.noiseMult * dt;
    else if (moving) this.noise += this.diff.walkNoisePerSec * dt;
    else this.noise -= this.diff.quietRecoverPerSec * dt;

    if (this.playerHidden) this.noise -= this.diff.hideRecoverPerSec * dt;

    this.noise = Phaser.Math.Clamp(this.noise, 0, 100);

    // If noise gets high, elephant may investigate player area
    if (this.noise >= this.diff.hearThreshold && Math.random() < 0.03) {
      this.postSoundPing(this.player.x, this.player.y, this.noise);
    }

    // AI update
    this.updateElephantAI(dt);

    // UI: noise bar
    this.ui.noiseBar.width = 2 * this.noise; // 0..200
    this.ui.noiseBar.x = (W - 220);

    // Draw hide spot outlines if Goggles unlocked
    this.hideZoneGraphics.clear();
    const unlocks = this.registry.get("unlocks") || {};
    if (unlocks.goggles) {
      this.hideZoneGraphics.lineStyle(2, 0x6c6ca8, 0.8);
      this.room.hides.forEach(h => {
        this.hideZoneGraphics.strokeRect(h.x - h.w / 2, h.y - h.h / 2, h.w, h.h);
      });
    }

    // Tracker arrow if unlocked
    if (unlocks.tracker) {
      if (!this._trackerArrow) {
        this._trackerArrow = this.add.text(W - 40, 70, "➤", { fontFamily: "Arial", fontSize: "28px", color: "#ffffff" }).setScrollFactor(0);
        this._trackerArrow.setAlpha(0.85);
      }
      const t = this.findNearestUncollectedToken();
      if (t) {
        const ang = Phaser.Math.Angle.Between(this.player.x, this.player.y, t.x, t.y);
        this._trackerArrow.setRotation(ang);
      } else {
        this._trackerArrow.setRotation(0);
      }
    }
  }

  updateElephantAI(dt) {
    const ai = this.ai;

    // Occasional funny "tell"
    ai.tellTimer -= dt;
    if (ai.tellTimer <= 0) {
      ai.tellTimer = Phaser.Math.FloatBetween(1.6, 3.2);

      // ear wiggle = listening mode (we simulate by slightly increasing chance to investigate)
      if (Math.random() < 0.35) {
        if (Math.random() < 0.25) this.say("Elephant", "Ears on! I’m listenin’!");
        // small burst: if player noisy, investigate
        if (this.noise > this.diff.hearThreshold - 10 && Math.random() < 0.6) {
          this.postSoundPing(this.player.x, this.player.y, this.noise);
        }
      }

      // sniff chance
      if (Math.random() < this.diff.sniffChancePerSec * 2.0) {
        if (Math.random() < 0.25) this.say("Elephant", "Sniff sniff…");
        // If close and player hidden, elephant might "check" but never unfairly:
        const dist = Phaser.Math.Distance.Between(this.elephant.x, this.elephant.y, this.player.x, this.player.y);
        if (this.playerHidden && dist < 140 && Math.random() < 0.35) {
          // gentle "almost found you" moment
          this.say("Narrator", "The elephant sniffs nearby… stay still!");
        }
      }

      // sneeze confetti = pause, good time to run
      if (Math.random() < 0.2) {
        this.say("Elephant", "Confetti sneeze! ACHOO!");
        this.elephant.setVelocity(0, 0);
        return;
      }
    }

    // Vision check
    const sees = this.canSeePlayer();
    if (sees) {
      ai.state = "CHASE";
      ai.lastSeen = { x: this.player.x, y: this.player.y };
      ai.chaseMemory = 1.8;
    }

    if (ai.state === "PATROL") {
      const p = ai.patrolPoints[ai.patrolIndex];
      this.moveElephantToward(p.x, p.y, this.diff.elephantPatrolSpeed);

      if (Phaser.Math.Distance.Between(this.elephant.x, this.elephant.y, p.x, p.y) < 18) {
        ai.patrolIndex = (ai.patrolIndex + 1) % ai.patrolPoints.length;
      }
    }

    if (ai.state === "INVESTIGATE") {
      const t = ai.investigateTarget;
      if (t) {
        this.moveElephantToward(t.x, t.y, this.diff.elephantPatrolSpeed + 10);
      }
      ai.investigateTimeLeft -= dt;

      if (ai.investigateTimeLeft <= 0) {
        ai.state = "PATROL";
        ai.investigateTarget = null;
      }
    }

    if (ai.state === "CHASE") {
      if (!sees) {
        ai.chaseMemory -= dt;
        if (ai.chaseMemory <= 0) {
          // Lost them—investigate last known spot
          ai.state = "INVESTIGATE";
          ai.investigateTarget = ai.lastSeen ? { ...ai.lastSeen } : { x: this.elephant.x, y: this.elephant.y };
          ai.investigateTimeLeft = this.diff.investigateSeconds;
          return;
        }
      }

      const tx = this.playerHidden ? (ai.lastSeen?.x ?? this.player.x) : this.player.x;
      const ty = this.playerHidden ? (ai.lastSeen?.y ?? this.player.y) : this.player.y;
      this.moveElephantToward(tx, ty, this.diff.elephantChaseSpeed);

      // occasional voice line
      ai.nextVoice -= dt;
      if (ai.nextVoice <= 0) {
        ai.nextVoice = Phaser.Math.FloatBetween(1.4, 2.8);
        if (Math.random() < 0.4) this.say("Elephant", randPick(ELEPHANT_LINES));
      }
    }
  }

  moveElephantToward(x, y, speed) {
    const v = new Phaser.Math.Vector2(x - this.elephant.x, y - this.elephant.y);
    if (v.lengthSq() > 0.1) v.normalize().scale(speed);
    this.elephant.setVelocity(v.x, v.y);
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: W,
  height: H,
  physics: {
    default: "arcade",
    arcade: { debug: false }
  },
  scene: [MenuScene, RoomScene, WinScene],
};

new Phaser.Game(config);
