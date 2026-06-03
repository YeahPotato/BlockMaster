/**
 * 批量生成 500 关脚本
 *
 * 运行方式：
 *   cd tools
 *   node build-levels.js
 *
 * 输出：
 *   minigame/data/levels/chapter_1.json ~ chapter_10.json
 *   minigame/data/levels/index.json (关卡索引)
 */

const fs = require('fs');
const path = require('path');
const { generateLevel } = require('./level-generator');

// ============ 章节配置 ============
// 共 500 关，10 章 × 50 关
const CHAPTERS = [
  { id: 1, name: '萌新草原', icon: '🌱', difficulty: 1, levelCount: 50 },
  { id: 2, name: '蔚蓝海岸', icon: '🌊', difficulty: 2, levelCount: 50 },
  { id: 3, name: '樱花小镇', icon: '🌸', difficulty: 3, levelCount: 50 },
  { id: 4, name: '秋日森林', icon: '🍂', difficulty: 4, levelCount: 50 },
  { id: 5, name: '冰雪奇境', icon: '❄️', difficulty: 5, levelCount: 50 },
  { id: 6, name: '火山熔岩', icon: '🌋', difficulty: 6, levelCount: 50 },
  { id: 7, name: '沙漠遗迹', icon: '🏜️', difficulty: 7, levelCount: 50 },
  { id: 8, name: '星空幻境', icon: '🌌', difficulty: 8, levelCount: 50 },
  { id: 9, name: '龙脊山脉', icon: '🐉', difficulty: 9, levelCount: 50 },
  { id: 10, name: '王者之巅', icon: '👑', difficulty: 10, levelCount: 50 },
];

// 输出路径
const OUTPUT_DIR = path.resolve(__dirname, '../minigame/data/levels');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function buildAllLevels() {
  ensureDir(OUTPUT_DIR);

  const indexData = {
    totalLevels: 0,
    chapters: [],
    generatedAt: new Date().toISOString(),
  };

  let globalLevelId = 1;
  let totalGenerated = 0;
  let totalFailed = 0;

  for (const chapter of CHAPTERS) {
    console.log(`\n========== 第 ${chapter.id} 章: ${chapter.icon} ${chapter.name} ==========`);
    const levels = [];
    let attempts = 0;
    let chapterStart = globalLevelId;

    while (levels.length < chapter.levelCount) {
      attempts++;
      if (attempts > chapter.levelCount * 5) {
        console.warn(`  ⚠️  生成 ${chapter.levelCount} 关尝试次数过多，已生成 ${levels.length} 关`);
        break;
      }

      const level = generateLevel(chapter.difficulty);
      if (!level) {
        totalFailed++;
        continue;
      }

      levels.push({
        levelId: globalLevelId,
        chapter: chapter.id,
        levelInChapter: levels.length + 1,
        name: `${chapter.name}-${levels.length + 1}`,
        difficulty: chapter.difficulty,
        difficultyScore: level.difficultyScore,
        gridSize: level.gridSize,
        targetCells: level.targetCells,
        availableBlocks: level.availableBlocks,
        solutionCount: level.solutionCount,
        rewards: computeRewards(chapter.difficulty),
      });

      globalLevelId++;
      if (levels.length % 10 === 0) {
        process.stdout.write(`  进度: ${levels.length}/${chapter.levelCount}\r`);
      }
    }

    // 写入章节文件
    const chapterFile = path.join(OUTPUT_DIR, `chapter_${chapter.id}.json`);
    fs.writeFileSync(
      chapterFile,
      JSON.stringify(
        {
          chapter: chapter.id,
          name: chapter.name,
          icon: chapter.icon,
          difficulty: chapter.difficulty,
          levels,
        },
        null,
        2
      )
    );

    indexData.chapters.push({
      id: chapter.id,
      name: chapter.name,
      icon: chapter.icon,
      difficulty: chapter.difficulty,
      file: `chapter_${chapter.id}.json`,
      levelCount: levels.length,
      levelStart: chapterStart,
      levelEnd: globalLevelId - 1,
    });

    totalGenerated += levels.length;
    console.log(`  ✅ 已生成 ${levels.length} 关 → ${chapterFile}`);
  }

  indexData.totalLevels = totalGenerated;

  // 写入索引文件
  const indexFile = path.join(OUTPUT_DIR, 'index.json');
  fs.writeFileSync(indexFile, JSON.stringify(indexData, null, 2));

  console.log('\n========================================');
  console.log(`🎉 关卡生成完成！`);
  console.log(`   总计：${totalGenerated} 关`);
  console.log(`   失败重试：${totalFailed} 次`);
  console.log(`   输出目录：${OUTPUT_DIR}`);
  console.log(`   索引文件：${indexFile}`);
  console.log('========================================\n');
}

/**
 * 不同难度的关卡奖励
 */
function computeRewards(difficulty) {
  return {
    coins: 50 + difficulty * 10,
    star1: { coins: 50 + difficulty * 10 },
    star2: { coins: 100 + difficulty * 20, diamonds: 5 },
    star3: { coins: 200 + difficulty * 30, diamonds: 10, stickerPiece: 1 },
  };
}

// 执行
buildAllLevels();
