class TileEditor {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.tileset = {};
        this.tiles = [];
        this.currentTile = null;
        this.editMode = false;

        this.bindEvents();
        this.loadTileset();

        this.drawCanvas();
    }

    loadTileset() {
        fetch('tileset.json')
            .then(response => response.json())
            .then(tilesetJson => {
                this.tileset = tilesetJson;
                this.renderTiles();
            });
    }

    drawTiles() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        for (const row of this.tiles) {
            for (const cell of row) {
                if (cell !== null && cell !== undefined) {
                    this.drawTile(width, height, cell);
                }
            }
        }
    }

    drawTile(x, y, tile) {
        const textureIndex = tile.texture;
        const vertices = tile.geometry.vertices;

        this.ctx.save();
        this.ctx.translate(x, y);

        if (this.editMode) {
            this.drawVertices(vertices);
            return;
        }

        // Texture rendering
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(this.tileset.src, 0, 0, tile.sizeX, tile.sizeY,
            -x * tile.sizeX / 16 + 8, -y * tile.sizeY / 16 + 8, tile.sizeX, tile.sizeY);

        // Fill background if tile is not walkable
        this.ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
        this.ctx.fillRect(-x * tile.sizeX / 16 + 8 - tile.sizeX,
            -y * tile.sizeY / 16 + 8 - tile.sizeY,
            tile.sizeX,
            tile.sizeY);

        this.ctx.restore();
    }

    drawVertices(vertices) {
        const width = this.canvas.width;
        const height = this.canvas.height;

        for (const vertex of vertices) {
            this.ctx.save();
            this.ctx.translate(vertex[0] * 2, vertex[1] * 2);
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            this.ctx.fillRect(-1, -1, 2, 2);

            this.ctx.restore();
        }
    }

    bindEvents() {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');

        canvas.addEventListener('mousedown', (e) => {
            const x = e.clientX;
            const y = e.clientY;

            for (const row of this.tiles) {
                for (const cell of row) {
                    if (cell !== null && cell !== undefined) {
                        if (
                            x >= cell.x &&
                            x < cell.x + cell.sizeX &&
                            y >= cell.y &&
                            y < cell.y + cell.sizeY
                        ) {
                            // Draw vertex overlay
                            ctx.save();
                            ctx.translate(cell.x, cell.y);
                            this.drawVertices(this.currentTile.geometry.vertices);

                            // Render tile vertices as points on canvas
                            for (const poly of this.currentTile.geometry.vertices) {
                                for (const vertex of poly) {
                                    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                                    ctx.fillRect(vertex[0], vertex[1], 2, 2);
                                }
                            }

                            ctx.restore();

                            // Edit mode
                            this.editMode = true;
                            this.currentTile = cell;

                            return;
                        }
                    }
                }
            }
        });
    }

    renderTiles() {
        fetch('geometry.json')
            .then(response => response.json())
            .then(geometryJson => {
                this.tiles = [];

                for (const id in geometryJson) {
                    if (Object.hasOwn(geometryJson, id)) {
                        const tile = {
                            x: Math.floor(Math.random() * 32),
                            y: Math.floor(Math.random() * 18),
                            sizeX: 16,
                            sizeY: 16,
                            texture: geometryJson[id].texture,
                            vertices: geometryJson[id].vertices,
                        };

                        this.tiles.push(tile);
                    }
                }

                this.drawTiles();
            });
    }
}

new TileEditor();

