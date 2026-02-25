# PixoSpritz Website

A modern, performant static marketing website for the PixoSpritz game engine.

## Features

- ✨ Clean, modern design with retro/playful aesthetics
- 📱 Fully responsive (mobile, tablet, desktop)
- 🚀 Performant - optimized for fast loading
- 🎨 CSS Grid & Flexbox layouts
- 🎭 Smooth animations and transitions
- 🎮 Dynamic game catalog loading
- 📦 Modular and maintainable code
- ♿ Accessible navigation and semantic HTML
- 🌙 Dark theme with vibrant accent colors

## Structure

```
website/
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # All styles (CSS variables, components, responsive)
├── js/
│   └── script.js          # Navigation, smooth scrolling, game loading
├── data/
│   └── games.json         # Game catalog data (easy to update)
├── assets/
│   ├── favicon.png        # Site favicon
│   ├── placeholder-game.png
│   ├── games/            # Game screenshots
│   │   └── example-game.png
│   └── README.md         # Asset guidelines
├── TODO.md               # Original requirements
└── README.md            # This file
```

## Sections

### 1. Hero Section

- Eye-catching title with gradient effect and glow animation
- Call-to-action buttons (Try Demo, Get Started, GitHub)
- Animated pixel grid background

### 2. About Section

- Overview of PixoSpritz features
- 6 feature cards with icons
- Placeholder for demo video

### 3. Demo Section

- Links to online player
- Link to editor
- Download option for desktop version

### 4. Games Catalog

- Dynamic loading from `games.json`
- Card-based layout with screenshots
- Easy to add new games

### 5. Documentation Section

- Links to getting started guide
- API reference
- Tutorials
- FAQ with expandable details elements
- Community links

### 6. Support/Donation Section

- Information about the solo developer
- Multiple donation platform links (GitHub Sponsors, Patreon, Ko-fi, PayPal)
- Alternative ways to support (stars, contributions, sharing)

### 7. Footer

- Quick links to all sections
- Resources and documentation
- Community and developer links
- Copyright notice

## Getting Started

### View the Website

Simply open `index.html` in a web browser:

```bash
# From the website directory
open index.html

# Or use a local server (recommended)
python3 -m http.server 8000
# Then visit http://localhost:8000
```

### Using a Development Server

For better development experience with live reload:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js (with npx)
npx serve .

# Using PHP
php -S localhost:8000
```

Then open your browser to `http://localhost:8000`

## Customization

### Adding New Games

1. Add your game screenshot to `assets/games/your-game.png`
2. Edit `data/games.json` and add a new entry:

```json
{
  "id": "your-game-id",
  "title": "Your Game Title",
  "description": "A brief description of your game (2-3 sentences).",
  "image": "assets/games/your-game.png",
  "links": [
    {
      "label": "Play Now",
      "url": "../path/to/game.html",
      "icon": "▶️",
      "external": false
    },
    {
      "label": "Download",
      "url": "https://example.com/download",
      "icon": "⬇️",
      "external": true
    }
  ]
}
```

The website will automatically display the new game card!

### Updating Colors

Edit CSS variables in `css/styles.css`:

```css
:root {
  --color-primary: #ff6b9d; /* Main accent color */
  --color-secondary: #4ecdc4; /* Secondary accent */
  --color-accent: #ffd93d; /* Highlight color */
  --color-bg: #0f0f1e; /* Main background */
  /* ... more variables */
}
```

### Updating Content

All text content is in `index.html`. Simply find the section you want to update and edit the text.

### Updating Donation Links

Edit the support section in `index.html` and replace placeholder URLs with your actual donation links:

```html
<a href="https://github.com/sponsors/YOUR_USERNAME" target="_blank" class="support-link">
  <span class="support-icon">❤️</span>
  <span>GitHub Sponsors</span>
</a>
```

## Features Deep Dive

### Responsive Navigation

- Hamburger menu on mobile
- Smooth scroll to sections
- Active state based on scroll position
- Sticky navbar with blur effect

### Animations

- Fade-in on scroll for cards and sections
- Glitch effect on hero title (with hover interaction)
- Smooth transitions on all interactive elements
- Easter egg: Konami code activates rainbow effect!

### Performance Optimizations

- CSS variables for consistent theming
- Debounced scroll events
- Lazy loading for images (via onerror fallback)
- Minimal JavaScript dependencies (vanilla JS only)
- Optimized SVG placeholders

### Accessibility

- Semantic HTML5 elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus states for all interactive elements
- Details/summary for FAQ (native HTML)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

Tested on:

- Desktop: macOS, Windows, Linux
- Mobile: iOS Safari, Chrome Android

## Deployment

### GitHub Pages

1. Push the `website` folder to your repository
2. Go to Settings > Pages
3. Select branch and `/website` folder
4. Your site will be live at `https://username.github.io/repo-name/`

### Netlify

1. Drag and drop the `website` folder to Netlify
2. Or connect your Git repository
3. Set build directory to `website`
4. Deploy!

### Custom Server

Upload the entire `website` folder to your web server. No build process required!

## Development Workflow

1. Edit HTML/CSS/JS files
2. Refresh browser to see changes
3. Test on different screen sizes
4. Update `games.json` as needed
5. Optimize images before adding to `assets/`

## TODO / Future Enhancements

- [ ] Add more game examples to catalog
- [ ] Create actual demo video
- [ ] Add blog/news section
- [ ] Implement search functionality for games
- [ ] Add theme switcher (light/dark mode)
- [ ] Create tutorial videos
- [ ] Add code syntax highlighting for docs
- [ ] Implement newsletter signup
- [ ] Add language selector for i18n
- [ ] Create downloadable press kit

## Credits

- **Design & Development**: PixoSpritz Team
- **Icons**: Emoji (native)
- **Fonts**: System fonts for performance
- **Inspiration**: Retro gaming aesthetics meets modern web design

## License

Same as PixoSpritz main project - see LICENSE file in root directory.

## Contributing

Found a bug or want to improve the website?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

Need help with the website?

- 📖 [Read the documentation](../README.md)
- 💬 [Join discussions](https://github.com/ConflictingTheories/calliope-pixos/discussions)
- 🐛 [Report issues](https://github.com/ConflictingTheories/calliope-pixos/issues)

---

Built with ❤️ for the PixoSpritz community
