/**
 * 方块大师 - 皮肤图案绘制库
 *
 * 每个 patternXxx(ctx, x, y, size, color) 函数负责绘制单个积木格
 *
 * 复杂度等级：
 *   L0 纯色   - patternSolid
 *   L1 几何   - patternDots / patternGrid / patternSpeckle / patternChecker
 *   L2 渐变   - patternGlow / patternGlass / patternStripe / patternAurora
 *   L3 图标   - patternPaw / patternStar / patternFlower / patternBubble / patternSnowflake
 *   L4 复合   - patternPixel / patternCloud / patternHoneycomb / patternInk / patternCandyGlass
 *   L5 大师   - patternDiamond / patternGoldRelief / patternGalaxy
 *   L6 限定   - patternDragonScale / patternPumpkin
 */

// ===== 颜色辅助 =====
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}
function rgbToHex(r, g, b) {
  const h = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return '#' + h(r) + h(g) + h(b);
}
function lighten(hex, pct) {
  const { r, g, b } = hexToRgb(hex);
  const f = pct / 100;
  return rgbToHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f);
}
function darken(hex, pct) {
  const { r, g, b } = hexToRgb(hex);
  const f = 1 - pct / 100;
  return rgbToHex(r * f, g * f, b * f);
}
function rgba(hex, a) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

function _roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
function _baseFill(ctx, x, y, size, color, radius = 8) {
  ctx.fillStyle = color;
  _roundRectPath(ctx, x, y, size, size, radius);
  ctx.fill();
}
function _topHighlight(ctx, x, y, size) {
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = '#fff';
  _roundRectPath(ctx, x + 4, y + 4, size - 8, size * 0.32, 6);
  ctx.fill();
  ctx.restore();
}
function _clipRound(ctx, x, y, size, r = 8) {
  ctx.beginPath();
  _roundRectPath(ctx, x, y, size, size, r);
  ctx.clip();
}

// ============ L0 纯色 ============
function patternSolid(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color);
  _topHighlight(ctx, x, y, size);
}

// ============ L1 几何 ============
function patternDots(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color);
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  _topHighlight(ctx, x, y, size);
}

function patternGrid(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color, 4);
  ctx.save();
  ctx.strokeStyle = darken(color, 25);
  ctx.lineWidth = Math.max(1, size * 0.04);
  const m = size / 2;
  ctx.beginPath();
  ctx.moveTo(x + m, y + 4); ctx.lineTo(x + m, y + size - 4);
  ctx.moveTo(x + 4, y + m); ctx.lineTo(x + size - 4, y + m);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = lighten(color, 30);
  ctx.fillRect(x + size * 0.55, y + 4, size * 0.4, size * 0.4);
}

// 极简斑点（不规则散布）
function patternSpeckle(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color);
  ctx.save();
  _clipRound(ctx, x, y, size);
  ctx.fillStyle = lighten(color, 50);
  ctx.globalAlpha = 0.55;
  // 固定布局以保持视觉一致
  const dots = [
    [0.22, 0.30, 0.06],
    [0.65, 0.22, 0.05],
    [0.42, 0.55, 0.07],
    [0.78, 0.68, 0.05],
    [0.18, 0.78, 0.05],
    [0.55, 0.85, 0.04],
  ];
  for (const [dx, dy, dr] of dots) {
    ctx.beginPath();
    ctx.arc(x + size * dx, y + size * dy, size * dr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// 棋盘格（2x2）
function patternChecker(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color, 6);
  ctx.save();
  _clipRound(ctx, x, y, size, 6);
  ctx.fillStyle = lighten(color, 25);
  const half = size / 2;
  ctx.fillRect(x, y, half, half);
  ctx.fillRect(x + half, y + half, half, half);
  ctx.restore();
  _topHighlight(ctx, x, y, size);
}

// ============ L2 渐变 ============
function patternGlow(ctx, x, y, size, color) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const grad = ctx.createRadialGradient(cx, cy - size * 0.15, size * 0.05, cx, cy, size * 0.7);
  grad.addColorStop(0, lighten(color, 40));
  grad.addColorStop(1, color);
  ctx.fillStyle = grad;
  _roundRectPath(ctx, x, y, size, size, 8);
  ctx.fill();
}

function patternGlass(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color);
  ctx.save();
  _clipRound(ctx, x, y, size);
  const grad = ctx.createLinearGradient(x, y, x + size, y + size);
  grad.addColorStop(0, 'rgba(255,255,255,0.55)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, size, size);
  ctx.restore();
  ctx.save();
  ctx.fillStyle = darken(color, 18);
  ctx.globalAlpha = 0.5;
  _roundRectPath(ctx, x, y + size * 0.7, size, size * 0.3, 6);
  ctx.fill();
  ctx.restore();
}

function patternStripe(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color);
  ctx.save();
  _clipRound(ctx, x, y, size);
  ctx.strokeStyle = lighten(color, 30);
  ctx.lineWidth = Math.max(2, size * 0.07);
  for (let i = -size; i < size * 2; i += size * 0.28) {
    ctx.beginPath();
    ctx.moveTo(x + i, y - 4);
    ctx.lineTo(x + i + size, y + size + 4);
    ctx.stroke();
  }
  ctx.restore();
}

// 极光（多色径向）
function patternAurora(ctx, x, y, size, color) {
  // 底色
  _baseFill(ctx, x, y, size, color);
  ctx.save();
  _clipRound(ctx, x, y, size);
  // 多个偏移径向渐变叠加
  const layers = [
    { cx: 0.3, cy: 0.3, r: 0.7, c1: lighten(color, 60), c2: 'rgba(0,0,0,0)' },
    { cx: 0.75, cy: 0.65, r: 0.55, c1: lighten(color, 40), c2: 'rgba(0,0,0,0)' },
  ];
  for (const l of layers) {
    const g = ctx.createRadialGradient(
      x + size * l.cx, y + size * l.cy, 0,
      x + size * l.cx, y + size * l.cy, size * l.r
    );
    g.addColorStop(0, l.c1);
    g.addColorStop(1, l.c2);
    ctx.fillStyle = g;
    ctx.fillRect(x, y, size, size);
  }
  // 顶部白雾
  const top = ctx.createLinearGradient(x, y, x, y + size);
  top.addColorStop(0, 'rgba(255,255,255,0.35)');
  top.addColorStop(0.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = top;
  ctx.fillRect(x, y, size, size);
  ctx.restore();
}

// ============ L3 图标 ============
function patternPaw(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color);
  _topHighlight(ctx, x, y, size);
  ctx.save();
  ctx.fillStyle = lighten(color, 50);
  ctx.beginPath();
  ctx.ellipse(x + size / 2, y + size * 0.65, size * 0.2, size * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  const toes = [[0.30, 0.42], [0.45, 0.32], [0.60, 0.32], [0.75, 0.42]];
  for (const [tx, ty] of toes) {
    ctx.beginPath();
    ctx.ellipse(x + size * tx, y + size * ty, size * 0.075, size * 0.10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function patternStar(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color);
  ctx.save();
  ctx.fillStyle = lighten(color, 50);
  ctx.translate(x + size / 2, y + size / 2);
  const r1 = size * 0.28;
  const r2 = size * 0.12;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? r1 : r2;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(-r1 * 0.4, -r1 * 0.4, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function patternFlower(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color);
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.fillStyle = lighten(color, 45);
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI * 2) / 5);
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.2, size * 0.09, size * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#FFD43B';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 海洋泡泡（多个气泡）
function patternBubble(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color);
  ctx.save();
  _clipRound(ctx, x, y, size);
  const bubbles = [
    [0.30, 0.30, 0.13],
    [0.65, 0.45, 0.10],
    [0.45, 0.70, 0.08],
    [0.78, 0.78, 0.06],
  ];
  for (const [bx, by, br] of bubbles) {
    const cx = x + size * bx;
    const cy = y + size * by;
    const r = size * br;
    // 气泡主体（半透明白）
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    // 描边
    ctx.strokeStyle = lighten(color, 40);
    ctx.lineWidth = 1;
    ctx.stroke();
    // 高光
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// 雪花（六角对称）
function patternSnowflake(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color);
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = Math.max(1.2, size * 0.04);
  ctx.lineCap = 'round';
  const armLen = size * 0.34;
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 3);
    // 主臂
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -armLen);
    ctx.stroke();
    // 侧分支
    ctx.beginPath();
    ctx.moveTo(0, -armLen * 0.55);
    ctx.lineTo(armLen * 0.18, -armLen * 0.75);
    ctx.moveTo(0, -armLen * 0.55);
    ctx.lineTo(-armLen * 0.18, -armLen * 0.75);
    ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ============ L4 复合 ============
function patternPixel(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color, 3);
  ctx.save();
  _clipRound(ctx, x, y, size, 3);
  const ps = size / 4;
  const dark = darken(color, 25);
  const light = lighten(color, 30);
  const map = [
    [1, 1, 0, 0],
    [1, 1, 1, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 2],
  ];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (map[r][c] === 1) ctx.fillStyle = light;
      else if (map[r][c] === 2) ctx.fillStyle = dark;
      else continue;
      ctx.fillRect(x + c * ps, y + r * ps, ps, ps);
    }
  }
  ctx.strokeStyle = darken(color, 15);
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * ps + 0.5, y); ctx.lineTo(x + i * ps + 0.5, y + size);
    ctx.moveTo(x, y + i * ps + 0.5); ctx.lineTo(x + size, y + i * ps + 0.5);
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = darken(color, 35);
  ctx.lineWidth = 2;
  _roundRectPath(ctx, x + 1, y + 1, size - 2, size - 2, 3);
  ctx.stroke();
}

function patternCloud(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color);
  ctx.save();
  _clipRound(ctx, x, y, size);
  ctx.strokeStyle = lighten(color, 45);
  ctx.lineWidth = Math.max(2, size * 0.06);
  ctx.lineCap = 'round';
  const cy = y + size * 0.55;
  ctx.beginPath();
  ctx.arc(x + size * 0.30, cy, size * 0.14, Math.PI, Math.PI * 2);
  ctx.arc(x + size * 0.55, cy - size * 0.05, size * 0.16, Math.PI, Math.PI * 2);
  ctx.arc(x + size * 0.78, cy, size * 0.12, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y + size * 0.25);
  ctx.lineTo(x + size * 0.35, y + size * 0.25);
  ctx.lineTo(x + size * 0.35, y + size * 0.18);
  ctx.lineTo(x + size * 0.28, y + size * 0.18);
  ctx.lineTo(x + size * 0.28, y + size * 0.32);
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = lighten(color, 50);
  ctx.lineWidth = 1.5;
  _roundRectPath(ctx, x + 2, y + 2, size - 4, size - 4, 7);
  ctx.stroke();
}

// 蜂巢战甲（六边形蜂窝）
function patternHoneycomb(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color, 6);
  ctx.save();
  _clipRound(ctx, x, y, size, 6);
  const hexR = size * 0.18;
  const dx = hexR * Math.sqrt(3);
  const dy = hexR * 1.5;
  ctx.strokeStyle = lighten(color, 35);
  ctx.lineWidth = Math.max(1, size * 0.025);
  for (let r = -1; r < 4; r++) {
    for (let c = -1; c < 4; c++) {
      const cx = x + c * dx + (r % 2 ? dx / 2 : 0);
      const cy = y + r * dy;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 - Math.PI / 2;
        const px = cx + Math.cos(a) * hexR;
        const py = cy + Math.sin(a) * hexR;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.restore();
  // 金属高光
  ctx.save();
  _clipRound(ctx, x, y, size, 6);
  const grad = ctx.createLinearGradient(x, y, x, y + size);
  grad.addColorStop(0, 'rgba(255,255,255,0.3)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, size, size);
  ctx.restore();
}

// 水墨山水（不规则墨迹）
function patternInk(ctx, x, y, size, color) {
  // 浅色底（米色调）
  ctx.fillStyle = lighten(color, 70);
  _roundRectPath(ctx, x, y, size, size, 8);
  ctx.fill();
  ctx.save();
  _clipRound(ctx, x, y, size);
  // 主体墨色
  ctx.fillStyle = darken(color, 5);
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.85);
  ctx.bezierCurveTo(
    x + size * 0.2, y + size * 0.55,
    x + size * 0.4, y + size * 0.75,
    x + size * 0.55, y + size * 0.65
  );
  ctx.bezierCurveTo(
    x + size * 0.7, y + size * 0.55,
    x + size * 0.85, y + size * 0.7,
    x + size, y + size * 0.6
  );
  ctx.lineTo(x + size, y + size);
  ctx.lineTo(x, y + size);
  ctx.closePath();
  ctx.fill();
  // 山顶飞白点
  ctx.fillStyle = darken(color, 20);
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.ellipse(x + size * 0.42, y + size * 0.38, size * 0.06, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.72, y + size * 0.32, size * 0.05, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 糖果琉璃（玻璃高光 + 内部光斑）
function patternCandyGlass(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color);
  ctx.save();
  _clipRound(ctx, x, y, size);
  // 三层光斑
  const lights = [
    { cx: 0.35, cy: 0.3, r: 0.35, alpha: 0.5 },
    { cx: 0.7, cy: 0.65, r: 0.25, alpha: 0.35 },
  ];
  for (const l of lights) {
    const g = ctx.createRadialGradient(
      x + size * l.cx, y + size * l.cy, 0,
      x + size * l.cx, y + size * l.cy, size * l.r
    );
    g.addColorStop(0, `rgba(255,255,255,${l.alpha})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, size, size);
  }
  // 顶部弧形高光
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.ellipse(x + size / 2, y + size * 0.18, size * 0.32, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // 玻璃描边
  ctx.strokeStyle = lighten(color, 40);
  ctx.lineWidth = 1.5;
  _roundRectPath(ctx, x + 1, y + 1, size - 2, size - 2, 7);
  ctx.stroke();
}

// ============ L5 大师 ============
// 钻石切面（多边形切割）
function patternDiamond(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color, 6);
  ctx.save();
  _clipRound(ctx, x, y, size, 6);

  const cx = x + size / 2;
  const cy = y + size / 2;
  const facets = [
    // 上半三角（更亮）
    { points: [[cx, y], [x + size, cy], [cx, cy]], shade: 35 },
    { points: [[cx, y], [cx, cy], [x, cy]], shade: 25 },
    // 下半三角（更暗）
    { points: [[x, cy], [cx, cy], [cx, y + size]], shade: -15 },
    { points: [[cx, cy], [x + size, cy], [cx, y + size]], shade: -25 },
  ];
  for (const f of facets) {
    ctx.fillStyle = f.shade > 0 ? lighten(color, f.shade) : darken(color, -f.shade);
    ctx.beginPath();
    ctx.moveTo(f.points[0][0], f.points[0][1]);
    ctx.lineTo(f.points[1][0], f.points[1][1]);
    ctx.lineTo(f.points[2][0], f.points[2][1]);
    ctx.closePath();
    ctx.fill();
  }
  // 切面线
  ctx.strokeStyle = darken(color, 40);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, y); ctx.lineTo(cx, y + size);
  ctx.moveTo(x, cy); ctx.lineTo(x + size, cy);
  ctx.stroke();
  // 顶部高光点
  ctx.fillStyle = '#fff';
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(cx - size * 0.12, cy - size * 0.12, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 黄金浮雕（金属光泽 + 倒角）
function patternGoldRelief(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color, 8);
  ctx.save();
  _clipRound(ctx, x, y, size);
  // 金属斜光
  const grad = ctx.createLinearGradient(x, y, x + size, y + size);
  grad.addColorStop(0, lighten(color, 50));
  grad.addColorStop(0.4, color);
  grad.addColorStop(0.6, lighten(color, 30));
  grad.addColorStop(1, darken(color, 25));
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, size, size);
  // 中心浮雕图（菱形）
  ctx.translate(x + size / 2, y + size / 2);
  ctx.fillStyle = lighten(color, 60);
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.2);
  ctx.lineTo(size * 0.18, 0);
  ctx.lineTo(0, size * 0.2);
  ctx.lineTo(-size * 0.18, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = darken(color, 30);
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.1);
  ctx.lineTo(size * 0.08, 0);
  ctx.lineTo(0, size * 0.1);
  ctx.lineTo(-size * 0.08, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // 烫金外描边
  ctx.strokeStyle = lighten(color, 40);
  ctx.lineWidth = 2;
  _roundRectPath(ctx, x + 1.5, y + 1.5, size - 3, size - 3, 7);
  ctx.stroke();
}

// 星河流转（流光感渐变）
function patternGalaxy(ctx, x, y, size, color) {
  // 深色底
  ctx.fillStyle = darken(color, 40);
  _roundRectPath(ctx, x, y, size, size, 8);
  ctx.fill();
  ctx.save();
  _clipRound(ctx, x, y, size);
  // 紫粉蓝多色斜向流光
  const grad = ctx.createLinearGradient(x, y + size, x + size, y);
  grad.addColorStop(0, darken(color, 30));
  grad.addColorStop(0.4, color);
  grad.addColorStop(0.65, lighten(color, 40));
  grad.addColorStop(1, '#FFD9F2');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, size, size);
  // 散落的星点
  const stars = [
    [0.20, 0.25, 0.018],
    [0.55, 0.18, 0.014],
    [0.78, 0.40, 0.020],
    [0.30, 0.60, 0.012],
    [0.72, 0.78, 0.018],
    [0.45, 0.85, 0.014],
  ];
  ctx.fillStyle = '#fff';
  for (const [sx, sy, sr] of stars) {
    ctx.beginPath();
    ctx.arc(x + size * sx, y + size * sy, size * sr, 0, Math.PI * 2);
    ctx.fill();
  }
  // 顶部薄雾
  const fog = ctx.createLinearGradient(x, y, x, y + size);
  fog.addColorStop(0, 'rgba(255,255,255,0.25)');
  fog.addColorStop(0.4, 'rgba(255,255,255,0)');
  ctx.fillStyle = fog;
  ctx.fillRect(x, y, size, size);
  ctx.restore();
}

// ============ L6 限定 ============
function patternDragonScale(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color);
  ctx.save();
  _clipRound(ctx, x, y, size);
  const scaleR = size * 0.22;
  ctx.strokeStyle = lighten(color, 45);
  ctx.lineWidth = Math.max(1.5, size * 0.05);
  for (let row = 0; row < 4; row++) {
    const offsetX = row % 2 === 0 ? 0 : scaleR;
    const yPos = y + scaleR * 0.5 + row * scaleR * 0.85;
    for (let col = -1; col < 4; col++) {
      const xPos = x + offsetX + col * scaleR * 1.6;
      ctx.beginPath();
      ctx.arc(xPos, yPos, scaleR, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
  }
  const grad = ctx.createLinearGradient(x, y, x + size, y + size);
  grad.addColorStop(0, 'rgba(255,215,0,0.35)');
  grad.addColorStop(0.5, 'rgba(255,215,0,0)');
  grad.addColorStop(1, 'rgba(255,215,0,0.25)');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, size, size);
  ctx.restore();
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2;
  _roundRectPath(ctx, x + 2, y + 2, size - 4, size - 4, 7);
  ctx.stroke();
}

// 万圣节南瓜（橙底 + 黑色镂空脸）
function patternPumpkin(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color);
  ctx.save();
  _clipRound(ctx, x, y, size);
  // 南瓜竖棱（亮一点）
  ctx.strokeStyle = lighten(color, 25);
  ctx.lineWidth = Math.max(1.5, size * 0.04);
  for (let i = 0.25; i < 1; i += 0.25) {
    ctx.beginPath();
    ctx.ellipse(
      x + size * i, y + size / 2,
      size * 0.05, size * 0.42,
      0, 0, Math.PI * 2
    );
    ctx.stroke();
  }
  // 黑色三角眼睛
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.moveTo(x + size * 0.30, y + size * 0.45);
  ctx.lineTo(x + size * 0.40, y + size * 0.35);
  ctx.lineTo(x + size * 0.40, y + size * 0.50);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.70, y + size * 0.45);
  ctx.lineTo(x + size * 0.60, y + size * 0.35);
  ctx.lineTo(x + size * 0.60, y + size * 0.50);
  ctx.closePath();
  ctx.fill();
  // 锯齿嘴
  ctx.beginPath();
  const my = y + size * 0.7;
  ctx.moveTo(x + size * 0.25, my);
  ctx.lineTo(x + size * 0.35, my + size * 0.08);
  ctx.lineTo(x + size * 0.45, my);
  ctx.lineTo(x + size * 0.55, my + size * 0.08);
  ctx.lineTo(x + size * 0.65, my);
  ctx.lineTo(x + size * 0.75, my + size * 0.08);
  ctx.lineTo(x + size * 0.75, my + size * 0.15);
  ctx.lineTo(x + size * 0.25, my + size * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ============ L3 收藏（重做：插画+卡通可爱）============

// L3-1 猫咪头像
function patternCat(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color);
  ctx.save();
  _clipRound(ctx, x, y, size);
  const cx = x + size / 2, cy = y + size / 2;
  const faceColor = lighten(color, 50);
  const dark = darken(color, 40);
  // 三角耳朵
  ctx.fillStyle = faceColor;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, y + size * 0.20);
  ctx.lineTo(x + size * 0.30, y + size * 0.45);
  ctx.lineTo(x + size * 0.45, y + size * 0.30);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.78, y + size * 0.20);
  ctx.lineTo(x + size * 0.70, y + size * 0.45);
  ctx.lineTo(x + size * 0.55, y + size * 0.30);
  ctx.closePath();
  ctx.fill();
  // 耳内粉
  ctx.fillStyle = '#FFB3D1';
  ctx.beginPath();
  ctx.moveTo(x + size * 0.28, y + size * 0.27);
  ctx.lineTo(x + size * 0.32, y + size * 0.38);
  ctx.lineTo(x + size * 0.40, y + size * 0.32);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.72, y + size * 0.27);
  ctx.lineTo(x + size * 0.68, y + size * 0.38);
  ctx.lineTo(x + size * 0.60, y + size * 0.32);
  ctx.closePath();
  ctx.fill();
  // 圆脸
  ctx.fillStyle = faceColor;
  ctx.beginPath();
  ctx.arc(cx, cy + size * 0.08, size * 0.32, 0, Math.PI * 2);
  ctx.fill();
  // 眼
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.arc(x + size * 0.40, y + size * 0.55, size * 0.045, 0, Math.PI * 2);
  ctx.arc(x + size * 0.60, y + size * 0.55, size * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x + size * 0.41, y + size * 0.54, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.61, y + size * 0.54, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  // 三角鼻
  ctx.fillStyle = '#FF6B9D';
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.025, cy + size * 0.10);
  ctx.lineTo(cx + size * 0.025, cy + size * 0.10);
  ctx.lineTo(cx, cy + size * 0.135);
  ctx.closePath();
  ctx.fill();
  // 嘴
  ctx.strokeStyle = dark;
  ctx.lineWidth = Math.max(1, size * 0.018);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy + size * 0.135);
  ctx.lineTo(cx, cy + size * 0.18);
  ctx.moveTo(cx, cy + size * 0.18);
  ctx.quadraticCurveTo(cx - size * 0.06, cy + size * 0.21, cx - size * 0.08, cy + size * 0.18);
  ctx.moveTo(cx, cy + size * 0.18);
  ctx.quadraticCurveTo(cx + size * 0.06, cy + size * 0.21, cx + size * 0.08, cy + size * 0.18);
  ctx.stroke();
  // 腮红
  ctx.fillStyle = 'rgba(255,179,209,0.55)';
  ctx.beginPath();
  ctx.arc(x + size * 0.30, y + size * 0.68, size * 0.05, 0, Math.PI * 2);
  ctx.arc(x + size * 0.70, y + size * 0.68, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// L3-2 流星划过
function patternMeteor(ctx, x, y, size, color) {
  ctx.fillStyle = darken(color, 50);
  _roundRectPath(ctx, x, y, size, size, 8);
  ctx.fill();
  ctx.save();
  _clipRound(ctx, x, y, size);
  // 散星
  const stars = [[0.18, 0.22, 0.012], [0.78, 0.32, 0.014], [0.40, 0.78, 0.010], [0.85, 0.78, 0.012]];
  ctx.fillStyle = '#fff';
  for (const [sx, sy, sr] of stars) {
    ctx.beginPath();
    ctx.arc(x + size * sx, y + size * sy, size * sr, 0, Math.PI * 2);
    ctx.fill();
  }
  // 流星拖尾
  const sX = x + size * 0.20, sY = y + size * 0.20;
  const eX = x + size * 0.75, eY = y + size * 0.65;
  const grad = ctx.createLinearGradient(sX, sY, eX, eY);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(0.6, lighten(color, 60));
  grad.addColorStop(1, '#fff');
  ctx.strokeStyle = grad;
  ctx.lineWidth = Math.max(2, size * 0.05);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(sX, sY); ctx.lineTo(eX, eY);
  ctx.stroke();
  // 流星头
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(eX, eY, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  const halo = ctx.createRadialGradient(eX, eY, 0, eX, eY, size * 0.18);
  halo.addColorStop(0, lighten(color, 80));
  halo.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(eX, eY, size * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// L3-3 樱花飘落
function patternSakura(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color);
  ctx.save();
  _clipRound(ctx, x, y, size);
  const drawSakura = (cx, cy, r, alpha) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = alpha;
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / 5);
      ctx.fillStyle = '#FFE0EC';
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.bezierCurveTo(r * 0.6, -r * 1.1, r * 0.9, -r * 0.3, 0, r * 0.2);
      ctx.bezierCurveTo(-r * 0.9, -r * 0.3, -r * 0.6, -r * 1.1, 0, -r);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#FFB6C8';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.strokeStyle = '#FF8FA8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.3);
      ctx.lineTo(0, -r * 0.85);
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = '#FFD93D';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#E8590C';
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 0.10, Math.sin(a) * r * 0.10, r * 0.04, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };
  drawSakura(x + size * 0.62, y + size * 0.40, size * 0.22, 1);
  drawSakura(x + size * 0.28, y + size * 0.72, size * 0.13, 0.7);
  // 飘落小花瓣
  ctx.fillStyle = 'rgba(255,224,236,0.7)';
  const petals = [[0.15, 0.20, 0.5], [0.78, 0.85, 1.2], [0.42, 0.18, 0.8]];
  for (const [px, py, rot] of petals) {
    ctx.save();
    ctx.translate(x + size * px, y + size * py);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.05, size * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// L3-4 珊瑚海底
function patternCoral(ctx, x, y, size, color) {
  ctx.save();
  _roundRectPath(ctx, x, y, size, size, 8);
  ctx.clip();
  const seaGrad = ctx.createLinearGradient(x, y, x, y + size);
  seaGrad.addColorStop(0, lighten(color, 35));
  seaGrad.addColorStop(1, darken(color, 25));
  ctx.fillStyle = seaGrad;
  ctx.fillRect(x, y, size, size);
  // 珊瑚
  ctx.strokeStyle = '#FF6B9D';
  ctx.lineWidth = Math.max(1.5, size * 0.04);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, y + size * 0.95);
  ctx.lineTo(x + size * 0.22, y + size * 0.65);
  ctx.moveTo(x + size * 0.22, y + size * 0.78);
  ctx.lineTo(x + size * 0.10, y + size * 0.65);
  ctx.moveTo(x + size * 0.22, y + size * 0.72);
  ctx.lineTo(x + size * 0.32, y + size * 0.58);
  ctx.stroke();
  ctx.fillStyle = '#FF8FA8';
  ctx.beginPath();
  ctx.arc(x + size * 0.22, y + size * 0.62, size * 0.05, 0, Math.PI * 2);
  ctx.arc(x + size * 0.10, y + size * 0.63, size * 0.035, 0, Math.PI * 2);
  ctx.arc(x + size * 0.32, y + size * 0.55, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // 海葵触手
  ctx.strokeStyle = lighten(color, 50);
  ctx.lineWidth = Math.max(1, size * 0.025);
  for (let i = 0; i < 4; i++) {
    const baseX = x + size * (0.62 + i * 0.06);
    ctx.beginPath();
    ctx.moveTo(baseX, y + size * 0.95);
    ctx.bezierCurveTo(
      baseX + size * 0.04, y + size * 0.85,
      baseX - size * 0.04, y + size * 0.75,
      baseX + size * 0.02, y + size * 0.62
    );
    ctx.stroke();
  }
  // 气泡
  const bubbles = [[0.45, 0.25, 0.05], [0.75, 0.30, 0.04], [0.35, 0.50, 0.035]];
  for (const [bx, by, br] of bubbles) {
    const cx = x + size * bx, cy = y + size * by, r = size * br;
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// L3-5 冰晶雪花
function patternIceCrystal(ctx, x, y, size, color) {
  ctx.save();
  _roundRectPath(ctx, x, y, size, size, 8);
  ctx.clip();
  const grad = ctx.createRadialGradient(x + size / 2, y + size / 2, 0, x + size / 2, y + size / 2, size * 0.7);
  grad.addColorStop(0, lighten(color, 50));
  grad.addColorStop(1, color);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, size, size);
  ctx.translate(x + size / 2, y + size / 2);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = Math.max(1.2, size * 0.04);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const armLen = size * 0.36;
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(0, -armLen);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -armLen);
    ctx.lineTo(armLen * 0.13, -armLen * 0.85);
    ctx.moveTo(0, -armLen);
    ctx.lineTo(-armLen * 0.13, -armLen * 0.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -armLen * 0.55);
    ctx.lineTo(armLen * 0.20, -armLen * 0.75);
    ctx.moveTo(0, -armLen * 0.55);
    ctx.lineTo(-armLen * 0.20, -armLen * 0.75);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -armLen * 0.30);
    ctx.lineTo(armLen * 0.13, -armLen * 0.42);
    ctx.moveTo(0, -armLen * 0.30);
    ctx.lineTo(-armLen * 0.13, -armLen * 0.42);
    ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const r = size * 0.05;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ============ L4 大师（重做：插画 + 艺术）============

// L4-1 像素剑士
function patternPixelKnight(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color, 2);
  ctx.save();
  _clipRound(ctx, x, y, size, 2);
  const ps = size / 8;
  const dark = darken(color, 35);
  const light = lighten(color, 35);
  const gold = '#FFD43B';
  const red = '#E63946';
  const map = [
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 1, 2, 2, 2, 1, 0, 0],
    [0, 1, 2, 4, 2, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 3, 0],
    [0, 0, 1, 2, 1, 0, 3, 0],
    [0, 1, 1, 2, 1, 1, 3, 0],
    [0, 1, 0, 2, 0, 1, 3, 0],
    [0, 0, 0, 0, 0, 0, 1, 0],
  ];
  const cm = { 1: dark, 2: light, 3: gold, 4: red };
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const v = map[r][c];
      if (!v) continue;
      ctx.fillStyle = cm[v];
      ctx.fillRect(x + c * ps, y + r * ps, ps + 0.5, ps + 0.5);
    }
  }
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(x + 3 * ps, y + 1 * ps, ps * 0.5, ps * 0.5);
  ctx.restore();
  ctx.strokeStyle = darken(color, 50);
  ctx.lineWidth = 1.5;
  _roundRectPath(ctx, x + 1, y + 1, size - 2, size - 2, 2);
  ctx.stroke();
}

// L4-2 流云祥纹
function patternFlowCloud(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color);
  ctx.save();
  _clipRound(ctx, x, y, size);
  const lightCol = lighten(color, 50);
  ctx.fillStyle = rgba(lightCol, 0.4);
  ctx.beginPath();
  ctx.ellipse(x + size * 0.5, y + size * 0.5, size * 0.42, size * 0.20, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = lightCol;
  ctx.lineWidth = Math.max(1.5, size * 0.05);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const cy = y + size * 0.55;
  ctx.beginPath();
  ctx.arc(x + size * 0.30, cy, size * 0.13, Math.PI, Math.PI * 2);
  ctx.arc(x + size * 0.50, cy - size * 0.05, size * 0.15, Math.PI, Math.PI * 2);
  ctx.arc(x + size * 0.72, cy, size * 0.12, Math.PI, Math.PI * 2);
  ctx.lineTo(x + size * 0.84, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + size * 0.30, y + size * 0.30, size * 0.06, 0, Math.PI * 1.6, false);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + size * 0.70, y + size * 0.28, size * 0.07, 0, Math.PI * 1.6, true);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.arc(x + size * 0.45, y + size * 0.35, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.62, y + size * 0.42, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 1.5;
  _roundRectPath(ctx, x + 2, y + 2, size - 4, size - 4, 7);
  ctx.stroke();
  ctx.strokeStyle = darken(color, 35);
  ctx.lineWidth = 1;
  _roundRectPath(ctx, x + 4, y + 4, size - 8, size - 8, 5);
  ctx.stroke();
}

// L4-3 机甲铆钉
function patternMechRivet(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color, 4);
  ctx.save();
  _clipRound(ctx, x, y, size, 4);
  const grad = ctx.createLinearGradient(x, y, x + size, y + size);
  grad.addColorStop(0, lighten(color, 30));
  grad.addColorStop(0.5, color);
  grad.addColorStop(1, darken(color, 30));
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, size, size);
  const hexR = size * 0.13;
  const dx = hexR * Math.sqrt(3);
  const dy = hexR * 1.5;
  ctx.strokeStyle = darken(color, 40);
  ctx.lineWidth = Math.max(1, size * 0.018);
  for (let r = 0; r < 5; r++) {
    for (let c = -1; c < 5; c++) {
      const cx = x + c * dx + (r % 2 ? dx / 2 : 0);
      const cyy = y + r * dy;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 - Math.PI / 2;
        const px = cx + Math.cos(a) * hexR;
        const py = cyy + Math.sin(a) * hexR;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
  // 4 角铆钉
  for (const [rx, ry] of [[0.18, 0.18], [0.82, 0.18], [0.18, 0.82], [0.82, 0.82]]) {
    const cx = x + size * rx, cy = y + size * ry, r = size * 0.06;
    ctx.fillStyle = darken(color, 50);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = lighten(color, 40);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.25, cy - r * 0.25, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = darken(color, 50);
  ctx.lineWidth = 2;
  _roundRectPath(ctx, x + 1.5, y + 1.5, size - 3, size - 3, 4);
  ctx.stroke();
}

// L4-4 远山近水
function patternMountain(ctx, x, y, size, color) {
  ctx.fillStyle = '#F5EFD8';
  _roundRectPath(ctx, x, y, size, size, 8);
  ctx.fill();
  ctx.save();
  _clipRound(ctx, x, y, size);
  const inkDark = darken(color, 5);
  const inkMid = lighten(color, 30);
  const inkLight = lighten(color, 55);
  // 远山
  ctx.fillStyle = inkLight;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.55);
  ctx.lineTo(x + size * 0.25, y + size * 0.42);
  ctx.lineTo(x + size * 0.45, y + size * 0.50);
  ctx.lineTo(x + size * 0.65, y + size * 0.40);
  ctx.lineTo(x + size, y + size * 0.50);
  ctx.lineTo(x + size, y + size * 0.62);
  ctx.lineTo(x, y + size * 0.62);
  ctx.closePath();
  ctx.fill();
  // 中山
  ctx.fillStyle = inkMid;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.65);
  ctx.lineTo(x + size * 0.18, y + size * 0.55);
  ctx.lineTo(x + size * 0.35, y + size * 0.62);
  ctx.lineTo(x + size * 0.55, y + size * 0.52);
  ctx.lineTo(x + size * 0.78, y + size * 0.60);
  ctx.lineTo(x + size, y + size * 0.55);
  ctx.lineTo(x + size, y + size * 0.72);
  ctx.lineTo(x, y + size * 0.72);
  ctx.closePath();
  ctx.fill();
  // 近山
  ctx.fillStyle = inkDark;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.78);
  ctx.lineTo(x + size * 0.20, y + size * 0.70);
  ctx.lineTo(x + size * 0.40, y + size * 0.75);
  ctx.lineTo(x + size * 0.65, y + size * 0.68);
  ctx.lineTo(x + size, y + size * 0.74);
  ctx.lineTo(x + size, y + size);
  ctx.lineTo(x, y + size);
  ctx.closePath();
  ctx.fill();
  // 飞鸟
  ctx.strokeStyle = inkDark;
  ctx.lineWidth = Math.max(1, size * 0.018);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + size * 0.62, y + size * 0.20);
  ctx.lineTo(x + size * 0.66, y + size * 0.18);
  ctx.lineTo(x + size * 0.70, y + size * 0.22);
  ctx.stroke();
  // 朱砂印
  ctx.fillStyle = '#C8102E';
  ctx.fillRect(x + size * 0.78, y + size * 0.10, size * 0.10, size * 0.10);
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${size * 0.05}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('印', x + size * 0.83, y + size * 0.155);
  ctx.restore();
}

// L4-5 棒棒糖琉璃
function patternLollipop(ctx, x, y, size, color) {
  _baseFill(ctx, x, y, size, color);
  ctx.save();
  _clipRound(ctx, x, y, size);
  const cx = x + size / 2, cy = y + size / 2;
  // 螺旋
  ctx.strokeStyle = lighten(color, 60);
  ctx.lineWidth = Math.max(2, size * 0.07);
  ctx.lineCap = 'round';
  ctx.beginPath();
  let firstPt = true;
  for (let t = 0; t < Math.PI * 5; t += 0.1) {
    const r = size * 0.04 * t;
    if (r > size * 0.42) break;
    const px = cx + Math.cos(t) * r;
    const py = cy + Math.sin(t) * r;
    if (firstPt) { ctx.moveTo(px, py); firstPt = false; }
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  // 玻璃高光
  const grad = ctx.createRadialGradient(x + size * 0.3, y + size * 0.3, 0, x + size * 0.3, y + size * 0.3, size * 0.4);
  grad.addColorStop(0, 'rgba(255,255,255,0.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.ellipse(cx, y + size * 0.18, size * 0.30, size * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = darken(color, 25);
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.ellipse(cx, y + size * 0.92, size * 0.45, size * 0.10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
  ctx.strokeStyle = lighten(color, 50);
  ctx.lineWidth = 1.5;
  _roundRectPath(ctx, x + 1.5, y + 1.5, size - 3, size - 3, 7);
  ctx.stroke();
}

// ============ L5 巅峰（重做 + 微动画）============
// 注意：所有 L5/L6 函数额外接收 time 参数，用于呼吸/流光/闪烁动画

// L5-1 八面切割钻石（旋转闪光）
function patternFacetDiamond(ctx, x, y, size, color, time = 0) {
  _baseFill(ctx, x, y, size, color, 6);
  ctx.save();
  _clipRound(ctx, x, y, size, 6);
  const cx = x + size / 2, cy = y + size / 2;
  const facets = [
    { angle: -90, shade: 60 }, { angle: -45, shade: 35 },
    { angle: 0, shade: 15 }, { angle: 45, shade: -15 },
    { angle: 90, shade: -35 }, { angle: 135, shade: -25 },
    { angle: 180, shade: 5 }, { angle: -135, shade: 30 },
  ];
  const r = size * 0.5;
  for (const f of facets) {
    const a1 = ((f.angle - 22.5) * Math.PI) / 180;
    const a2 = ((f.angle + 22.5) * Math.PI) / 180;
    ctx.fillStyle = f.shade > 0 ? lighten(color, f.shade) : darken(color, -f.shade);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r);
    ctx.lineTo(cx + Math.cos(a2) * r, cy + Math.sin(a2) * r);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = darken(color, 50);
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 8; i++) {
    const a = ((-90 + i * 45 + 22.5) * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.stroke();
  }
  // 中心高光六边形
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const rr = size * 0.08;
    if (i === 0) ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    else ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  // ===== 动画：旋转闪光十字 =====
  const sparkleAngle = (time * 0.0015) % (Math.PI * 2);
  const sparkleAlpha = 0.5 + 0.4 * Math.sin(time * 0.003);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(sparkleAngle);
  ctx.globalAlpha = sparkleAlpha;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = Math.max(1, size * 0.02);
  ctx.lineCap = 'round';
  const slen = size * 0.20;
  ctx.beginPath();
  ctx.moveTo(-slen, 0); ctx.lineTo(slen, 0);
  ctx.moveTo(0, -slen); ctx.lineTo(0, slen);
  ctx.stroke();
  ctx.restore();
  ctx.restore();
  ctx.strokeStyle = lighten(color, 40);
  ctx.lineWidth = 1.5;
  _roundRectPath(ctx, x + 1, y + 1, size - 2, size - 2, 6);
  ctx.stroke();
}

// L5-2 皇家纹章（呼吸光晕）
function patternRoyalCrest(ctx, x, y, size, color, time = 0) {
  _baseFill(ctx, x, y, size, color, 8);
  ctx.save();
  _clipRound(ctx, x, y, size);
  const grad = ctx.createLinearGradient(x, y, x + size, y + size);
  grad.addColorStop(0, lighten(color, 40));
  grad.addColorStop(0.5, color);
  grad.addColorStop(1, darken(color, 30));
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, size, size);
  const cx = x + size / 2, cy = y + size / 2;
  // 盾形外
  ctx.fillStyle = darken(color, 25);
  ctx.beginPath();
  ctx.moveTo(cx, y + size * 0.18);
  ctx.lineTo(x + size * 0.78, y + size * 0.25);
  ctx.lineTo(x + size * 0.78, y + size * 0.55);
  ctx.quadraticCurveTo(x + size * 0.78, y + size * 0.85, cx, y + size * 0.92);
  ctx.quadraticCurveTo(x + size * 0.22, y + size * 0.85, x + size * 0.22, y + size * 0.55);
  ctx.lineTo(x + size * 0.22, y + size * 0.25);
  ctx.closePath();
  ctx.fill();
  // 盾形内
  ctx.fillStyle = lighten(color, 25);
  ctx.beginPath();
  ctx.moveTo(cx, y + size * 0.22);
  ctx.lineTo(x + size * 0.74, y + size * 0.28);
  ctx.lineTo(x + size * 0.74, y + size * 0.55);
  ctx.quadraticCurveTo(x + size * 0.74, y + size * 0.82, cx, y + size * 0.88);
  ctx.quadraticCurveTo(x + size * 0.26, y + size * 0.82, x + size * 0.26, y + size * 0.55);
  ctx.lineTo(x + size * 0.26, y + size * 0.28);
  ctx.closePath();
  ctx.fill();
  // 王冠
  ctx.fillStyle = '#FFD700';
  ctx.strokeStyle = darken('#FFD700', 30);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.rect(cx - size * 0.13, cy - size * 0.02, size * 0.26, size * 0.07);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.13, cy - size * 0.02);
  ctx.lineTo(cx - size * 0.10, cy - size * 0.13);
  ctx.lineTo(cx - size * 0.06, cy - size * 0.05);
  ctx.lineTo(cx, cy - size * 0.16);
  ctx.lineTo(cx + size * 0.06, cy - size * 0.05);
  ctx.lineTo(cx + size * 0.10, cy - size * 0.13);
  ctx.lineTo(cx + size * 0.13, cy - size * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // 宝石
  ctx.fillStyle = '#E63946';
  ctx.beginPath();
  ctx.arc(cx, cy - size * 0.16, size * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1971C2';
  ctx.beginPath();
  ctx.arc(cx - size * 0.10, cy - size * 0.13, size * 0.018, 0, Math.PI * 2);
  ctx.arc(cx + size * 0.10, cy - size * 0.13, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  // 装饰星
  ctx.save();
  ctx.translate(cx, cy + size * 0.20);
  ctx.fillStyle = '#FFD700';
  const starR = size * 0.05;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 === 0 ? starR : starR * 0.45;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.restore();
  // ===== 动画：呼吸光晕 =====
  const breathAlpha = 0.3 + 0.3 * Math.sin(time * 0.0025);
  ctx.save();
  ctx.globalAlpha = breathAlpha;
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2;
  _roundRectPath(ctx, x + 1, y + 1, size - 2, size - 2, 8);
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 1.5;
  _roundRectPath(ctx, x + 2, y + 2, size - 4, size - 4, 7);
  ctx.stroke();
}

// L5-3 银河漩涡（旋转流光）
function patternGalaxySpiral(ctx, x, y, size, color, time = 0) {
  ctx.fillStyle = darken(color, 60);
  _roundRectPath(ctx, x, y, size, size, 8);
  ctx.fill();
  ctx.save();
  _clipRound(ctx, x, y, size);
  const cx = x + size / 2, cy = y + size / 2;
  const cloudGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.7);
  cloudGrad.addColorStop(0, lighten(color, 30));
  cloudGrad.addColorStop(0.5, color);
  cloudGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = cloudGrad;
  ctx.fillRect(x, y, size, size);
  // ===== 动画：旋转 =====
  const rotation = (time * 0.0006) % (Math.PI * 2);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  for (let arm = 0; arm < 2; arm++) {
    ctx.save();
    ctx.rotate(arm * Math.PI);
    const grad = ctx.createLinearGradient(0, 0, size * 0.5, 0);
    grad.addColorStop(0, 'rgba(255,255,255,0.8)');
    grad.addColorStop(0.5, lighten(color, 60));
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = Math.max(2, size * 0.05);
    ctx.lineCap = 'round';
    ctx.beginPath();
    let firstPt = true;
    for (let t = 0; t < Math.PI * 1.4; t += 0.1) {
      const r = size * 0.05 + size * 0.25 * t / Math.PI;
      const px = Math.cos(t) * r;
      const py = Math.sin(t) * r;
      if (firstPt) { ctx.moveTo(px, py); firstPt = false; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  // 散星 + 闪烁
  const stars = [
    [0.15, 0.20, 0.018], [0.85, 0.18, 0.014], [0.20, 0.85, 0.020],
    [0.78, 0.78, 0.016], [0.50, 0.10, 0.012], [0.10, 0.55, 0.010],
    [0.92, 0.50, 0.010],
  ];
  ctx.fillStyle = '#fff';
  for (let i = 0; i < stars.length; i++) {
    const [sx, sy, sr] = stars[i];
    const twinkle = 0.5 + 0.5 * Math.sin(time * 0.003 + i * 1.3);
    ctx.globalAlpha = twinkle;
    ctx.beginPath();
    ctx.arc(x + size * sx, y + size * sy, size * sr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // 中心黑洞
  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.10);
  coreGrad.addColorStop(0, '#fff');
  coreGrad.addColorStop(0.5, lighten(color, 60));
  coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ============ L6 限定（重做 + 动画）============

// L6-1 赤金龙鳞（烫金扫光）
function patternGoldDragon(ctx, x, y, size, color, time = 0) {
  _baseFill(ctx, x, y, size, color);
  ctx.save();
  _clipRound(ctx, x, y, size);
  const scaleR = size * 0.20;
  for (let row = -1; row < 5; row++) {
    const offsetX = row % 2 === 0 ? 0 : scaleR;
    const yPos = y + scaleR * 0.5 + row * scaleR * 0.85;
    for (let col = -1; col < 5; col++) {
      const xPos = x + offsetX + col * scaleR * 1.6;
      const grad = ctx.createLinearGradient(xPos, yPos - scaleR, xPos, yPos);
      grad.addColorStop(0, lighten(color, 40));
      grad.addColorStop(1, darken(color, 20));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(xPos, yPos, scaleR, Math.PI, Math.PI * 2);
      ctx.lineTo(xPos - scaleR, yPos);
      ctx.fill();
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = Math.max(1, size * 0.02);
      ctx.beginPath();
      ctx.arc(xPos, yPos, scaleR, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
  }
  // ===== 动画：烫金扫光 =====
  const sweepX = ((time * 0.0008) % 2 - 0.5) * size;
  const grad = ctx.createLinearGradient(x + sweepX, y, x + sweepX + size * 0.4, y);
  grad.addColorStop(0, 'rgba(255,215,0,0)');
  grad.addColorStop(0.5, 'rgba(255,215,0,0.45)');
  grad.addColorStop(1, 'rgba(255,215,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, size, size);
  ctx.restore();
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2;
  _roundRectPath(ctx, x + 1, y + 1, size - 2, size - 2, 8);
  ctx.stroke();
  ctx.strokeStyle = darken(color, 30);
  ctx.lineWidth = 0.8;
  _roundRectPath(ctx, x + 3, y + 3, size - 6, size - 6, 6);
  ctx.stroke();
}

// L6-2 诡笑南瓜（内透火光闪烁）
function patternEvilPumpkin(ctx, x, y, size, color, time = 0) {
  _baseFill(ctx, x, y, size, color);
  ctx.save();
  _clipRound(ctx, x, y, size);
  // 竖棱
  ctx.strokeStyle = darken(color, 25);
  ctx.lineWidth = Math.max(1.5, size * 0.04);
  for (let i = 0.20; i < 1; i += 0.20) {
    ctx.beginPath();
    ctx.ellipse(x + size * i, y + size * 0.55, size * 0.05, size * 0.40, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = lighten(color, 30);
  ctx.beginPath();
  ctx.ellipse(x + size * 0.30, y + size * 0.45, size * 0.08, size * 0.20, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // 蒂
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(x + size * 0.45, y + size * 0.10, size * 0.10, size * 0.08);
  ctx.beginPath();
  ctx.moveTo(x + size * 0.55, y + size * 0.12);
  ctx.quadraticCurveTo(x + size * 0.65, y + size * 0.05, x + size * 0.62, y + size * 0.18);
  ctx.fill();
  // 黑色面具
  ctx.fillStyle = '#0d0d0d';
  ctx.beginPath();
  ctx.moveTo(x + size * 0.30, y + size * 0.45);
  ctx.lineTo(x + size * 0.42, y + size * 0.35);
  ctx.lineTo(x + size * 0.42, y + size * 0.50);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.70, y + size * 0.45);
  ctx.lineTo(x + size * 0.58, y + size * 0.35);
  ctx.lineTo(x + size * 0.58, y + size * 0.50);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  const my = y + size * 0.65;
  ctx.moveTo(x + size * 0.25, my);
  ctx.lineTo(x + size * 0.32, my + size * 0.10);
  ctx.lineTo(x + size * 0.40, my);
  ctx.lineTo(x + size * 0.50, my + size * 0.10);
  ctx.lineTo(x + size * 0.60, my);
  ctx.lineTo(x + size * 0.68, my + size * 0.10);
  ctx.lineTo(x + size * 0.75, my);
  ctx.lineTo(x + size * 0.75, my + size * 0.18);
  ctx.lineTo(x + size * 0.25, my + size * 0.18);
  ctx.closePath();
  ctx.fill();
  // ===== 动画：内透火光闪烁 =====
  const flicker = 0.55 + 0.45 * Math.sin(time * 0.008);
  ctx.save();
  ctx.globalAlpha = flicker;
  ctx.fillStyle = '#FF4500';
  ctx.beginPath();
  ctx.arc(x + size * 0.36, y + size * 0.42, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.64, y + size * 0.42, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.ellipse(x + size * 0.50, my + size * 0.07, size * 0.08, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

// ============ 新增：赛博霓虹（赛博/科幻 + 扫描动画）============
function patternCyberpunk(ctx, x, y, size, color, time = 0) {
  ctx.fillStyle = '#0F0420';
  _roundRectPath(ctx, x, y, size, size, 6);
  ctx.fill();
  ctx.save();
  _clipRound(ctx, x, y, size, 6);
  // 网格
  ctx.strokeStyle = rgba(color, 0.25);
  ctx.lineWidth = 0.6;
  for (let i = 0.12; i < 1; i += 0.12) {
    ctx.beginPath();
    ctx.moveTo(x, y + size * i); ctx.lineTo(x + size, y + size * i);
    ctx.moveTo(x + size * i, y); ctx.lineTo(x + size * i, y + size);
    ctx.stroke();
  }
  // ===== 动画：扫描光带 =====
  const scanY = y + ((time * 0.0008) % 1) * size;
  const scanGrad = ctx.createLinearGradient(x, scanY - size * 0.1, x, scanY + size * 0.1);
  scanGrad.addColorStop(0, 'rgba(0,255,255,0)');
  scanGrad.addColorStop(0.5, rgba(color, 0.4));
  scanGrad.addColorStop(1, 'rgba(0,255,255,0)');
  ctx.fillStyle = scanGrad;
  ctx.fillRect(x, scanY - size * 0.1, size, size * 0.2);
  // 双色霓虹错位框
  ctx.strokeStyle = '#FF1B8D';
  ctx.lineWidth = Math.max(2, size * 0.04);
  _roundRectPath(ctx, x + size * 0.20, y + size * 0.30, size * 0.60, size * 0.40, 4);
  ctx.stroke();
  ctx.strokeStyle = '#00F5FF';
  _roundRectPath(ctx, x + size * 0.22, y + size * 0.32, size * 0.60, size * 0.40, 4);
  ctx.stroke();
  // CYBER 文字
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${size * 0.10}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = color;
  ctx.shadowBlur = size * 0.15;
  ctx.fillText('CYBER', x + size / 2, y + size * 0.50);
  ctx.shadowBlur = 0;
  // 角标
  ctx.fillStyle = '#FF1B8D';
  ctx.fillRect(x + 4, y + 4, size * 0.04, size * 0.04);
  ctx.fillStyle = '#00F5FF';
  ctx.fillRect(x + size - 4 - size * 0.04, y + size - 4 - size * 0.04, size * 0.04, size * 0.04);
  ctx.restore();
  // 外发光
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = size * 0.1;
  _roundRectPath(ctx, x + 1, y + 1, size - 2, size - 2, 6);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// ============ 皮肤注册表（24 套）============
const SKIN_LIST = [
  // ===== L0 纯色 =====
  {
    id: 'classic', name: '经典糖果', level: 0, levelLabel: 'L0 纯色',
    pattern: patternSolid,
    colors: ['#5B9DF9', '#FF8B6B', '#6BCB77', '#B084EE'],
    unlock: { type: 'default' }, statusText: '使用中',
  },

  // ===== L1 几何（4 套）=====
  {
    id: 'morandi', name: '莫兰迪点点', level: 1, levelLabel: 'L1 几何',
    pattern: patternDots,
    colors: ['#A8B8C8', '#D4A5A5', '#A8B5A0', '#C8A2C8'],
    unlock: { type: 'stars', value: 50 }, statusText: '⭐ 50 解锁',
  },
  {
    id: 'pixelGrid', name: '像素方格', level: 1, levelLabel: 'L1 几何',
    pattern: patternGrid,
    colors: ['#E63946', '#F77F00', '#06A77D', '#5E2BFF'],
    unlock: { type: 'stars', value: 150 }, statusText: '⭐ 150 解锁',
  },
  {
    id: 'speckle', name: '极简斑点', level: 1, levelLabel: 'L1 几何',
    pattern: patternSpeckle,
    colors: ['#4DABF7', '#FCC419', '#FF6B6B', '#51CF66'],
    unlock: { type: 'stars', value: 300 }, statusText: '⭐ 300 解锁',
  },
  {
    id: 'checker', name: '棋盘格', level: 1, levelLabel: 'L1 几何',
    pattern: patternChecker,
    colors: ['#212529', '#FFFFFF', '#FFA8A8', '#74C0FC'],
    unlock: { type: 'stars', value: 500 }, statusText: '⭐ 500 解锁',
  },

  // ===== L2 渐变（4 套）=====
  {
    id: 'watercolor', name: '水彩光晕', level: 2, levelLabel: 'L2 渐变',
    pattern: patternGlow,
    colors: ['#FFADAD', '#FDD68C', '#A0E1A0', '#A0C4FF'],
    unlock: { type: 'coins', value: 3000 }, statusText: '🪙 3000',
  },
  {
    id: 'neonGlass', name: '霓虹玻璃', level: 2, levelLabel: 'L2 渐变',
    pattern: patternGlass,
    colors: ['#FF006E', '#FB5607', '#3A86FF', '#06FFA5'],
    unlock: { type: 'coins', value: 6000 }, statusText: '🪙 6000',
  },
  {
    id: 'nordic', name: '北欧条纹', level: 2, levelLabel: 'L2 渐变',
    pattern: patternStripe,
    colors: ['#9D8189', '#FFCAD4', '#6D6875', '#B5838D'],
    unlock: { type: 'coins', value: 10000 }, statusText: '🪙 10000',
  },
  {
    id: 'aurora', name: '极光渐变', level: 2, levelLabel: 'L2 渐变',
    pattern: patternAurora,
    colors: ['#7950F2', '#15AABF', '#51CF66', '#FFA94D'],
    unlock: { type: 'diamonds', value: 50 }, statusText: '💎 50',
  },

  // ===== L3 收藏（5 套，全部重做）=====
  {
    id: 'cat', name: '猫咪头像', level: 3, levelLabel: 'L3 收藏',
    pattern: patternCat,
    colors: ['#FFB4A2', '#FFCDB2', '#A8DADC', '#F1FAEE'],
    unlock: { type: 'coins', value: 15000 }, statusText: '🪙 15000',
  },
  {
    id: 'meteor', name: '流星划过', level: 3, levelLabel: 'L3 收藏',
    pattern: patternMeteor,
    colors: ['#3D348B', '#7678ED', '#F35B04', '#F18701'],
    unlock: { type: 'coins', value: 20000 }, statusText: '🪙 20000',
  },
  {
    id: 'sakura', name: '樱花飘落', level: 3, levelLabel: 'L3 收藏',
    pattern: patternSakura,
    colors: ['#FFAEBC', '#FFC4D6', '#FFE0EC', '#FFB6C8'],
    unlock: { type: 'stars', value: 600 }, statusText: '⭐ 600',
  },
  {
    id: 'coral', name: '珊瑚海底', level: 3, levelLabel: 'L3 收藏',
    pattern: patternCoral,
    colors: ['#1971C2', '#15AABF', '#22B8CF', '#74C0FC'],
    unlock: { type: 'diamonds', value: 100 }, statusText: '💎 100',
  },
  {
    id: 'iceCrystal', name: '冰晶雪花', level: 3, levelLabel: 'L3 收藏',
    pattern: patternIceCrystal,
    colors: ['#A5D8FF', '#74C0FC', '#D0BFFF', '#E599F7'],
    unlock: { type: 'ad', value: 30 }, statusText: '📺 看广告 ×30',
  },

  // ===== L4 大师（5 套，全部重做）=====
  {
    id: 'pixelKnight', name: '像素剑士', level: 4, levelLabel: 'L4 大师',
    pattern: patternPixelKnight,
    colors: ['#E63946', '#F4A261', '#2A9D8F', '#264653'],
    unlock: { type: 'coins', value: 35000 }, statusText: '🪙 35000',
  },
  {
    id: 'flowCloud', name: '流云祥纹', level: 4, levelLabel: 'L4 大师',
    pattern: patternFlowCloud,
    colors: ['#A8201A', '#143642', '#2C5530', '#723D46'],
    unlock: { type: 'coins', value: 50000 }, statusText: '🪙 50000',
  },
  {
    id: 'mechRivet', name: '机甲铆钉', level: 4, levelLabel: 'L4 大师',
    pattern: patternMechRivet,
    colors: ['#495057', '#868E96', '#212529', '#5C7CFA'],
    unlock: { type: 'diamonds', value: 250 }, statusText: '💎 250',
  },
  {
    id: 'mountain', name: '远山近水', level: 4, levelLabel: 'L4 大师',
    pattern: patternMountain,
    colors: ['#212529', '#495057', '#5C0011', '#1B4332'],
    unlock: { type: 'stars', value: 1000 }, statusText: '⭐ 1000',
  },
  {
    id: 'lollipop', name: '棒棒糖琉璃', level: 4, levelLabel: 'L4 大师',
    pattern: patternLollipop,
    colors: ['#FF6B9D', '#FFD43B', '#69DB7C', '#74C0FC'],
    unlock: { type: 'ad', value: 80 }, statusText: '📺 看广告 ×80',
  },

  // ===== L5 巅峰（3 套，全部重做 + 微动画）=====
  {
    id: 'facetDiamond', name: '八面切割钻', level: 5, levelLabel: 'L5 巅峰',
    pattern: patternFacetDiamond, animated: true,
    colors: ['#15AABF', '#9775FA', '#FA5252', '#FCC419'],
    unlock: { type: 'diamonds', value: 800 }, statusText: '💎 800',
  },
  {
    id: 'royalCrest', name: '皇家纹章', level: 5, levelLabel: 'L5 巅峰',
    pattern: patternRoyalCrest, animated: true,
    colors: ['#A8201A', '#5C0011', '#1864AB', '#0B7285'],
    unlock: { type: 'diamonds', value: 1200 }, statusText: '💎 1200',
  },
  {
    id: 'galaxySpiral', name: '银河漩涡', level: 5, levelLabel: 'L5 巅峰',
    pattern: patternGalaxySpiral, animated: true,
    colors: ['#5F3DC4', '#9C36B5', '#1864AB', '#0B7285'],
    unlock: { type: 'stars', value: 2500 }, statusText: '⭐ 2500',
  },

  // ===== L6 限定（3 套：含新增赛博霓虹 + 重做的限定）=====
  {
    id: 'cyberpunk', name: '赛博霓虹', level: 6, levelLabel: 'L6 限定',
    pattern: patternCyberpunk, animated: true,
    colors: ['#FF1B8D', '#00F5FF', '#FFD700', '#7C4DFF'],
    unlock: { type: 'diamonds', value: 1500 }, statusText: '💎 1500',
  },
  {
    id: 'goldDragon', name: '赤金龙鳞', level: 6, levelLabel: 'L6 限定',
    pattern: patternGoldDragon, animated: true,
    colors: ['#C8102E', '#A8201A', '#8B0000', '#5C0011'],
    unlock: { type: 'event', value: 'spring_festival' }, statusText: '🧧 春节活动',
  },
  {
    id: 'evilPumpkin', name: '诡笑南瓜', level: 6, levelLabel: 'L6 限定',
    pattern: patternEvilPumpkin, animated: true,
    colors: ['#F76707', '#E8590C', '#A52A2A', '#FAB005'],
    unlock: { type: 'event', value: 'halloween' }, statusText: '🎃 万圣活动',
  },
];

// 暴露给 prototype.js
window.BM_SKINS = SKIN_LIST;
window.BM_PATTERNS = {
  patternSolid,
  patternDots, patternGrid, patternSpeckle, patternChecker,
  patternGlow, patternGlass, patternStripe, patternAurora,
  patternCat, patternMeteor, patternSakura, patternCoral, patternIceCrystal,
  patternPixelKnight, patternFlowCloud, patternMechRivet, patternMountain, patternLollipop,
  patternFacetDiamond, patternRoyalCrest, patternGalaxySpiral,
  patternGoldDragon, patternEvilPumpkin, patternCyberpunk,
  lighten, darken,
};
