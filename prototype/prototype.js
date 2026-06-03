/**
 * 方块大师 UI 静态原型
 * 仅渲染视觉，无业务逻辑
 */

// ===== 配色（清新柔和马卡龙）=====
const C = {
  // 基础
  bg: '#F8F9FA',
  bgGradTop: '#FFE9A0',
  bgGradBottom: '#FFFFFF',
  panel: '#FFFFFF',
  text: '#2C3E50',
  subText: '#8693A6',
  divider: '#E9ECEF',
  // 棋盘
  cellTarget: '#FFE9A0',
  cellEmpty: '#E9ECEF',
  cellPreviewOk: '#A0D8FF',
  cellPreviewBad: '#FFB6B6',
  // 4 色积木
  block1: '#5B9DF9', // 晴空蓝
  block2: '#FF8B6B', // 日落橙
  block3: '#6BCB77', // 抹茶绿
  block4: '#B084EE', // 薰衣草紫
  // 按钮
  ctaPrimary: '#FFB400', // 阳光黄主 CTA
  ctaPrimaryDark: '#E89F00',
  ctaSecondary: '#5B9DF9',
  ctaTertiary: '#B084EE',
  ctaQuart: '#6BCB77',
  ctaDanger: '#FF6B6B',
  ctaGray: '#ADB5BD',
  btnText: '#FFFFFF',
  // 星
  starGold: '#FFC107',
  starGray: '#DEE2E6',
};

const W = 750;
const H = 1334;

// ===== 工具函数 =====
function roundRect(ctx, x, y, w, h, r) {
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

function fillRoundRect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
}

function strokeRoundRect(ctx, x, y, w, h, r, color, lineWidth = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  roundRect(ctx, x, y, w, h, r);
  ctx.stroke();
}

function text(ctx, str, x, y, opts = {}) {
  ctx.save();
  ctx.fillStyle = opts.color || C.text;
  const weight = opts.bold ? 'bold ' : '';
  const size = opts.size || 28;
  const family = opts.family || '-apple-system, "PingFang SC", sans-serif';
  ctx.font = `${weight}${size}px ${family}`;
  ctx.textAlign = opts.align || 'left';
  ctx.textBaseline = opts.baseline || 'top';
  ctx.fillText(str, x, y);
  ctx.restore();
}

function softShadow(ctx, fn) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.08)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;
  fn();
  ctx.restore();
}

// 顶部资源条（金币 + 钻石 + 设置齿轮）
function renderTopBar(ctx, { coins = 1280, diamonds = 25, showSettings = true } = {}) {
  const pad = 30;
  const top = 40;
  const h = 64;
  // 金币
  fillRoundRect(ctx, pad, top, 200, h, 32, C.panel);
  text(ctx, '🪙', pad + 20, top + h / 2, { size: 32, baseline: 'middle' });
  text(ctx, String(coins), pad + 70, top + h / 2, {
    size: 26, bold: true, baseline: 'middle',
  });
  // 钻石
  fillRoundRect(ctx, pad + 220, top, 180, h, 32, C.panel);
  text(ctx, '💎', pad + 240, top + h / 2, { size: 28, baseline: 'middle' });
  text(ctx, String(diamonds), pad + 290, top + h / 2, {
    size: 26, bold: true, baseline: 'middle',
  });
  // 齿轮
  if (showSettings) {
    fillRoundRect(ctx, W - pad - h, top, h, h, 32, C.panel);
    text(ctx, '⚙️', W - pad - h / 2, top + h / 2, {
      size: 32, align: 'center', baseline: 'middle',
    });
  }
}

// 通用按钮
function renderButton(ctx, x, y, w, h, label, opts = {}) {
  const bg = opts.bg || C.ctaPrimary;
  const color = opts.color || C.btnText;
  const radius = opts.radius || 24;
  // 阴影
  softShadow(ctx, () => fillRoundRect(ctx, x, y, w, h, radius, bg));
  // 内层渐变（模拟轻微高光）
  const grad = ctx.createLinearGradient(0, y, 0, y + h);
  grad.addColorStop(0, 'rgba(255,255,255,0.15)');
  grad.addColorStop(1, 'rgba(0,0,0,0.05)');
  ctx.fillStyle = grad;
  roundRect(ctx, x, y, w, h, radius);
  ctx.fill();
  // 文本
  text(ctx, label, x + w / 2, y + h / 2, {
    size: opts.fontSize || 36,
    bold: true,
    color,
    align: 'center',
    baseline: 'middle',
  });
}

// 圆角小积木格
function blockCell(ctx, x, y, size, color, gap = 4) {
  fillRoundRect(ctx, x + gap / 2, y + gap / 2, size - gap, size - gap, 8, color);
  // 高光
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#fff';
  roundRect(ctx, x + gap / 2 + 4, y + gap / 2 + 4, size - gap - 8, (size - gap) * 0.35, 6);
  ctx.fill();
  ctx.restore();
}

// 棋盘格
function gridCell(ctx, x, y, size, type) {
  let color = C.cellEmpty;
  if (type === 'target') color = C.cellTarget;
  else if (type === 'previewOk') color = C.cellPreviewOk;
  else if (type === 'previewBad') color = C.cellPreviewBad;
  fillRoundRect(ctx, x + 2, y + 2, size - 4, size - 4, 8, color);
}

// 渲染 polyomino（按矩阵 0/1 网格）
function renderShape(ctx, shape, x, y, cellSize, color, gap = 4) {
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j] === 1) {
        blockCell(ctx, x + j * cellSize, y + i * cellSize, cellSize, color, gap);
      }
    }
  }
}

// ============================================================
// 场景 1：主菜单
// ============================================================
function renderMain(ctx) {
  // 渐变背景
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, C.bgGradTop);
  grad.addColorStop(0.5, '#FFFFFF');
  grad.addColorStop(1, '#E0F4FF');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  renderTopBar(ctx);

  // 标题区
  text(ctx, '🧩', W / 2, 200, { size: 140, align: 'center', baseline: 'top' });
  text(ctx, '方块大师', W / 2, 360, {
    size: 80, bold: true, color: C.text, align: 'center',
  });
  text(ctx, 'Block Master', W / 2, 460, {
    size: 28, color: C.subText, align: 'center',
  });

  // 进度
  text(ctx, '已通关 12 关  ⭐ 28', W / 2, 530, {
    size: 26, color: C.subText, align: 'center',
  });

  // 主 CTA
  renderButton(ctx, 95, 640, 560, 110, '▶  开 始 游 戏', {
    bg: C.ctaPrimary, fontSize: 42,
  });

  // 双联按钮 1：签到 / 挑战
  renderButton(ctx, 95, 790, 270, 95, '📅  签到', {
    bg: C.ctaQuart, fontSize: 30,
  });
  renderButton(ctx, 385, 790, 270, 95, '🎁  挑战', {
    bg: C.ctaSecondary, fontSize: 30,
  });

  // 双联按钮 2：皮肤 / 排行榜
  renderButton(ctx, 95, 905, 270, 95, '🎨  皮肤', {
    bg: C.ctaTertiary, fontSize: 30,
  });
  renderButton(ctx, 385, 905, 270, 95, '🏆  排行', {
    bg: '#FF8B6B', fontSize: 30,
  });

  // 底部装饰：4 色积木点缀
  const sample = [
    { shape: [[1, 1], [1, 1]], color: C.block1 },
    { shape: [[1, 1, 1]], color: C.block2 },
    { shape: [[1, 0], [1, 1], [0, 1]], color: C.block3 },
    { shape: [[1, 1, 1, 1]], color: C.block4 },
  ];
  let dx = 80;
  for (const s of sample) {
    renderShape(ctx, s.shape, dx, 1080, 36, s.color);
    dx += s.shape[0].length * 36 + 50;
  }

  text(ctx, 'v1.0.0', W / 2, H - 60, {
    size: 22, color: C.subText, align: 'center',
  });
}

// ============================================================
// 场景 2：选关
// ============================================================
function renderSelect(ctx) {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // 顶栏
  fillRoundRect(ctx, 30, 40, 110, 70, 24, C.panel);
  text(ctx, '◀ 返回', 30 + 55, 40 + 35, {
    size: 24, color: C.text, align: 'center', baseline: 'middle',
  });
  text(ctx, '选 择 关 卡', W / 2, 75, {
    size: 40, bold: true, color: C.text, align: 'center', baseline: 'middle',
  });

  // 难度 Tab
  const tabY = 150;
  const tabH = 80;
  const tabW = (W - 60) / 5;
  const labels = ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];
  const counts = ['40关', '50关', '50关', '40关', '20关'];
  const active = 0;
  for (let i = 0; i < 5; i++) {
    const x = 30 + i * tabW;
    const isActive = i === active;
    if (isActive) {
      fillRoundRect(ctx, x + 6, tabY, tabW - 12, tabH, 16, '#FFF6E0');
    }
    text(ctx, labels[i], x + tabW / 2, tabY + 30, {
      size: i < 3 ? 22 : 18, align: 'center', baseline: 'middle',
      color: isActive ? C.ctaPrimary : C.subText,
    });
    text(ctx, counts[i], x + tabW / 2, tabY + 58, {
      size: 18, align: 'center', baseline: 'middle',
      color: isActive ? C.text : C.subText,
    });
    if (isActive) {
      ctx.fillStyle = C.ctaPrimary;
      roundRect(ctx, x + tabW / 2 - 30, tabY + tabH - 4, 60, 4, 2);
      ctx.fill();
    }
  }

  // 关卡格子
  const cols = 5;
  const padding = 30;
  const gap = 18;
  const cellSize = (W - padding * 2 - gap * (cols - 1)) / cols;
  const startY = 280;
  for (let i = 0; i < 25; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = padding + col * (cellSize + gap);
    const y = startY + row * (cellSize + gap);
    const idx = i + 1;
    const passed = i < 12;
    const locked = i >= 14;
    const stars = passed ? [3, 3, 2, 3, 1, 2, 3, 1, 3, 2, 1, 2][i] || 0 : 0;

    if (locked) {
      fillRoundRect(ctx, x, y, cellSize, cellSize, 16, C.divider);
      text(ctx, '🔒', x + cellSize / 2, y + cellSize / 2, {
        size: 44, align: 'center', baseline: 'middle',
      });
    } else {
      softShadow(ctx, () =>
        fillRoundRect(ctx, x, y, cellSize, cellSize, 16, C.panel)
      );
      // 关卡序号
      text(ctx, String(idx), x + cellSize / 2, y + cellSize * 0.36, {
        size: 42, bold: true, color: passed ? C.text : C.subText,
        align: 'center', baseline: 'middle',
      });
      // 星星
      let sStr = '';
      for (let s = 0; s < 3; s++) sStr += s < stars ? '⭐' : '☆';
      text(ctx, sStr, x + cellSize / 2, y + cellSize * 0.74, {
        size: 22, color: passed ? C.starGold : C.starGray,
        align: 'center', baseline: 'middle',
      });
    }
  }
}

// ============================================================
// 场景 3：游戏中（基础态）
// ============================================================
function renderGame(ctx, opts = {}) {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // 顶栏
  fillRoundRect(ctx, 30, 40, 110, 70, 24, C.panel);
  text(ctx, '◀', 30 + 55, 40 + 35, {
    size: 30, color: C.text, align: 'center', baseline: 'middle',
  });
  // 关卡名 + 计时
  text(ctx, '第 1-3 关', W / 2, 60, {
    size: 36, bold: true, align: 'center', baseline: 'top',
  });
  text(ctx, '⏱  0:42', W / 2, 105, {
    size: 22, color: C.subText, align: 'center', baseline: 'top',
  });
  // 重置
  fillRoundRect(ctx, W - 140, 40, 110, 70, 24, C.panel);
  text(ctx, '🔄', W - 140 + 55, 40 + 35, {
    size: 32, align: 'center', baseline: 'middle',
  });

  // 顶栏下方 3 颗星（实时变化提示）
  const sx = W / 2 - 80;
  const stars = opts.starsLive || 1;
  for (let i = 0; i < 3; i++) {
    text(ctx, i < stars ? '⭐' : '☆', sx + i * 80, 165, {
      size: 50, align: 'center', baseline: 'middle',
      color: i < stars ? C.starGold : C.starGray,
    });
  }

  // ===== 棋盘 =====
  const gridW = 6;
  const gridH = 6;
  const cellSize = 90;
  const gridX = (W - gridW * cellSize) / 2;
  const gridY = 230;

  // 关卡形状（目标格分布）
  const target = [
    [0, 0, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0],
  ];

  // 已放置
  const placed = opts.placedShown
    ? [
        // 蓝色块 L 形
        { cells: [[0, 2], [0, 3], [1, 2], [1, 3]], color: C.block1 },
        // 橙色块 T 形
        { cells: [[0, 4], [1, 4], [2, 4], [2, 5]], color: C.block2 },
      ]
    : [];

  // 预览（拖拽中态显示）
  const preview = opts.previewCells || null;
  const previewOk = opts.previewOk !== false;

  // 画格子
  for (let r = 0; r < gridH; r++) {
    for (let c = 0; c < gridW; c++) {
      const x = gridX + c * cellSize;
      const y = gridY + r * cellSize;
      const isTarget = target[r][c] === 1;
      gridCell(ctx, x, y, cellSize, isTarget ? 'target' : 'empty');
    }
  }
  // 预览描边
  if (preview) {
    for (const [r, c] of preview) {
      const x = gridX + c * cellSize;
      const y = gridY + r * cellSize;
      gridCell(ctx, x, y, cellSize, previewOk ? 'previewOk' : 'previewBad');
    }
  }
  // 已放置
  for (const blk of placed) {
    for (const [r, c] of blk.cells) {
      const x = gridX + c * cellSize;
      const y = gridY + r * cellSize;
      blockCell(ctx, x, y, cellSize, blk.color, 6);
    }
  }

  // ===== 托盘 =====
  const trayY = gridY + gridH * cellSize + 50;
  const trayH = 280;
  fillRoundRect(ctx, 30, trayY, W - 60, trayH, 24, C.panel);
  text(ctx, '可用方块', 60, trayY + 24, { size: 24, color: C.subText });

  // 托盘里 3 个方块
  const trayCellSize = 44;
  const trayShapes = [
    { shape: [[1, 1, 1], [1, 0, 0], [1, 0, 0]], color: C.block3, x: 80, y: trayY + 90 },
    { shape: [[1, 1, 0], [0, 1, 1], [0, 0, 1]], color: C.block4, x: 320, y: trayY + 90 },
    { shape: [[1, 1, 1, 1]], color: C.block2, x: 540, y: trayY + 130 },
  ];
  if (opts.afterShuffle) {
    // 打乱后顺序变化
    trayShapes.reverse();
    trayShapes[0].x = 80; trayShapes[0].y = trayY + 90;
    trayShapes[1].x = 320; trayShapes[1].y = trayY + 90;
    trayShapes[2].x = 540; trayShapes[2].y = trayY + 130;
  }
  for (const t of trayShapes) {
    if (opts.draggingIdx === trayShapes.indexOf(t)) continue; // 拖拽中的不在托盘画
    renderShape(ctx, t.shape, t.x, t.y, trayCellSize, t.color);
  }

  // 拖拽中的块（在棋盘上半透明跟随手指）
  if (opts.draggingShape) {
    ctx.save();
    ctx.globalAlpha = 0.85;
    const ds = opts.draggingShape;
    const dragX = opts.dragX || 350;
    const dragY = opts.dragY || 480;
    const sw = ds.shape[0].length * cellSize;
    const sh = ds.shape.length * cellSize;
    renderShape(ctx, ds.shape, dragX - sw / 2, dragY - sh / 2, cellSize, ds.color, 6);
    ctx.restore();
  }

  // ===== 底部工具条 =====
  const toolY = H - 130;
  const toolH = 90;
  const toolGap = 16;
  const toolW = (W - 60 - toolGap * 3) / 4;
  const tools = [
    { label: '💡  提示', n: '×3', bg: '#FFF3CD' },
    { label: '🎯  撤销', bg: '#D1ECF1' },
    { label: '🔀  打乱', bg: '#E2D9F3' },
    { label: '🚫  跳关', bg: '#F8D7DA' },
  ];
  for (let i = 0; i < tools.length; i++) {
    const x = 30 + i * (toolW + toolGap);
    fillRoundRect(ctx, x, toolY, toolW, toolH, 20, tools[i].bg);
    if (tools[i].n) {
      text(ctx, tools[i].n, x + toolW - 12, toolY + 12, {
        size: 18, bold: true, color: C.ctaDanger, align: 'right',
      });
    }
    text(ctx, tools[i].label, x + toolW / 2, toolY + toolH / 2 + 4, {
      size: 24, bold: true, color: C.text,
      align: 'center', baseline: 'middle',
    });
  }
}

// ============================================================
// 场景 3.5：游戏中 - 拖拽预览态
// ============================================================
function renderGameDragging(ctx) {
  // 模拟玩家把绿色 L 块拖到棋盘左上目标区，预览合法
  renderGame(ctx, {
    starsLive: 2,
    placedShown: true,
    previewCells: [[3, 1], [4, 1], [4, 2], [4, 3]],
    previewOk: true,
    draggingIdx: 0,
    draggingShape: {
      shape: [[1, 0, 0], [1, 1, 1]],
      color: C.block3,
    },
    dragX: 320,
    dragY: 580,
  });
}

// ============================================================
// 场景 4：通关结算（弹层覆盖在 game 上）
// ============================================================
function renderResult(ctx) {
  // 先画一层游戏背景
  renderGame(ctx, { starsLive: 3, placedShown: true });

  // 半透明遮罩
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, W, H);

  // 弹层
  const panelW = W * 0.85;
  const panelH = 880;
  const px = (W - panelW) / 2;
  const py = (H - panelH) / 2 - 40;
  softShadow(ctx, () =>
    fillRoundRect(ctx, px, py, panelW, panelH, 32, C.panel)
  );

  // 标题
  text(ctx, '🎉', W / 2, py + 50, { size: 80, align: 'center' });
  text(ctx, '通 关 成 功！', W / 2, py + 170, {
    size: 56, bold: true, color: C.text, align: 'center', baseline: 'middle',
  });

  // 三星（带光晕）
  const sy = py + 280;
  for (let i = 0; i < 3; i++) {
    const sx = W / 2 - 100 + i * 100;
    // 光晕
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = C.starGold;
    ctx.beginPath();
    ctx.arc(sx, sy, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // 星星
    text(ctx, '⭐', sx, sy, {
      size: 70, align: 'center', baseline: 'middle',
    });
  }

  // 数据行
  const dataY = py + 400;
  text(ctx, '⏱', W / 2 - 120, dataY, { size: 30, align: 'right', baseline: 'middle' });
  text(ctx, '0:42', W / 2 - 100, dataY, { size: 30, bold: true, baseline: 'middle' });
  text(ctx, '💡', W / 2 + 30, dataY, { size: 30, baseline: 'middle' });
  text(ctx, '未使用提示', W / 2 + 70, dataY, {
    size: 26, color: C.subText, baseline: 'middle',
  });

  // 奖励行
  const rewardY = py + 470;
  fillRoundRect(ctx, px + 60, rewardY, panelW - 120, 80, 20, '#FFF8E1');
  text(ctx, '🪙  +120     💎  +5     🎫  +1', W / 2, rewardY + 40, {
    size: 30, bold: true, color: C.text, align: 'center', baseline: 'middle',
  });

  // 按钮组
  const btnX = px + 50;
  const btnW = panelW - 100;
  renderButton(ctx, btnX, py + 600, btnW, 90, '📺 看广告 金币×2', {
    bg: '#FF6B6B', fontSize: 30,
  });
  renderButton(ctx, btnX, py + 705, btnW, 90, '下 一 关  →', {
    bg: C.ctaPrimary, fontSize: 36,
  });
  renderButton(ctx, btnX, py + 810, btnW, 70, '返 回 选 关', {
    bg: C.ctaGray, fontSize: 26,
  });
}

// ============================================================
// 场景 5：皮肤商店
// ============================================================
// 全局滚动状态（皮肤页用）
const scrollState = { skin: 0, skinMax: 0 };

function renderSkin(ctx) {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // 数据
  const skins = (window.BM_SKINS || []).map((s, i) => ({
    ...s,
    isCurrent: i === 0,
    isOwned: i === 0,
    isLocked: i > 0,
  }));

  // 按等级分组
  const groups = [0, 1, 2, 3, 4, 5, 6].map((lv) => ({
    level: lv,
    items: skins.filter((s) => s.level === lv),
  }));

  const previewShapes = [
    [[1, 1], [1, 1]],
    [[1, 1, 1]],
    [[1, 0], [1, 1]],
    [[0, 1], [1, 1], [1, 0]],
  ];

  const levelBadge = {
    0: { bg: '#E9ECEF', fg: '#495057', label: 'L0 纯色', headerText: '默认皮肤' },
    1: { bg: '#D1ECF1', fg: '#0C5460', label: 'L1 几何', headerText: '入门 · 累计星数解锁' },
    2: { bg: '#FFF3CD', fg: '#856404', label: 'L2 渐变', headerText: '进阶 · 一周内拥有' },
    3: { bg: '#F8D7DA', fg: '#721C24', label: 'L3 图标', headerText: '收藏 · 半月攒钱' },
    4: { bg: '#E2D9F3', fg: '#4A148C', label: 'L4 复合', headerText: '大师 · 月度目标' },
    5: { bg: '#FFE0B2', fg: '#E65100', label: 'L5 大师', headerText: '巅峰 · 长期目标' },
    6: { bg: '#FFD3E0', fg: '#AD1457', label: 'L6 限定', headerText: '稀有 · 节日活动' },
  };

  // 卡片网格参数
  const padX = 20;
  const cardGap = 12;
  const cols = 3;
  const cardW = (W - padX * 2 - cardGap * (cols - 1)) / cols;
  const cardH = 220;
  const groupHeaderH = 56;

  // 计算总内容高度
  const contentTop = 220;
  const contentBottom = H - 60; // 底部留白
  const visibleH = contentBottom - contentTop;

  let totalH = 0;
  for (const grp of groups) {
    if (grp.items.length === 0) continue;
    const rows = Math.ceil(grp.items.length / cols);
    totalH += groupHeaderH + rows * (cardH + cardGap) + 12;
  }
  scrollState.skinMax = Math.max(0, totalH - visibleH);
  scrollState.skin = Math.max(0, Math.min(scrollState.skinMax, scrollState.skin));

  // ===== 滚动区域绘制 =====
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, contentTop, W, visibleH);
  ctx.clip();
  ctx.translate(0, -scrollState.skin);

  let currentY = contentTop;
  for (const grp of groups) {
    if (grp.items.length === 0) continue;

    const badge = levelBadge[grp.level];
    fillRoundRect(ctx, padX, currentY, 110, 36, 18, badge.bg);
    text(ctx, badge.label, padX + 55, currentY + 18, {
      size: 18, bold: true, color: badge.fg, align: 'center', baseline: 'middle',
    });
    text(ctx, badge.headerText, padX + 130, currentY + 18, {
      size: 18, color: C.subText, baseline: 'middle',
    });
    text(ctx, `${grp.items.length} 套`, W - padX, currentY + 18, {
      size: 18, color: C.subText, align: 'right', baseline: 'middle',
    });
    currentY += groupHeaderH;

    const rows = Math.ceil(grp.items.length / cols);
    for (let i = 0; i < grp.items.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = padX + col * (cardW + cardGap);
      const y = currentY + row * (cardH + cardGap);
      renderSkinCard(ctx, x, y, cardW, cardH, grp.items[i], previewShapes);
    }
    currentY += rows * (cardH + cardGap) + 12;
  }

  ctx.restore();

  // ===== 顶部固定区（不随滚动）=====
  // 顶栏（覆盖在内容上）
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, contentTop);

  fillRoundRect(ctx, 30, 40, 110, 70, 24, C.panel);
  text(ctx, '◀ 返回', 30 + 55, 40 + 35, {
    size: 24, align: 'center', baseline: 'middle',
  });
  text(ctx, '皮 肤 商 店', W / 2, 75, {
    size: 40, bold: true, align: 'center', baseline: 'middle',
  });

  const tabY = 130;
  fillRoundRect(ctx, 30, tabY, W - 60, 70, 18, C.panel);
  fillRoundRect(ctx, 40, tabY + 7, (W - 80) / 2, 56, 14, C.ctaPrimary);
  text(ctx, '积木皮肤 (25)', 40 + (W - 80) / 4, tabY + 35, {
    size: 24, bold: true, color: '#fff', align: 'center', baseline: 'middle',
  });
  text(ctx, '背景皮肤', W - 40 - (W - 80) / 4, tabY + 35, {
    size: 24, color: C.subText, align: 'center', baseline: 'middle',
  });

  // ===== 底部固定区 + 滚动条 =====
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, contentBottom, W, H - contentBottom);

  // 滚动条（右侧细条，仅当有内容可滚时显示）
  if (scrollState.skinMax > 0) {
    const sbX = W - 12;
    const sbW = 4;
    const sbY = contentTop + 8;
    const sbTrackH = visibleH - 16;
    // 滑轨
    fillRoundRect(ctx, sbX, sbY, sbW, sbTrackH, 2, '#E9ECEF');
    // 滑块
    const thumbH = Math.max(40, (visibleH / totalH) * sbTrackH);
    const thumbY = sbY + (scrollState.skin / scrollState.skinMax) * (sbTrackH - thumbH);
    fillRoundRect(ctx, sbX, thumbY, sbW, thumbH, 2, '#ADB5BD');
  }

  // 底部提示（位置/进度）
  const progressPct = scrollState.skinMax > 0
    ? Math.round((scrollState.skin / scrollState.skinMax) * 100)
    : 100;
  text(ctx,
    scrollState.skinMax > 0
      ? `滚轮 / 拖拽浏览  ·  ${progressPct}%`
      : '已显示全部 24 套皮肤',
    W / 2, H - 30, {
      size: 18, color: C.subText, align: 'center', baseline: 'middle',
    }
  );
}

// 单张皮肤卡片
function renderSkinCard(ctx, x, y, w, h, sk, previewShapes) {
  // 背景
  softShadow(ctx, () =>
    fillRoundRect(ctx, x, y, w, h, 16, sk.isLocked ? '#F8F9FA' : C.panel)
  );

  // 4 个小积木预览
  const previewY = y + 12;
  const previewH = 110;
  const cellSize = 14;
  const slotW = (w - 8) / 4;
  for (let k = 0; k < 4; k++) {
    const shape = previewShapes[k];
    const shapeColor = sk.colors[k];
    const sw = shape[0].length * cellSize;
    const sh = shape.length * cellSize;
    const slotX = x + 4 + k * slotW + (slotW - sw) / 2;
    const slotY = previewY + (previewH - sh) / 2;

    ctx.save();
    if (sk.isLocked) ctx.globalAlpha = 0.85;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === 1) {
          sk.pattern(
            ctx,
            slotX + c * cellSize + 1,
            slotY + r * cellSize + 1,
            cellSize - 2,
            shapeColor,
            window.BM_TIME || 0
          );
        }
      }
    }
    ctx.restore();
  }

  // 皮肤名
  text(ctx, sk.name, x + w / 2, y + 145, {
    size: 18, bold: true, align: 'center', baseline: 'middle',
    color: sk.isLocked ? C.subText : C.text,
  });

  // 解锁按钮
  const btnH = 36;
  const btnX = x + 12;
  const btnY = y + h - btnH - 12;
  const btnW = w - 24;
  let btnBg;
  if (sk.isCurrent) btnBg = C.ctaQuart;
  else if (sk.isOwned) btnBg = C.ctaPrimary;
  else if (sk.unlock.type === 'event') btnBg = '#E91E63';
  else if (sk.unlock.type === 'ad') btnBg = '#FF6B6B';
  else if (sk.unlock.type === 'diamonds') btnBg = '#5B9DF9';
  else if (sk.unlock.type === 'coins') btnBg = '#FFB400';
  else if (sk.unlock.type === 'stars') btnBg = '#FFA94D';
  else btnBg = C.ctaPrimary;

  fillRoundRect(ctx, btnX, btnY, btnW, btnH, 10, btnBg);
  text(ctx, sk.statusText, btnX + btnW / 2, btnY + btnH / 2, {
    size: 14, bold: true, color: '#fff', align: 'center', baseline: 'middle',
  });
}

// ============================================================
// 场景 6：每日签到
// ============================================================
function renderDaily(ctx) {
  // 渐变背景
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#FFE9F0');
  grad.addColorStop(1, '#FFFFFF');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 顶栏
  fillRoundRect(ctx, 30, 40, 110, 70, 24, C.panel);
  text(ctx, '◀ 返回', 30 + 55, 40 + 35, {
    size: 24, align: 'center', baseline: 'middle',
  });
  text(ctx, '每 日 签 到', W / 2, 75, {
    size: 40, bold: true, align: 'center', baseline: 'middle',
  });

  // 连签
  text(ctx, '🔥 连续签到第 3 天', W / 2, 180, {
    size: 32, bold: true, color: '#FF6B6B', align: 'center',
  });
  text(ctx, '坚持就是胜利！', W / 2, 230, {
    size: 22, color: C.subText, align: 'center',
  });

  // 7 天奖励格
  const days = [
    { day: 1, reward: '🪙', val: 50, done: true },
    { day: 2, reward: '🪙', val: 80, done: true },
    { day: 3, reward: '🪙', val: 100, today: true },
    { day: 4, reward: '🪙', val: 150 },
    { day: 5, reward: '🎫', val: 1, special: true },
    { day: 6, reward: '🪙', val: 200 },
    { day: 7, reward: '💎', val: 10, big: true },
  ];
  const cellW = (W - 80) / 4;
  const cellH = 180;
  const sy = 320;
  for (let i = 0; i < days.length; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 40 + col * (cellW + 0);
    const y = sy + row * (cellH + 20);
    const d = days[i];

    let bg = C.panel;
    if (d.done) bg = '#E8F5E9';
    if (d.today) bg = '#FFF3CD';
    if (d.big) bg = '#E3F2FD';
    if (d.special) bg = '#F3E5F5';

    softShadow(ctx, () =>
      fillRoundRect(ctx, x + 6, y, cellW - 12, cellH, 16, bg)
    );

    // 第 N 天
    text(ctx, `第${d.day}天`, x + cellW / 2, y + 24, {
      size: 22, color: C.subText, align: 'center', baseline: 'middle',
    });
    // 奖励 emoji
    text(ctx, d.reward, x + cellW / 2, y + 78, {
      size: 56, align: 'center', baseline: 'middle',
    });
    // 数量
    text(ctx, d.val + (d.special ? ' 碎片' : ''), x + cellW / 2, y + 130, {
      size: 22, bold: true, color: C.text, align: 'center', baseline: 'middle',
    });
    // 状态
    if (d.done) {
      text(ctx, '✓', x + cellW / 2, y + 158, {
        size: 24, bold: true, color: '#6BCB77', align: 'center', baseline: 'middle',
      });
    } else if (d.today) {
      text(ctx, '👉今日', x + cellW / 2, y + 158, {
        size: 18, bold: true, color: '#FF6B6B', align: 'center', baseline: 'middle',
      });
    }
  }

  // 主按钮
  renderButton(ctx, 95, 760, 560, 110, '✨  签 到 领 取', {
    bg: C.ctaPrimary, fontSize: 38,
  });
  renderButton(ctx, 95, 900, 560, 100, '📺  看广告 翻倍领取', {
    bg: '#FF6B6B', fontSize: 30,
  });

  // 提示
  text(ctx, '连签满 7 天可获得隐藏皮肤！', W / 2, 1080, {
    size: 22, color: C.subText, align: 'center',
  });
}

// ============================================================
// 场景 7：设置
// ============================================================
function renderSettings(ctx) {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // 顶栏
  fillRoundRect(ctx, 30, 40, 110, 70, 24, C.panel);
  text(ctx, '◀ 返回', 30 + 55, 40 + 35, {
    size: 24, align: 'center', baseline: 'middle',
  });
  text(ctx, '设 置', W / 2, 75, {
    size: 40, bold: true, align: 'center', baseline: 'middle',
  });

  const items = [
    { icon: '🎵', label: '背景音乐', toggle: true, on: true },
    { icon: '🔊', label: '音效', toggle: true, on: true },
    { icon: '📳', label: '震动反馈', toggle: true, on: false },
    { divider: true },
    { icon: '🌐', label: '语言', value: '简体中文 ▶' },
    { icon: '🎨', label: '当前皮肤', value: '经典糖果 ▶' },
    { divider: true },
    { icon: '📤', label: '邀请好友', value: '▶' },
    { icon: '⭐', label: '给个好评', value: '▶' },
    { icon: '📜', label: '用户协议', value: '▶' },
    { icon: '🔒', label: '隐私政策', value: '▶' },
  ];

  let curY = 160;
  const itemH = 96;
  const padX = 30;
  // 整段背景
  let totalH = 0;
  for (const it of items) totalH += it.divider ? 30 : itemH;
  fillRoundRect(ctx, padX, curY, W - padX * 2, totalH, 24, C.panel);

  for (const it of items) {
    if (it.divider) {
      ctx.fillStyle = C.divider;
      ctx.fillRect(padX + 30, curY + 14, W - padX * 2 - 60, 1);
      curY += 30;
      continue;
    }
    // icon + label
    text(ctx, it.icon, padX + 36, curY + itemH / 2, {
      size: 36, baseline: 'middle',
    });
    text(ctx, it.label, padX + 100, curY + itemH / 2, {
      size: 28, baseline: 'middle',
    });
    // 右侧
    if (it.toggle) {
      const swW = 80;
      const swH = 44;
      const swX = W - padX - 36 - swW;
      const swY = curY + (itemH - swH) / 2;
      fillRoundRect(ctx, swX, swY, swW, swH, 22, it.on ? C.ctaQuart : C.divider);
      // 圆点
      ctx.beginPath();
      ctx.arc(it.on ? swX + swW - swH / 2 : swX + swH / 2, swY + swH / 2, swH / 2 - 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    } else if (it.value) {
      text(ctx, it.value, W - padX - 36, curY + itemH / 2, {
        size: 24, color: C.subText, align: 'right', baseline: 'middle',
      });
    }
    curY += itemH;
  }

  // 危险按钮
  renderButton(ctx, 95, curY + 60, 560, 90, '⚠ 重 置 游 戏 数 据', {
    bg: C.ctaDanger, fontSize: 28,
  });

  // 版本号
  text(ctx, 'v1.0.0', W / 2, H - 60, {
    size: 22, color: C.subText, align: 'center',
  });
}

// ============================================================
// 主控逻辑
// ============================================================
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const sceneInfo = document.getElementById('sceneInfo');
const legend = document.getElementById('legend');

const scenes = {
  main: {
    render: renderMain,
    title: '① 主菜单 MainScene',
    desc: `
      <h3>设计要点</h3>
      <ul>
        <li>顶栏白色胶囊：<code>金币 + 钻石 + 设置</code></li>
        <li>主 CTA「开始游戏」用 <code>#FFB400</code> 阳光黄，最显眼</li>
        <li>下方双联按钮：<code>签到 / 挑战 / 皮肤 / 排行</code></li>
        <li>底部装饰：4 色积木点缀，强化品牌识别</li>
        <li>顶到底渐变（暖黄→白→淡蓝），柔和马卡龙感</li>
      </ul>
    `,
  },
  select: {
    render: renderSelect,
    title: '② 选关 LevelSelectScene',
    desc: `
      <h3>设计要点</h3>
      <ul>
        <li>5 个 Tab 对应 1-5 星难度，每个 Tab 显示该难度关数</li>
        <li>当前 Tab 浅黄高亮 + 下方阳光黄色短下划线</li>
        <li>关卡格 130×130 圆角 16，显示「序号 + 三星」</li>
        <li>已通关白底显金星，未通关浅灰星，未解锁灰底 + 🔒</li>
        <li>纵向滚动加载（演示静态截图）</li>
      </ul>
    `,
  },
  game: {
    render: (ctx) => renderGame(ctx, { starsLive: 1, placedShown: true }),
    title: '③ 游戏中 GameScene（基础态）',
    desc: `
      <h3>设计要点</h3>
      <ul>
        <li>顶栏：返回 / 关名 第 1-3 关 / 计时 / 重置</li>
        <li>顶栏下方 3 颗大星：<b>实时显示当前可获得星数</b>（用提示会从 3⭐ 降到 2⭐）</li>
        <li>棋盘：<code>暖黄 = 目标格</code>，<code>浅灰 = 非目标格</code></li>
        <li>托盘里 3 块积木横向排列，使用 4 色之一</li>
        <li>底部 4 个工具：💡 提示×3、🎯 撤销、🔀 打乱、🚫 跳关</li>
      </ul>
    `,
  },
  'game-dragging': {
    render: renderGameDragging,
    title: '③.5 游戏中 - 拖拽预览态',
    desc: `
      <h3>核心 UX：拖拽预览</h3>
      <ul>
        <li>玩家拖动绿色 L 块，棋盘上四格变 <span style="color:#5B9DF9">浅蓝</span> = 合法位置</li>
        <li>非法位置变 <span style="color:#FFB6B6">浅粉红</span>，松手会飞回托盘</li>
        <li>拖动时积木放大到棋盘格大小（45px → 90px），半透明</li>
        <li>这是同类游戏的金标准 UX，让玩家未松手就知道能不能放</li>
      </ul>
    `,
  },
  result: {
    render: renderResult,
    title: '④ 通关结算 ResultScene',
    desc: `
      <h3>设计要点</h3>
      <ul>
        <li>弹层覆盖在游戏画面上（不是新场景），半透明黑底 0.55</li>
        <li>白色面板圆角 32，从底部弹入（0.3s ease-out）</li>
        <li>三星依次弹出：0s / 0.2s / 0.4s，星后带金色光晕</li>
        <li>奖励行用浅黄底胶囊：<code>🪙+120 💎+5 🎫+1</code></li>
        <li>3 个按钮：<b>看广告金币×2 / 下一关 / 返回选关</b></li>
      </ul>
    `,
  },
  skin: {
    render: renderSkin,
    title: '⑤ 皮肤商店 SkinShopScene',
    desc: `
      <h3>v3 视觉升级（25 套皮肤）</h3>
      <ul>
        <li><b>L3-L6 全部重做</b>，不再是抽象图案，而是<b>有具体形象</b>的插画 / 真实质感 / 微动画</li>
        <li><b>L5/L6 自带微动画</b>：钻石旋转闪光 · 王冠呼吸光晕 · 银河旋转 · 龙鳞烫金扫光 · 南瓜火光闪烁 · 赛博扫描线</li>
        <li>动画通过 <code>requestAnimationFrame</code> 驱动，仅在皮肤商店预览时启用，游戏内可关闭</li>
      </ul>
      <h3>L3 收藏（5 套，重做后变成可识别角色/场景）</h3>
      <ul>
        <li>🐱 <b>猫咪头像</b> · ☄ <b>流星划过</b> · 🌸 <b>樱花飘落</b> · 🐠 <b>珊瑚海底</b> · ❄ <b>冰晶雪花</b></li>
      </ul>
      <h3>L4 大师（5 套，强烈艺术风格）</h3>
      <ul>
        <li>⚔ <b>像素剑士</b>（8x8 像素小人轮廓）· ☁ <b>流云祥纹</b>（双层卷云+烫金）</li>
        <li>🛡 <b>机甲铆钉</b>（蜂窝+4 铆钉+金属斜光）· 🏔 <b>远山近水</b>（三层山+飞鸟+朱砂印）</li>
        <li>🍭 <b>棒棒糖琉璃</b>（阿基米德螺旋+玻璃高光）</li>
      </ul>
      <h3>L5 巅峰（3 套，带微动画的顶级质感）</h3>
      <ul>
        <li>💎 <b>八面切割钻</b>（8 切面 + 旋转闪光）</li>
        <li>👑 <b>皇家纹章</b>（盾形+王冠+宝石 + 呼吸光晕）</li>
        <li>🌌 <b>银河漩涡</b>（双旋臂+星点 + 旋转动画）</li>
      </ul>
      <h3>L6 限定（3 套，含新增赛博）</h3>
      <ul>
        <li>🌃 <b>赛博霓虹</b>（NEW！网格+扫描光+CYBER字+霓虹双色）💎 1500</li>
        <li>🐲 <b>赤金龙鳞</b>（立体鳞片+金线 + 烫金扫光） 春节限定</li>
        <li>🎃 <b>诡笑南瓜</b>（黑面具+ 内透火光闪烁） 万圣限定</li>
      </ul>
      <h3>价格锚点（月活跃 ≈ 9 万金币）</h3>
      <ul>
        <li><b>L0</b> 默认  ·  <b>L1</b> ⭐50~500  ·  <b>L2</b> 🪙3000~10000 / 💎50</li>
        <li><b>L3</b> 🪙15000~20000 / 💎100 / 📺×30 / ⭐600  ·  <b>L4</b> 🪙35000~50000 / 💎250 / ⭐1000（月度目标）</li>
        <li><b>L5</b> 💎800~1200 / ⭐2500（长期目标）  ·  <b>L6</b> 💎1500 / 节日限定</li>
      </ul>
    `,
  },
  daily: {
    render: renderDaily,
    title: '⑥ 每日签到 DailyScene',
    desc: `
      <h3>设计要点</h3>
      <ul>
        <li>7 天循环奖励格，每天奖励差异化：金币/碎片/钻石</li>
        <li>第 5 天：贴纸碎片（紫色高亮），第 7 天：钻石大奖（蓝色高亮）</li>
        <li>已签：绿底 + ✓，今日：黄底 + 👉，未来：白底</li>
        <li>主 CTA「签到领取」+ 副 CTA「看广告翻倍」</li>
        <li>进入主菜单时，当天未签则自动弹出</li>
      </ul>
    `,
  },
  settings: {
    render: renderSettings,
    title: '⑦ 设置 SettingsScene',
    desc: `
      <h3>设计要点</h3>
      <ul>
        <li>纯白卡片承载所有项，灰色细线分组</li>
        <li>3 个开关：BGM / 音效 / 震动（绿色 = 开）</li>
        <li>2 个跳转项：语言 / 当前皮肤</li>
        <li>4 个静态项：邀请 / 评分 / 协议 / 隐私</li>
        <li>底部红色危险按钮：重置游戏数据（带二次确认）</li>
      </ul>
    `,
  },
};

function show(key) {
  const s = scenes[key];
  if (!s) return;
  currentSceneKey = key;
  ctx.clearRect(0, 0, W, H);
  s.render(ctx);
  sceneInfo.textContent = s.title;
  legend.innerHTML = s.desc;
  document.querySelectorAll('.nav button').forEach((b) => {
    b.classList.toggle('active', b.dataset.scene === key);
  });
}

document.querySelectorAll('.nav button').forEach((btn) => {
  btn.addEventListener('click', () => {
    // 切换场景时重置滚动
    if (btn.dataset.scene === 'skin') scrollState.skin = 0;
    show(btn.dataset.scene);
  });
});

// ===== 滚动支持（皮肤页用）=====
let currentSceneKey = 'main';

// 鼠标滚轮
cv.addEventListener('wheel', (e) => {
  if (currentSceneKey !== 'skin') return;
  if (scrollState.skinMax <= 0) return;
  e.preventDefault();
  // 浏览器 deltaY 一般是 ±100，这里乘 1.5 让滚动更顺滑
  scrollState.skin = Math.max(0, Math.min(
    scrollState.skinMax,
    scrollState.skin + e.deltaY * 1.5
  ));
  show('skin');
}, { passive: false });

// 鼠标拖拽
let dragState = null;
cv.addEventListener('mousedown', (e) => {
  if (currentSceneKey !== 'skin') return;
  if (scrollState.skinMax <= 0) return;
  dragState = {
    startY: e.clientY,
    startScroll: scrollState.skin,
  };
  cv.style.cursor = 'grabbing';
});
window.addEventListener('mousemove', (e) => {
  if (!dragState) return;
  const dy = e.clientY - dragState.startY;
  // 因为 canvas 实际显示尺寸是 ~600 高，但内部 1334，需要按比例放大
  const ratio = H / cv.getBoundingClientRect().height;
  scrollState.skin = Math.max(0, Math.min(
    scrollState.skinMax,
    dragState.startScroll - dy * ratio
  ));
  show('skin');
});
window.addEventListener('mouseup', () => {
  if (dragState) {
    dragState = null;
    cv.style.cursor = 'pointer';
  }
});

// 触摸（手机/触控板）
cv.addEventListener('touchstart', (e) => {
  if (currentSceneKey !== 'skin') return;
  if (scrollState.skinMax <= 0) return;
  const t = e.touches[0];
  dragState = {
    startY: t.clientY,
    startScroll: scrollState.skin,
  };
}, { passive: true });
cv.addEventListener('touchmove', (e) => {
  if (!dragState) return;
  const t = e.touches[0];
  const dy = t.clientY - dragState.startY;
  const ratio = H / cv.getBoundingClientRect().height;
  scrollState.skin = Math.max(0, Math.min(
    scrollState.skinMax,
    dragState.startScroll - dy * ratio
  ));
  show('skin');
  e.preventDefault();
}, { passive: false });
cv.addEventListener('touchend', () => {
  dragState = null;
});

// ===== 动画循环（仅在皮肤页激活，因为只有 L5/L6 用了 time）=====
window.BM_TIME = 0;
let animStart = performance.now();
let animRafId = null;
function animLoop() {
  window.BM_TIME = performance.now() - animStart;
  // 当前在皮肤页时持续重绘
  if (currentSceneKey === 'skin') {
    show('skin');
  }
  animRafId = requestAnimationFrame(animLoop);
}
animLoop();

// 初始化
show('main');
