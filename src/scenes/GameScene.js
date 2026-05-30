import Phaser from 'phaser';
import { COLS, ROWS, MT_DEPTH, SHORE_START, SHORE_END, TERRAIN } from '../game/constants.js';
import { HexGrid } from '../game/HexGrid.js';
import { buildWorld } from '../game/worldGen.js';
import { state } from '../game/gameState.js';
import { canPlace, placeBuilding } from '../game/buildings.js';
import { processTick } from '../game/resourceTick.js';
import { checkTechUnlocks } from '../game/techs.js';

// Atlas frame mapping per CLAUDE.md "Terrain frame -> game terrain mapping".
// Tints are programmatic placeholders for ocean/stream/forest (no native water/forest sprite).
const TERRAIN_TO_FRAME = {
  [TERRAIN.FLAT]:     'grass_01.png',
  [TERRAIN.MOUNTAIN]: 'stone_01.png',
  'peak-tip':         'stone_01.png',
  'peak-upper':       'stone_01.png',
  [TERRAIN.SHORE]:    'sand_01.png',
  [TERRAIN.OCEAN]:    'grass_01.png',
  [TERRAIN.STREAM]:   'grass_01.png',
  [TERRAIN.FOREST]:   'grass_01.png',
};

const TERRAIN_TO_TINT = {
  [TERRAIN.OCEAN]:  0x2255bb,
  [TERRAIN.STREAM]: 0x2255bb,
  [TERRAIN.FOREST]: 0x1a5c1a,
};

const BUILDING_TINT = { hale: 0xffd700, loi: 0x00ffcc, 'loko-ia': 0x4488ff };
// Tints per visual tier (0=T1, 1=T2, 2=T3). hale darkens with each tech unlock.
// loi/loko-ia are single-tier -- tint stays constant.
const BUILDING_TIER_TINT = {
  hale:      [0xffd700, 0xb38600, 0x7a5c00],
  loi:       [0x00ffcc, 0x00ffcc, 0x00ffcc],
  'loko-ia': [0x4488ff, 0x4488ff, 0x4488ff],
};
const SINGLE_TIER_TYPES = new Set(['loi', 'loko-ia']);
const SEASON_LABEL = { wet: 'Hoʻoilo', dry: 'Kauwela' };

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    // 1. Tilemap from the Tiled JSON loaded by PreloadScene.
    const map = this.make.tilemap({ key: 'ahupuaa-map' });

    // 2. Bind atlas texture to the tileset name declared in the JSON.
    const tileset = map.addTilesetImage('terrain', 'terrain');

    // 3. Create the terrain layer. Kept around for Sprint 2 input/camera work, but hidden:
    //    the Kenney atlas is a sprite sheet (tilecount: 1, frames are arbitrary-sized SubTextures),
    //    not a uniform tilegrid, so layer rendering produces noise. We stamp Images per-tile below.
    const layer = map.createLayer('terrain', tileset, 0, 0);
    layer.setVisible(false);

    // Kenney hexagonTerrain atlas frames are 120x140 px native. The Tiled JSON cell
    // footprint is 54x46. Scale by cell-width / frame-width so sprites fit the cell.
    // The isometric 3D style means tiles naturally overlap neighboring rows -- that is
    // the art style, not a bug. (Not in original Phaser 3 spec; logged as v2 delta.)
    const TILE_SCALE = 54 / 120;

    // 4. Build world state via the ported pipeline. tiles[col][row] is the canonical store.
    const grid = new HexGrid(COLS, ROWS);
    const { tiles, streamPath } = buildWorld(grid, {
      mtDepth: MT_DEPTH,
      shoreStart: SHORE_START,
      shoreEnd: SHORE_END,
    });

    // Expose tiles on state so the End Turn handler can pass them to processTick.
    state.tiles = tiles;
    this.map = map;
    this.tileImages = {};
    this.buildingLabels = {};

    // 5. Stamp each tile: position from map.tileToWorldXY, sprite from atlas, tint where applicable.
    let stamped = 0;
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const tile = tiles[col][row];
        const frame = TERRAIN_TO_FRAME[tile.terrainType] || 'grass_01.png';
        const { x, y } = map.tileToWorldXY(col, row);
        const img = this.add.image(x, y, 'terrain', frame);
        img.setScale(TILE_SCALE);

        const tint = TERRAIN_TO_TINT[tile.terrainType];
        if (tint !== undefined) img.setTint(tint);

        this.tileImages[`${col},${row}`] = img;
        stamped++;
      }
    }

    // 6. Verification console output (Sprint 1 exit criteria 5 + 6).
    console.log(
      'tileToWorldXY test:',
      map.tileToWorldXY(0, 0),
      map.tileToWorldXY(10, 28),
      map.tileToWorldXY(19, 55)
    );
    console.log(
      'tiles spot check:',
      tiles[0][0].terrainType,
      tiles[10][28].terrainType,
      tiles[19][55].terrainType
    );
    console.log(`[GameScene] stamped ${stamped} tiles; stream path length: ${streamPath.size}`);

    // Camera: constrain to map bounds, enable drag-pan and scroll zoom.
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.input.on('pointermove', (pointer) => {
      if (!pointer.isDown) return;
      this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
      this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
    });

    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      const zoom = Phaser.Math.Clamp(this.cameras.main.zoom - deltaY * 0.001, 0.5, 2.0);
      this.cameras.main.zoom = zoom;
    });

    // Building placement state -- wired to selector panel buttons below.
    this.selectedType = 'hale';
    this.selectedTier = 0;

    // Selector panel wiring.
    document.getElementById('btn-type-hale').addEventListener('click', () => {
      this.selectedType = 'hale';
      this.selectedTier = Math.min(this.selectedTier, 2);
      updateSelector(this);
    });
    document.getElementById('btn-type-loi').addEventListener('click', () => {
      this.selectedType = 'loi';
      this.selectedTier = 0;
      updateSelector(this);
    });
    document.getElementById('btn-type-loko-ia').addEventListener('click', () => {
      this.selectedType = 'loko-ia';
      this.selectedTier = 0;
      updateSelector(this);
    });
    document.getElementById('btn-tier-0').addEventListener('click', () => {
      this.selectedTier = 0;
      updateSelector(this);
    });
    document.getElementById('btn-tier-1').addEventListener('click', () => {
      this.selectedTier = 1;
      updateSelector(this);
    });
    document.getElementById('btn-tier-2').addEventListener('click', () => {
      this.selectedTier = 2;
      updateSelector(this);
    });
    updateSelector(this);
    this.showRejectionText = true;
    const tooltipEl = document.getElementById('tooltip');
    const canvasRect = this.sys.canvas.getBoundingClientRect();

    this.input.on('pointermove', (pointer) => {
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const tileXY = this.map.worldToTileXY(worldPoint.x, worldPoint.y);
      if (!tileXY) { tooltipEl.style.display = 'none'; return; }
      const col = tileXY.x, row = tileXY.y;
      if (col < 0 || col >= COLS || row < 0 || row >= ROWS) { tooltipEl.style.display = 'none'; return; }
      const tile = state.tiles[col][row];
      let html = cap(tile.terrainType) + '<br>' + (tile.isWet ? 'Wet' : 'Dry');
      if (tile.buildingId) {
        const building = state.buildings[tile.buildingId];
        if (building) html += '<br>' + cap(building.type) + ' T' + (building.tier + 1);
      }
      html += '<br><span style="opacity:0.5;font-size:11px;">(' + col + ',' + row + ')</span>';
      tooltipEl.innerHTML = html;
      tooltipEl.style.left = (canvasRect.left + pointer.x + 14) + 'px';
      tooltipEl.style.top  = (canvasRect.top + pointer.y + 14) + 'px';
      tooltipEl.style.display = 'block';
    });
    this.input.on('pointerout', () => { tooltipEl.style.display = 'none'; });

    this.input.keyboard.on('keydown-D', () => {
      this.showRejectionText = !this.showRejectionText;
      if (!this.showRejectionText) {
        document.getElementById('rejection-reason').style.opacity = '0';
      }
    });

    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) return;
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const tileXY = this.map.worldToTileXY(worldPoint.x, worldPoint.y);
      if (!tileXY) return;
      const col = tileXY.x, row = tileXY.y;
      if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;
      const tile = state.tiles[col][row];
      const placement = canPlace(tile, this.selectedType, this.selectedTier, state);
      if (placement.ok) {
        placeBuilding(tile, this.selectedType, this.selectedTier, state);
        const placed = state.buildings[tile.buildingId];
        if (placed) applyBuildingVisual(col, row, placed, this);
        updateHUD();
        const newTechs = checkTechUnlocks(state); // helpers defined below at module scope
        if (newTechs.length > 0) {
          if (this.cache.audio.exists('success')) this.sound.play('success');
          showUnlockMessage(newTechs[0]);
          refreshAllBuildingVisuals(this);
          updateSelector(this);
          flashNewTierButtons(newTechs);
        }
      } else {
        const img = this.tileImages[`${col},${row}`];
        if (img) {
          img.setTint(0xff0000);
          this.time.delayedCall(300, () => {
            const building = tile.buildingId ? state.buildings[tile.buildingId] : null;
            if (building) {
              applyBuildingVisual(col, row, building, this);
            } else {
              const origTint = TERRAIN_TO_TINT[tile.terrainType];
              if (origTint !== undefined) {
                img.setTint(origTint);
              } else {
                img.clearTint();
              }
            }
          });
        }
        if (this.showRejectionText) {
          const rrEl = document.getElementById('rejection-reason');
          rrEl.textContent = friendlyReason(placement.reason);
          rrEl.style.transition = 'none';
          rrEl.style.opacity = '1';
          requestAnimationFrame(() => {
            rrEl.style.transition = 'opacity 3s';
            rrEl.style.opacity = '0';
          });
        }
      }
    });

    // End Turn button.
    document.getElementById('end-turn').addEventListener('click', () => {
      state.turn++;
      processTick(state, state.tiles);
      updateHUD();
      const newTechs = checkTechUnlocks(state); // helpers defined below at module scope
      if (newTechs.length > 0) {
        if (this.cache.audio.exists('success')) this.sound.play('success');
        showUnlockMessage(newTechs[0]);
        refreshAllBuildingVisuals(this);
        flashNewTierButtons(newTechs);
      }
      updateSelector(this);
    });

    // Initial HUD render.
    updateHUD();
  }
}

function updateHUD() {
  document.getElementById('hud-turn').textContent   = state.turn;
  document.getElementById('hud-pop').textContent    = state.population;
  document.getElementById('hud-popcap').textContent = state.populationCap;
  document.getElementById('hud-taro').textContent   = state.resources.taro;
  document.getElementById('hud-fish').textContent   = state.resources.fish;
  document.getElementById('hud-wood').textContent   = state.resources.wood;
  document.getElementById('hud-stone').textContent  = state.resources.stone;
  const isWet = state.month >= 11 || state.month <= 4;
  document.getElementById('hud-year').textContent   = state.year;
  document.getElementById('hud-month').textContent  = state.month;
  document.getElementById('hud-season').textContent = isWet ? SEASON_LABEL.wet : SEASON_LABEL.dry;
  document.getElementById('hud-ike').textContent    = state.resources.ike;
}

function updateSelector(scene) {
  const typeIds = ['hale', 'loi', 'loko-ia'];
  for (const t of typeIds) {
    const btn = document.getElementById(`btn-type-${t}`);
    if (!btn) continue;
    if (t === scene.selectedType) {
      btn.style.borderColor = '#a07840';
      btn.style.background  = 'rgba(80,60,20,0.7)';
    } else {
      btn.style.borderColor = '#5a4a30';
      btn.style.background  = '#3a2a10';
    }
  }
  for (let i = 0; i < 3; i++) {
    const btn = document.getElementById(`btn-tier-${i}`);
    if (!btn) continue;
    if (i === scene.selectedTier) {
      btn.style.borderColor = '#a07840';
      btn.style.background  = 'rgba(80,60,20,0.7)';
    } else {
      btn.style.borderColor = '#5a4a30';
      btn.style.background  = '#3a2a10';
    }
    if (i > 0 && SINGLE_TIER_TYPES.has(scene.selectedType)) {
      // loi and loko-ia have only one tier -- disable T2 and T3 for these types
      btn.style.opacity       = '0.4';
      btn.style.pointerEvents = 'none';
    } else if (scene.selectedType === 'hale' && i === 1 && !state.techs.includes('carpentry')) {
      // hale T2 requires Carpentry tech
      btn.style.opacity       = '0.4';
      btn.style.pointerEvents = 'none';
    } else if (scene.selectedType === 'hale' && i === 2 && !state.techs.includes('masonry')) {
      // hale T3 requires Masonry tech
      btn.style.opacity       = '0.4';
      btn.style.pointerEvents = 'none';
    } else {
      btn.style.opacity       = '1';
      btn.style.pointerEvents = 'auto';
    }
  }
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function friendlyReason(reason) {
  if (reason === 'tile already occupied')           return 'Tile already occupied';
  if (reason === 'must harvest forest (forestLevel > 0) before building here') return 'Clear forest first';
  if (reason === 'mountain tiles are not buildable') return "Can't build on mountain";
  if (reason === 'loi requires wet tile')           return 'Loi needs a wet tile';
  if (reason === 'loko-ia requires wet tile')       return 'Loko-ia needs a wet tile';
  if (reason.startsWith('hale requires land tile'))               return 'Hale needs land';
  if (reason.startsWith('loi requires flat or stream tile'))      return 'Loi needs flat or stream';
  if (reason.startsWith('loko-ia requires shore or stream tile')) return 'Loko-ia needs shore or stream';
  if (reason.startsWith('tier 1 hale'))             return 'Requires Carpentry tech';
  if (reason.startsWith('tier 2 hale'))             return 'Requires Carpentry + Masonry';
  if (reason.startsWith('insufficient resources - need ')) {
    try {
      const costs = JSON.parse(reason.slice('insufficient resources - need '.length));
      return Object.entries(costs).map(([res, amt]) => `Not enough ${res} (need ${amt})`).join(' + ');
    } catch {
      return reason;
    }
  }
  return reason;
}

// Displays a tech unlock notification in the #rejection-reason element using the same
// 3s opacity fade-out pattern as placement rejection messages (D-10).
function showUnlockMessage(techName) {
  const messages = {
    carpentry: 'Carpentry unlocked!',
    masonry: 'Masonry unlocked!',
  };
  const msg = messages[techName] ?? `${techName} unlocked!`;
  const rrEl = document.getElementById('rejection-reason');
  rrEl.textContent = msg;
  rrEl.style.transition = 'none';
  rrEl.style.opacity = '1';
  requestAnimationFrame(() => {
    rrEl.style.transition = 'opacity 3s';
    rrEl.style.opacity = '0';
  });
}

// Briefly highlights the newly-enabled tier button(s) for ~500ms after an unlock (D-12).
// Runs AFTER updateSelector has re-rendered buttons so the button is already enabled.
// Tech-to-button mapping: carpentry -> btn-tier-1, masonry -> btn-tier-2.
function flashNewTierButtons(newTechs) {
  const techToTierIndex = { carpentry: 1, masonry: 2 };
  for (const tech of newTechs) {
    const tierIdx = techToTierIndex[tech];
    if (tierIdx === undefined) continue;
    const btn = document.getElementById(`btn-tier-${tierIdx}`);
    if (!btn) continue;
    const prevBg = btn.style.background;
    btn.style.background = 'rgba(160,120,50,0.9)';
    setTimeout(() => {
      btn.style.background = prevBg;
    }, 500);
  }
}

// Returns the visual tier for a building given current tech state.
// Hale upgrades 1 visual tier per hale-relevant tech unlocked (carpentry, masonry).
// loi/loko-ia are single-tier -- no visual upgrade.
function getVisualTier(building, techs) {
  if (building.type !== 'hale') return building.tier;
  const bonus = techs.filter(t => t === 'carpentry' || t === 'masonry').length;
  return Math.min(building.tier + bonus, 2);
}

// Applies tint and tier label for a placed building based on its current visual tier.
// Called on placement and after tech unlock to propagate visual upgrades.
function applyBuildingVisual(col, row, building, scene) {
  const img = scene.tileImages[`${col},${row}`];
  if (!img) return;
  const vTier = getVisualTier(building, state.techs);
  const tints = BUILDING_TIER_TINT[building.type] ?? [0xffd700, 0xb38600, 0x7a5c00];
  img.setTint(tints[vTier] ?? tints[0]);
  const key = `${col},${row}`;
  if (scene.buildingLabels[key]) {
    scene.buildingLabels[key].destroy();
    delete scene.buildingLabels[key];
  }
  if (vTier > 0) {
    const { x, y } = scene.map.tileToWorldXY(col, row);
    const label = scene.add.text(x, y, String(vTier + 1), {
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0.5).setDepth(10);
    scene.buildingLabels[key] = label;
  }
}

// Re-renders all placed buildings after a tech unlock so existing structures
// reflect the new visual tier (darker tint + tier number overlay).
function refreshAllBuildingVisuals(scene) {
  for (const building of Object.values(state.buildings)) {
    applyBuildingVisual(building.col, building.row, building, scene);
  }
}
