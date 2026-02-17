/**
 * TRUNK OR TREAT: THE BOOP CHASE
 * A kid-friendly "fun horror" game.
 */

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

let player, barnaby, walls, tokens, hideSpots, cursors, ui;
let noiseLevel = 0;
let isHidden = false;
let tokensCollected = 0;
let canBeBooped = true;

function preload() {
    // Graphics are generated procedurally in create()
}

function create() {
    // 1. Background (Dark Midnight Museum)
    this.add.rectangle(480, 270, 960, 540, 0x1a1a2e);

    // 2. Walls (The Museum Exhibits)
    walls = this.physics.add.staticGroup();
    const createWall = (x, y, w, h) => {
        let wBox = this.add.rectangle(x, y, w, h, 0x2e2e4a).setStrokeStyle(2, 0x4e4e7a);
        this.physics.add.existing(wBox, true);
        walls.add(wBox);
    };

    createWall(480, 10, 960, 20);  // Top
    createWall(480, 530, 960, 20); // Bottom
    createWall(10, 270, 20, 540);  // Left
    createWall(950, 270, 20, 540); // Right
    createWall(480, 270, 220, 40); // Center Fossil Exhibit

    // 3. Hide Spots (Giant Polka-Dot Hats)
    hideSpots = this.physics.add.staticGroup();
    const spawnHideSpot = (x, y) => {
        let hat = this.add.circle(x, y, 40, 0x8855cc, 0.6).setStrokeStyle(3, 0xaa88ff);
        this.add.text(x - 15, y - 10, "HAT", { fontSize: '14px', fontStyle: 'bold', fill: '#fff' });
        this.physics.add.existing(hat, true);
        hideSpots.add(hat);
    };
    spawnHideSpot(250, 400);
    spawnHideSpot(700, 150);

    // 4. Tokens (Shiny Trick Tokens)
    tokens = this.physics.add.group();
    for(let i=0; i<5; i++) {
        let t = this.add.star(Phaser.Math.Between(100, 860), Phaser.Math.Between(100, 440), 5, 8, 15, 0xffcc00);
        this.physics.add.existing(t);
        t.body.setImmovable(true);
        tokens.add(t);
        
        // Make tokens bob up and down
        this.tweens.add({
            targets: t,
            y: t.y - 10,
            duration: 800 + (i * 100),
            yoyo: true,
            repeat: -1
        });
    }

    // 5. Player (The Brave Giggler)
    player = this.physics.add.sprite(100, 100, null).setSize(25, 25);
    drawPlayer(this, player);
    player.setCollideWorldBounds(true);

    // 6. Barnaby (The Goofy Elephant)
    barnaby = this.physics.add.sprite(800, 450, null);
    drawElephant(this, barnaby);
    barnaby.setSize(50, 50); // Collision box
    barnaby.setCollideWorldBounds(true);

    // 7. UI System
    ui = {
        score: this.add.text(30, 30, 'Trick Tokens: 0/5', { fontSize: '22px', fill: '#fff' }),
        noiseLabel: this.add.text(720, 25, 'Giggle Meter', { fontSize: '14px', fill: '#fff' }),
        noiseBarBg: this.add.rectangle(820, 50, 200, 12, 0x333355),
        noiseBar: this.add.rectangle(720, 50, 0, 10, 0x00ffcc).setOrigin(0, 0.5),
        msg: this.add.text(480, 500, 'Find the tokens! Space to hide!', { fontSize: '18px', fill: '#ffffff' }).setOrigin(0.5)
    };

    // 8. Collisions & Interactions
    this.physics.add.collider(player, walls);
    this.physics.add.collider(barnaby, walls);
    
    this.physics.add.overlap(player, tokens, (p, t) => {
        t.destroy();
        tokensCollected++;
        ui.score.setText(`Trick Tokens: ${tokensCollected}/5`);
        if(tokensCollected === 5) ui.msg.setText("YOU GOT THEM ALL! RUN TO THE START!");
    });

    this.physics.add.overlap(player, barnaby, handleBoop, null, this);

    cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE,SHIFT');
}

function update(time, delta) {
    const dt = delta / 1000;

    if (!isHidden) {
        // Player Movement
        let speed = (this.keys.SHIFT.isDown) ? 220 : 140;
        player.body.setVelocity(0);

        if (cursors.left.isDown || this.keys.A.isDown) player.body.setVelocityX(-speed);
        else if (cursors.right.isDown || this.keys.D.isDown) player.body.setVelocityX(speed);
        if (cursors.up.isDown || this.keys.W.isDown) player.body.setVelocityY(-speed);
        else if (cursors.down.isDown || this.keys.S.isDown) player.body.setVelocityY(speed);

        // Noise Logic (Giggle Meter)
        if (player.body.velocity.length() > 0) {
            noiseLevel += (this.keys.SHIFT.isDown ? 40 : 15) * dt;
        } else {
            noiseLevel = Math.max(0, noiseLevel - 20 * dt);
        }
    }

    // Space to Hide Toggle
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
        let touchingHat = false;
        this.physics.overlap(player, hideSpots, () => touchingHat = true);
        
        if (touchingHat) {
            isHidden = !isHidden;
            player.setAlpha(isHidden ? 0.2 : 1);
            ui.msg.setText(isHidden ? "Hiding... Barnaby can't see you!" : "Sneaking again!");
            if(isHidden) player.body.setVelocity(0);
        } else if (!isHidden) {
            ui.msg.setText("You need to be under a Hat to hide!");
        }
    }

    // Barnaby AI & Wiggle
    let dist = Phaser.Math.Distance.Between(barnaby.x, barnaby.y, player.x, player.y);
    
    if (!isHidden && (noiseLevel > 45 || dist < 220)) {
        // Chase Behavior
        let chaseSpeed = (noiseLevel > 65) ? 175 : 105;
        this.physics.moveToObject(barnaby, player, chaseSpeed);
        
        // Elephant Trunk Wiggle Animation
        barnaby.angle = Math.sin(time * 0.01) * 5; 
        
        if(dist < 120) ui.msg.setText("WATCH OUT! HE WANTS A HUG!");
    } else {
        // Patrol/Idle
        barnaby.body.setVelocity(0);
        barnaby.angle = 0;
    }

    // Update UI
    ui.noiseBar.width = Phaser.Math.Clamp(noiseLevel * 2, 0, 200);
    ui.noiseBar.setFillStyle(noiseLevel > 60 ? 0xff3300 : 0x00ffcc);
}

function handleBoop(p, b) {
    if (isHidden || !canBeBooped) return;

    canBeBooped = false;
    ui.msg.setText("BOOP! Hug respawn!");
    
    // Camera shake for fun
    this.cameras.main.shake(200, 0.01);
    
    // Respawn to start
    player.setPosition(100, 100);
    noiseLevel = 0;
    
    // Safety delay
    this.time.delayedCall(2000, () => {
        canBeBooped = true;
        ui.msg.setText("Find the tokens!");
    });
}

// --- VISUAL GENERATORS ---

function drawPlayer(scene, sprite) {
    let g = scene.add.graphics();
    g.fillStyle(0x9fe2ff, 1);
    g.fillCircle(15, 15, 14);
    g.fillStyle(0x000000, 1);
    g.fillCircle(10, 12, 2); // Eye L
    g.fillCircle(20, 12, 2); // Eye R
    g.generateTexture('player_body', 30, 30);
    sprite.setTexture('player_body');
    g.destroy();
}

function drawElephant(scene, sprite) {
    const size = 64;
    let g = scene.add.graphics();

    // Ears
    g.fillStyle(0xa8a8bf, 1);
    g.fillEllipse(15, 25, 30, 45); 
    g.fillEllipse(49, 25, 30, 45); 

    // Head
    g.fillStyle(0xb7b7c9, 1);
    g.fillCircle(32, 32, 22);

    // Trunk
    g.fillStyle(0x9a9ab3, 1);
    g.fillRoundedRect(27, 35, 10, 25, 5);

    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillCircle(25, 28, 2.5); 
    g.fillCircle(39, 28, 2.5); 

    // Polka Dots
    g.fillStyle(0xffaaff, 1);
    g.fillCircle(20, 20, 4);
    g.fillCircle(45, 40, 3);

    g.generateTexture('elephant_body', size, size);
    sprite.setTexture('elephant_body');
    g.destroy();
}
