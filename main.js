// --- Game Configuration ---
const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: { preload: preload, create: create, update: update }
};

const game = new Phaser.Game(config);

// --- Variables ---
let player, barnaby, walls, tokens, hideSpots, cursors, ui;
let noiseLevel = 0;
let isHidden = false;
let tokensCollected = 0;
let aiState = 'PATROL'; // PATROL, INVESTIGATE, CHASE
let targetPos = { x: 0, y: 0 };

function preload() {
    // We generate textures procedurally so you don't need external images
}

function create() {
    // 1. Scene setup
    this.add.rectangle(480, 270, 960, 540, 0x141425); // Dark Blue floor
    
    // 2. Obstacles (The Museum Walls)
    walls = this.physics.add.staticGroup();
    const wallStyles = { fill: 0x23233a, stroke: 0x3b3b5a };
    
    const createWall = (x, y, w, h) => {
        let wall = this.add.rectangle(x, y, w, h, wallStyles.fill).setStrokeStyle(2, wallStyles.stroke);
        this.physics.add.existing(wall, true);
        walls.add(wall);
    };

    createWall(480, 10, 960, 20);  // Ceiling
    createWall(480, 530, 960, 20); // Floor
    createWall(10, 270, 20, 540);  // Left Wall
    createWall(950, 270, 20, 540); // Right Wall
    createWall(480, 300, 300, 40); // Center Exhibit

    // 3. Collectibles
    tokens = this.physics.add.staticGroup();
    for(let i=0; i<5; i++) {
        let t = this.add.circle(Phaser.Math.Between(100, 860), Phaser.Math.Between(100, 440), 10, 0xffa13a);
        this.physics.add.existing(t, true);
        tokens.add(t);
    }

    // 4. Hide Spots
    hideSpots = this.physics.add.staticGroup();
    let spot = this.add.rectangle(200, 420, 80, 60, 0x6c6ca8, 0.3).setStrokeStyle(2, 0x6c6ca8);
    this.physics.add.existing(spot, true);
    hideSpots.add(spot);

    // 5. Entities
    player = this.physics.add.sprite(100, 100, null).setSize(26, 26);
    drawCircleSprite(this, player, 14, 0x9fe2ff); // Light Blue Hero
    
    barnaby = this.physics.add.sprite(820, 420, null).setSize(44, 44);
    drawCircleSprite(this, barnaby, 22, 0xb7b7c9); // Grey Elephant
    
    // 6. UI
    ui = {
        score: this.add.text(30, 30, 'Tokens: 0/5', { fontSize: '20px', color: '#fff' }),
        noiseBarBg: this.add.rectangle(800, 45, 200, 15, 0x222233),
        noiseBar: this.add.rectangle(700, 45, 0, 11, 0x7f7fff).setOrigin(0, 0.5),
        status: this.add.text(480, 500, 'Stay Quiet!', { fontSize: '16px', color: '#cfcfe8' }).setOrigin(0.5)
    };

    // 7. Physics Logic
    this.physics.add.collider(player, walls);
    this.physics.add.collider(barnaby, walls);
    this.physics.add.overlap(player, tokens, (p, t) => {
        t.destroy();
        tokensCollected++;
        ui.score.setText(`Tokens: ${tokensCollected}/5`);
    }, null, this);
    this.physics.add.overlap(player, barnaby, onBoop, null, this);

    cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE,SHIFT');
}

function update(time, delta) {
    const dt = delta / 1000;

    // --- Player Movement ---
    if (!isHidden) {
        let speed = (this.keys.SHIFT.isDown) ? 240 : 160;
        player.body.setVelocity(0);

        if (cursors.left.isDown || this.keys.A.isDown) player.body.setVelocityX(-speed);
        else if (cursors.right.isDown || this.keys.D.isDown) player.body.setVelocityX(speed);

        if (cursors.up.isDown || this.keys.W.isDown) player.body.setVelocityY(-speed);
        else if (cursors.down.isDown || this.keys.S.isDown) player.body.setVelocityY(speed);

        // Noise Generation
        if (player.body.velocity.length() > 0) {
            noiseLevel += (this.keys.SHIFT.isDown ? 40 : 15) * dt;
        } else {
            noiseLevel = Math.max(0, noiseLevel - 25 * dt);
        }
    }

    // --- Hiding Mechanic ---
    this.physics.overlap(player, hideSpots, () => {
        if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
            toggleHide();
        }
    });

    // --- Barnaby AI Logic ---
    let dist = Phaser.Math.Distance.Between(barnaby.x, barnaby.y, player.x, player.y);
    
    if (noiseLevel > 50 && !isHidden) {
        aiState = 'CHASE';
        this.physics.moveToObject(barnaby, player, 180);
        barnaby.setTint(0xffaaaa);
    } else if (dist < 200 && !isHidden) {
        aiState = 'CURIOUS';
        this.physics.moveToObject(barnaby, player, 90);
        barnaby.setTint(0xffffff);
    } else {
        aiState = 'PATROL';
        barnaby.body.setVelocity(0);
        barnaby.clearTint();
    }

    // --- UI Update ---
    ui.noiseBar.width = Phaser.Math.Clamp(noiseLevel * 2, 0, 200);
}

function toggleHide() {
    isHidden = !isHidden;
    if (isHidden) {
        player.setAlpha(0.4);
        player.body.setVelocity(0);
        noiseLevel = 0;
    } else {
        player.setAlpha(1);
    }
}

function onBoop() {
    if (isHidden) return;
    alert("BOOP! Barnaby caught you for a hug!");
    window.location.reload(); // Simple reset for now
}

function drawCircleSprite(scene, sprite, radius, color) {
    let g = scene.add.graphics();
    g.fillStyle(color, 1);
    g.fillCircle(radius, radius, radius);
    let key = 'circle_' + color;
    if (!scene.textures.exists(key)) {
        g.generateTexture(key, radius * 2, radius * 2);
    }
    sprite.setTexture(key);
    g.destroy();
}
