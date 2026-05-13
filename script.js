console.log('Akwadra Super Builder Initialized - Neon Squad Royale');

const routes = {
    '/': 'home',
    '/play': 'play',
    '/play/loadout': 'loadout',
    '/rankings': 'rankings',
    '/rankings/season': 'rankings',
    '/about': 'about',
    '/contact': 'contact'
};

const weapons = [
    { name: 'Nova AR', icon: '🔫', type: 'رشاش متوازن', damage: 18, fireRate: 210, speed: 8, range: 88, glow: 'rgba(40,247,255,.22)' },
    { name: 'Ember SG', icon: '💥', type: 'شوتغن قريب', damage: 38, fireRate: 430, speed: 7, range: 48, glow: 'rgba(255,122,24,.24)' },
    { name: 'Falcon DMR', icon: '🎯', type: 'قناص سريع', damage: 30, fireRate: 520, speed: 11, range: 100, glow: 'rgba(183,255,60,.2)' },
    { name: 'Pulse SMG', icon: '⚡', type: 'رشاش فائق', damage: 13, fireRate: 120, speed: 9, range: 62, glow: 'rgba(124,60,255,.24)' }
];

const rankingSeed = [
    ['صقر جدة', 'أسطوري', 9820, 42, 488], ['ظل الرياض', 'أسطوري', 9410, 39, 502], ['برق الدمام', 'ماسي', 8720, 34, 420],
    ['نمر تبوك', 'ماسي', 8510, 32, 395], ['ليث المدينة', 'ماسي', 8290, 30, 377], ['قناص أبها', 'ذهبي', 7620, 26, 338],
    ['شهاب مكة', 'ذهبي', 7440, 25, 301], ['رعد القصيم', 'ذهبي', 7110, 22, 286], ['فهد حائل', 'ماسي', 8060, 29, 360],
    ['عنقاء الشرقية', 'أسطوري', 9100, 36, 451], ['سهم نجران', 'ذهبي', 6900, 20, 270], ['نجم الجوف', 'ماسي', 7980, 28, 344]
].map(([name, tier, points, wins, kills], index) => ({ id: index + 1, name, tier, points, wins, kills }));

const app = {
    selectedWeapon: weapons[0],
    rankPage: 1,
    rankPerPage: 6
};

function navigate(path, replace = false) {
    const normalized = routes[path] ? path : '/';
    if (replace) history.replaceState({}, '', normalized);
    else history.pushState({}, '', normalized);
    renderRoute();
}

function renderRoute() {
    const path = routes[location.pathname] ? location.pathname : '/';
    const page = routes[path];
    document.querySelectorAll('[data-page]').forEach(section => {
        section.classList.toggle('hidden', section.dataset.page !== page);
    });
    document.querySelectorAll('[data-route]').forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === path || (path === '/rankings/season' && href === '/rankings/season'));
    });
    document.getElementById('navLinks')?.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initNavigation() {
    document.addEventListener('click', event => {
        const link = event.target.closest('[data-route]');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href?.startsWith('/')) return;
        event.preventDefault();
        navigate(href);
    });

    document.getElementById('menuToggle')?.addEventListener('click', () => {
        document.getElementById('navLinks')?.classList.toggle('hidden');
    });

    window.addEventListener('popstate', renderRoute);
    renderRoute();
}

function renderWeapons() {
    const grid = document.getElementById('weaponGrid');
    if (!grid) return;
    grid.innerHTML = weapons.map((weapon, index) => `
        <article class="weapon-card reveal" style="--glow:${weapon.glow}; animation-delay:${index * 90}ms">
            <div class="relative z-10 flex h-full flex-col">
                <div class="flex items-start justify-between gap-3">
                    <div>
                        <p class="section-kicker">${weapon.type}</p>
                        <h2 class="mt-2 font-display text-3xl font-extrabold">${weapon.name}</h2>
                    </div>
                    <span class="weapon-icon">${weapon.icon}</span>
                </div>
                <div class="mt-8 space-y-4">
                    ${statBar('القوة', Math.min(100, weapon.damage * 2.4))}
                    ${statBar('السرعة', Math.min(100, 115 - weapon.fireRate / 6))}
                    ${statBar('المدى', weapon.range)}
                </div>
                <button class="secondary-btn mt-auto w-full select-weapon ${app.selectedWeapon.name === weapon.name ? '!border-acid/60 !bg-acid/15 !text-acid' : ''}" data-weapon="${weapon.name}">${app.selectedWeapon.name === weapon.name ? 'محدد الآن' : 'اختيار السلاح'}</button>
            </div>
        </article>
    `).join('');

    grid.querySelectorAll('.select-weapon').forEach(button => {
        button.addEventListener('click', () => {
            app.selectedWeapon = weapons.find(weapon => weapon.name === button.dataset.weapon) || weapons[0];
            document.getElementById('weaponHud').textContent = app.selectedWeapon.name;
            renderWeapons();
        });
    });
}

function statBar(label, value) {
    return `<div><div class="mb-2 flex justify-between text-sm text-white/62"><span>${label}</span><b>${Math.round(value)}</b></div><div class="bar"><span style="width:${Math.max(8, Math.min(100, value))}%"></span></div></div>`;
}

function initRanking() {
    ['rankSearch', 'rankTier', 'rankSort'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', () => { app.rankPage = 1; renderRanking(); });
    });
    document.getElementById('prevRank')?.addEventListener('click', () => { app.rankPage = Math.max(1, app.rankPage - 1); renderRanking(); });
    document.getElementById('nextRank')?.addEventListener('click', () => { app.rankPage += 1; renderRanking(); });
    renderRanking();
}

function renderRanking() {
    const body = document.getElementById('rankBody');
    if (!body) return;
    const search = document.getElementById('rankSearch')?.value.trim() || '';
    const tier = document.getElementById('rankTier')?.value || 'all';
    const sort = document.getElementById('rankSort')?.value || 'points';
    let rows = rankingSeed
        .filter(player => tier === 'all' || player.tier === tier)
        .filter(player => player.name.includes(search));
    rows.sort((a, b) => b[sort] - a[sort]);
    const pages = Math.max(1, Math.ceil(rows.length / app.rankPerPage));
    app.rankPage = Math.min(app.rankPage, pages);
    const start = (app.rankPage - 1) * app.rankPerPage;
    const pageRows = rows.slice(start, start + app.rankPerPage);

    body.innerHTML = pageRows.map((player, index) => `
        <tr class="transition hover:bg-white/[.06]">
            <td class="p-4 text-neon">${start + index + 1}</td>
            <td class="p-4 font-bold">${player.name}</td>
            <td class="p-4"><span class="rounded-full border border-ember/30 bg-ember/10 px-3 py-1 text-amber-100">${player.tier}</span></td>
            <td class="p-4">${player.points.toLocaleString('ar-SA')}</td>
            <td class="p-4">${player.wins}</td>
            <td class="p-4">${player.kills}</td>
            <td class="p-4"><button class="rounded-xl border border-neon/25 bg-neon/10 px-3 py-2 text-neon transition hover:bg-neon/20 focus:outline-none focus:ring-2 focus:ring-neon">عرض</button></td>
        </tr>
    `).join('') || `<tr><td class="p-6 text-center text-white/50" colspan="7">لا توجد نتائج</td></tr>`;
    document.getElementById('rankPageInfo').textContent = `صفحة ${app.rankPage} من ${pages} — ${rows.length} لاعب`;
    document.getElementById('prevRank').disabled = app.rankPage <= 1;
    document.getElementById('nextRank').disabled = app.rankPage >= pages;
}

function initContact() {
    document.getElementById('joinForm')?.addEventListener('submit', event => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        document.getElementById('formMessage').textContent = `تم تسجيل ${data.get('name')} في قائمة السكواد التجريبية ✅`;
        event.currentTarget.reset();
    });
}

class RoyaleGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keys = new Set();
        this.pointer = { x: canvas.width / 2, y: canvas.height / 2, down: false };
        this.running = false;
        this.lastTime = 0;
        this.lastShot = 0;
        this.touchFire = false;
        this.reset();
        this.bindEvents();
        requestAnimationFrame(time => this.loop(time));
    }

    reset() {
        this.player = { x: 480, y: 310, r: 15, hp: 100, armor: 0, speed: 245, kills: 0 };
        this.bullets = [];
        this.particles = [];
        this.zone = { x: 480, y: 310, r: 285, min: 96, shrink: .018 };
        this.bots = Array.from({ length: 23 }, (_, i) => this.makeBot(i));
        this.loot = Array.from({ length: 16 }, () => this.makeLoot());
        this.running = false;
        this.over = false;
        this.status('جاهز للنزول');
        this.updateHud();
        const overlay = document.getElementById('gameOverlay');
        overlay?.classList.remove('hidden');
        if (overlay) {
            overlay.innerHTML = `<div class="max-w-md rounded-[2rem] border border-white/15 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-xl"><p class="text-5xl">🪂</p><h2 class="mt-3 font-display text-3xl font-bold">اضغط تشغيل الجولة</h2><p class="mt-2 text-sm leading-7 text-white/65">اجمع الصناديق اللامعة، اهرب من المنطقة، وأسقط البوتات قبل النهاية.</p></div>`;
        }
        this.draw();
    }

    makeBot(i) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 120 + Math.random() * 230;
        return {
            id: i,
            x: 480 + Math.cos(angle) * dist,
            y: 310 + Math.sin(angle) * dist,
            r: 13,
            hp: 55 + Math.random() * 30,
            speed: 86 + Math.random() * 48,
            lastShot: 0,
            color: ['#ff7a18', '#ff3c6f', '#b7ff3c'][i % 3]
        };
    }

    makeLoot() {
        const kind = ['heal', 'armor', 'weapon'][Math.floor(Math.random() * 3)];
        return { x: 55 + Math.random() * 850, y: 55 + Math.random() * 510, r: 12, kind, pulse: Math.random() * Math.PI * 2 };
    }

    bindEvents() {
        window.addEventListener('keydown', e => this.keys.add(e.key));
        window.addEventListener('keyup', e => this.keys.delete(e.key));
        this.canvas.addEventListener('pointermove', e => {
            const rect = this.canvas.getBoundingClientRect();
            this.pointer.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            this.pointer.y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        });
        this.canvas.addEventListener('pointerdown', e => { this.pointer.down = true; this.canvas.setPointerCapture?.(e.pointerId); });
        window.addEventListener('pointerup', () => { this.pointer.down = false; this.touchFire = false; });
        document.getElementById('startGame')?.addEventListener('click', () => this.start());
        document.getElementById('resetGame')?.addEventListener('click', () => this.reset());
        document.getElementById('touchFire')?.addEventListener('pointerdown', () => { this.touchFire = true; });
        document.querySelectorAll('.touch-control').forEach(button => {
            const key = button.dataset.key;
            button.addEventListener('pointerdown', () => this.keys.add(key));
            button.addEventListener('pointerup', () => this.keys.delete(key));
            button.addEventListener('pointerleave', () => this.keys.delete(key));
        });
    }

    start() {
        if (this.over) this.reset();
        this.running = true;
        document.getElementById('gameOverlay')?.classList.add('hidden');
        this.status('المعركة بدأت');
    }

    status(text) { document.getElementById('gameStatus').textContent = text; }

    loop(time) {
        const dt = Math.min(.033, (time - this.lastTime) / 1000 || 0);
        this.lastTime = time;
        if (this.running && !this.over) this.update(dt, time);
        this.draw();
        requestAnimationFrame(t => this.loop(t));
    }

    update(dt, time) {
        this.movePlayer(dt);
        this.updateZone(dt);
        this.handleLoot();
        if (this.pointer.down || this.touchFire) this.shoot(this.player, this.pointer.x, this.pointer.y, time, false);
        this.updateBots(dt, time);
        this.updateBullets(dt);
        this.updateParticles(dt);
        this.checkEnd();
        this.updateHud();
    }

    movePlayer(dt) {
        let dx = 0, dy = 0;
        if (this.keys.has('ArrowUp') || this.keys.has('w') || this.keys.has('W')) dy -= 1;
        if (this.keys.has('ArrowDown') || this.keys.has('s') || this.keys.has('S')) dy += 1;
        if (this.keys.has('ArrowRight') || this.keys.has('d') || this.keys.has('D')) dx += 1;
        if (this.keys.has('ArrowLeft') || this.keys.has('a') || this.keys.has('A')) dx -= 1;
        const length = Math.hypot(dx, dy) || 1;
        this.player.x = clamp(this.player.x + (dx / length) * this.player.speed * dt, this.player.r, this.canvas.width - this.player.r);
        this.player.y = clamp(this.player.y + (dy / length) * this.player.speed * dt, this.player.r, this.canvas.height - this.player.r);
    }

    updateZone(dt) {
        if (this.zone.r > this.zone.min) this.zone.r -= this.zone.shrink * 60 * dt;
        const distance = Math.hypot(this.player.x - this.zone.x, this.player.y - this.zone.y);
        if (distance > this.zone.r) this.damagePlayer(8 * dt);
    }

    damagePlayer(amount) {
        if (this.player.armor > 0) {
            const absorbed = Math.min(this.player.armor, amount * .65);
            this.player.armor -= absorbed;
            amount -= absorbed;
        }
        this.player.hp -= amount;
        if (this.player.hp <= 0) this.end(false);
    }

    handleLoot() {
        this.loot = this.loot.filter(item => {
            if (Math.hypot(this.player.x - item.x, this.player.y - item.y) < this.player.r + item.r + 5) {
                if (item.kind === 'heal') this.player.hp = Math.min(100, this.player.hp + 28);
                if (item.kind === 'armor') this.player.armor = Math.min(100, this.player.armor + 35);
                if (item.kind === 'weapon') app.selectedWeapon = weapons[Math.floor(Math.random() * weapons.length)];
                this.burst(item.x, item.y, item.kind === 'heal' ? '#b7ff3c' : item.kind === 'armor' ? '#28f7ff' : '#ff7a18');
                document.getElementById('weaponHud').textContent = app.selectedWeapon.name;
                return false;
            }
            return true;
        });
        while (this.loot.length < 10) this.loot.push(this.makeLoot());
    }

    shoot(source, tx, ty, time, bot = false) {
        const weapon = bot ? { damage: 9, fireRate: 650, speed: 6 } : app.selectedWeapon;
        const lastKey = bot ? 'lastShot' : 'lastShot';
        if (time - source[lastKey] < weapon.fireRate) return;
        source[lastKey] = time;
        const angle = Math.atan2(ty - source.y, tx - source.x);
        this.bullets.push({
            x: source.x + Math.cos(angle) * 18,
            y: source.y + Math.sin(angle) * 18,
            vx: Math.cos(angle) * weapon.speed * 60,
            vy: Math.sin(angle) * weapon.speed * 60,
            life: bot ? .95 : 1.15,
            damage: weapon.damage,
            bot,
            r: bot ? 3 : 4
        });
    }

    updateBots(dt, time) {
        this.bots.forEach(bot => {
            const toPlayer = Math.atan2(this.player.y - bot.y, this.player.x - bot.x);
            const distancePlayer = Math.hypot(this.player.x - bot.x, this.player.y - bot.y);
            const zoneDistance = Math.hypot(bot.x - this.zone.x, bot.y - this.zone.y);
            let targetAngle = distancePlayer < 300 ? toPlayer : Math.atan2(this.zone.y - bot.y, this.zone.x - bot.x);
            if (zoneDistance > this.zone.r - 20) targetAngle = Math.atan2(this.zone.y - bot.y, this.zone.x - bot.x);
            bot.x = clamp(bot.x + Math.cos(targetAngle) * bot.speed * dt, bot.r, this.canvas.width - bot.r);
            bot.y = clamp(bot.y + Math.sin(targetAngle) * bot.speed * dt, bot.r, this.canvas.height - bot.r);
            if (distancePlayer < 245) this.shoot(bot, this.player.x, this.player.y, time, true);
            if (zoneDistance > this.zone.r) bot.hp -= 8 * dt;
        });
        this.bots = this.bots.filter(bot => {
            if (bot.hp <= 0) { this.burst(bot.x, bot.y, bot.color); return false; }
            return true;
        });
    }

    updateBullets(dt) {
        this.bullets.forEach(bullet => {
            bullet.x += bullet.vx * dt;
            bullet.y += bullet.vy * dt;
            bullet.life -= dt;
        });
        this.bullets = this.bullets.filter(bullet => {
            if (bullet.life <= 0 || bullet.x < -20 || bullet.x > this.canvas.width + 20 || bullet.y < -20 || bullet.y > this.canvas.height + 20) return false;
            if (bullet.bot) {
                if (Math.hypot(bullet.x - this.player.x, bullet.y - this.player.y) < this.player.r + bullet.r) {
                    this.damagePlayer(bullet.damage);
                    this.burst(this.player.x, this.player.y, '#ff3c6f', 5);
                    return false;
                }
            } else {
                for (const bot of this.bots) {
                    if (Math.hypot(bullet.x - bot.x, bullet.y - bot.y) < bot.r + bullet.r) {
                        bot.hp -= bullet.damage;
                        this.burst(bot.x, bot.y, '#28f7ff', 4);
                        if (bot.hp <= 0) this.player.kills += 1;
                        return false;
                    }
                }
            }
            return true;
        });
    }

    burst(x, y, color, count = 12) {
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2;
            this.particles.push({ x, y, vx: Math.cos(a) * (55 + Math.random() * 90), vy: Math.sin(a) * (55 + Math.random() * 90), life: .35 + Math.random() * .35, color });
        }
    }

    updateParticles(dt) {
        this.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
        this.particles = this.particles.filter(p => p.life > 0);
    }

    checkEnd() {
        if (this.bots.length <= 0) this.end(true);
    }

    end(won) {
        this.over = true;
        this.running = false;
        this.status(won ? 'فزت بالمركز الأول!' : 'انتهت الجولة');
        const overlay = document.getElementById('gameOverlay');
        overlay?.classList.remove('hidden');
        if (overlay) {
            overlay.innerHTML = `<div class="max-w-md rounded-[2rem] border border-white/15 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-xl"><p class="text-5xl">${won ? '🏆' : '💀'}</p><h2 class="mt-3 font-display text-3xl font-bold">${won ? 'بويا! أنت البطل' : 'حاول مرة ثانية'}</h2><p class="mt-2 text-sm leading-7 text-white/65">القتل: ${this.player.kills} — المتبقين: ${this.bots.length + 1}</p></div>`;
        }
    }

    updateHud() {
        document.getElementById('healthHud').textContent = Math.max(0, Math.round(this.player.hp));
        document.getElementById('armorHud').textContent = Math.round(this.player.armor);
        document.getElementById('weaponHud').textContent = app.selectedWeapon.name;
        document.getElementById('aliveHud').textContent = this.bots.length + 1;
        document.getElementById('killsHud').textContent = this.player.kills;
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMap(ctx);
        this.drawZone(ctx);
        this.drawLoot(ctx);
        this.bots.forEach(bot => this.drawBot(ctx, bot));
        this.drawPlayer(ctx);
        this.drawBullets(ctx);
        this.drawParticles(ctx);
    }

    drawMap(ctx) {
        ctx.fillStyle = '#070a12';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.strokeStyle = 'rgba(40,247,255,.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.canvas.height); ctx.stroke(); }
        for (let y = 0; y < this.canvas.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.canvas.width, y); ctx.stroke(); }
        const buildings = [[90,80,120,70], [735,95,130,90], [190,430,180,80], [615,385,145,125], [430,145,105,92]];
        buildings.forEach(([x, y, w, h], i) => {
            ctx.fillStyle = i % 2 ? 'rgba(255,122,24,.10)' : 'rgba(40,247,255,.10)';
            roundRect(ctx, x, y, w, h, 18, true, false);
            ctx.strokeStyle = 'rgba(255,255,255,.08)';
            roundRect(ctx, x, y, w, h, 18, false, true);
        });
    }

    drawZone(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(255,48,70,.16)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(this.zone.x, this.zone.y, this.zone.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.beginPath();
        ctx.arc(this.zone.x, this.zone.y, this.zone.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(40,247,255,.85)';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#28f7ff';
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    drawLoot(ctx) {
        this.loot.forEach(item => {
            item.pulse += .05;
            const color = item.kind === 'heal' ? '#b7ff3c' : item.kind === 'armor' ? '#28f7ff' : '#ff7a18';
            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.rotate(item.pulse);
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 14;
            roundRect(ctx, -item.r, -item.r, item.r * 2, item.r * 2, 5, true, false);
            ctx.restore();
        });
    }

    drawPlayer(ctx) {
        const angle = Math.atan2(this.pointer.y - this.player.y, this.pointer.x - this.player.x);
        ctx.save();
        ctx.translate(this.player.x, this.player.y);
        ctx.rotate(angle);
        ctx.fillStyle = '#b7ff3c';
        ctx.shadowColor = '#b7ff3c';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(0, 0, this.player.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#071019';
        roundRect(ctx, 6, -4, 20, 8, 3, true, false);
        ctx.restore();
        this.drawHealthBar(ctx, this.player.x, this.player.y - 28, this.player.hp / 100, '#b7ff3c');
    }

    drawBot(ctx, bot) {
        const angle = Math.atan2(this.player.y - bot.y, this.player.x - bot.x);
        ctx.save();
        ctx.translate(bot.x, bot.y);
        ctx.rotate(angle);
        ctx.fillStyle = bot.color;
        ctx.shadowColor = bot.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, bot.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,.55)';
        roundRect(ctx, 5, -3, 16, 6, 2, true, false);
        ctx.restore();
        this.drawHealthBar(ctx, bot.x, bot.y - 24, bot.hp / 85, bot.color);
    }

    drawHealthBar(ctx, x, y, ratio, color) {
        ctx.fillStyle = 'rgba(0,0,0,.45)';
        roundRect(ctx, x - 18, y, 36, 5, 3, true, false);
        ctx.fillStyle = color;
        roundRect(ctx, x - 18, y, 36 * clamp(ratio, 0, 1), 5, 3, true, false);
    }

    drawBullets(ctx) {
        this.bullets.forEach(b => {
            ctx.fillStyle = b.bot ? '#ff7a18' : '#28f7ff';
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    }

    drawParticles(ctx) {
        this.particles.forEach(p => {
            ctx.globalAlpha = clamp(p.life * 2, 0, 1);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        });
    }
}

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

function initGame() {
    const canvas = document.getElementById('gameCanvas');
    if (canvas) window.royaleGame = new RoyaleGame(canvas);
}

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    renderWeapons();
    initRanking();
    initContact();
    initGame();
});
