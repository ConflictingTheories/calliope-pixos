# PixoSpritz Website - Quick Start Guide

## 🚀 Launch the Website

### Option 1: Direct File Opening
```bash
cd website
open index.html
```

### Option 2: Local Server (Recommended)
```bash
cd website

# Python 3
python3 -m http.server 8000

# Node.js
npx serve -p 8000

# PHP
php -S localhost:8000
```

Then visit: **http://localhost:8000**

## 📝 Quick Edits

### Add a New Game
1. Add screenshot: `assets/games/my-game.png` (640x360px)
2. Edit `data/games.json`:
```json
{
  "id": "my-game",
  "title": "My Awesome Game",
  "description": "Description here...",
  "image": "assets/games/my-game.png",
  "links": [
    {
      "label": "Play Now",
      "url": "path/to/game.html",
      "icon": "▶️",
      "external": false
    }
  ]
}
```
3. Refresh browser - done! ✨

### Update Colors
Edit `css/styles.css` (line 10-15):
```css
:root {
    --color-primary: #ff6b9d;    /* Main pink */
    --color-secondary: #4ecdc4;  /* Teal */
    --color-accent: #ffd93d;     /* Yellow */
}
```

### Update Text Content
All content is in `index.html` - just edit and save!

### Update Donation Links
Find the support section in `index.html` (around line 260) and update URLs:
```html
<a href="YOUR_GITHUB_SPONSORS_URL" ...>
<a href="YOUR_PATREON_URL" ...>
<a href="YOUR_KOFI_URL" ...>
<a href="YOUR_PAYPAL_URL" ...>
```

## 📁 File Structure
```
website/
├── index.html          ← Main page
├── css/styles.css      ← All styles
├── js/script.js        ← All JavaScript
├── data/games.json     ← Game catalog
└── assets/             ← Images & media
    ├── favicon.png
    ├── placeholder-game.png
    └── games/
        └── example-game.png
```

## 🎨 Features

✅ Fully responsive (mobile, tablet, desktop)  
✅ Dark theme with vibrant colors  
✅ Smooth animations & transitions  
✅ Dynamic game loading  
✅ No build process needed  
✅ Easy to customize  
✅ SEO friendly  
✅ Fast & performant  

## 🐛 Troubleshooting

**Images not loading?**
- Check file paths in `games.json`
- Make sure images exist in `assets/` folder
- Use relative paths: `assets/games/image.png`

**Styles not applying?**
- Clear browser cache
- Check browser console for errors
- Verify `css/styles.css` is linked in HTML

**Games not showing?**
- Open browser console (F12)
- Check for JavaScript errors
- Verify `games.json` has valid JSON syntax

## 🌐 Deploy

**GitHub Pages:**
1. Push to GitHub
2. Settings → Pages → Select branch
3. Done! Live at `username.github.io/repo`

**Netlify:**
1. Drag & drop `website` folder
2. Done!

**Any Web Host:**
1. Upload `website` folder
2. Point domain to folder
3. Done!

## 💡 Tips

- **Test responsively**: Use browser dev tools (F12) to test mobile views
- **Optimize images**: Use TinyPNG or Squoosh before adding images
- **Keep it fast**: Compress assets, minimize HTTP requests
- **Update regularly**: Add new games, update content, keep it fresh

## 🎮 Easter Egg

Try the Konami Code on the website:  
↑ ↑ ↓ ↓ ← → ← → B A

## 📖 Full Documentation

See `README.md` for complete documentation.

---

**Need Help?** Open an issue on GitHub!
