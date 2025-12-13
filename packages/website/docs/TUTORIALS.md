# PixoSpritz Tutorials

Welcome to the PixoSpritz tutorials hub! These guides are designed to take you from a complete beginner to a confident game developer.

---

## Tutorial 1: Your First Game

In this tutorial, you'll create a simple, playable game from scratch. You will learn how to:

1.  Create a new game package.
2.  Design a simple map using the Map Editor.
3.  Add a player character and an NPC.
4.  Write a simple script to make the NPC talk.
5.  Play your game in the PixoSpritz Console.

### Step 1: Create Your Project

First, we need a new game package. A package is a folder (or zip file) that holds all your game's assets, maps, and scripts.

1.  Open the **PixoSpritz Editor**.
2.  In the **Zip Manager** tab, click the **"New Package"** button.
3.  Name your package `MyFirstGame`.
4.  This creates a standard folder structure inside your package. You'll see folders like `maps`, `sprites`, and `scripts`.

### Step 2: Create a Tileset

A tileset is the palette of tiles you'll use to paint your map.

1.  Go to the **Tileset Editor**.
2.  Click **"New Tileset"**. Let's call it `basic_tiles`.
3.  For this tutorial, we'll use the default tiles. You'll see a grid of tiles like grass, dirt, and water.
4.  Click on a tile, and use the properties panel on the right to mark it as `walkable` or not. Ensure the grass tile is walkable.
5.  Click **"Save"** (Ctrl+S). It will be saved as `tilesets/basic_tiles.json`.

### Step 3: Design Your Map

Now let's create the world your player will explore.

1.  Navigate to the **Map Editor** tab.
2.  Click **"New Map"**. Name it `level_one`.
3.  In the map properties, select `basic_tiles` as the tileset.
4.  Your tileset will appear in the palette. Select the grass tile.
5.  Click and drag on the main grid to paint a grassy area for your player to walk on.
6.  Save the map. It will be saved as `maps/level_one.json`.

### Step 4: Add Sprites (Player and NPC)

A map isn't much fun without characters. Let's add a player and a friendly NPC.

1.  In the **Map Editor**, switch from the "Paint" tool to the **"Sprite"** tool in the toolbar.
2.  In the asset panel, find a suitable player sprite (e.g., `characters/male`).
3.  Click on the map where you want the player to start. A sprite instance will appear.
4.  Select the sprite. In the properties panel on the right, give it a unique ID: `player`.
5.  Now, let's add an NPC. Select another sprite (e.g., `npc/air-knight`) and place it on the map.
6.  Give this NPC sprite the ID `guard`.
7.  Save your map again.

### Step 5: Create an Interaction Script

Let's make the `guard` NPC say something when the player interacts with them. This requires a simple PixoScript file.

1.  Go to the **Script Editor** tab.
2.  Create a new file and save it as `scripts/guard_talk.pxs`.
3.  Write the following Lua code in the editor:

```lua
-- scripts/guard_talk.pxs

-- This function is called when the player interacts with the sprite this script is attached to.
function on_interact(self, interactor)
  -- 'self' is the guard sprite.
  -- 'interactor' is the player sprite.

  pixos.sprite_dialogue(self.id, "Greetings, traveler! The path ahead is dangerous.")
end
```

4.  Save the script.
5.  Go back to the **Map Editor**, select the `guard` sprite.
6.  In the properties panel, find the "On Interact" script property and set it to `scripts/guard_talk.pxs`.
7.  Save the map one last time.

### Step 6: Configure the Manifest

The `manifest.json` file is the entry point to your game. It tells the engine what to load first.

1.  In the **Zip Manager**, find and open `manifest.json`.
2.  Modify it to look like this:

```json
{
  "id": "my-first-game",
  "title": "My First Game",
  "startZone": "maps/level_one.json",
  "player": "player"
}
```

This tells the engine to load your `level_one` map and designate the sprite with the ID `player` as the controllable character.

### Step 7: Play Your Game!

You're all set! It's time to see your creation in action.

1.  In the **Zip Manager**, click the **"Export as Zip"** button. Save `MyFirstGame.zip`.
2.  Open the **PixoSpritz Console** (you can usually access this from the main website's "Launch Demo" area).
3.  Drag and drop your `MyFirstGame.zip` file onto the console window.

Your game will load, and you'll see your player character on the map. Walk over to the guard using the arrow keys and press the interact button (usually 'E' or 'Space'). The guard should display the dialogue you wrote!

**Congratulations, you've made your first PixoSpritz game!**