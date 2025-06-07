var score = 0;
var scoreText;
var explosionSound;
var musicaFondo;
var gameOver = false;
var jugador;
var cursors;
var plata;
var stars;
var bombs;

var PrePantalla = new Phaser.Scene('PrePantalla');

PrePantalla.preload = function () {
    this.load.image('sky', 'assets/sky.png');
    this.load.audio('musicaFondo', 'assets/mr.mp3');
};

PrePantalla.create = function () {
    let fondo = this.add.image(600, 300, 'sky');
    fondo.setDisplaySize(1200, 600);

    this.titleText = this.add.text(250, 150, 'SOUTH PARK THE GAME FAKE', {
        fontSize: '48px',
        fontFamily: 'Ink Free, Arial, sans-serif',
        fill: '#ff0000',
        align: 'center',
        wordWrap: { width: 1000, useAdvancedWrap: true }
    });
    this.titleText.setShadow(0, 0, '#ff0000', 10, true, true);

    this.startText = this.add.text(340, 320, 'Haz clic para empezar', {
        fontSize: '48px',
        fontFamily: 'Ink Free, Arial, sans-serif',
        fill: '#ff0000',
    });
    this.startText.setShadow(0, 0, '#ff0000', 10, true, true);

    this.startText.setInteractive({ useHandCursor: true });

    this.startText.on('pointerdown', () => {
        this.scene.start('MainScene');
    });

    this.startText.on('pointerover', () => {
        this.startText.setStyle({ fill: '#ffff00' });
        this.tweens.add({
            targets: this.startText,
            scale: 1.1,
            duration: 200,
            ease: 'Power2'
        });
    });

    this.startText.on('pointerout', () => {
        this.startText.setStyle({ fill: '#ff0000' });
        this.tweens.add({
            targets: this.startText,
            scale: 1,
            duration: 200,
            ease: 'Power2'
        });
    });

    this.glowSize = 10;
    this.glowPulseDirection = 1;
};

PrePantalla.update = function () {
    this.glowSize += this.glowPulseDirection * 0.3;
    if (this.glowSize >= 15) this.glowPulseDirection = -1;
    if (this.glowSize <= 7) this.glowPulseDirection = 1;

    this.titleText.setShadow(0, 0, '#ff0000', this.glowSize, true, true);
    this.startText.setShadow(0, 0, '#ff0000', this.glowSize, true, true);
};


var MainScene = new Phaser.Scene('MainScene');

MainScene.preload = function () {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('plataforma', 'assets/platform.png');
    this.load.image('bomba', 'assets/bomb.png');
    this.load.image('star', 'assets/star.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.audio('explosion', 'assets/hp.mp3');
    this.load.audio('musicaFondo', 'assets/mr.mp3');
};

MainScene.create = function () {
    this.add.image(400, 280, 'sky');

    plata = this.physics.add.staticGroup();
    plata.create(400, 560, 'plataforma');
    plata.create(0, 560, 'plataforma');
    plata.create(100, 560, 'plataforma');
    plata.create(250, 560, 'plataforma');
    plata.create(300, 560, 'plataforma');
    plata.create(500, 560, 'plataforma');
    plata.create(600, 560, 'plataforma');
    plata.create(700, 560, 'plataforma');
    plata.create(800, 560, 'plataforma');
    plata.create(200, 350, 'plataforma');
    plata.create(400, 460, 'plataforma');
    plata.create(50, 460, 'plataforma');
    plata.create(750, 460, 'plataforma');
    plata.create(600, 280, 'plataforma');
    plata.create(400, 560, 'plataforma');
    plata.create(400, 220, 'plataforma');

    jugador = this.physics.add.sprite(400, 10, 'dude');
    jugador.setBounce(0.3);
    jugador.setCollideWorldBounds(true);
    this.cameras.main.setBounds(0, 0, 800, 560);
    this.cameras.main.startFollow(jugador);
    this.cameras.main.setZoom(1.5);
    this.cameras.main.setLerp(0.9);
    this.physics.add.collider(jugador, plata);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(plata, stars);
    this.physics.add.overlap(jugador, stars, collectStar, null, this);

    scoreText = this.add.text(16, 16, ' score: 0 ', {
        fontSize: '32px',
        fill: '#ff0000'
    });

    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, plata);
    this.physics.add.collider(jugador, bombs, hitBomb, null, this);

    explosionSound = this.sound.add('explosion');
    musicaFondo = this.sound.add('musicaFondo', { loop: true, volume: 0.5 });
    musicaFondo.play();

    function collectStar(jugador, star) {
        star.disableBody(true, true);
        score += 10;
        scoreText.setText('score: ' + score);

        if (stars.countActive(true) === 0) {
            stars.children.iterate(function (child) {
                child.enableBody(true, child.x, 0, true, true);
            });

            var x = (jugador.x < 400)
                ? Phaser.Math.Between(400, 800)
                : Phaser.Math.Between(0, 400);
            var bomb = bombs.create(x, 16, 'bomba');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
    }

    function hitBomb(jugador, bomb) {
        this.physics.pause();
        jugador.setTint(0xff0000);
        jugador.anims.play('turn');
        explosionSound.play();
        musicaFondo.stop();
        gameOver = true;

        let panelBg = this.add.rectangle(600, 300, 400, 250, 0x000000, 0.7).setScrollFactor(0);

        let gameOverText = this.add.text(600, 220, 'GAME OVER', {
            fontSize: '48px',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 6,
            fontFamily: 'Ink Free, Arial, sans-serif',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0);

        let retryText = this.add.text(600, 300, 'Reintentar', {
            fontSize: '36px',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4,
            fontFamily: 'Ink Free, Arial, sans-serif',
        }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true });

        retryText.on('pointerover', () => {
            retryText.setStyle({ fill: '#ffff00' });
            this.tweens.add({
                targets: retryText,
                scale: 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });

        retryText.on('pointerout', () => {
            retryText.setStyle({ fill: '#ff0000' });
            this.tweens.add({
                targets: retryText,
                scale: 1,
                duration: 200,
                ease: 'Power2'
            });
        });

        retryText.on('pointerdown', () => {
            this.scene.restart();
            score = 0;
            gameOver = false;
        });

        let menuText = this.add.text(600, 360, 'Volver al Inicio', {
            fontSize: '36px',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4,
            fontFamily: 'Ink Free, Arial, sans-serif',
        }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true });

        menuText.on('pointerover', () => {
            menuText.setStyle({ fill: '#ffff00' });
            this.tweens.add({
                targets: menuText,
                scale: 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });

        menuText.on('pointerout', () => {
            menuText.setStyle({ fill: '#ff0000' });
            this.tweens.add({
                targets: menuText,
                scale: 1,
                duration: 200,
                ease: 'Power2'
            });
        });

        menuText.on('pointerdown', () => {
            this.scene.start('PrePantalla');
            score = 0;
            gameOver = false;
        });
    }
};

MainScene.update = function () {
    if (gameOver) return;

    if (cursors.left.isDown) {
        jugador.setVelocityX(-160);
        jugador.anims.play('left', true);
    } else if (cursors.right.isDown) {
        jugador.setVelocityX(160);
        jugador.anims.play('right', true);
    } else {
        jugador.setVelocityX(0);
        jugador.anims.play('turn');
    }

    if (cursors.up.isDown && jugador.body.touching.down) {
        jugador.setVelocityY(-300);
    }
};

var config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 330 }
        }
    },
    scene: [PrePantalla, MainScene]
};

var game = new Phaser.Game(config);
