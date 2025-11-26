# PixoSpritz Website Assets

This directory contains assets for the PixoSpritz marketing website.

## Directory Structure

```
assets/
├── favicon.png          - Website favicon (32x32 or 64x64)
├── placeholder-game.png - Default game card image (640x360, 16:9 ratio)
├── games/              - Game screenshots and promotional images
│   └── example-game.png
└── screenshots/        - Additional website screenshots
```

## Image Specifications

### Favicon
- Format: PNG
- Size: 32x32 or 64x64 pixels
- Transparent background recommended

### Game Card Images
- Format: PNG or JPG
- Size: 640x360 pixels (16:9 aspect ratio)
- Optimized for web (< 200KB recommended)

### Screenshots
- Format: PNG or JPG
- Size: 1920x1080 or 1280x720 pixels
- Optimized for web

## Creating Placeholder Images

You can create simple placeholder images using any image editor or online tools:

1. **Favicon**: Create a 32x32 pixel image with the PixoSpritz logo or "PS" text
2. **Game Cards**: Create 640x360 images with game screenshots or promotional art
3. **Screenshots**: Capture screenshots from the editor or player

## Adding New Games

To add a new game to the catalog:

1. Add a game screenshot to `assets/games/your-game.png`
2. Update `data/games.json` with game details
3. The website will automatically display the new game card

Example:
```json
{
  "id": "your-game",
  "title": "Your Game Title",
  "description": "A brief description of your game...",
  "image": "assets/games/your-game.png",
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

## Optimization Tips

- Use WebP format for better compression (with PNG/JPG fallbacks)
- Compress images before uploading (TinyPNG, Squoosh, etc.)
- Use lazy loading for images below the fold
- Consider using a CDN for faster delivery
