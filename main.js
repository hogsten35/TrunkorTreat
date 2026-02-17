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
    // We'll create the graphics inside the 'create' function to keep it simple for GitHub
}

function create() {
    // 1. Background
    this.add.rectangle(480, 270, 960, 540, 0x1a1a2e);

    // 2. Walls (The Museum)
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
    createWall(480, 270, 200, 40); // Center Exhibit

    // 3. Hide Spots (The Giant Hats)
    hideSpots = this.physics.add.staticGroup();
    let hat = this.add.circle(250, 400, 40, 0x8855cc, 0.5).setStrokeStyle(3, 0xaa88ff);
    this.add.text(230, 390, "HAT", {fontSize: '14px', color: '#fff'});
    this.physics.add.existing(hat, true);
    hideSpots.add(hat);

    // 4. Tokens (Trick Tokens)
    tokens = this.physics.add.group();
    for(let i=0; i<5; i++) {
        let t = this.add.star(Phaser.Math.Between(100, 860), Phaser.Math.Between(100, 440), 5, 8, 15, 0xffcc00);
        this.physics.add.existing(t);
        t.body.setImmovable(true);
        tokens.add(t);
    }

    // 5. Player
    player = this.physics.add.sprite(100, 100, null).setSize(25, 25);
    player.setTint(0x00ccff);
    drawCircle(this, player, 15);
    player.setCollideWorldBounds(true);

    // 6. Barnaby the Elephant
    barnaby = this.physics.add.sprite(800, 450, null).setSize(45, 45);
    barnaby.setTint(0xff99cc);
    drawCircle(this, barnaby, 25);
    barnaby.setCollideWorldBounds(true);

    // 7. UI
    ui = {
        score: this.add.text(30, 30, 'Trick Tokens: 0/5', { fontSize: '22px', fill: '#fff' }),
        noiseLabel: this.add.text(720, 25, 'Giggle Meter', { fontSize: '14px', fill: '#fff' }),
        noiseBarBg: this.add.rectangle(820, 50, 200, 12, 0x333355),
        noiseBar: this.add.rectangle(720, 50, 0, 10, 0x00ffcc).setOrigin(0, 0.5),
        msg: this.add.text(480, 500, 'Find the tokens! Space to hide!', { fontSize: '18px', fill: '#ffffff' }).setOrigin(0.5)
    };

    // 8. Collisions & Overlaps
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
        // Movement
        let speed = (this.keys.SHIFT.isDown) ? 220 : 140;
        player.body.setVelocity(0);

        if (cursors.left.isDown || this.keys.A.isDown) player.body.setVelocityX(-speed);
        else if (cursors.right.isDown || this.keys.D.isDown) player.body.setVelocityX(speed);
        if (cursors.up.isDown || this.keys.W.isDown) player.body.setVelocityY(-speed);
        else if (cursors.down.isDown || this.keys.S.isDown) player.body.setVelocityY(speed);

        // Noise
        if (player.body.velocity.length() > 0) {
            noiseLevel += (this.keys.SHIFT.isDown ? 35 : 12) * dt;
        } else {
            noiseLevel = Math.max(0, noiseLevel - 20 * dt);
        }
    }

    // Space to Hide
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
        let touchingHat = false;
        this.physics.overlap(player, hideSpots, () => touchingHat = true);
        
        if (touchingHat) {
            isHidden = !isHidden;
            player.setAlpha(isHidden ? 0.3 : 1);
            ui.msg.setText(isHidden ? "Hiding... Barnaby can't see you!" : "Sneaking again!");
            if(isHidden) player.body.setVelocity(0);
        }
    }

    // Barnaby AI
    let dist = Phaser.Math.Distance.Between(barnaby.x, barnaby.y, player.x, player.y);
    if (!isHidden && (noiseLevel > 40 || dist < 200)) {
        this.physics.moveToObject(barnaby, player, (noiseLevel > 60) ? 170 : 100);
        if(dist < 100) ui.msg.setText("HE'S GETTING CLOSE!");
    } else {
        barnaby.body.setVelocity(0);
    }

    // UI Bars
    ui.noiseBar.width = Phaser.Math.Clamp(noiseLevel * 2, 0, 200);
    if(noiseLevel > 60) ui.noiseBar.setFillStyle(0xff3300);
    else ui.noiseBar.setFillStyle(0x00ffcc);
}

function handleBoop(p, b) {
    if (isHidden || !canBeBooped) return;

    canBeBooped = false;
    alert("BOOP! Barnaby caught you! Back to the start!");
    
    // Respawn
    player.setPosition(100, 100);
    noiseLevel = 0;
    
    // Safety Invincibility for 2 seconds
    this.time.delayedCall(2000, () => canBeBooped = true);
}

function drawCircle(scene, sprite, radius) {
    let g = scene.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(radius, radius, radius);
    g.generateTexture('circle_' + radius, radius * 2, radius * 2);
    sprite.setTexture('circle_' + radius);
    g.destroy();
}
