/* ==========================================================
   Trunk or Treat: The Boop Chase (Polished Phaser 3)
   - Better visuals (spotlight lighting, UI panels, particles)
   - More fun (gumdrops recharge distractions, hide meter)
   - Kid-safe: caught = BOOP + respawn, no harm
   ========================================================== */

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

// Difficulty tuning (same idea, slightly juiced)
const DIFFICULTIES = {
  easy: {
    label: "Tiny Toot (Easy)",
    playerWalk: 170,
    playerRun: 260,
    accel: 1200,
    drag: 900,
    runNoisePerSec: 16,
    walkNoisePerSec: 0,
    quietRecoverPerSec: 22,
    hideRecoverPerSec: 48,
    elephantPatrolSpeed: 105,
    elephantChaseSpeed: 165,
    sightRange: 225,
    hearThreshold: 55,
    sniffChancePerSec: 0.22,
    investigateSeconds: 2.4,
    hideSettleTime: 0.55,
  },
  normal: {
    label: "Spooky Scoot (Normal)",
    playerWalk: 160,
    playerRun: 245,
    accel: 1300,
    drag: 950,
    runNoisePerSec: 21,
    walkNoisePerSec: 1,
    quietRecoverPerSec: 18,
    hideRecoverPerSec: 42,
    elephantPatrolSpeed: 120,
    elephantChaseSpeed: 185,
    sightRange: 255,
    hearThreshold: 45,
    sniffChancePerSec: 0.30,
    investigateSeconds: 2.8,
    hideSettleTime: 0.65,
  },
  hard: {
    label: "Mega Trunk (Hard)",
    playerWalk: 155,
    playerRun: 235,
    accel: 1400,
    drag: 1050,
    runNoisePerSec: 26,
    walkNoisePerSec: 2,
    quietRecoverPerSec: 14,
    hideRecoverPerSec: 38,
    elephantPatrolSpeed: 135,
    elephantChaseSpeed: 210,
    sightRange: 280,
    hearThreshold: 40,
    sniffChancePerSec: 0.40,
    investigateSeconds: 3.2,
    hideSettleTime: 0.75,
  },
};

// Rooms (same structure; gumdrops spawn automatically)
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
      { x: 510, y: 300, w: 200, h: 30 },
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
    decor: [
      { x: 220, y: 460, emoji: "🎃" },
      { x: 760, y: 460, emoji: "🎃" },
      { x: 520, y: 240, emoji: "🕸️" },
    ],
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
      { x: 480, y: 270, w: 60,  h: 220 },
    ],
    hides: [
      { x: 160, y: 130, w: 90, h: 70, label: "Curtains" },
      { x: 790, y: 130, w: 90, h: 70, label: "Closet" },
      { x: 160, y: 410, w: 90, h: 70, label: "Umbrella Stand" },
    ],
    doors: [
      { to: 0, x: 30,  y: 270, w: 40, h: 140, label: "← Porch" },
      { to: 2, x: 930, y: 270, w: 40, h: 140, label: "→ Kitchen" },
      { to: 4, x: 480, y: 50, w: 160, h: 40, label: "Secret Hatch (Cape)", requires: "cape" },
    ],
    collectibles: [
      { type: "token", id: "token_2", x: 720, y: 400 },
      { type: "item",  id: "tracker", x: 240, y: 270 },
    ],
    gags: [{ type: "portraitSneezes", x: 760, y: 260, w: 90, h: 120 }],
    decor: [
      { x: 220, y: 120, emoji: "🖼️" },
      { x: 820, y: 120, emoji: "🧥" },
      { x: 520, y: 420, emoji: "🕸️" },
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
      { x: 480, y: 260, w: 300, h: 40 },
      { x: 260, y: 340, w: 120, h: 40 },
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
    decor: [
      { x: 260, y: 310, emoji: "🥣" },
      { x: 720, y: 160, emoji: "🍭" },
      { x: 820, y: 420, emoji: "🚪" },
    ],
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
      { x: 520, y: 320, w: 260, h: 160 },
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
    collectibles: [{ type: "item", id: "banana", x: 740, y: 420 }],
    gags: [{ type: "toyChestBalloons", x: 760, y: 130, w: 120, h: 120 }],
    decor: [
      { x: 240, y: 120, emoji: "🧸" },
      { x: 760, y: 120, emoji: "🧸" },
      { x: 520, y: 330, emoji: "🧱" },
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
      { x: 480, y: 270, w: 120, h: 260 },
      { x: 260, y: 210, w: 120, h: 120 },
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
    gags: [{ type: "bathtubFoamSmile", x: 740, y: 170, w: 160, h: 130 }],
    decor: [
      { x: 260, y: 210, emoji: "🪞" },
      { x: 740, y: 170, emoji: "🛁" },
      { x: 780, y: 420, emoji: "🚿" },
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
      { x: 420, y: 260, w: 220, h: 60 },
      { x: 640, y: 340, w: 140, h: 60 },
    ],
    hides: [
      { x: 340, y: 420, w: 110, h: 70, label: "Costume Trunk" },
      { x: 780, y: 420, w: 110, h: 70, label: "Hat Stack" },
    ],
    doors: [{ to: 4, x: 30, y: 270, w: 40, h: 140, label: "← Bathroom" }],
    collectibles: [{ type: "token", id: "token_5", x: 520, y: 160 }],
    exit: { x: 860, y: 460, w: 120, h: 60, label: "Candy Chute Exit" },
    gags: [],
    decor: [
      { x: 340, y: 420, emoji: "🎩" },
      { x: 780, y: 420, emoji: "🧢" },
      { x: 520, y: 160, emoji: "🌙" },
    ],
  },
];

function randPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Little helper: rounded panel
function panel(scene, x, y, w, h, alpha = 0.85) {
  const g = scene.add.graphics().setScrollFactor(0);
  g.fillStyle(0x141428, alpha);
  g.fillRoundedRect(x, y, w, h, 12);
  g.lineStyle(2, 0x6c6ca8, 0.95);
  g.strokeRoundedRect(x, y, w, h, 12);
  return g;
}

class MenuScene extends Phaser.Scene {
  constructor() { super("Menu"); }

  create() {
    this.cameras.main.setBackgroundColor("#0b0b12");

    // Floating spooky sparkles
    this.makeTextures();

    const spark = this.add.particles(0, 0, "spark");
    spark.createEmitter({
      x: { min: 0, max: W },
      y: { min: 0, max: H },
      lifespan: 2400,
      speedY: { min: -10, max: -30 },
      scale: { start: 1.0, end: 0 },
      quantity: 2,
      frequency: 180,
      alpha: { start: 0.7, end: 0 },
    });

    const cx = W / 2;

    this.add.text(cx, 78, GAME_TITLE, {
      fontFamily: "Arial",
      fontSize: "40px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(cx, 120, "Spooky-but-silly hide-and-seek. No harm—just BOOPS!", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#cfcfe8"
    }).setOrigin(0.5);

    this.add.text(cx, 170, "Pick Difficulty", {
      fontFamily: "Arial",
      fontSize: "22px",
      color: "#ffffff"
    }).setOrigin(0.5);

    const opts = [
      { key: "easy", y: 240 },
      { key: "normal", y: 305 },
      { key: "hard", y: 370 },
    ];

    opts.forEach(o => {
      const d = DIFFICULTIES[o.key];
      const box = this.add.rectangle(cx, o.y, 560, 54, 0x1b1b2f)
        .setStrokeStyle(2, 0x6c6ca8)
        .setInteractive({ useHandCursor: true });

      const label = this.add.text(cx, o.y, d.label, {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#ffffff"
      }).setOrigin(0.5);

      this.tweens.add({
        targets: [box, label],
        y: o.y - 2,
        yoyo: true,
        repeat: -1,
        duration: 1200,
        ease: "Sine.easeInOut"
      });

      box.on("pointerdown", () => {
        this.registry.set("difficultyKey", o.key);
        this.registry.set("tokens", 0);
        this.registry.set("score", 0);
        this.registry.set("boopsThisRun", 0);
        this.registry.set("tokenFlags", {});
        this.registry.set("itemFlags", {});
        this.registry.set("unlocks", { goggles:false, tracker:false, spray:false, banana:false, cape:false });
        this.registry.set("tutorialDone", false);
        this.scene.start("Room", { roomIndex: 0 });
      });
    });

    this.add.text(cx, 470,
      "Desktop: WASD/Arrows • Shift Run • Space Hide • E Use Door/Exit • Click toss distraction\niPad: Tap to toss • On-screen buttons for move/run/hide",
      { fontFamily: "Arial", fontSize: "14px", color: "#cfcfe8", align: "center", wordWrap: { width: 860 } }
    ).setOrigin(0.5);
  }

  makeTextures() {
    if (this.textures.exists("spark")) return;

    // Spark
    {
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 1);
      g.fillRect(0, 0, 3, 3);
      g.generateTexture("spark", 3, 3);
      g.destroy();
    }
  }
}

class WinScene extends Phaser.Scene {
  constructor() { super("Win"); }
  create() {
    this.cameras.main.setBackgroundColor("#101020");
    const cx = W / 2;

    const p = panel(this, cx - 320, 120, 640, 280, 0.9);

    this.add.text(cx, 170, "YOU WIN!", {
      fontFamily: "Arial",
      fontSize: "54px",
      color: "#ffffff",
      stroke: "#000",
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(cx, 230, "You rode the Candy Chute and escaped the BOOP!", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#cfcfe8"
    }).setOrigin(0.5);

    const boops = this.registry.get("boopsThisRun") ?? 0;
    const score = this.registry.get("score") ?? 0;

    this.add.text(cx, 270, `Boops this run: ${boops}   •   Score: ${score}`, {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#cfcfe8"
    }).setOrigin(0.5);

    const btn = this.add.rectangle(cx, 350, 260, 56, 0x1b1b2f)
      .setStrokeStyle(2, 0x6c6ca8)
      .setInteractive({ useHandCursor: true });

    this.add.text(cx, 350, "Play Again", { fontFamily: "Arial", fontSize: "20px", color: "#ffffff" }).setOrigin(0.5);

    btn.on("pointerdown", () => this.scene.start("Menu"));

    // little celebration sparkles
    const conf = this.add.particles(0, 0, "confetti");
    conf.createEmitter({
      x: { min: 80, max: W - 80 },
      y: 0,
      speedY: { min: 80, max: 170 },
      speedX: { min: -40, max: 40 },
      lifespan: 1400,
      quantity: 3,
      frequency: 90,
      scale: { start: 1, end: 0 },
      alpha: { start: 0.8, end: 0 },
    });
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

    this.makeTextures();
    this.cameras.main.setBackgroundColor(this.room.bg);

    this.physics.world.setBounds(0, 0, W, H);

    // Background "floor" grid for readability
    this.floor = this.add.graphics();
    this.floor.fillStyle(0x0b0b12, 0.18);
    for (let x = 0; x < W; x += 48) this.floor.fillRect(x, 0, 1, H);
    for (let y = 0; y < H; y += 48) this.floor.fillRect(0, y, W, 1);

    // Decor emojis (cheap charm)
    (this.room.decor || []).forEach(d => {
      this.add.text(d.x, d.y, d.emoji, { fontFamily: "Arial", fontSize: "26px" }).setOrigin(0.5).setAlpha(0.8);
    });

    // Obstacles
    this.walls = this.physics.add.staticGroup();
    this.room.obstacles.forEach(o => {
      const wall = this.add.rectangle(o.x, o.y, o.w, o.h, 0x23233a).setStrokeStyle(2, 0x3b3b5a);
      this.physics.add.existing(wall, true);
      this.walls.add(wall);
    });

    // Hiding zones
    this.hideZones = [];
    this.hideZoneGraphics = this.add.graphics().setDepth(10);

    this.room.hides.forEach(h => {
      const z = this.add.zone(h.x, h.y, h.w, h.h);
      this.physics.add.existing(z, true);
      z._hideLabel = h.label;
      this.hideZones.push(z);

      // Cute marker icon near hide zones
      this.add.text(h.x, h.y - (h.h / 2) - 18, "🫥", { fontFamily: "Arial", fontSize: "18px" })
        .setOrigin(0.5).setAlpha(0.55);
    });

    // Doors
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

      this.add.text(d.x, d.y - 40, "🚪", { fontFamily: "Arial", fontSize: "24px" }).setOrigin(0.5).setAlpha(0.85);
    });

    // Exit zone (attic)
    this.exitZone = null;
    if (this.room.exit) {
      const e = this.room.exit;
      this.exitZone = this.add.zone(e.x, e.y, e.w, e.h);
      this.physics.add.existing(this.exitZone, true);
      this.add.text(e.x, e.y - 30, "🍬", { fontFamily: "Arial", fontSize: "28px" }).setOrigin(0.5);
    }

    // Player + shadow
    this.playerHidden = false;
    this.hideProgress = 0; // 0..1 settle meter

    this.playerShadow = this.add.ellipse(this.room.spawn.x, this.room.spawn.y + 18, 26, 10, 0x000000, 0.35);
    this.player = this.physics.add.sprite(this.room.spawn.x, this.room.spawn.y, "player");
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(26, 26);
    this.player.body.setDrag(this.diff.drag, this.diff.drag);
    this.player.body.setMaxSpeed(this.diff.playerRun);

    // Elephant + shadow
    this.elephantShadow = this.add.ellipse(this.room.elephantSpawn.x, this.room.elephantSpawn.y + 24, 40, 14, 0x000000, 0.35);
    this.elephant = this.physics.add.sprite(this.room.elephantSpawn.x, this.room.elephantSpawn.y, "elephant");
    this.elephant.setCollideWorldBounds(true);
    this.elephant.body.setSize(44, 44);

    // Mood icon above elephant
    this.eMood = this.add.text(this.elephant.x, this.elephant.y - 40, "💤", { fontFamily: "Arial", fontSize: "22px" })
      .setOrigin(0.5).setAlpha(0.9);

    // Physics
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.elephant, this.walls);
    this.physics.add.overlap(this.player, this.elephant, () => this.onBoop(), null, this);

    // Collectibles
    this.collectGroup = this.physics.add.staticGroup();
    this.spawnCollectibles();
    this.physics.add.overlap(this.player, this.collectGroup, (p, it) => this.pickup(it), null, this);

    // Gumdrops (fun + recharge)
    this.gumdropGroup = this.physics.add.staticGroup();
    this.spawnGumdrops(3);
    this.physics.add.overlap(this.player, this.gumdropGroup, (p, g) => this.pickGumdrop(g), null, this);

    // Noise + charges
    this.noise = 0;
    this.noiseMult = 1;

    this.distractionCharges = 1;
    this.maxCharges = 1;

    // AI
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
      sneezeCooldown: 0,
    };

    // Input
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

    // Tap/click toss
    this.input.on("pointerdown", (p) => {
      if (p.y < 110) return; // don't throw on top UI
      this.tryTossDistraction(p.worldX, p.worldY);
    });

    // UI panels
    panel(this, 10, 10, 430, 92, 0.85);
    panel(this, W - 300, 10, 290, 92, 0.85);

    this.ui = {};
    this.ui.room = this.add.text(22, 18, this.room.key, { fontFamily: "Arial", fontSize: "18px", color: "#ffffff" }).setScrollFactor(0);
    this.ui.tokens = this.add.text(22, 42, "", { fontFamily: "Arial", fontSize: "16px", color: "#cfcfe8" }).setScrollFactor(0);
    this.ui.score  = this.add.text(22, 66, "", { fontFamily: "Arial", fontSize: "16px", color: "#cfcfe8" }).setScrollFactor(0);

    this.ui.noiseLabel = this.add.text(W - 286, 18, "Noise", { fontFamily: "Arial", fontSize: "14px", color: "#ffffff" }).setScrollFactor(0);
    this.ui.noiseBarBg = this.add.rectangle(W - 150, 44, 240, 14, 0x20203a).setStrokeStyle(1, 0x5e5e90).setScrollFactor(0);
    this.ui.noiseBar = this.add.rectangle(W - 270, 44, 0, 10, 0x7f7fff).setOrigin(0, 0.5).setScrollFactor(0);

    this.ui.charges = this.add.text(W - 286, 66, "", { fontFamily: "Arial", fontSize: "16px", color: "#cfcfe8" }).setScrollFactor(0);

    this.ui.action = this.add.text(W / 2, H - 22, "", { fontFamily: "Arial", fontSize: "14px", color: "#cfcfe8" })
      .setOrigin(0.5).setScrollFactor(0);

    this.ui.bubble = this.add.text(W / 2, 120, "", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: 860 },
      stroke: "#000",
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    // Hide settle bar
    this.ui.hideBarBg = this.add.rectangle(W / 2, H - 56, 220, 14, 0x20203a).setStrokeStyle(1, 0x5e5e90)
      .setScrollFactor(0).setAlpha(0);
    this.ui.hideBar = this.add.rectangle(W / 2 - 110, H - 56, 0, 10, 0x7f7fff).setOrigin(0, 0.5)
      .setScrollFactor(0).setAlpha(0);

    // Lighting overlay (spotlight)
    this.darkness = this.add.graphics().setDepth(150).setScrollFactor(0);
    this.spot = this.add.graphics().setDepth(151).setScrollFactor(0);
    this.spot.setBlendMode(Phaser.BlendModes.ERASE);

    // Touch controls
    this.touchUI = this.buildTouchUI();

    // Gags
    this.gagZones = [];
    (this.room.gags || []).forEach(g => {
      const z = this.add.zone(g.x, g.y, g.w, g.h);
      this.physics.add.existing(z, true);
      z._gagType = g.type;
      z._gagDone = false;
      this.gagZones.push(z);
    });

    // Overlaps
    this.physics.add.overlap(this.player, this.doorZones, (p, z) => this.enterDoor(z), null, this);
    if (this.exitZone) this.physics.add.overlap(this.player, this.exitZone, () => this.tryExit(), null, this);
    if (this.gagZones.length) this.physics.add.overlap(this.player, this.gagZones, (p, z) => this.triggerGag(z), null, this);

    // Apply unlocks now
    this.applyUnlocks();

    // Room title splash
    this.roomTitle = this.add.text(W / 2, 260, this.room.key, {
      fontFamily: "Arial",
      fontSize: "42px",
      color: "#ffffff",
      stroke: "#000",
      strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({
      targets: this.roomTitle,
      alpha: 1,
      duration: 250,
      yoyo: true,
      hold: 650,
      ease: "Sine.easeOut"
    });

    // Tutorial
    if (!this.registry.get("tutorialDone")) this.runTutorial();
    else this.say("Narrator", "Collect 5 Trick Tokens 🍬. If you get caught, you just get BOOPED and respawn!");

    this.updateUI();
  }

  makeTextures() {
    if (this.textures.exists("player")) return;

    // Player texture (cuter)
    {
      const g = this.add.graphics();
      g.fillStyle(0x9fe2ff, 1);
      g.fillCircle(16, 16, 14);
      g.fillStyle(0x0b0b12, 1);
      g.fillCircle(11, 13, 2);
      g.fillCircle(21, 13, 2);
      g.lineStyle(2, 0x0b0b12, 1);
      g.beginPath(); g.arc(16, 19, 6, 0, Math.PI, false); g.strokePath();
      // tiny candy hat
      g.fillStyle(0xffa13a, 1);
      g.fillRoundedRect(10, 3, 12, 6, 3);
      g.generateTexture("player", 32, 32);
      g.destroy();
    }

    // Elephant texture (goofy + big ears)
    {
      const g = this.add.graphics();
      g.fillStyle(0xb7b7c9, 1);
      g.fillCircle(24, 24, 22);
      g.fillStyle(0xa8a8bf, 1);
      g.fillEllipse(6, 24, 16, 22);
      g.fillEllipse(42, 24, 16, 22);
      g.fillStyle(0x9a9ab3, 1);
      g.fillRoundedRect(19, 30, 10, 18, 5);
      g.fillStyle(0x0b0b12, 1);
      g.fillCircle(17, 20, 2);
      g.fillCircle(31, 20, 2);
      g.lineStyle(2, 0x0b0b12, 1);
      g.beginPath(); g.arc(24, 27, 9, 0, Math.PI, false); g.strokePath();
      g.generateTexture("elephant", 48, 48);
      g.destroy();
    }

    // Token
    {
      const g = this.add.graphics();
      g.fillStyle(0xffa13a, 1);
      g.fillCircle(12, 12, 10);
      g.fillStyle(0x0b0b12, 1);
      g.fillCircle(8, 10, 2);
      g.fillCircle(16, 10, 2);
      g.lineStyle(2, 0x0b0b12, 1);
      g.beginPath(); g.arc(12, 14, 6, 0, Math.PI, false); g.strokePath();
      g.generateTexture("token", 24, 24);
      g.destroy();
    }

    // Item
    {
      const g = this.add.graphics();
      g.fillStyle(0xfff1a6, 1);
      g.fillCircle(12, 12, 10);
      g.fillStyle(0x0b0b12, 1);
      g.fillCircle(12, 12, 3);
      g.generateTexture("item", 24, 24);
      g.destroy();
    }

    // Confetti
    {
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 1);
      g.fillRect(0, 0, 4, 4);
      g.generateTexture("confetti", 4, 4);
      g.destroy();
    }

    // Gumdrop (recharge)
    {
      const g = this.add.graphics();
      g.fillStyle(0x7fffd4, 1);
      g.fillRoundedRect(2, 4, 20, 16, 6);
      g.fillStyle(0x0b0b12, 1);
      g.fillCircle(9, 12, 1.5);
      g.fillCircle(15, 12, 1.5);
      g.generateTexture("gumdrop", 24, 24);
      g.destroy();
    }

    // Run puff
    {
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 1);
      g.fillCircle(10, 10, 10);
      g.generateTexture("puff", 20, 20);
      g.destroy();
    }
  }

  applyUnlocks() {
    const unlocks = this.registry.get("unlocks") || {};
    this.noiseMult = unlocks.spray ? 0.75 : 1.0;

    this.maxCharges = 1 + (unlocks.banana ? 1 : 0);
    this.distractionCharges = Phaser.Math.Clamp(this.distractionCharges || this.maxCharges, 0, this.maxCharges);
  }

  spawnCollectibles() {
    const tokenFlags = this.registry.get("tokenFlags") || {};
    const itemFlags = this.registry.get("itemFlags") || {};

    this.room.collectibles.forEach(c => {
      if (c.type === "token" && tokenFlags[c.id]) return;
      if (c.type === "item" && itemFlags[c.id]) return;

      const key = (c.type === "token") ? "token" : "item";
      const s = this.collectGroup.create(c.x, c.y, key);
      s._collectType = c.type;
      s._collectId = c.id;

      this.tweens.add({
        targets: s,
        y: s.y - 8,
        duration: 650,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });
  }

  spawnGumdrops(count) {
    // Spawn safe, random-ish spots that aren't inside obstacles
    const tries = 30;
    let placed = 0;

    for (let t = 0; t < tries && placed < count; t++) {
      const x = Phaser.Math.Between(120, W - 120);
      const y = Phaser.Math.Between(140, H - 120);

      const blocked = this.room.obstacles.some(o =>
        x > (o.x - o.w / 2 - 16) && x < (o.x + o.w / 2 + 16) &&
        y > (o.y - o.h / 2 - 16) && y < (o.y + o.h / 2 + 16)
      );
      if (blocked) continue;

      const g = this.gumdropGroup.create(x, y, "gumdrop");
      this.tweens.add({
        targets: g,
        y: y - 6,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      placed++;
    }
  }

  pickGumdrop(g) {
    const score = (this.registry.get("score") || 0) + 10;
    this.registry.set("score", score);

    // Recharge distraction a bit
    this.distractionCharges = Phaser.Math.Clamp(this.distractionCharges + 1, 0, this.maxCharges);

    // Pop effect
    const puff = this.add.image(g.x, g.y, "puff").setAlpha(0.6);
    this.tweens.add({
      targets: puff,
      scale: 1.8,
      alpha: 0,
      duration: 350,
      onComplete: () => puff.destroy()
    });

    g.destroy();
    this.say("Player", "Gumdrop power! +1 distraction!");
    this.updateUI();
  }

  pickup(itemSprite) {
    const type = itemSprite._collectType;
    const id = itemSprite._collectId;

    if (type === "token") {
      const flags = this.registry.get("tokenFlags") || {};
      flags[id] = true;
      this.registry.set("tokenFlags", flags);

      this.registry.set("tokens", (this.registry.get("tokens") || 0) + 1);
      this.registry.set("score", (this.registry.get("score") || 0) + 50);

      // confetti pop
      this.popConfetti(itemSprite.x, itemSprite.y, 16);

      this.say("Player", randPick(PLAYER_LINES));
    } else {
      const flags = this.registry.get("itemFlags") || {};
      flags[id] = true;
      this.registry.set("itemFlags", flags);

      const unlocks = this.registry.get("unlocks") || { goggles:false, tracker:false, spray:false, banana:false, cape:false };
      if (id === "goggles") unlocks.goggles = true;
      if (id === "tracker") unlocks.tracker = true;
      if (id === "spray") unlocks.spray = true;
      if (id === "banana") unlocks.banana = true;
      if (id === "cape") unlocks.cape = true;
      this.registry.set("unlocks", unlocks);

      this.registry.set("score", (this.registry.get("score") || 0) + 100);

      this.applyUnlocks();
      this.popConfetti(itemSprite.x, itemSprite.y, 22);

      const itemName = {
        goggles: "Giggle Goggles (hide spots glow!)",
        tracker: "Tracker Tot (points to tokens!)",
        spray: "Squeak-B-Gone Spray (quieter running!)",
        banana: "Banana-Phone (extra distraction!)",
        cape: "Brave Jellybean Cape (secret hatch!)",
      }[id] || "Mystery Thing";

      this.say("Narrator", `Unlocked: ${itemName}`);
      this.say("Elephant", randPick(ELEPHANT_LINES));
    }

    itemSprite.destroy();
    this.updateUI();
  }

  updateUI() {
    const tokens = this.registry.get("tokens") || 0;
    const score = this.registry.get("score") || 0;

    this.ui.tokens.setText(`Trick Tokens: ${tokens}/5`);
    this.ui.score.setText(`Score: ${score}`);

    this.ui.charges.setText(`Distractions: ${this.distractionCharges}/${this.maxCharges}  (tap/click to toss)`);
  }

  say(who, text) {
    this.ui.bubble.setText(`${who}: ${text}`);
    this.ui.bubble.setAlpha(1);
    this.tweens.killTweensOf(this.ui.bubble);
    this.tweens.add({ targets: this.ui.bubble, alpha: 0, duration: 1200, delay: 1400 });
  }

  popConfetti(x, y, qty) {
    const p = this.add.particles(0, 0, "confetti", {
      x, y,
      speed: { min: 40, max: 180 },
      lifespan: 500,
      quantity: qty,
      scale: { start: 1, end: 0 },
      alpha: { start: 0.85, end: 0 },
    });
    this.time.delayedCall(520, () => p.destroy());
  }

  makePatrolPoints() {
    return [
      { x: 170, y: 150 },
      { x: 790, y: 150 },
      { x: 790, y: 410 },
      { x: 170, y: 410 },
    ];
  }

  canSeePlayer() {
    if (this.playerHidden) return false;

    const dist = Phaser.Math.Distance.Between(this.elephant.x, this.elephant.y, this.player.x, this.player.y);
    if (dist > this.diff.sightRange) return false;

    const steps = 10;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const x = Phaser.Math.Linear(this.elephant.x, this.player.x, t);
      const y = Phaser.Math.Linear(this.elephant.y, this.player.y, t);
      const blocked = this.room.obstacles.some(o =>
        x > (o.x - o.w / 2) && x < (o.x + o.w / 2) &&
        y > (o.y - o.h / 2) && y < (o.y + o.h / 2)
      );
      if (blocked) return false;
    }
    return true;
  }

  postSoundPing(x, y, strength = 60) {
    if (strength >= this.diff.hearThreshold) {
      this.ai.state = "INVESTIGATE";
      this.ai.investigateTarget = { x, y };
      this.ai.investigateTimeLeft = this.diff.investigateSeconds;
      this.eMood.setText("🧐");
      if (Math.random() < 0.45) this.say("Elephant", "Huh? A funny sound!");
    }
  }

  tryTossDistraction(x, y) {
    if (this.distractionCharges <= 0) {
      this.say("Narrator", "No distractions left! Find Gumdrops to recharge.");
      return;
    }
    if (this.playerHidden) return;

    this.distractionCharges -= 1;
    this.updateUI();

    // Visual target ping
    const ring = this.add.circle(x, y, 10, 0xffffff, 0.25);
    this.tweens.add({
      targets: ring,
      radius: 40,
      alpha: 0,
      duration: 420,
      onComplete: () => ring.destroy()
    });

    this.say("Player", "Distraction deployed!");
    this.postSoundPing(x, y, 80);
  }

  onBoop() {
    if (this.playerHidden) return;
    if (this._boopCooldown) return;

    this._boopCooldown = true;
    this.time.delayedCall(900, () => (this._boopCooldown = false));

    this.registry.set("boopsThisRun", (this.registry.get("boopsThisRun") || 0) + 1);

    this.cameras.main.shake(180, 0.006);
    this.popConfetti(this.player.x, this.player.y, 28);

    this.say("Elephant", "BOOP-A-DOOP!");
    this.say("Player", "Booped! Respawn time!");

    // Respawn + reset
    this.player.setPosition(this.room.spawn.x, this.room.spawn.y);
    this.player.body.setVelocity(0, 0);

    this.playerHidden = false;
    this.hideProgress = 0;
    this.player.setAlpha(1);

    this.ai.state = "PATROL";
    this.ai.investigateTarget = null;
    this.ai.investigateTimeLeft = 0;
    this.ai.chaseMemory = 0;

    this.eMood.setText("💤");
  }

  enterDoor(zone) {
    if (!this.keys.E.isDown) {
      this.ui.action.setText(`Press E to enter: ${zone._label}`);
      return;
    }

    // Fade transition
    this.cameras.main.fadeOut(180, 0, 0, 0);
    this.time.delayedCall(190, () => this.scene.restart({ roomIndex: zone._toRoom }));
  }

  tryExit() {
    const tokens = this.registry.get("tokens") || 0;

    if (!this.keys.E.isDown) {
      this.ui.action.setText("Press E to ride the Candy Chute!");
      return;
    }

    if (tokens >= 5) {
      this.cameras.main.fadeOut(240, 0, 0, 0);
      this.time.delayedCall(250, () => this.scene.start("Win"));
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
        repeat: 6,
        duration: 70,
        onComplete: () => {
          face.setText("🤧");
          this.say("Narrator", "The portrait sneezes glitter! ACHOO!");
          this.popConfetti(zone.x, zone.y, 18);
          this.time.delayedCall(700, () => { portrait.destroy(); face.destroy(); });
        }
      });
    }

    if (zone._gagType === "toyChestBalloons") {
      this.say("Narrator", "The toy chest pops open… BOING!");
      const chest = this.add.rectangle(zone.x, zone.y + 20, 90, 50, 0x3a2b2b).setStrokeStyle(2, 0x6c6ca8);
      for (let i = 0; i < 3; i++) {
        const b = this.add.text(zone.x + (-22 + i * 22), zone.y - 10, "🎈", { fontFamily: "Arial", fontSize: "26px" }).setOrigin(0.5);
        this.tweens.add({ targets: b, y: b.y - 90, duration: 820, ease: "Sine.easeOut", onComplete: () => b.destroy() });
      }
      this.time.delayedCall(900, () => chest.destroy());
    }

    if (zone._gagType === "bathtubFoamSmile") {
      this.say("Narrator", "A spooky shadow rises… it’s FOAM making a smile!");
      const tub = this.add.rectangle(zone.x, zone.y + 20, 120, 60, 0x23233a).setStrokeStyle(2, 0x6c6ca8);
      const foam = this.add.text(zone.x, zone.y, "☺️", { fontFamily: "Arial", fontSize: "46px" }).setOrigin(0.5);
      const duck = this.add.text(zone.x + 70, zone.y + 30, "🦆", { fontFamily: "Arial", fontSize: "26px" }).setOrigin(0.5);
      this.say("Narrator", "The duck goes: QUACK-BOO!");
      this.tweens.add({ targets: [foam, duck], y: "-=10", yoyo: true, repeat: 6, duration: 120 });
      this.time.delayedCall(1400, () => { tub.destroy(); foam.destroy(); duck.destroy(); });
    }
  }

  buildTouchUI() {
    if (!this.sys.game.device.input.touch) return null;

    const ui = {};
    ui.pad = {
      up: this.add.rectangle(70, H - 120, 52, 52, 0x1b1b2f).setAlpha(0.8).setInteractive(),
      left: this.add.rectangle(22, H - 72, 52, 52, 0x1b1b2f).setAlpha(0.8).setInteractive(),
      right:this.add.rectangle(118, H - 72, 52, 52, 0x1b1b2f).setAlpha(0.8).setInteractive(),
      down: this.add.rectangle(70, H - 24, 52, 52, 0x1b1b2f).setAlpha(0.8).setInteractive(),
    };
    this.add.text(70, H - 120, "↑", { fontFamily: "Arial", fontSize: "22px", color: "#fff" }).setOrigin(0.5).setScrollFactor(0).setDepth(300);
    this.add.text(22, H - 72, "←", { fontFamily: "Arial", fontSize: "22px", color: "#fff" }).setOrigin(0.5).setScrollFactor(0).setDepth(300);
    this.add.text(118, H - 72, "→", { fontFamily: "Arial", fontSize: "22px", color: "#fff" }).setOrigin(0.5).setScrollFactor(0).setDepth(300);
    this.add.text(70, H - 24, "↓", { fontFamily: "Arial", fontSize: "22px", color: "#fff" }).setOrigin(0.5).setScrollFactor(0).setDepth(300);

    ui.btnRun = this.add.rectangle(W - 90, H - 80, 120, 52, 0x1b1b2f).setAlpha(0.82).setInteractive();
    this.add.text(W - 90, H - 80, "RUN", { fontFamily: "Arial", fontSize: "18px", color: "#fff" }).setOrigin(0.5).setScrollFactor(0).setDepth(300);

    ui.btnHide = this.add.rectangle(W - 90, H - 24, 120, 52, 0x1b1b2f).setAlpha(0.82).setInteractive();
    this.add.text(W - 90, H - 24, "HIDE", { fontFamily: "Arial", fontSize: "18px", color: "#fff" }).setOrigin(0.5).setScrollFactor(0).setDepth(300);

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

    Object.values(ui.pad).forEach(o => o.setScrollFactor(0).setDepth(300));
    ui.btnRun.setScrollFactor(0).setDepth(300);
    ui.btnHide.setScrollFactor(0).setDepth(300);

    return ui;
  }

  runTutorial() {
    const steps = [
      "Welcome! Find 5 Trick Tokens 🍬",
      "Elephant is goofy—if it catches you, it just BOOPS you back safely.",
      "Run is louder (Shift / RUN). Noise makes Elephant investigate!",
      "Stand in a hide spot and press Hide (Space / HIDE)… hold still to fully hide!",
      "Tap/click to toss a distraction. Gumdrops recharge distractions!",
      "Doors + exit: press E (or walk in and press E on desktop). Go go go!",
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

    const loop = () => {
      if (this.registry.get("tutorialDone")) return;
      this.input.once("pointerdown", () => { next(); loop(); });
      this.input.keyboard.once("keydown-SPACE", () => { next(); loop(); });
    };
    loop();
  }

  update(time, deltaMs) {
    const dt = deltaMs / 1000;
    this.ui.action.setText("");

    // Update shadows + mood icon follow
    this.playerShadow.setPosition(this.player.x, this.player.y + 18);
    this.elephantShadow.setPosition(this.elephant.x, this.elephant.y + 24);
    this.eMood.setPosition(this.elephant.x, this.elephant.y - 40);

    // Input
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

    // Hide toggle
    const wantsHide = Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || (touch?.hideTap);
    if (touch) touch.hideTap = false;

    if (wantsHide) {
      const inHide = this.hideZones.some(z => this.physics.overlap(this.player, z));
      if (!this.playerHidden && inHide) {
        // start hiding (requires settle)
        this.playerHidden = true;
        this.hideProgress = 0;
        this.player.body.setVelocity(0, 0);
        this.player.setAlpha(0.7);
        this.say("Player", "Okay… hold your giggles!");
      } else if (this.playerHidden) {
        // unhide
        this.playerHidden = false;
        this.hideProgress = 0;
        this.player.setAlpha(1);
        this.ui.hideBarBg.setAlpha(0);
        this.ui.hideBar.setAlpha(0);
        this.say("Player", "Sneak mode!");
      } else {
        this.say("Narrator", "Hide spots are marked with 🫥");
      }
    }

    // Movement physics (smooth acceleration)
    if (!this.playerHidden) {
      const speed = running ? this.diff.playerRun : this.diff.playerWalk;
      const v = new Phaser.Math.Vector2(ix, iy);
      if (v.lengthSq() > 0) v.normalize();

      const ax = v.x * this.diff.accel;
      const ay = v.y * this.diff.accel;
      this.player.body.setAcceleration(ax, ay);
      this.player.body.setMaxSpeed(speed);
    } else {
      this.player.body.setAcceleration(0, 0);
      this.player.body.setVelocity(0, 0);
    }

    // Hide settle meter (must stay still and stay in hide zone)
    if (this.playerHidden) {
      const still = this.player.body.velocity.length() < 8;
      const inHide = this.hideZones.some(z => this.physics.overlap(this.player, z));

      this.ui.hideBarBg.setAlpha(1);
      this.ui.hideBar.setAlpha(1);

      if (still && inHide) {
        this.hideProgress = Phaser.Math.Clamp(this.hideProgress + (dt / this.diff.hideSettleTime), 0, 1);
      } else {
        this.hideProgress = Phaser.Math.Clamp(this.hideProgress - dt * 1.5, 0, 1);
      }

      this.ui.hideBar.width = 220 * this.hideProgress;
      this.ui.hideBar.x = (W / 2 - 110);

      // Fully hidden at 100%
      if (this.hideProgress >= 1) this.player.setAlpha(0.35);
      else this.player.setAlpha(0.7);
    }

    // Running puffs (fun juice)
    const moving = (ix !== 0 || iy !== 0) && !this.playerHidden;
    if (running && moving && Math.random() < 0.08) {
      const puff = this.add.image(this.player.x - ix * 10, this.player.y - iy * 10, "puff").setAlpha(0.35);
      puff.setScale(0.6);
      this.tweens.add({
        targets: puff,
        scale: 1.3,
        alpha: 0,
        duration: 420,
        onComplete: () => puff.destroy()
      });
    }

    // Noise meter
    if (running && moving) this.noise += this.diff.runNoisePerSec * this.noiseMult * dt;
    else if (moving) this.noise += this.diff.walkNoisePerSec * dt;
    else this.noise -= this.diff.quietRecoverPerSec * dt;

    if (this.playerHidden) this.noise -= this.diff.hideRecoverPerSec * dt;
    this.noise = Phaser.Math.Clamp(this.noise, 0, 100);

    // If noise high, occasionally ping elephant
    if (this.noise >= this.diff.hearThreshold && Math.random() < 0.03) {
      this.postSoundPing(this.player.x, this.player.y, this.noise);
    }

    // AI
    this.updateElephantAI(dt);

    // Noise bar UI
    this.ui.noiseBar.width = 2.4 * this.noise; // 0..240
    this.ui.noiseBar.x = (W - 270);

    // Hide outlines if goggles unlocked
    this.hideZoneGraphics.clear();
    const unlocks = this.registry.get("unlocks") || {};
    if (unlocks.goggles) {
      this.hideZoneGraphics.lineStyle(2, 0x6c6ca8, 0.75);
      this.room.hides.forEach(h => {
        this.hideZoneGraphics.strokeRect(h.x - h.w / 2, h.y - h.h / 2, h.w, h.h);
      });
    }

    // Token tracker arrow (simple)
    if (unlocks.tracker) {
      if (!this._trackerArrow) {
        this._trackerArrow = this.add.text(W - 40, 110, "➤", { fontFamily: "Arial", fontSize: "28px", color: "#ffffff" }).setScrollFactor(0);
        this._trackerArrow.setAlpha(0.85);
      }
      const t = this.findNearestUncollectedToken();
      if (t) {
        const ang = Phaser.Math.Angle.Between(this.player.x, this.player.y, t.x, t.y);
        this._trackerArrow.setRotation(ang);
      }
    }

    // Lighting: draw darkness + erase spotlight
    this.darkness.clear();
    this.darkness.fillStyle(0x000000, 0.50);
    this.darkness.fillRect(0, 0, W, H);

    this.spot.clear();
    const r = this.playerHidden ? 85 : (running ? 120 : 105);
    this.spot.fillStyle(0xffffff, 1);
    this.spot.fillCircle(this.player.x, this.player.y, r);
  }

  findNearestUncollectedToken() {
    const flags = this.registry.get("tokenFlags") || {};
    let best = null;

    for (let r = 0; r < ROOMS.length; r++) {
      const room = ROOMS[r];
      for (const c of room.collectibles) {
        if (c.type !== "token") continue;
        if (flags[c.id]) continue;

        const wx = (r === this.roomIndex) ? c.x : (r < this.roomIndex ? 60 : 900);
        const wy = (r === this.roomIndex) ? c.y : 270;
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, wx, wy);
        if (!best || d < best.d) best = { x: wx, y: wy, d };
      }
    }
    return best;
  }

  updateElephantAI(dt) {
    const ai = this.ai;

    ai.tellTimer -= dt;
    ai.sneezeCooldown = Math.max(ai.sneezeCooldown - dt, 0);

    const sees = this.canSeePlayer() && (!this.playerHidden || this.hideProgress < 1);

    if (sees) {
      ai.state = "CHASE";
      ai.lastSeen = { x: this.player.x, y: this.player.y };
      ai.chaseMemory = 1.8;
      this.eMood.setText("🏃");
    }

    // Funny tells
    if (ai.tellTimer <= 0) {
      ai.tellTimer = Phaser.Math.FloatBetween(1.6, 3.1);

      // Ear wiggle = listening (slightly more likely to investigate)
      if (Math.random() < 0.35) {
        if (Math.random() < 0.35) this.say("Elephant", "Ears on! I’m listenin’!");
        this.eMood.setText("👂");
        if (this.noise > this.diff.hearThreshold - 10 && Math.random() < 0.7) {
          this.postSoundPing(this.player.x, this.player.y, this.noise);
        }
      }

      // Sniff tell (adds tension but fair)
      if (Math.random() < this.diff.sniffChancePerSec * 2.0) {
        if (Math.random() < 0.3) this.say("Elephant", "Sniff sniff…");
        if (this.playerHidden && this.hideProgress >= 1) {
          const dist = Phaser.Math.Distance.Between(this.elephant.x, this.elephant.y, this.player.x, this.player.y);
          if (dist < 145 && Math.random() < 0.35) {
            this.say("Narrator", "Stay still… the elephant is sniffing nearby!");
          }
        }
      }

      // Confetti sneeze pause (gives player a chance)
      if (ai.sneezeCooldown <= 0 && Math.random() < 0.18) {
        ai.sneezeCooldown = 4.0;
        this.elephant.setVelocity(0, 0);
        this.eMood.setText("😮");
        this.say("Elephant", "Confetti sneeze! ACHOO!");
        this.popConfetti(this.elephant.x, this.elephant.y, 14);
        return;
      }
    }

    if (ai.state === "PATROL") {
      this.eMood.setText("💤");
      const p = ai.patrolPoints[ai.patrolIndex];
      this.moveElephantToward(p.x, p.y, this.diff.elephantPatrolSpeed);

      if (Phaser.Math.Distance.Between(this.elephant.x, this.elephant.y, p.x, p.y) < 18) {
        ai.patrolIndex = (ai.patrolIndex + 1) % ai.patrolPoints.length;
      }
    }

    if (ai.state === "INVESTIGATE") {
      this.eMood.setText("🧐");
      const t = ai.investigateTarget;
      if (t) this.moveElephantToward(t.x, t.y, this.diff.elephantPatrolSpeed + 10);
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
          ai.state = "INVESTIGATE";
          ai.investigateTarget = ai.lastSeen ? { ...ai.lastSeen } : { x: this.elephant.x, y: this.elephant.y };
          ai.investigateTimeLeft = this.diff.investigateSeconds;
          return;
        }
      }

      const tx = (this.playerHidden && this.hideProgress >= 1) ? (ai.lastSeen?.x ?? this.player.x) : this.player.x;
      const ty = (this.playerHidden && this.hideProgress >= 1) ? (ai.lastSeen?.y ?? this.player.y) : this.player.y;

      this.moveElephantToward(tx, ty, this.diff.elephantChaseSpeed);

      ai.nextVoice -= dt;
      if (ai.nextVoice <= 0) {
        ai.nextVoice = Phaser.Math.FloatBetween(1.3, 2.7);
        if (Math.random() < 0.45) this.say("Elephant", randPick(ELEPHANT_LINES));
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
