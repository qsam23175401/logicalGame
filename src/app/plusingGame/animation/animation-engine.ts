/**
 * Canvas 2D 動畫引擎 — 幼童直覺式加減法演示
 *
 * 用十格框 (ten-frame) 代表「十」，用單顆 emoji 代表「一」。
 * 透過 requestAnimationFrame + lerp 實現平滑動畫，
 * 以 async/await 編排每個步驟的順序和暫停。
 */

// ─── 資料類型 ───

interface CanvasItem {
  id: number;
  type: 'tenFrame' | 'one';
  emoji: string;
  x: number; y: number;
  targetX: number; targetY: number;
  opacity: number; targetOpacity: number;
  scale: number; targetScale: number;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  color: string; size: number;
  rot: number; rotV: number;
}

// ─── 主引擎 ───

export class AnimationEngine {

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private items: CanvasItem[] = [];
  private rafId = 0;
  private running = false;
  private gen = 0;          // 世代計數，用來安全取消動畫
  private nextId = 0;
  public paused = false;

  // 文字覆層
  private title = '';
  private subtitle = '';
  private resultTxt = '';
  private resultSub = '';

  // 碎紙
  private confetti: Particle[] = [];
  private confettiOn = false;

  // 尺寸（resize 時重算）
  private dotSize = 18;
  private dotGap = 22;

  // Emoji 設定
  readonly EMOJI_A = '🍎';
  readonly EMOJI_B = '⭐';
  readonly EMOJI_CARRY = '💎';
  readonly EMOJI_BORROW = '🍏';

  // ═══════════════ 初始化 ═══════════════

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const w = Math.min(parent.clientWidth - 10, 480);
    this.canvas.width = w;
    this.canvas.height = 400;
    this.dotSize = w < 350 ? 14 : 18;
    this.dotGap = this.dotSize + 4;
    if (!this.running) this.draw();
  }

  reset() {
    this.gen++;
    cancelAnimationFrame(this.rafId);
    this.items = [];
    this.title = '';
    this.subtitle = '';
    this.resultTxt = '';
    this.resultSub = '';
    this.confetti = [];
    this.confettiOn = false;
    this.nextId = 0;
    this.running = false;
    this.paused = false;
    if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  stopAnimation() {
    this.gen++;
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  togglePause() {
    this.paused = !this.paused;
  }

  // ═══════════════ 繪圖 ═══════════════

  private draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // 標題
    if (this.title) {
      ctx.font = `bold ${this.dotSize + 4}px "Microsoft YaHei", "Noto Sans TC", sans-serif`;
      ctx.fillStyle = '#2c3e50';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.title, w / 2, 24);
    }

    // 副標題
    if (this.subtitle) {
      ctx.font = `${Math.round(this.dotSize * 0.8)}px "Microsoft YaHei", "Noto Sans TC", sans-serif`;
      ctx.fillStyle = '#444';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.subtitle, w / 2, 50);
    }

    // 所有物件
    for (const item of this.items) {
      if (item.opacity < 0.01) continue;
      ctx.save();
      ctx.globalAlpha = Math.min(1, item.opacity);
      if (item.type === 'tenFrame') this.drawTF(item);
      else this.drawOne(item);
      ctx.restore();
    }

    // 結果
    if (this.resultTxt) {
      ctx.save();
      ctx.font = `bold ${this.dotSize * 2.5}px "Microsoft YaHei", sans-serif`;
      ctx.fillStyle = '#c0392b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.resultTxt, w / 2, h - 80);
      if (this.resultSub) {
        ctx.font = `${this.dotSize}px "Microsoft YaHei", sans-serif`;
        ctx.fillStyle = '#555';
        ctx.fillText(this.resultSub, w / 2, h - 45);
      }
      ctx.restore();
    }

    if (this.confettiOn) this.renderConfetti();
  }

  /** 繪製十格框（2×5 方格內含 emoji） */
  private drawTF(item: CanvasItem) {
    const ctx = this.ctx;
    const s = item.scale * this.dotSize;
    if (s < 1) return;
    const cell = s + 2;
    const pad = 3;
    const fw = 5 * cell + 2 * pad;
    const fh = 2 * cell + 2 * pad;
    const rx = item.x - fw / 2;
    const ry = item.y - fh / 2;

    // 底框
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.strokeStyle = 'rgba(80,80,80,0.2)';
    ctx.lineWidth = 1.5;
    this.roundRect(rx, ry, fw, fh, 5);
    ctx.fill();
    ctx.stroke();

    // 10 個 emoji
    ctx.font = `${s}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 5; c++) {
        ctx.fillText(item.emoji, rx + pad + c * cell + cell / 2, ry + pad + r * cell + cell / 2);
      }
    }
  }

  /** 繪製單個 emoji */
  private drawOne(item: CanvasItem) {
    const s = item.scale * this.dotSize;
    if (s < 1) return;
    this.ctx.font = `${s}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(item.emoji, item.x, item.y);
  }

  /** 手繪圓角矩形（相容性最好） */
  private roundRect(x: number, y: number, w: number, h: number, r: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  /** 碎紙動畫 */
  private renderConfetti() {
    if (this.confetti.length === 0) {
      const colors = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6', '#e91e63'];
      for (let i = 0; i < 50; i++) {
        this.confetti.push({
          x: this.canvas.width / 2,
          y: this.canvas.height * 0.35,
          vx: (Math.random() - 0.5) * 10,
          vy: -Math.random() * 7 - 2,
          color: colors[i % colors.length],
          size: 3 + Math.random() * 5,
          rot: Math.random() * Math.PI * 2,
          rotV: (Math.random() - 0.5) * 0.2,
        });
      }
    }
    const ctx = this.ctx;
    for (const p of this.confetti) {
      if (!this.paused) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.rot += p.rotV;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
      ctx.restore();
    }
  }

  // ═══════════════ 動畫迴圈 ═══════════════

  private loop = () => {
    if (!this.running) return;
    this.tick();
    this.draw();
    this.rafId = requestAnimationFrame(this.loop);
  };

  /** 每幀更新：用 lerp 平滑移動所有物件 */
  private tick() {
    if (this.paused) return;
    const spd = 0.07;
    for (const item of this.items) {
      item.x += (item.targetX - item.x) * spd;
      item.y += (item.targetY - item.y) * spd;
      item.opacity += (item.targetOpacity - item.opacity) * spd;
      item.scale += (item.targetScale - item.scale) * spd;
    }
    // 清除已完全消失的物件
    this.items = this.items.filter(i => i.targetOpacity > 0 || i.opacity > 0.02);
  }

  /** 檢查所有物件是否已到達目標 */
  private settled(): boolean {
    for (const item of this.items) {
      if (Math.abs(item.x - item.targetX) > 0.8) return false;
      if (Math.abs(item.y - item.targetY) > 0.8) return false;
      if (Math.abs(item.opacity - item.targetOpacity) > 0.02) return false;
      if (Math.abs(item.scale - item.targetScale) > 0.02) return false;
    }
    return true;
  }

  /** 等待所有動畫到位 */
  private awaitSettle(g: number): Promise<void> {
    return new Promise(resolve => {
      const f = () => {
        if (this.gen !== g || this.settled()) resolve();
        else setTimeout(f, 50);
      };
      setTimeout(f, 80);
    });
  }

  /** 延遲（可被 stop/reset 中斷，且支援暫停） */
  private delay(ms: number, g: number): Promise<void> {
    return new Promise(resolve => {
      let left = ms;
      let last = Date.now();
      const f = () => {
        if (this.gen !== g) {
          resolve();
          return;
        }
        const now = Date.now();
        const dt = now - last;
        last = now;
        if (!this.paused) {
          left -= dt;
        }
        if (left <= 0) resolve();
        else setTimeout(f, 40);
      };
      f();
    });
  }

  /** 一個完整步驟：等動畫到位 → 暫停，回傳 false 表示動畫已取消 */
  private async step(ms: number, g: number): Promise<boolean> {
    await this.awaitSettle(g);
    if (this.gen !== g) return false;
    await this.delay(ms, g);
    return this.gen === g;
  }

  // ═══════════════ 物件 & 佈局 ═══════════════

  private addItem(type: 'tenFrame' | 'one', emoji: string, x: number, y: number): CanvasItem {
    const item: CanvasItem = {
      id: this.nextId++, type, emoji,
      x, y, targetX: x, targetY: y,
      opacity: 0, targetOpacity: 1,
      scale: 0.2, targetScale: 1,
    };
    this.items.push(item);
    return item;
  }

  /** 十格框的像素寬度 */
  private tfW(): number { return 5 * (this.dotSize + 2) + 6; }
  /** 十格框的像素高度 */
  private tfH(): number { return 2 * (this.dotSize + 2) + 6; }

  /** 計算 N 個十格框的排列位置（每排最多 3 個，置中） */
  private layoutTFs(n: number, y0: number): { x: number; y: number }[] {
    if (n <= 0) return [];
    const tw = this.tfW(), th = this.tfH(), gap = 8;
    const w = this.canvas.width;
    const out: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / 3), col = i % 3;
      const rowN = Math.min(3, n - row * 3);
      const totalW = rowN * tw + (rowN - 1) * gap;
      const x0 = (w - totalW) / 2 + tw / 2;
      out.push({ x: x0 + col * (tw + gap), y: y0 + row * (th + gap) + th / 2 });
    }
    return out;
  }

  /** 十格框區段佔用的高度 */
  private tfSecH(n: number): number {
    if (n <= 0) return 0;
    const th = this.tfH(), gap = 8;
    return Math.ceil(n / 3) * (th + gap);
  }

  /** 計算 N 個「一」的排列位置（每排最多 10 個，置中） */
  private layoutOnes(n: number, y0: number): { x: number; y: number }[] {
    if (n <= 0) return [];
    const g = this.dotGap;
    const w = this.canvas.width;
    const out: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / 10), col = i % 10;
      const rowN = Math.min(10, n - row * 10);
      const totalW = rowN * g;
      const x0 = (w - totalW) / 2 + g / 2;
      out.push({ x: x0 + col * g, y: y0 + row * (g + 2) });
    }
    return out;
  }

  /** 「一」區段佔用的高度 */
  private onesSecH(n: number): number {
    if (n <= 0) return 0;
    return Math.ceil(n / 10) * (this.dotGap + 2);
  }

  /** 產生一個數字的十格框 + 個位圓點 */
  private spawnNum(tens: number, ones: number, emoji: string, y0: number) {
    const cx = this.canvas.width / 2;
    const tfPos = this.layoutTFs(tens, y0);
    const tfs: CanvasItem[] = [];
    for (const p of tfPos) {
      const it = this.addItem('tenFrame', emoji, cx, -30);
      it.targetX = p.x; it.targetY = p.y;
      tfs.push(it);
    }
    const oy = y0 + this.tfSecH(tens) + (tens > 0 && ones > 0 ? 5 : 0);
    const oPos = this.layoutOnes(ones, oy);
    const os: CanvasItem[] = [];
    for (const p of oPos) {
      const it = this.addItem('one', emoji, cx, -30);
      it.targetX = p.x; it.targetY = p.y;
      os.push(it);
    }
    const nextY = oy + this.onesSecH(ones);
    return { tfs, ones: os, nextY };
  }

  /** 「X個十 + Y個一」的中文描述 */
  private desc(n: number): string {
    const t = Math.floor(n / 10), o = n % 10;
    if (t > 0 && o > 0) return `${t}個十 + ${o}個一`;
    if (t > 0) return `${t}個十`;
    return `${o}個一`;
  }

  // ═══════════════ 加法動畫 ═══════════════

  async playAddition(a: number, b: number) {
    this.reset();
    const g = this.gen;
    this.running = true;
    requestAnimationFrame(this.loop);

    const tA = Math.floor(a / 10), oA = a % 10;
    const tB = Math.floor(b / 10), oB = b % 10;
    const ans = a + b;
    const totalO = oA + oB;
    const carry = totalO >= 10;
    const finalT = tA + tB + (carry ? 1 : 0);
    const finalO = carry ? totalO - 10 : totalO;
    const y0 = 65;

    // ── 步驟 1：展示數字 A ──
    this.title = `${a} + ${b}`;
    this.subtitle = `${a} = ${this.desc(a)}`;
    const partA = this.spawnNum(tA, oA, this.EMOJI_A, y0);
    if (!await this.step(2000, g)) return;

    // ── 步驟 2：展示數字 B ──
    const bTop = partA.nextY + 25;
    this.subtitle = `${b} = ${this.desc(b)}`;
    const partB = this.spawnNum(tB, oB, this.EMOJI_B, bTop);
    if (!await this.step(2000, g)) return;

    // ── 步驟 3：合併個位 ──
    const allOnes = [...partA.ones, ...partB.ones];
    const onesY = y0 + this.tfSecH(tA) + 5;

    if (totalO > 0) {
      this.subtitle = `個位：${oA} + ${oB} = ${totalO}`;
      const cPos = this.layoutOnes(allOnes.length, onesY);
      for (let i = 0; i < allOnes.length; i++) {
        allOnes[i].targetX = cPos[i].x;
        allOnes[i].targetY = cPos[i].y;
      }
      if (!await this.step(2000, g)) return;
    }

    if (carry) {
      // ── 步驟 4：湊十進位 ✨ ──
      this.subtitle = `${totalO}個 → 湊成 1個十 + ${finalO}個一 ✨ 進位！`;
      const cx = this.canvas.width / 2;
      const mergeY = onesY + 10;

      // 前 10 個圓點縮小消失
      for (let i = 0; i < 10 && i < allOnes.length; i++) {
        allOnes[i].targetX = cx;
        allOnes[i].targetY = mergeY;
        allOnes[i].targetScale = 0.1;
        allOnes[i].targetOpacity = 0;
      }
      await this.awaitSettle(g);
      if (this.gen !== g) return;

      // 產生進位十格框
      const carryTF = this.addItem('tenFrame', this.EMOJI_CARRY, cx, mergeY);
      carryTF.scale = 0.1;
      partA.tfs.push(carryTF);

      // 剩餘的個位重新排列
      const remOnes = allOnes.slice(10);
      if (remOnes.length > 0) {
        const remY = onesY + this.tfH() + 15;
        const remPos = this.layoutOnes(remOnes.length, remY);
        for (let i = 0; i < remOnes.length; i++) {
          remOnes[i].targetX = remPos[i].x;
          remOnes[i].targetY = remPos[i].y;
        }
      }
      if (!await this.step(3000, g)) return;

      // ── 步驟 5：合併十位 ──
      this.subtitle = `十位：${tA} + ${tB} + 1(進位) = ${finalT}個十`;
      const allTFs = [...partA.tfs, ...partB.tfs];
      const tfPos = this.layoutTFs(allTFs.length, y0);
      for (let i = 0; i < allTFs.length; i++) {
        allTFs[i].targetX = tfPos[i].x;
        allTFs[i].targetY = tfPos[i].y;
      }
      const fOnesY = y0 + this.tfSecH(allTFs.length) + 8;
      if (remOnes.length > 0) {
        const fPos = this.layoutOnes(remOnes.length, fOnesY);
        for (let i = 0; i < remOnes.length; i++) {
          remOnes[i].targetX = fPos[i].x;
          remOnes[i].targetY = fPos[i].y;
        }
      }
      if (!await this.step(3000, g)) return;

    } else {
      // 不需進位 → 直接合併十位
      const allTFs = [...partA.tfs, ...partB.tfs];
      if (allTFs.length > 0) {
        this.subtitle = `十位：${tA} + ${tB} = ${finalT}個十`;
        const tfPos = this.layoutTFs(allTFs.length, y0);
        for (let i = 0; i < allTFs.length; i++) {
          allTFs[i].targetX = tfPos[i].x;
          allTFs[i].targetY = tfPos[i].y;
        }
      }
      const fOnesY = y0 + this.tfSecH(allTFs.length) + 8;
      const fPos = this.layoutOnes(allOnes.length, fOnesY);
      for (let i = 0; i < allOnes.length; i++) {
        allOnes[i].targetX = fPos[i].x;
        allOnes[i].targetY = fPos[i].y;
      }
      if (!await this.step(3000, g)) return;
    }

    // ── 步驟 6：顯示結果 🎉 ──
    this.subtitle = '';
    this.resultTxt = `= ${ans}`;
    this.resultSub = `${this.desc(ans)} = ${ans}`;
    this.confettiOn = true;
    await this.delay(3000, g);
    this.running = false;
  }

  // ═══════════════ 減法動畫 ═══════════════

  async playSubtraction(a: number, b: number) {
    this.reset();
    const g = this.gen;
    this.running = true;
    requestAnimationFrame(this.loop);

    let tA = Math.floor(a / 10), oA = a % 10;
    const tB = Math.floor(b / 10), oB = b % 10;
    const ans = a - b;
    const needBorrow = oA < oB;
    const y0 = 65;

    // ── 步驟 1：展示被減數 ──
    this.title = `${a} - ${b}`;
    this.subtitle = `${a} = ${this.desc(a)}`;
    const part = this.spawnNum(tA, oA, this.EMOJI_A, y0);
    const tfs = part.tfs;
    const ones = part.ones;
    if (!await this.step(2000, g)) return;

    // ── 步驟 2：預告 ──
    this.subtitle = `要拿走 ${b}（${this.desc(b)}）`;
    if (!await this.step(3000, g)) return;

    // ── 步驟 3：退位（如果需要）──
    if (needBorrow) {
      this.subtitle = `個位 ${oA} 不夠減 ${oB}，需要退位！`;
      if (!await this.step(3000, g)) return;

      this.subtitle = `拆 1個十 → 10個一`;

      // 拆掉最後一個十格框
      const broken = tfs.pop()!;
      const bx = broken.x, by = broken.y;
      broken.targetOpacity = 0;
      broken.targetScale = 0.1;
      await this.awaitSettle(g);
      if (this.gen !== g) return;

      tA -= 1;
      oA += 10;

      // 重排剩餘十格框
      const newTFPos = this.layoutTFs(tfs.length, y0);
      for (let i = 0; i < tfs.length; i++) {
        tfs[i].targetX = newTFPos[i].x;
        tfs[i].targetY = newTFPos[i].y;
      }

      // 產生 10 個退位圓點（從拆掉的位置飛出）
      for (let i = 0; i < 10; i++) {
        const it = this.addItem('one', this.EMOJI_BORROW, bx, by);
        ones.push(it);
      }

      // 重排所有圓點
      const allOnesY = y0 + this.tfSecH(tfs.length) + 5;
      const onesPos = this.layoutOnes(ones.length, allOnesY);
      for (let i = 0; i < ones.length; i++) {
        ones[i].targetX = onesPos[i].x;
        ones[i].targetY = onesPos[i].y;
      }

      this.subtitle = `現在有 ${tA}個十 + ${oA}個一`;
      if (!await this.step(3000, g)) return;
    }

    // ── 步驟 4：減個位 ──
    if (oB > 0) {
      this.subtitle = `個位：${oA} - ${oB} = ${oA - oB}個一`;
      if (!await this.step(3000, g)) return;
      const offX = this.canvas.width + 40;
      for (let i = 0; i < oB; i++) {
        const it = ones.pop()!;
        it.targetOpacity = 0;
        it.targetX = offX;
      }
      // 重排剩餘圓點
      const rY = y0 + this.tfSecH(tfs.length) + 5;
      const rPos = this.layoutOnes(ones.length, rY);
      for (let i = 0; i < ones.length; i++) {
        ones[i].targetX = rPos[i].x;
        ones[i].targetY = rPos[i].y;
      }
      if (!await this.step(3000, g)) return;
    }

    // ── 步驟 5：減十位 ──
    if (tB > 0) {
      this.subtitle = `十位：${tA} - ${tB} = ${tA - tB}個十`;
      if (!await this.step(3000, g)) return;
      const offX = this.canvas.width + 80;
      for (let i = 0; i < tB; i++) {
        const it = tfs.pop()!;
        it.targetOpacity = 0;
        it.targetX = offX;
      }
      // 重排剩餘十格框
      const newTFPos = this.layoutTFs(tfs.length, y0);
      for (let i = 0; i < tfs.length; i++) {
        tfs[i].targetX = newTFPos[i].x;
        tfs[i].targetY = newTFPos[i].y;
      }
      // 重排圓點
      const rY = y0 + this.tfSecH(tfs.length) + 5;
      const rPos = this.layoutOnes(ones.length, rY);
      for (let i = 0; i < ones.length; i++) {
        ones[i].targetX = rPos[i].x;
        ones[i].targetY = rPos[i].y;
      }
      if (!await this.step(3000, g)) return;
    }

    // ── 步驟 6：顯示結果 🎉 ──
    this.subtitle = '';
    this.resultTxt = `= ${ans}`;
    this.resultSub = `${this.desc(ans)} = ${ans}`;
    this.confettiOn = true;
    await this.delay(3000, g);
    this.running = false;
  }
}
