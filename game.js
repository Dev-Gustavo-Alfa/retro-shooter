// ─────────────────────────────────────────────
//  SOUND MANAGER  (Web Audio API – no files)
// ─────────────────────────────────────────────
class SoundManager {
  constructor() { this.ctx = null; }

  _init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  _tone(freq, endFreq, dur, wave, vol) {
    if (!this.ctx) return;
    try {
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = wave || 'sine';
      const t = this.ctx.currentTime;
      osc.frequency.setValueAtTime(freq, t);
      if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
      gain.gain.setValueAtTime(vol || 0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.start(t);
      osc.stop(t + dur);
    } catch (_) {}
  }

  _noise(dur, vol) {
    if (!this.ctx) return;
    try {
      const sr  = this.ctx.sampleRate;
      const buf = this.ctx.createBuffer(1, sr * dur, sr);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src  = this.ctx.createBufferSource();
      src.buffer = buf;
      const gain = this.ctx.createGain();
      src.connect(gain);
      gain.connect(this.ctx.destination);
      const t = this.ctx.currentTime;
      gain.gain.setValueAtTime(vol || 0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.start(t);
    } catch (_) {}
  }

  play(id) {
    this._init();
    const later = (fn, ms) => setTimeout(fn, ms);
    switch (id) {
      case 'shoot':
        this._tone(820, 380, 0.07, 'square', 0.11);
        break;
      case 'hit':
        this._tone(260, 90, 0.055, 'square', 0.18);
        break;
      case 'enemyDeath':
        this._tone(460, 70, 0.19, 'sawtooth', 0.22);
        break;
      case 'playerHit':
        this._noise(0.22, 0.28);
        this._tone(85, 45, 0.28, 'sine', 0.18);
        break;
      case 'waveStart':
        this._tone(280, 280, 0.09, 'sine', 0.2);
        later(() => this._tone(420, 420, 0.09, 'sine', 0.2), 115);
        later(() => this._tone(560, 560, 0.14, 'sine', 0.2), 230);
        break;
      case 'gameOver':
        this._tone(340, 340, 0.13, 'sine', 0.2);
        later(() => this._tone(270, 270, 0.13, 'sine', 0.2), 180);
        later(() => this._tone(200, 200, 0.13, 'sine', 0.2), 360);
        later(() => this._tone(130, 90,  0.38, 'sine', 0.2), 540);
        break;
      case 'scoreUp':
        this._tone(500, 960, 0.09, 'sine', 0.18);
        break;
    }
  }
}

const sfx = new SoundManager();

// ─────────────────────────────────────────────
//  BOOT SCENE  – generate all textures in code
// ─────────────────────────────────────────────
class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  create() {
    this._player();
    this._gun();
    this._walker();
    this._runner();
    this._tank();
    this._bullet();
    this._flash();
    this._spark();
    this._grid();
    this._scanlines();
    this._heart();
    this.scene.start('GameScene');
  }

  _px(g, col, rects) {
    g.fillStyle(col);
    rects.forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
  }

  _player() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Shadow
    g.fillStyle(0x000000, 0.25); g.fillEllipse(16, 31, 22, 5);
    // Boots
    this._px(g, 0x1a1f2e, [[6,27,9,5],[17,27,9,5]]);
    // Pants
    this._px(g, 0x2b3d5c, [[7,18,8,11],[17,18,8,11]]);
    // Belt
    this._px(g, 0x7a5520, [[7,17,18,3]]);
    // Shirt
    this._px(g, 0x1a58a0, [[7,9,18,10]]);
    // Collar
    this._px(g, 0x0d3a70, [[12,9,8,3]]);
    // Neck
    this._px(g, 0xefb080, [[13,7,6,4]]);
    // Head
    this._px(g, 0xf0b070, [[10,1,12,8]]);
    // Hair
    this._px(g, 0x4a2608, [[10,0,12,4]]);
    // Eyes
    this._px(g, 0x111111, [[12,4,2,2],[18,4,2,2]]);
    // Mouth
    this._px(g, 0xc07050, [[13,7,6,2]]);
    // Outline accents
    g.lineStyle(1, 0x08080f, 0.55);
    g.strokeRect(7, 9, 18, 10);
    g.strokeRect(10, 1, 12, 8);
    g.generateTexture('player', 32, 32);
    g.destroy();
  }

  _gun() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Grip
    this._px(g, 0x3a200e, [[0,5,8,9]]);
    // Body
    this._px(g, 0x505055, [[5,2,16,7]]);
    // Slide
    this._px(g, 0x686870, [[7,1,12,3]]);
    // Barrel
    this._px(g, 0x404045, [[19,3,8,5]]);
    // Muzzle
    this._px(g, 0x282830, [[26,2,4,7]]);
    // Highlight line
    this._px(g, 0x787880, [[7,2,10,1]]);
    g.generateTexture('gun', 30, 13);
    g.destroy();
  }

  _walker() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Legs
    this._px(g, 0x1a6328, [[4,20,8,8],[16,20,8,8]]);
    // Body
    this._px(g, 0x23913a, [[3,8,22,14]]);
    // Arms (zombie outstretched)
    this._px(g, 0x23913a, [[0,9,5,5],[23,9,5,5]]);
    // Hands
    this._px(g, 0x35b050, [[-1,8,4,5],[25,8,4,5]]);
    // Head
    this._px(g, 0x30aa48, [[5,0,18,10]]);
    // Rotting spots
    this._px(g, 0x166025, [[8,11,4,4],[19,15,3,3]]);
    // Eyes (red X)
    this._px(g, 0xdd1111, [[7,2,4,4],[17,2,4,4]]);
    this._px(g, 0x880000, [[8,3,2,2],[18,3,2,2]]);
    // Mouth gash
    this._px(g, 0x770000, [[9,7,10,3]]);
    g.lineStyle(1, 0x0c3c18, 0.75);
    g.strokeRect(3, 8, 22, 14);
    g.strokeRect(5, 0, 18, 10);
    g.generateTexture('walker', 28, 28);
    g.destroy();
  }

  _runner() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Legs
    this._px(g, 0x8b0f1e, [[3,17,5,7],[12,17,5,7]]);
    // Body slim
    this._px(g, 0xcc1e2e, [[2,6,16,12]]);
    // Claws
    this._px(g, 0xaa0f1c, [[-1,7,4,4],[17,7,4,4]]);
    // Head
    this._px(g, 0xdd2535, [[3,0,14,8]]);
    // Eyes (angry yellow)
    this._px(g, 0xffee00, [[4,1,4,4],[12,1,4,4]]);
    this._px(g, 0x110000, [[5,2,2,2],[13,2,2,2]]);
    // Teeth
    this._px(g, 0xffffff, [[5,5,2,2],[9,5,2,2],[13,5,2,2]]);
    g.lineStyle(1, 0x550010, 0.75);
    g.strokeRect(2, 6, 16, 12);
    g.strokeRect(3, 0, 14, 8);
    g.generateTexture('runner', 20, 24);
    g.destroy();
  }

  _tank() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Legs
    this._px(g, 0x363650, [[3,29,12,7],[21,29,12,7]]);
    // Body
    this._px(g, 0x484860, [[2,10,32,22]]);
    // Shoulder pads
    this._px(g, 0x555575, [[-1,10,7,16],[30,10,7,16]]);
    // Chest plate
    this._px(g, 0x5e5e80, [[7,13,22,10]]);
    // Helmet
    this._px(g, 0x383855, [[5,0,26,12]]);
    // Visor
    this._px(g, 0xff1100, [[8,3,7,6],[21,3,7,6]]);
    this._px(g, 0xff6644, [[9,4,5,4],[22,4,5,4]]);
    // Rivets
    this._px(g, 0x909098, [[8,14,2,2],[26,14,2,2],[8,21,2,2],[26,21,2,2]]);
    g.lineStyle(1, 0x1a1a28, 0.75);
    g.strokeRect(2, 10, 32, 22);
    g.strokeRect(5, 0, 26, 12);
    g.generateTexture('tank', 36, 36);
    g.destroy();
  }

  _bullet() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    this._px(g, 0xffffff, [[0,1,4,2]]);
    this._px(g, 0xffee44, [[3,0,8,4]]);
    this._px(g, 0xff9900, [[10,1,2,2]]);
    g.generateTexture('bullet', 12, 4);
    g.destroy();
  }

  _flash() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffaa); g.fillCircle(12, 12, 12);
    g.fillStyle(0xffffff); g.fillCircle(12, 12, 7);
    g.generateTexture('flash', 24, 24);
    g.destroy();
  }

  _spark() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xff7700); g.fillRect(0, 0, 4, 4);
    g.generateTexture('spark', 4, 4);
    g.destroy();
  }

  _grid() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x0c0c1e); g.fillRect(0, 0, 800, 600);
    g.lineStyle(1, 0x17173a, 1);
    for (let x = 0; x <= 800; x += 40) g.lineBetween(x, 0, x, 600);
    for (let y = 0; y <= 600; y += 40) g.lineBetween(0, y, 800, y);
    g.generateTexture('grid', 800, 600);
    g.destroy();
  }

  _scanlines() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.16);
    for (let y = 0; y < 600; y += 3) g.fillRect(0, y, 800, 1);
    g.generateTexture('scanlines', 800, 600);
    g.destroy();
  }

  _heart() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xff2244);
    [
      [1,0],[2,0],[4,0],[5,0],
      [0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],
      [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],
      [1,3],[2,3],[3,3],[4,3],[5,3],
      [2,4],[3,4],[4,4],
      [3,5]
    ].forEach(([px, py]) => g.fillRect(px * 2, py * 2, 2, 2));
    g.generateTexture('heart', 14, 13);
    g.destroy();
  }
}

// ─────────────────────────────────────────────
//  GAME SCENE
// ─────────────────────────────────────────────
class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  init() {
    this.score      = 0;
    this.wave       = 1;
    this.kills      = 0;
    this.hp         = 3;
    this.invincible = false;
    this.dead       = false;
    this.lastShot   = 0;
    this.fireRate   = 150;
    this.waveId     = 0;        // incremented each wave to cancel stale spawn callbacks
    this.waveTotal  = 0;
    this.waveKills  = 0;
    this.waveActive = false;
    this.bobAngle   = 0;
  }

  create() {
    this.add.image(400, 300, 'grid').setDepth(0);
    this.physics.world.setBounds(0, 0, 800, 600);

    // Groups
    this.bullets = this.physics.add.group();
    this.enemies = this.physics.add.group();

    // Player
    this.player = this.physics.add.sprite(400, 300, 'player')
      .setDepth(5).setCollideWorldBounds(true);

    // Gun sprite (no physics, follows player each frame)
    this.gun = this.add.sprite(400, 302, 'gun')
      .setDepth(6).setOrigin(0.12, 0.5);

    // Overlaps
    this.physics.add.overlap(this.bullets, this.enemies, this._onBulletHit, null, this);
    this.physics.add.overlap(this.player,  this.enemies, this._onEnemyContact, null, this);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd    = this.input.keyboard.addKeys('W,A,S,D');

    // HUD
    this._buildHUD();

    // Scanlines overlay
    this.add.image(400, 300, 'scanlines').setDepth(999).setScrollFactor(0);

    // Kick off first wave
    this.time.delayedCall(900, () => this._startWave());
  }

  // ── HUD ───────────────────────────────────
  _buildHUD() {
    const s = (sz, col) => ({
      fontFamily: '"Press Start 2P", monospace',
      fontSize: `${sz}px`,
      fill: col || '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.scoreTxt = this.add.text(12, 12, 'SCORE 0', s(9))
      .setDepth(500).setScrollFactor(0);
    this.killsTxt = this.add.text(12, 30, 'KILLS 0', s(7, '#88ff88'))
      .setDepth(500).setScrollFactor(0);
    this.waveTxt = this.add.text(400, 12, 'WAVE 1', s(10, '#ffff00'))
      .setOrigin(0.5, 0).setDepth(500).setScrollFactor(0);
    this.hearts = [];
    for (let i = 0; i < 3; i++) {
      this.hearts.push(
        this.add.image(790 - i * 22, 18, 'heart').setDepth(500).setScrollFactor(0)
      );
    }
  }

  _refreshHUD() {
    this.scoreTxt.setText('SCORE ' + this.score);
    this.killsTxt.setText('KILLS ' + this.kills);
    this.waveTxt.setText('WAVE ' + this.wave);
    this.hearts.forEach((h, i) => {
      const alive = i < this.hp;
      h.setAlpha(alive ? 1 : 0.22).setTint(alive ? 0xff2244 : 0x555555);
    });
  }

  // ── WAVE MANAGEMENT ───────────────────────
  _startWave() {
    this.waveId++;
    const id = this.waveId;
    this.waveActive = true;
    this.waveTotal  = 4 + (this.wave - 1) * 2;
    this.waveKills  = 0;
    sfx.play('waveStart');

    // Banner
    const banner = this.add.text(400, 300, 'WAVE ' + this.wave, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '32px', fill: '#ffff00',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(800).setScrollFactor(0);
    this.tweens.add({
      targets: banner, alpha: 0, y: 240,
      duration: 1700, ease: 'Power2',
      onComplete: () => banner.destroy(),
    });

    for (let i = 0; i < this.waveTotal; i++) {
      this.time.delayedCall(700 + i * 750, () => {
        if (!this.dead && this.waveId === id) this._spawnEnemy();
      });
    }
  }

  _spawnEnemy() {
    const pad  = 42;
    const side = Phaser.Math.Between(0, 3);
    let x, y;
    switch (side) {
      case 0: x = Phaser.Math.FloatBetween(pad, 800-pad); y = -pad;      break;
      case 1: x = Phaser.Math.FloatBetween(pad, 800-pad); y = 600+pad;   break;
      case 2: x = -pad;     y = Phaser.Math.FloatBetween(pad, 600-pad);  break;
      default: x = 800+pad; y = Phaser.Math.FloatBetween(pad, 600-pad);  break;
    }

    const r = Math.random(), w = this.wave;
    let key, hp, spd, pts;
    if (w >= 5 && r < 0.12)        { key='tank';   hp=8; spd=52+(w-5)*3;  pts=60; }
    else if (w >= 3 && r < 0.35)   { key='runner'; hp=1; spd=170+(w-3)*7; pts=20; }
    else                            { key='walker'; hp=3; spd=80+(w-1)*5;  pts=10; }

    const e = this.enemies.create(x, y, key);
    e.setDepth(4).setCollideWorldBounds(false);
    e.hp  = hp; e.maxHp = hp;
    e.spd = spd; e.pts = pts;
    e.setScale(0);
    this.tweens.add({ targets: e, scale: 1, duration: 200, ease: 'Back.easeOut' });
  }

  _checkWaveDone() {
    if (this.waveActive && this.waveKills >= this.waveTotal) {
      this.waveActive = false;
      this.wave++;
      this._refreshHUD();
      this.time.delayedCall(2000, () => { if (!this.dead) this._startWave(); });
    }
  }

  // ── COLLISIONS ────────────────────────────
  _onBulletHit(bullet, enemy) {
    if (!bullet.active || !enemy.active) return;
    bullet.destroy();
    enemy.hp--;
    sfx.play('hit');

    enemy.setTint(0xffffff);
    this.time.delayedCall(65, () => { if (enemy.active) enemy.clearTint(); });
    this._sparks(bullet.x, bullet.y, 4);

    if (enemy.hp <= 0) this._killEnemy(enemy);
  }

  _killEnemy(enemy) {
    if (!enemy.active) return;
    sfx.play('enemyDeath');
    this.kills++;
    this.score += enemy.pts;
    this.waveKills++;
    if (this.kills % 10 === 0) sfx.play('scoreUp');

    const ex = enemy.x, ey = enemy.y;
    enemy.destroy();
    this._sparks(ex, ey, 7);
    this._refreshHUD();
    this._checkWaveDone();
  }

  _onEnemyContact(player, enemy) {
    if (this.invincible || this.dead || !enemy.active) return;
    this.hp--;
    sfx.play('playerHit');
    this.cameras.main.shake(220, 0.013);

    // Knockback
    const ang = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    player.setVelocity(Math.cos(ang) * 260, Math.sin(ang) * 260);

    // Invincibility frames
    this.invincible = true;
    this.tweens.add({
      targets: player, alpha: 0.3, duration: 80, yoyo: true, repeat: 7,
      onComplete: () => { player.setAlpha(1); this.invincible = false; },
    });

    this._refreshHUD();
    if (this.hp <= 0) this._die();
  }

  // ── SHOOTING ──────────────────────────────
  _shoot() {
    if (this.time.now - this.lastShot < this.fireRate) return;
    this.lastShot = this.time.now;
    sfx.play('shoot');

    const ptr = this.input.activePointer;
    const ang = Phaser.Math.Angle.Between(this.player.x, this.player.y, ptr.x, ptr.y);
    const deg = Phaser.Math.RadToDeg(ang);
    const tx  = this.player.x + Math.cos(ang) * 24;
    const ty  = this.player.y + Math.sin(ang) * 24;

    const b = this.bullets.create(tx, ty, 'bullet');
    b.setDepth(7).setRotation(ang);
    this.physics.velocityFromAngle(deg, 630, b.body.velocity);

    // Muzzle flash
    const fl = this.add.image(tx, ty, 'flash').setDepth(8);
    this.tweens.add({ targets: fl, alpha: 0, scale: 1.5, duration: 70, onComplete: () => fl.destroy() });

    this.time.delayedCall(1100, () => { if (b && b.active) b.destroy(); });
  }

  // ── PARTICLES ─────────────────────────────
  _sparks(x, y, count) {
    for (let i = 0; i < count; i++) {
      const ang  = Math.random() * Math.PI * 2;
      const dist = Phaser.Math.Between(15, 55);
      const sp   = this.add.image(x, y, 'spark').setDepth(10);
      this.tweens.add({
        targets: sp,
        x: x + Math.cos(ang) * dist,
        y: y + Math.sin(ang) * dist,
        alpha: 0, scale: 0,
        duration: Phaser.Math.Between(110, 280),
        onComplete: () => sp.destroy(),
      });
    }
  }

  // ── DEATH ─────────────────────────────────
  _die() {
    this.dead = true;
    sfx.play('gameOver');
    this.player.setTint(0xff0000);
    this.cameras.main.shake(450, 0.02);
    this.time.delayedCall(1500, () => {
      this.scene.start('GameOverScene', { score: this.score, wave: this.wave, kills: this.kills });
    });
  }

  // ── UPDATE LOOP ───────────────────────────
  update(time, delta) {
    if (this.dead) return;

    // Movement
    const spd = 210;
    let vx = 0, vy = 0;
    if (this.cursors.left.isDown  || this.wasd.A.isDown) vx = -spd;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx =  spd;
    if (this.cursors.up.isDown    || this.wasd.W.isDown) vy = -spd;
    if (this.cursors.down.isDown  || this.wasd.S.isDown) vy =  spd;
    if (vx && vy) { vx *= 0.7071; vy *= 0.7071; }
    this.player.setVelocity(vx, vy);

    // Walking scale-bob (doesn't fight physics body position)
    if (vx || vy) {
      this.bobAngle += delta * 0.014;
      this.player.setScale(1, 1 + Math.sin(this.bobAngle) * 0.07);
    } else {
      this.player.setScale(1, 1);
    }

    // Aim gun at mouse
    const ptr    = this.input.activePointer;
    const aimAng = Phaser.Math.Angle.Between(this.player.x, this.player.y, ptr.x, ptr.y);
    this.gun.setPosition(this.player.x, this.player.y + 2);
    this.gun.setRotation(aimAng);
    this.gun.setFlipY(ptr.x < this.player.x);
    this.player.setFlipX(ptr.x < this.player.x);

    // Shoot on hold
    if (ptr.isDown) this._shoot();

    // Move enemies toward player + gentle scale bob
    const enemies = this.enemies.getChildren();
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e.active) continue;
      const ea = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
      this.physics.velocityFromAngle(Phaser.Math.RadToDeg(ea), e.spd, e.body.velocity);
      e.setScale(1 + Math.sin(time * 0.0055 + e.x * 0.3) * 0.05);
    }

    // Cull bullets that fly off-screen
    const bullets = this.bullets.getChildren();
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      if (b.active && (b.x < -60 || b.x > 860 || b.y < -60 || b.y > 660)) b.destroy();
    }
  }
}

// ─────────────────────────────────────────────
//  GAME OVER SCENE
// ─────────────────────────────────────────────
class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOverScene' }); }

  init(data) {
    this.finalScore = data.score || 0;
    this.finalWave  = data.wave  || 1;
    this.finalKills = data.kills || 0;
  }

  create() {
    this.add.image(400, 300, 'grid').setAlpha(0.35);
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.84);

    const s = (sz, col) => ({
      fontFamily: '"Press Start 2P", monospace',
      fontSize: `${sz}px`, fill: col || '#ffffff',
      stroke: '#000000', strokeThickness: 3,
    });

    this.add.text(400, 120, 'GAME OVER', s(30, '#ff2244')).setOrigin(0.5);

    this.add.text(400, 240, `SCORE   ${this.finalScore}`, s(12)).setOrigin(0.5);
    this.add.text(400, 275, `WAVE    ${this.finalWave}`,  s(12, '#ffff00')).setOrigin(0.5);
    this.add.text(400, 310, `KILLS   ${this.finalKills}`, s(12, '#88ff88')).setOrigin(0.5);

    const restart = this.add.text(400, 415, 'CLICK TO PLAY AGAIN', s(11)).setOrigin(0.5);
    this.tweens.add({ targets: restart, alpha: 0.1, duration: 550, yoyo: true, repeat: -1 });

    this.add.image(400, 300, 'scanlines').setDepth(999).setAlpha(0.42);

    this.input.once('pointerdown', () => this.scene.start('GameScene'));
    this.input.keyboard.once('keydown', () => this.scene.start('GameScene'));
  }
}

// ─────────────────────────────────────────────
//  LAUNCH
// ─────────────────────────────────────────────
new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#0c0c1e',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: [BootScene, GameScene, GameOverScene],
});
