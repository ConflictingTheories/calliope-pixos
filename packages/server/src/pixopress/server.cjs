const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'void_press_secret_key_change_in_prod'; // Use env var in production

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Allow large payloads for images

// Database Setup
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_premium INTEGER DEFAULT 0
    )`);

    // Interactive novels Table
    db.run(`CREATE TABLE IF NOT EXISTS interactive novels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT,
        data TEXT, -- JSON string of pages/elements
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_published INTEGER DEFAULT 0,
        published_at DATETIME,
        author_name TEXT,
        genre TEXT,
        tags TEXT,
        read_count INTEGER DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// API Routes

// Register
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(`INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`,
        [username, email, hashedPassword],
        function (err) {
            if (err) return res.status(400).json({ error: 'User already exists' });
            const token = jwt.sign({ id: this.lastID, username }, SECRET_KEY);
            res.json({ token, user: { id: this.lastID, username, is_premium: 0 } });
        }
    );
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err || !user) return res.status(400).json({ error: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);
        res.json({ token, user: { id: user.id, username: user.username, is_premium: user.is_premium } });
    });
});

// Sync / Save Interactive novel
app.post('/api/interactive novels', authenticateToken, (req, res) => {
    const { id, title, data, theme } = req.body; // id is local ID, or maybe server ID?
    // Strategy: If ID exists and belongs to user, update. Else create.
    // However, offline syncing is complex. For now, we'll use a simple "Save" endpoint that returns a server ID.
    // Client should store server_id mapping.

    // Allow user to specify an ID if updating, otherwise create new.
    // But SQLite IDs are auto-increment.
    // Let's assume the client sends a `serverId` if it has one.

    const serverId = req.body.serverId;

    if (serverId) {
        db.run(`UPDATE interactive novels SET title = ?, data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
            [title, JSON.stringify(data), serverId, req.user.id],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: serverId, status: 'updated' });
            }
        );
    } else {
        db.run(`INSERT INTO interactive novels (user_id, title, data) VALUES (?, ?, ?)`,
            [req.user.id, title, JSON.stringify(data)],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: this.lastID, status: 'created' });
            }
        );
    }
});

// Get User Interactive novels
app.get('/api/interactive novels', authenticateToken, (req, res) => {
    db.all(`SELECT id, title, updated_at, is_published, read_count, genre, tags FROM interactive novels WHERE user_id = ? ORDER BY updated_at DESC`,
        [req.user.id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// List Published Interactive novels (Public)
app.get('/api/published', (req, res) => {
    const { q, genre } = req.query;
    let sql = `SELECT id, title, author_name, genre, tags, read_count, published_at FROM interactive novels WHERE is_published = 1`;
    const params = [];

    if (genre) {
        sql += ` AND genre = ?`;
        params.push(genre);
    }
    if (q) {
        sql += ` AND (title LIKE ? OR author_name LIKE ? OR tags LIKE ?)`;
        const wildcard = `%${q}%`;
        params.push(wildcard, wildcard, wildcard);
    }

    sql += ` ORDER BY published_at DESC LIMIT 50`;

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Publish Interactive novel
app.post('/api/publish/:id', authenticateToken, (req, res) => {
    const { author_name, genre, tags } = req.body;
    db.run(`UPDATE interactive novels SET is_published = 1, published_at = CURRENT_TIMESTAMP, author_name = ?, genre = ?, tags = ? WHERE id = ? AND user_id = ?`,
        [author_name, genre, tags, req.params.id, req.user.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Interactive novel not found or not owned' });
            res.json({ status: 'published' });
        }
    );
});

// Get Single Interactive novel (for Reader)
app.get('/api/interactive novels/:id', (req, res) => {
    // If published, anyone can read. If not, only owner.
    // Simplified: Check if published first.
    db.get(`SELECT * FROM interactive novels WHERE id = ?`, [req.params.id], (err, interactive novel) => {
        if (err || !interactive novel) return res.status(404).json({ error: 'Not found' });

    if (interactive novel.is_published) {
    // Increment read count async
    db.run(`UPDATE interactive novels SET read_count = read_count + 1 WHERE id = ?`, [req.params.id]);
    return res.json({ ...interactive novel, data: JSON.parse(interactive novel.data) });
}

// Check auth for private interactive novels
const token = req.headers['authorization']?.split(' ')[1];
if (!token) return res.status(403).json({ error: 'Private interactive novel' });

jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err || user.id !== interactive novel.user_id) return res.status(403).json({ error: 'Forbidden' });
res.json({ ...interactive novel, data: JSON.parse(interactive novel.data) });
        });
    });
});

// MCP Interface for programmatic interactive novel manipulation and automation
app.get('/mcp/interactive novels/:id', authenticateToken, (req, res) => {
    db.get(`SELECT * FROM interactive novels WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id], (err, interactive novel) => {
        if (err || !interactive novel) return res.status(404).json({ error: 'Interactive novel not found' });
    res.json({ ...interactive novel, data: JSON.parse(interactive novel.data) });
});
});

app.put('/mcp/interactive novels/:id', authenticateToken, (req, res) => {
    const { title, data } = req.body;
    db.run(`UPDATE interactive novels SET title = ?, data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
        [title, JSON.stringify(data), req.params.id, req.user.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Interactive novel not found' });
            res.json({ status: 'updated' });
        }
    );
});

app.post('/mcp/interactive novels/:id/pages', authenticateToken, (req, res) => {
    db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id], (err, interactive novel) => {
        if (err || !interactive novel) return res.status(404).json({ error: 'Interactive novel not found' });
    const data = JSON.parse(interactive novel.data);
    const newPage = { id: Date.now(), elements: [], background: '#ffffff', texture: null };
    data.pages.push(newPage);
    db.run(`UPDATE interactive novels SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [JSON.stringify(data), req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ pageId: newPage.id, pageIdx: data.pages.length - 1 });
        }
    );
});
});

app.put('/mcp/interactive novels/:id/pages/:pageIdx', authenticateToken, (req, res) => {
    const { background, texture } = req.body;
    db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id], (err, interactive novel) => {
        if (err || !interactive novel) return res.status(404).json({ error: 'Interactive novel not found' });
    const data = JSON.parse(interactive novel.data);
    const pageIdx = parseInt(req.params.pageIdx);
    if (!data.pages[pageIdx]) return res.status(404).json({ error: 'Page not found' });
    if (background !== undefined) data.pages[pageIdx].background = background;
    if (texture !== undefined) data.pages[pageIdx].texture = texture;
    db.run(`UPDATE interactive novels SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [JSON.stringify(data), req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: 'updated' });
        }
    );
});
});

app.delete('/mcp/interactive novels/:id/pages/:pageIdx', authenticateToken, (req, res) => {
    db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id], (err, interactive novel) => {
        if (err || !interactive novel) return res.status(404).json({ error: 'Interactive novel not found' });
    const data = JSON.parse(interactive novel.data);
    const pageIdx = parseInt(req.params.pageIdx);
    if (data.pages.length <= 1) return res.status(400).json({ error: 'Cannot delete last page' });
    if (!data.pages[pageIdx]) return res.status(404).json({ error: 'Page not found' });
    data.pages.splice(pageIdx, 1);
    db.run(`UPDATE interactive novels SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [JSON.stringify(data), req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: 'deleted' });
        }
    );
});
});

app.post('/mcp/interactive novels/:id/pages/:pageIdx/elements', authenticateToken, (req, res) => {
    const { element } = req.body;
    db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id], (err, interactive novel) => {
        if (err || !interactive novel) return res.status(404).json({ error: 'Interactive novel not found' });
    const data = JSON.parse(interactive novel.data);
    const pageIdx = parseInt(req.params.pageIdx);
    if (!data.pages[pageIdx]) return res.status(404).json({ error: 'Page not found' });
    const el = { ...element, id: 'el_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9), zIndex: data.pages[pageIdx].elements.length };
    data.pages[pageIdx].elements.push(el);
    db.run(`UPDATE interactive novels SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [JSON.stringify(data), req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ elementId: el.id });
        }
    );
});
});

app.put('/mcp/interactive novels/:id/pages/:pageIdx/elements/:elementId', authenticateToken, (req, res) => {
    const updates = req.body;
    db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id], (err, interactive novel) => {
        if (err || !interactive novel) return res.status(404).json({ error: 'Interactive novel not found' });
    const data = JSON.parse(interactive novel.data);
    const pageIdx = parseInt(req.params.pageIdx);
    const el = data.pages[pageIdx]?.elements.find(e => e.id === req.params.elementId);
    if (!el) return res.status(404).json({ error: 'Element not found' });
    Object.assign(el, updates);
    db.run(`UPDATE interactive novels SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [JSON.stringify(data), req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: 'updated' });
        }
    );
});
});

app.delete('/mcp/interactive novels/:id/pages/:pageIdx/elements/:elementId', authenticateToken, (req, res) => {
    db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id], (err, interactive novel) => {
        if (err || !interactive novel) return res.status(404).json({ error: 'Interactive novel not found' });
    const data = JSON.parse(interactive novel.data);
    const pageIdx = parseInt(req.params.pageIdx);
    const elements = data.pages[pageIdx]?.elements;
    if (!elements) return res.status(404).json({ error: 'Page not found' });
    const idx = elements.findIndex(e => e.id === req.params.elementId);
    if (idx === -1) return res.status(404).json({ error: 'Element not found' });
    elements.splice(idx, 1);
    db.run(`UPDATE interactive novels SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [JSON.stringify(data), req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: 'deleted' });
        }
    );
});
});

// Model Context Protocol (MCP) Server Implementation
// This allows AI assistants to programmatically interact with the interactive novel builder

// MCP Initialize
app.post('/mcp/initialize', (req, res) => {
    res.json({
        protocolVersion: '2024-11-05',
        capabilities: {
            tools: {},
            resources: {},
            prompts: {}
        },
        serverInfo: {
            name: 'interactive novel-builder-mcp',
            version: '1.0.0'
        }
    });
});

// MCP Resources List
app.post('/mcp/resources/list', (req, res) => {
    res.json({
        resources: [
            {
                uri: 'interactive novel://themes',
                name: 'Available Themes',
                description: 'List of available interactive novel themes with their properties',
                mimeType: 'application/json'
            },
            {
                uri: 'interactive novel://templates',
                name: 'Page Templates',
                description: 'Available page templates for different interactive novel layouts',
                mimeType: 'application/json'
            },
            {
                uri: 'interactive novel://assets',
                name: 'Asset Library',
                description: 'Available assets including shapes, symbols, SFX, and shaders',
                mimeType: 'application/json'
            }
        ]
    });
});

// MCP Resources Read
app.post('/mcp/resources/read', (req, res) => {
    const { uri } = req.body;
    let resourceData;

    switch (uri) {
        case 'interactive novel://themes':
            resourceData = {
                themes: {
                    classic: { name: 'Classic Literature', colors: { background: '#fdfaf1', text: '#1a1a1a', accent: '#d4af37' }, fonts: { display: 'Playfair Display', body: 'Crimson Text', accent: 'Crimson Text' }, status: 'STABLE' },
                    fantasy: { name: 'Medieval Fantasy', colors: { background: '#f5f5dc', text: '#0a0a0a', accent: '#ffd700' }, fonts: { display: 'Cinzel', body: 'Crimson Text', accent: 'MedievalSharp' }, status: 'LEGENDARY' },
                    cyberpunk: { name: 'Cyberpunk', colors: { background: '#f0f0f0', text: '#050505', accent: '#ff003c' }, fonts: { display: 'Orbitron', body: 'Roboto Mono', accent: 'Bebas Neue' }, status: 'CONNECTED' },
                    conspiracy: { name: 'Dark Conspiracies', colors: { background: '#e8e4d9', text: '#000000', accent: '#c5b358' }, fonts: { display: 'Special Elite', body: 'Courier Prime', accent: 'Roboto Mono' }, status: 'CLASSIFIED' },
                    worldbuilding: { name: 'World Building', colors: { background: '#ecf0f1', text: '#2c3e50', accent: '#f1c40f' }, fonts: { display: 'Montserrat', body: 'Assistant', accent: 'Crimson Text' }, status: 'CHARTED' },
                    comics: { name: 'Comics', colors: { background: '#ffffff', text: '#000000', accent: '#ffd700' }, fonts: { display: 'Bangers', body: 'Comic Neue', accent: 'Bebas Neue' }, status: 'DYNAMIC' },
                    arcane: { name: 'Arcane Lore', colors: { background: '#f8f1ff', text: '#0f041b', accent: '#ff9e00' }, fonts: { display: 'Cinzel Decorative', body: 'Crimson Text', accent: 'Cinzel' }, status: 'MANIFESTED' }
                }
            };
            break;
        case 'interactive novel://templates':
            resourceData = {
                templates: {
                    cover: { name: 'Cover Page', description: 'Title page with decorative elements', elements: ['title_text', 'subtitle_text', 'decorative_panel'] },
                    content: { name: 'Content Page', description: 'Standard content page layout', elements: ['chapter_title', 'body_text'] },
                    back: { name: 'Back Cover', description: 'Back cover with final elements', elements: ['end_text'] }
                }
            };
            break;
        case 'interactive novel://assets':
            resourceData = {
                assets: {
                    shapes: ['circle', 'square', 'triangle', 'diamond', 'line_h', 'arrow'],
                    balloons: ['dialog', 'thought', 'shout', 'caption', 'whisper', 'narration'],
                    sfx: ['crash', 'boom', 'zap', 'pow', 'whoosh', 'splat'],
                    symbols: ['pentagram', 'skull', 'star_symbol', 'eye', 'biohazard', 'radiation', 'compass', 'rune', 'ankh', 'omega', 'infinity', 'trident'],
                    shaders: ['plasma', 'fire', 'water', 'lightning', 'voidNoise', 'galaxy']
                }
            };
            break;
        default:
            return res.status(404).json({ error: 'Resource not found' });
    }

    res.json({
        contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(resourceData, null, 2)
        }]
    });
});

// MCP Prompts List
app.post('/mcp/prompts/list', (req, res) => {
    res.json({
        prompts: [
            {
                name: 'create_story_interactive novel',
                description: 'Generate a complete story interactive novel with multiple pages',
                arguments: [
                    {
                        name: 'theme',
                        description: 'Theme for the interactive novel',
                        required: true
                    },
                    {
                        name: 'genre',
                        description: 'Story genre',
                        required: true
                    },
                    {
                        name: 'title',
                        description: 'Interactive novel title',
                        required: true
                    }
                ]
            },
            {
                name: 'generate_comic_page',
                description: 'Create a comic-style page with panels and dialogue',
                arguments: [
                    {
                        name: 'interactive novelId',
                        description: 'Existing interactive novel ID to add page to',
                        required: true
                    },
                    {
                        name: 'pageDescription',
                        description: 'Description of the comic page content',
                        required: true
                    }
                ]
            },
            {
                name: 'apply_theme_consistently',
                description: 'Apply a theme to an entire interactive novel with consistent styling',
                arguments: [
                    {
                        name: 'interactive novelId',
                        description: 'Interactive novel ID to apply theme to',
                        required: true
                    },
                    {
                        name: 'theme',
                        description: 'Theme to apply',
                        required: true
                    }
                ]
            }
        ]
    });
});

// MCP Prompts Get
app.post('/mcp/prompts/get', (req, res) => {
    const { name, arguments: args } = req.body;
    let prompt;

    switch (name) {
        case 'create_story_interactive novel':
            prompt = {
                description: `Create a complete ${args.genre} story interactive novel titled "${args.title}" using the ${args.theme} theme. Include cover page, multiple content pages with story elements, and back cover.`,
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `Create a ${args.genre} story interactive novel with the title "${args.title}" using the ${args.theme} theme. Generate engaging content with appropriate visual elements for the theme.`
                        }
                    }
                ]
            };
            break;
        case 'generate_comic_page':
            prompt = {
                description: `Generate a comic page with panels and dialogue based on: ${args.pageDescription}`,
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `Create a comic page for interactive novel ${args.interactive novelId
                        } with the following description: ${ args.pageDescription }.Include appropriate panels, dialogue balloons, and visual elements.`
                        }
                    }
                ]
            };
            break;
        case 'apply_theme_consistently':
            prompt = {
                description: `Apply the ${ args.theme } theme consistently across all pages and elements in interactive novel ${ args.interactive novelId }`,
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `Apply the ${ args.theme } theme to interactive novel ${ args.interactive novelId }, ensuring all text colors, backgrounds, and visual elements match the theme consistently.`
                        }
                    }
                ]
            };
            break;
        default:
            return res.status(404).json({ error: 'Prompt not found' });
    }

    res.json(prompt);
});

// MCP Tools List
app.post('/mcp/tools/list', (req, res) => {
    res.json({
        tools: [
            {
                name: 'create_interactive novel',
                description: 'Create a new interactive novel project',
                inputSchema: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', description: 'Interactive novel title' },
                        theme: { type: 'string', description: 'Theme key (optional)', enum: ['classic', 'fantasy', 'cyberpunk', 'conspiracy', 'worldbuilding', 'comics', 'arcane'] }
                    },
                    required: ['title']
                }
            },
            {
                name: 'get_interactive novel',
                description: 'Get interactive novel data by ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        interactive novelId: { type: 'integer', description: 'Interactive novel ID' }
                    },
                    required: ['interactive novelId']
                }
            },
            {
                name: 'add_page',
                description: 'Add a new page to a interactive novel',
                inputSchema: {
                    type: 'object',
                    properties: {
                        interactive novelId: { type: 'integer', description: 'Interactive novel ID' },
                        background: { type: 'string', description: 'Page background color (optional)' },
                        texture: { type: 'string', description: 'Page texture URL (optional)' }
                    },
                    required: ['interactive novelId']
                }
            },
            {
                name: 'delete_page',
                description: 'Delete a page from a interactive novel',
                inputSchema: {
                    type: 'object',
                    properties: {
                        interactive novelId: { type: 'integer', description: 'Interactive novel ID' },
                        pageIdx: { type: 'integer', description: 'Page index to delete' }
                    },
                    required: ['interactive novelId', 'pageIdx']
                }
            },
            {
                name: 'duplicate_page',
                description: 'Duplicate a page in a interactive novel',
                inputSchema: {
                    type: 'object',
                    properties: {
                        interactive novelId: { type: 'integer', description: 'Interactive novel ID' },
                        pageIdx: { type: 'integer', description: 'Page index to duplicate' }
                    },
                    required: ['interactive novelId', 'pageIdx']
                }
            },
            {
                name: 'add_text_element',
                description: 'Add a text element to a page',
                inputSchema: {
                    type: 'object',
                    properties: {
                        interactive novelId: { type: 'integer', description: 'Interactive novel ID' },
                        pageIdx: { type: 'integer', description: 'Page index' },
                        content: { type: 'string', description: 'Text content' },
                        x: { type: 'number', description: 'X position', default: 80 },
                        y: { type: 'number', description: 'Y position', default: 80 },
                        fontSize: { type: 'number', description: 'Font size', default: 18 },
                        color: { type: 'string', description: 'Text color', default: '#0a0a0a' }
                    },
                    required: ['interactive novelId', 'pageIdx', 'content']
                }
            },
            {
                name: 'add_image_element',
                description: 'Add an image element to a page',
                inputSchema: {
                    type: 'object',
                    properties: {
                        interactive novelId: { type: 'integer', description: 'Interactive novel ID' },
                        pageIdx: { type: 'integer', description: 'Page index' },
                        src: { type: 'string', description: 'Image URL or data URL' },
                        x: { type: 'number', description: 'X position', default: 80 },
                        y: { type: 'number', description: 'Y position', default: 80 },
                        width: { type: 'number', description: 'Width', default: 200 },
                        height: { type: 'number', description: 'Height', default: 200 }
                    },
                    required: ['interactive novelId', 'pageIdx', 'src']
                }
            },
            {
                name: 'add_panel_element',
                description: 'Add a panel element to a page',
                inputSchema: {
                    type: 'object',
                    properties: {
                        interactive novelId: { type: 'integer', description: 'Interactive novel ID' },
                        pageIdx: { type: 'integer', description: 'Page index' },
                        x: { type: 'number', description: 'X position', default: 40 },
                        y: { type: 'number', description: 'Y position', default: 40 },
                        width: { type: 'number', description: 'Width', default: 220 },
                        height: { type: 'number', description: 'Height', default: 160 }
                    },
                    required: ['interactive novelId', 'pageIdx']
                }
            },
            {
                name: 'add_shape_element',
                description: 'Add a shape element to a page',
                inputSchema: {
                    type: 'object',
                    properties: {
                        interactive novelId: { type: 'integer', description: 'Interactive novel ID' },
                        pageIdx: { type: 'integer', description: 'Page index' },
                        shape: { type: 'string', description: 'Shape type', enum: ['circle', 'square', 'triangle', 'diamond', 'line_h', 'arrow'], default: 'circle' },
                        x: { type: 'number', description: 'X position', default: 80 },
                        y: { type: 'number', description: 'Y position', default: 80 },
                        width: { type: 'number', description: 'Width', default: 100 },
                        height: { type: 'number', description: 'Height', default: 100 },
                        fill: { type: 'string', description: 'Fill color', default: '#0a0a0a' }
                    },
                    required: ['interactive novelId', 'pageIdx']
                }
            },
            {
                name: 'add_balloon_element',
                description: 'Add a speech balloon to a page',
                inputSchema: {
                    type: 'object',
                    properties: {
                        interactive novelId: { type: 'integer', description: 'Interactive novel ID' },
                        pageIdx: { type: 'integer', description: 'Page index' },
                        content: { type: 'string', description: 'Balloon text' },
                        balloonType: { type: 'string', description: 'Balloon type', enum: ['dialog', 'thought', 'shout', 'caption', 'whisper', 'narration'], default: 'dialog' },
                        x: { type: 'number', description: 'X position', default: 80 },
                        y: { type: 'number', description: 'Y position', default: 80 }
                    },
                    required: ['interactive novelId', 'pageIdx', 'content']
                }
            },
            {
                name: 'add_sfx_element',
                description: 'Add an SFX element to a page',
                inputSchema: {
                    type: 'object',
                    properties: {
                        interactive novelId: { type: 'integer', description: 'Interactive novel ID' },
                        pageIdx: { type: 'integer', description: 'Page index' },
                        sfxType: { type: 'string', description: 'SFX type', enum: ['crash', 'boom', 'zap', 'pow', 'whoosh', 'splat'], default: 'boom' },
                        x: { type: 'number', description: 'X position', default: 80 },
                        y: { type: 'number', description: 'Y position', default: 80 }
                    },
                    required: ['interactive novelId', 'pageIdx']
                }
            },
            {
                name: 'add_symbol_element',
                description: 'Add a symbol element to a page',
                inputSchema: {
                    type: 'object',
                    properties: {
                        interactive novelId: { type: 'integer', description: 'Interactive novel ID' },
                        pageIdx: { type: 'integer', description: 'Page index' },
                        symbol: { type: 'string', description: 'Symbol type', enum: ['pentagram', 'skull', 'star_symbol', 'eye', 'biohazard', 'radiation', 'compass', 'rune', 'ankh', 'omega', 'infinity', 'trident'], default: 'star_symbol' },
                        x: { type: 'number', description: 'X position', default: 80 },
                        y: { type: 'number', description: 'Y position', default: 80 }
                    },
                    required: ['interactive novelId', 'pageIdx']
                }
            },
            {
                name: 'add_shader_element',
                description: 'Add a shader element to a page',
                inputSchema: {
                    type: 'object',
                    properties: {
                        interactive novelId: { type: 'integer', description: 'Interactive novel ID' },
                        pageIdx: { type: 'integer', description: 'Page index' },
                        shaderPreset: { type: 'string', description: 'Shader preset', enum: ['plasma', 'fire', 'water', 'lightning', 'voidNoise', 'galaxy'], default: 'plasma' },
                        x: { type: 'number', description: 'X position', default: 80 },
                        y: { type: 'number', description: 'Y position', default: 80 },
                        width: { type: 'number', description: 'Width', default: 220 },
                        height: { type: 'number', description: 'Height', default: 220 }
                    },
                    required: ['interactive novelId', 'pageIdx']
                }
            },
            {
                name: 'update_element',
                description: 'Update an element\'s properties',
                inputSchema: {
                    type: 'object',
                    properties: {
                        interactive novelId: { type: 'integer', description: 'Interactive novel ID' },
                        pageIdx: { type: 'integer', description: 'Page index' },
                        elementId: { type: 'string', description: 'Element ID' },
                        updates: { type: 'object', description: 'Properties to update' }
                    },
                    required: ['interactive novelId', 'pageIdx', 'elementId', 'updates']
                }
            },
            {
                name: 'delete_element',
                description: 'Delete an element from a page',
                inputSchema: {
                    type: 'object',
                    properties: {
                        interactive novelId: { type: 'integer', description: 'Interactive novel ID' },
                        pageIdx: { type: 'integer', description: 'Page index' },
                        elementId: { type: 'string', description: 'Element ID to delete' }
                    },
                    required: ['interactive novelId', 'pageIdx', 'elementId']
                }
            },
            {
                name: 'duplicate_element',
                description: 'Duplicate an element on a page',
                inputSchema: {
                    type: 'object',
                    properties: {
                        interactive novelId: { type: 'integer', description: 'Interactive novel ID' },
                        pageIdx: { type: 'integer', description: 'Page index' },
                        elementId: { type: 'string', description: 'Element ID to duplicate' }
                    },
                    required: ['interactive novelId', 'pageIdx', 'elementId']
                }
            },
            {
                name: 'move_layer',
                description: 'Move an element up or down in the layer stack',
                inputSchema: {
                    type: 'object',
                    properties: {
                        interactive novelId: { type: 'integer', description: 'Interactive novel ID' },
                        pageIdx: { type: 'integer', description: 'Page index' },
                        elementId: { type: 'string', description: 'Element ID' },
                        direction: { type: 'string', description: 'Move direction', enum: ['up', 'down', 'top', 'bottom'] }
                    },
                    required: ['interactive novelId', 'pageIdx', 'elementId', 'direction']
                }
            },
            {
                name: 'apply_theme',
                description: 'Apply a theme to a interactive novel',
                inputSchema: {
                    type: 'object',
                    properties: {
                        interactive novelId: { type: 'integer', description: 'Interactive novel ID' },
                        theme: { type: 'string', description: 'Theme key', enum: ['classic', 'fantasy', 'cyberpunk', 'conspiracy', 'worldbuilding', 'comics', 'arcane'] }
                    },
                    required: ['interactive novelId', 'theme']
                }
            },
            {
                name: 'apply_template',
                description: 'Apply a template to a page',
                inputSchema: {
                    type: 'object',
                    properties: {
                        interactive novelId: { type: 'integer', description: 'Interactive novel ID' },
                        pageIdx: { type: 'integer', description: 'Page index' },
                        template: { type: 'string', description: 'Template type', enum: ['cover', 'content', 'back'] }
                    },
                    required: ['interactive novelId', 'pageIdx', 'template']
                }
            },
            {
                name: 'export_html',
                description: 'Export interactive novel as HTML',
                inputSchema: {
                    type: 'object',
                    properties: {
                        interactive novelId: { type: 'integer', description: 'Interactive novel ID' }
                    },
                    required: ['interactive novelId']
                }
            },
            {
                name: 'publish_interactive novel',
                description: 'Publish interactive novel to make it publicly readable',
                inputSchema: {
                    type: 'object',
                    properties: {
                        interactive novelId: { type: 'integer', description: 'Interactive novel ID' },
                        author: { type: 'string', description: 'Author name' },
                        genre: { type: 'string', description: 'Genre' },
                        tags: { type: 'string', description: 'Comma-separated tags' }
                    },
                    required: ['interactive novelId']
                }
            }
        ]
    });
});

// MCP Tools Call
app.post('/mcp/tools/call', authenticateToken, async (req, res) => {
    const { name, arguments: args } = req.body;

    try {
        let result;

        switch (name) {
            case 'create_interactive novel':
                result = await handleCreateInteractive novel(req.user.id, args);
                break;
            case 'get_interactive novel':
                result = await handleGetInteractive novel(req.user.id, args.interactive novelId);
                break;
            case 'add_page':
                result = await handleAddPage(req.user.id, args);
                break;
            case 'delete_page':
                result = await handleDeletePage(req.user.id, args);
                break;
            case 'duplicate_page':
                result = await handleDuplicatePage(req.user.id, args);
                break;
            case 'add_text_element':
                result = await handleAddTextElement(req.user.id, args);
                break;
            case 'add_image_element':
                result = await handleAddImageElement(req.user.id, args);
                break;
            case 'add_panel_element':
                result = await handleAddPanelElement(req.user.id, args);
                break;
            case 'add_shape_element':
                result = await handleAddShapeElement(req.user.id, args);
                break;
            case 'add_balloon_element':
                result = await handleAddBalloonElement(req.user.id, args);
                break;
            case 'add_sfx_element':
                result = await handleAddSFXElement(req.user.id, args);
                break;
            case 'add_symbol_element':
                result = await handleAddSymbolElement(req.user.id, args);
                break;
            case 'add_shader_element':
                result = await handleAddShaderElement(req.user.id, args);
                break;
            case 'update_element':
                result = await handleUpdateElement(req.user.id, args);
                break;
            case 'delete_element':
                result = await handleDeleteElement(req.user.id, args);
                break;
            case 'duplicate_element':
                result = await handleDuplicateElement(req.user.id, args);
                break;
            case 'move_layer':
                result = await handleMoveLayer(req.user.id, args);
                break;
            case 'apply_theme':
                result = await handleApplyTheme(req.user.id, args);
                break;
            case 'apply_template':
                result = await handleApplyTemplate(req.user.id, args);
                break;
            case 'export_html':
                result = await handleExportHTML(req.user.id, args.interactive novelId);
                break;
            case 'publish_interactive novel':
                result = await handlePublishInteractive novel(req.user.id, args);
                break;
            default:
                throw new Error(`Unknown tool: ${ name }`);
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Tool handlers
async function handleCreateInteractive novel(userId, args) {
    return new Promise((resolve, reject) => {
        const pages = [{ id: Date.now(), elements: [], background: '#ffffff', texture: null }];

        db.run(`INSERT INTO interactive novels(user_id, title, data) VALUES(?, ?, ?)`,
            [userId, args.title, JSON.stringify(pages)],
            function (err) {
                if (err) return reject(err);
                resolve({ interactive novelId: this.lastID, message: 'Interactive novel created successfully' });
            }
        );
    });
}

async function handleGetInteractive novel(userId, interactive novelId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM interactive novels WHERE id = ? AND user_id = ? `, [interactive novelId, userId], (err, interactive novel) => {
            if (err || !interactive novel) return reject(new Error('Interactive novel not found'));
            resolve({ ...interactive novel, data: JSON.parse(interactive novel.data) });
        });
    });
}

async function handleAddPage(userId, args) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ? `, [args.interactive novelId, userId], (err, interactive novel) => {
            if (err || !interactive novel) return reject(new Error('Interactive novel not found'));
            const data = JSON.parse(interactive novel.data);
            const newPage = {
                id: Date.now(),
                elements: [],
                background: args.background || '#ffffff',
                texture: args.texture || null
            };
            data.pages.push(newPage);
            db.run(`UPDATE interactive novels SET data = ? WHERE id = ? `, [JSON.stringify(data), args.interactive novelId], function (err) {
                if (err) return reject(err);
                resolve({ pageId: newPage.id, pageIdx: data.pages.length - 1 });
            });
        });
    });
}

async function handleAddTextElement(userId, args) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ? `, [args.interactive novelId, userId], (err, interactive novel) => {
            if (err || !interactive novel) return reject(new Error('Interactive novel not found'));
            const data = JSON.parse(interactive novel.data);
            if (!data.pages[args.pageIdx]) return reject(new Error('Page not found'));
            const element = {
                id: 'el_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                type: 'text',
                content: args.content,
                x: args.x || 80,
                y: args.y || 80,
                width: 220,
                height: 50,
                fontSize: args.fontSize || 18,
                fontFamily: 'Crimson Text',
                color: args.color || '#0a0a0a',
                align: 'left',
                zIndex: data.pages[args.pageIdx].elements.length
            };
            data.pages[args.pageIdx].elements.push(element);
            db.run(`UPDATE interactive novels SET data = ? WHERE id = ? `, [JSON.stringify(data), args.interactive novelId], function (err) {
                if (err) return reject(err);
                resolve({ elementId: element.id });
            });
        });
    });
}

async function handleAddImageElement(userId, args) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ? `, [args.interactive novelId, userId], (err, interactive novel) => {
            if (err || !interactive novel) return reject(new Error('Interactive novel not found'));
            const data = JSON.parse(interactive novel.data);
            if (!data.pages[args.pageIdx]) return reject(new Error('Page not found'));
            const element = {
                id: 'el_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                type: 'image',
                src: args.src,
                x: args.x || 80,
                y: args.y || 80,
                width: args.width || 200,
                height: args.height || 200,
                zIndex: data.pages[args.pageIdx].elements.length
            };
            data.pages[args.pageIdx].elements.push(element);
            db.run(`UPDATE interactive novels SET data = ? WHERE id = ? `, [JSON.stringify(data), args.interactive novelId], function (err) {
                if (err) return reject(err);
                resolve({ elementId: element.id });
            });
        });
    });
}

async function handleAddPanelElement(userId, args) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ? `, [args.interactive novelId, userId], (err, interactive novel) => {
            if (err || !interactive novel) return reject(new Error('Interactive novel not found'));
            const data = JSON.parse(interactive novel.data);
            if (!data.pages[args.pageIdx]) return reject(new Error('Page not found'));
            const element = {
                id: 'el_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                type: 'panel',
                x: args.x || 40,
                y: args.y || 40,
                width: args.width || 220,
                height: args.height || 160,
                panelBorderWidth: 4,
                panelBorderColor: '#0a0a0a',
                panelBorderStyle: 'solid',
                fill: 'transparent',
                zIndex: data.pages[args.pageIdx].elements.length
            };
            data.pages[args.pageIdx].elements.push(element);
            db.run(`UPDATE interactive novels SET data = ? WHERE id = ? `, [JSON.stringify(data), args.interactive novelId], function (err) {
                if (err) return reject(err);
                resolve({ elementId: element.id });
            });
        });
    });
}

async function handleAddBalloonElement(userId, args) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ? `, [args.interactive novelId, userId], (err, interactive novel) => {
            if (err || !interactive novel) return reject(new Error('Interactive novel not found'));
            const data = JSON.parse(interactive novel.data);
            if (!data.pages[args.pageIdx]) return reject(new Error('Page not found'));
            const element = {
                id: 'el_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                type: 'balloon',
                content: args.content,
                balloonType: args.balloonType || 'dialog',
                x: args.x || 80,
                y: args.y || 80,
                width: 200,
                height: 80,
                fontSize: 14,
                zIndex: data.pages[args.pageIdx].elements.length
            };
            data.pages[args.pageIdx].elements.push(element);
            db.run(`UPDATE interactive novels SET data = ? WHERE id = ? `, [JSON.stringify(data), args.interactive novelId], function (err) {
                if (err) return reject(err);
                resolve({ elementId: element.id });
            });
        });
    });
}

async function handleUpdateElement(userId, args) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ? `, [args.interactive novelId, userId], (err, interactive novel) => {
            if (err || !interactive novel) return reject(new Error('Interactive novel not found'));
            const data = JSON.parse(interactive novel.data);
            const el = data.pages[args.pageIdx]?.elements.find(e => e.id === args.elementId);
            if (!el) return reject(new Error('Element not found'));
            Object.assign(el, args.updates);
            db.run(`UPDATE interactive novels SET data = ? WHERE id = ? `, [JSON.stringify(data), args.interactive novelId], function (err) {
                if (err) return reject(err);
                resolve({ status: 'updated' });
            });
        });
    });
}

async function handleApplyTheme(userId, args) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ? `, [args.interactive novelId, userId], (err, interactive novel) => {
            if (err || !interactive novel) return reject(new Error('Interactive novel not found'));
            const data = JSON.parse(interactive novel.data);
            // Apply theme colors - simplified version
            const themeColors = {
                classic: { background: '#fdfaf1', text: '#1a1a1a', accent: '#d4af37' },
                fantasy: { background: '#f5f5dc', text: '#0a0a0a', accent: '#ffd700' },
                cyberpunk: { background: '#f0f0f0', text: '#050505', accent: '#ff003c' },
                conspiracy: { background: '#e8e4d9', text: '#000000', accent: '#c5b358' },
                worldbuilding: { background: '#ecf0f1', text: '#2c3e50', accent: '#f1c40f' },
                comics: { background: '#ffffff', text: '#000000', accent: '#ffd700' },
                arcane: { background: '#f8f1ff', text: '#0f041b', accent: '#ff9e00' }
            };
            const colors = themeColors[args.theme] || themeColors.classic;

            data.pages.forEach(page => {
                if (page.background === '#ffffff') page.background = colors.background;
                page.elements.forEach(el => {
                    if (el.color && ['#000000', '#333333', '#666666'].includes(el.color)) el.color = colors.text;
                    if (el.fill && ['#000000', '#333333', '#666666'].includes(el.fill)) el.fill = colors.accent;
                });
            });

            db.run(`UPDATE interactive novels SET data = ? WHERE id = ? `, [JSON.stringify(data), args.interactive novelId], function (err) {
                if (err) return reject(err);
                resolve({ status: 'theme applied' });
            });
        });
    });
}

async function handleApplyTemplate(userId, args) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ? `, [args.interactive novelId, userId], (err, interactive novel) => {
            if (err || !interactive novel) return reject(new Error('Interactive novel not found'));
            const data = JSON.parse(interactive novel.data);
            if (!data.pages[args.pageIdx]) return reject(new Error('Page not found'));

            const templates = {
                cover: {
                    background: '#1a1a1a',
                    elements: [
                        { type: 'text', content: 'INTERACTIVE NOVEL TITLE', x: 50, y: 150, width: 428, height: 100, fontSize: 64, color: '#d4af37', align: 'center', bold: true },
                        { type: 'text', content: 'Issue No. 01', x: 50, y: 260, width: 428, height: 40, fontSize: 24, color: '#fdfaf1', align: 'center' },
                        { type: 'panel', x: 40, y: 40, width: 448, height: 736, panelBorderWidth: 8, panelBorderColor: '#d4af37' }
                    ]
                },
                content: {
                    background: '#fdfaf1',
                    elements: [
                        { type: 'text', content: 'CHAPTER NAME', x: 50, y: 50, width: 428, height: 60, fontSize: 32, color: '#1a1a1a', bold: true },
                        { type: 'text', content: 'Start your story here...', x: 50, y: 120, width: 428, height: 600, fontSize: 16, color: '#1a1a1a' }
                    ]
                },
                back: {
                    background: '#1a1a1a',
                    elements: [
                        { type: 'text', content: 'THE END', x: 50, y: 380, width: 428, height: 60, fontSize: 48, color: '#fdfaf1', align: 'center', bold: true }
                    ]
                }
            };

            const template = templates[args.template];
            if (!template) return reject(new Error('Template not found'));

            data.pages[args.pageIdx].background = template.background;
            data.pages[args.pageIdx].elements = template.elements.map(el => ({
                ...el,
                id: 'el_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                zIndex: 0
            }));

            db.run(`UPDATE interactive novels SET data = ? WHERE id = ? `, [JSON.stringify(data), args.interactive novelId], function (err) {
                if (err) return reject(err);
                resolve({ status: 'template applied' });
            });
        });
    });
}

async function handleExportHTML(userId, interactive novelId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM interactive novels WHERE id = ? AND user_id = ? `, [interactive novelId, userId], (err, interactive novel) => {
            if (err || !interactive novel) return reject(new Error('Interactive novel not found'));
            const project = { title: interactive novel.title, pages: JSON.parse(interactive novel.data) };

            // Basic HTML export - in full implementation, use the client-side exportToHTML logic
            let html = `< !DOCTYPE html > <html><head><title>${project.title}</title></head><body>`;
            project.pages.forEach((p, i) => {
        html += `<div>Page ${i + 1}</div>`;
            });
    html += `</body></html>`;

            resolve({ html });
        });
    });
}

async function handlePublishInteractive novel(userId, args) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE interactive novels SET is_published = 1, published_at = CURRENT_TIMESTAMP, author_name = ?, genre = ?, tags = ? WHERE id = ? AND user_id = ? `,
            [args.author || 'Anonymous', args.genre || 'classic', args.tags || '', args.interactive novelId, userId],
            function (err) {
                if (err) return reject(err);
                if (this.changes === 0) return reject(new Error('Interactive novel not found'));
                resolve({ status: 'published' });
            }
        );
    });
}

async function handleDeletePage(userId, args) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ? `, [args.interactive novelId, userId], (err, interactive novel) => {
            if (err || !interactive novel) return reject(new Error('Interactive novel not found'));
            const data = JSON.parse(interactive novel.data);
            const pageIdx = parseInt(args.pageIdx);
            if (data.pages.length <= 1) return reject(new Error('Cannot delete last page'));
            if (!data.pages[pageIdx]) return reject(new Error('Page not found'));
            data.pages.splice(pageIdx, 1);
            db.run(`UPDATE interactive novels SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? `,
                [JSON.stringify(data), args.interactive novelId],
                function (err) {
                    if (err) return reject(err);
                    resolve({ status: 'deleted' });
                }
            );
        });
    });
}

async function handleDuplicatePage(userId, args) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ? `, [args.interactive novelId, userId], (err, interactive novel) => {
            if (err || !interactive novel) return reject(new Error('Interactive novel not found'));
            const data = JSON.parse(interactive novel.data);
            const pageIdx = parseInt(args.pageIdx);
            if (!data.pages[pageIdx]) return reject(new Error('Page not found'));
            const newPage = JSON.parse(JSON.stringify(data.pages[pageIdx]));
            newPage.id = Date.now();
            if (newPage.elements) newPage.elements.forEach(e => { e.id = 'el_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9) });
            data.pages.splice(pageIdx + 1, 0, newPage);
            db.run(`UPDATE interactive novels SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? `,
                [JSON.stringify(data), args.interactive novelId],
                function (err) {
                    if (err) return reject(err);
                    resolve({ pageId: newPage.id, pageIdx: pageIdx + 1 });
                }
            );
        });
    });
}

async function handleAddShapeElement(userId, args) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ? `, [args.interactive novelId, userId], (err, interactive novel) => {
            if (err || !interactive novel) return reject(new Error('Interactive novel not found'));
            const data = JSON.parse(interactive novel.data);
            if (!data.pages[args.pageIdx]) return reject(new Error('Page not found'));
            const shapes = { circle: { shape: 'circle', width: 100, height: 100 }, square: { shape: 'rect', width: 100, height: 100 }, triangle: { shape: 'triangle', width: 100, height: 100 }, diamond: { shape: 'diamond', width: 80, height: 100 }, line_h: { shape: 'line_h', width: 200, height: 4 }, arrow: { type: 'text', content: '➤', fontSize: 48, color: '#0a0a0a', width: 60, height: 60, fontFamily: 'sans-serif' } };
            const shapeConfig = shapes[args.shape] || shapes.circle;
            const element = {
                id: 'el_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                type: shapeConfig.type || 'shape',
                shape: shapeConfig.shape,
                x: args.x || 80,
                y: args.y || 80,
                width: args.width || shapeConfig.width,
                height: args.height || shapeConfig.height,
                fill: args.fill || '#0a0a0a',
                zIndex: data.pages[args.pageIdx].elements.length
            };
            if (shapeConfig.content) element.content = shapeConfig.content;
            if (shapeConfig.fontSize) element.fontSize = shapeConfig.fontSize;
            if (shapeConfig.color) element.color = shapeConfig.color;
            if (shapeConfig.fontFamily) element.fontFamily = shapeConfig.fontFamily;
            data.pages[args.pageIdx].elements.push(element);
            db.run(`UPDATE interactive novels SET data = ? WHERE id = ? `, [JSON.stringify(data), args.interactive novelId], function (err) {
                if (err) return reject(err);
                resolve({ elementId: element.id });
            });
        });
    });
}

async function handleAddSFXElement(userId, args) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ? `, [args.interactive novelId, userId], (err, interactive novel) => {
            if (err || !interactive novel) return reject(new Error('Interactive novel not found'));
            const data = JSON.parse(interactive novel.data);
            if (!data.pages[args.pageIdx]) return reject(new Error('Page not found'));
            const sfx = { crash: 'CRASH!', boom: 'BOOM!', zap: 'ZAP!', pow: 'POW!', whoosh: 'WHOOSH!', splat: 'SPLAT!' };
            const element = {
                id: 'el_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                type: 'text',
                content: sfx[args.sfxType] || 'BAM!',
                x: args.x || 80,
                y: args.y || 80,
                fontSize: 52,
                fontFamily: 'Bangers',
                color: '#0a0a0a',
                width: 180,
                height: 70,
                strokeWidth: 2,
                strokeColor: '#ffffff',
                zIndex: data.pages[args.pageIdx].elements.length
            };
            data.pages[args.pageIdx].elements.push(element);
            db.run(`UPDATE interactive novels SET data = ? WHERE id = ? `, [JSON.stringify(data), args.interactive novelId], function (err) {
                if (err) return reject(err);
                resolve({ elementId: element.id });
            });
        });
    });
}

async function handleAddSymbolElement(userId, args) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ? `, [args.interactive novelId, userId], (err, interactive novel) => {
            if (err || !interactive novel) return reject(new Error('Interactive novel not found'));
            const data = JSON.parse(interactive novel.data);
            if (!data.pages[args.pageIdx]) return reject(new Error('Page not found'));
            const symbols = { pentagram: '⛤', skull: '☠', star_symbol: '✦', eye: '👁', biohazard: '☣', radiation: '☢', compass: '🧭', rune: 'ᚱ', ankh: '☥', omega: 'Ω', infinity: '∞', trident: '🔱' };
            const element = {
                id: 'el_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                type: 'text',
                content: symbols[args.symbol] || '✦',
                x: args.x || 80,
                y: args.y || 80,
                fontSize: 56,
                color: '#d4af37',
                width: 80,
                height: 80,
                fontFamily: 'sans-serif',
                zIndex: data.pages[args.pageIdx].elements.length
            };
            data.pages[args.pageIdx].elements.push(element);
            db.run(`UPDATE interactive novels SET data = ? WHERE id = ? `, [JSON.stringify(data), args.interactive novelId], function (err) {
                if (err) return reject(err);
                resolve({ elementId: element.id });
            });
        });
    });
}

async function handleAddShaderElement(userId, args) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ? `, [args.interactive novelId, userId], (err, interactive novel) => {
            if (err || !interactive novel) return reject(new Error('Interactive novel not found'));
            const data = JSON.parse(interactive novel.data);
            if (!data.pages[args.pageIdx]) return reject(new Error('Page not found'));
            const element = {
                id: 'el_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                type: 'shader',
                shaderPreset: args.shaderPreset || 'plasma',
                x: args.x || 80,
                y: args.y || 80,
                width: args.width || 220,
                height: args.height || 220,
                opacity: 1,
                zIndex: data.pages[args.pageIdx].elements.length
            };
            data.pages[args.pageIdx].elements.push(element);
            db.run(`UPDATE interactive novels SET data = ? WHERE id = ? `, [JSON.stringify(data), args.interactive novelId], function (err) {
                if (err) return reject(err);
                resolve({ elementId: element.id });
            });
        });
    });
}

async function handleDeleteElement(userId, args) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ? `, [args.interactive novelId, userId], (err, interactive novel) => {
            if (err || !interactive novel) return reject(new Error('Interactive novel not found'));
            const data = JSON.parse(interactive novel.data);
            const pageIdx = parseInt(args.pageIdx);
            const elements = data.pages[pageIdx]?.elements;
            if (!elements) return reject(new Error('Page not found'));
            const idx = elements.findIndex(e => e.id === args.elementId);
            if (idx === -1) return reject(new Error('Element not found'));
            elements.splice(idx, 1);
            db.run(`UPDATE interactive novels SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? `,
                [JSON.stringify(data), args.interactive novelId],
                function (err) {
                    if (err) return reject(err);
                    resolve({ status: 'deleted' });
                }
            );
        });
    });
}

async function handleDuplicateElement(userId, args) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ? `, [args.interactive novelId, userId], (err, interactive novel) => {
            if (err || !interactive novel) return reject(new Error('Interactive novel not found'));
            const data = JSON.parse(interactive novel.data);
            const pageIdx = parseInt(args.pageIdx);
            const el = data.pages[pageIdx]?.elements.find(e => e.id === args.elementId);
            if (!el) return reject(new Error('Element not found'));
            const newEl = JSON.parse(JSON.stringify(el));
            newEl.id = 'el_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            newEl.x += 20;
            newEl.y += 20;
            data.pages[pageIdx].elements.push(newEl);
            db.run(`UPDATE interactive novels SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? `,
                [JSON.stringify(data), args.interactive novelId],
                function (err) {
                    if (err) return reject(err);
                    resolve({ elementId: newEl.id });
                }
            );
        });
    });
}

async function handleMoveLayer(userId, args) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT data FROM interactive novels WHERE id = ? AND user_id = ? `, [args.interactive novelId, userId], (err, interactive novel) => {
            if (err || !interactive novel) return reject(new Error('Interactive novel not found'));
            const data = JSON.parse(interactive novel.data);
            const pageIdx = parseInt(args.pageIdx);
            const elements = data.pages[pageIdx]?.elements;
            if (!elements) return reject(new Error('Page not found'));
            const idx = elements.findIndex(e => e.id === args.elementId);
            if (idx === -1) return reject(new Error('Element not found'));

            if (args.direction === 'up' && idx < elements.length - 1) {
                [elements[idx], elements[idx + 1]] = [elements[idx + 1], elements[idx]];
            } else if (args.direction === 'down' && idx > 0) {
                [elements[idx], elements[idx - 1]] = [elements[idx - 1], elements[idx]];
            } else if (args.direction === 'top') {
                const el = elements.splice(idx, 1)[0];
                elements.push(el);
            } else if (args.direction === 'bottom') {
                const el = elements.splice(idx, 1)[0];
                elements.unshift(el);
            }

            // Update all zIndex
            elements.forEach((e, i) => e.zIndex = i);
            db.run(`UPDATE interactive novels SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? `,
                [JSON.stringify(data), args.interactive novelId],
                function (err) {
                    if (err) return reject(err);
                    resolve({ status: 'moved' });
                }
            );
        });
    });
}

// Additional MCP endpoints for export and other features
app.post('/mcp/export/html', authenticateToken, (req, res) => {
    const { project } = req.body;
    // Placeholder for HTML export - in full implementation, adapt client-side exportToHTML
    // For now, return basic HTML structure
    let html = `< !DOCTYPE html > <html><head><title>${project.title}</title></head><body>`;
    project.pages.forEach((p, i) => {
        html += `<div>Page ${i + 1}</div>`;
    });
    html += `</body></html>`;
    res.json({ html });
});

app.post('/mcp/export/pdf', authenticateToken, (req, res) => {
    // Placeholder for PDF export
    res.json({ message: 'PDF export not implemented server-side yet' });
});

// Static Files
// Serve root folder, but exclude backend files
app.use((req, res, next) => {
    if (req.path.endsWith('.sqlite') || req.path === '/server/' || req.path === '/server.js') {
        return res.status(403).send('Forbidden');
    }
    next();
});
app.use(express.static(__dirname));

// Serve index.html (interactive novel_builder.html) for unknown routes (SPA)
// Actually, let's keep it simple and just serve static.
// app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'interactive novel_builder.html')));

app.listen(PORT, () => {
    console.log(`Server running on port ${ PORT } `);
});
