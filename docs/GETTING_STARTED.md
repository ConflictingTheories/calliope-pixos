# Getting Started with PixoSpritz

Build your first game in 10 minutes.

## 1. Create a Project

Open the PixoSpritz editor. You'll see the command palette (Ctrl+K).

Type "Project Settings" and hit Enter. Fill in:
- **Title:** My First Game
- **Version:** 1.0.0
- **Starting Maps:** village
- **Modes:** explore

Click Save.

## 2. Create a Map

In the command palette, type "New Map" (or use the Map Editor tool).

You'll see a grid. Click tiles to paint:
- **Brush (B):** Paint tiles
- **Eraser (E):** Remove tiles
- **Fill (F):** Fill an area

Paint a small village: grass around the edges, a path through the middle.

## 3. Add the Player

Maps need a spawn point. In the map JSON (toggle with Ctrl+J), add:

```json
{
  "defaultSpawn": { "x": 5, "y": 5, "facing": "Down" }
}
```

## 4. Add an NPC

Click "Add Sprite" in the map editor. Choose a character. Place them on the map.

Select the NPC, open the Behavior Editor (Ctrl+K → "Behavior Editor"). Add:
- **Dialog** behavior: Set greeting to "Hello, traveler!"
- **Wander** behavior: Set radius to 3

The NPC will now wander and talk when you press E near them.

## 5. Test Your Game

Press **Ctrl+T** (or Ctrl+K → "Test Scene"). Your map loads in a playable window.

- **WASD/Arrows:** Move
- **E/Space:** Interact
- **Esc:** Stop testing

## 6. Add a Second Map

Create another map called "dungeon". In the first map, open the Portal Editor (Ctrl+K → "Portal Editor").

Add a portal:
- **ID:** village-exit
- **Position:** Where the door is (e.g., X: 10, Y: 0)
- **Target Map:** dungeon
- **Target Portal:** dungeon-entrance (create this portal in the dungeon map first)

Now walking into the portal takes you to the dungeon, arriving at the linked portal.

## 7. Publish

When ready, use "Publish to SVRN" (Ctrl+K). Your game becomes a pixozine that others can play.

## Next Steps

- Read the [PixoScript Reference](PIXOSCRIPT_REFERENCE.md) to add custom logic
- See the [Behavior Catalog](BEHAVIOR_CATALOG.md) for all declarative behaviors
- Check the [Portal Guide](PORTAL_GUIDE.md) for advanced map linking
