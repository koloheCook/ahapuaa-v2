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
        const img = this.tileImages[`${col},${row}`];
        if (img) img.setTint(BUILDING_TINT[this.selectedType] ?? 0xffd700);
        updateHUD();
        const newTechs = checkTechUnlocks(state); // helpers defined below at module scope
        if (newTechs.length > 0) {
          this.sound.play('success');
          showUnlockMessage(newTechs[0]);
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
              img.setTint(BUILDING_TINT[building.type] ?? 0xffd700);
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
        this.sound.play('success');
        showUnlockMessage(newTechs[0]);
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
      btn.style.opacity      = '0.4';
      btn.style.pointerEvents = 'none';
    } else {
      btn.style.opacity      = '1';
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
