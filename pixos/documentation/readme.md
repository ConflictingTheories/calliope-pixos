# Pixospritz - Specification alpha-v0.7.x

##  Getting Started With Pixospritz
**Pixospritz** is designed around declarative mini-game architecture that focuses on an open format and interoperability on the platform. Rather than locking down the format with a particular engine implementation, or focusing on using it solely for compiling games, it focuses on a generalized *Player* or *Reader* which can interpret the Pixospritz packages and render them. This idea is to promote a community around sharing pixospritz games and scenes that can be ported to different platforms through open-source support. 

Rather than having it tied to a particular engine, platform, or even hardware - the Pixospritz format will be open by design with the hopes it can be shared and experienced by as many people. Imagine playing a game in your browser, then saving it to a mmicroSD card, putting that in your raspberry pi or pi-clone and then playing it with a DIY controller that you put together running on a DIY game console and pickup exactly where you left-off in your web-browser, then save it via IPFS and share the experience, replay, or straight up your character. 

This is the aim of Pixospritz. Open-community gaming. Open Platforms, Open Worlds, Shared Assets, Shared Stories, and portable adventures with emergent experiences waiting to unfold.


# The Pixospritz Format
The format is currently simply a predetermine folder structure alongside a `manifest.json` which is all bundled up inside of the root folder of a Zip archive. This may change someway in the future, but for now this is most likely to remain. Any future DRM considerations will be done internally within the format to the underlying data, but the general system is unlikely to deviate.


## Pixospritz Package
As it is a zip archive, it should be readily accessible by most platforms, and will be using a built-in zip interpretter library for its own purposes.


## Key Folders
There are key folders in the main root directory of the package which provide the core specification structure. They are:
- `/audio`
- `/callbacks`
- `/maps`
- `/models`
- `/sprites`
- `/textures`
- `/tilesets`
- `/triggers`


## Data Types
For now not all data types and formats are accepted, and it will be up to the platform implementation to ensure compatability if there is a problem. Since this is primarily focused around web-supported formats, the majority will be those which the browser natively supports, and where applicable specific mention may be made. The actual specification when it is formalized will have listed formats which are accetable within each category - to ensure that maximum compability is provided between players and platforms.


### Maps
The `/maps` folder will hold the various definitions and declarations for the different maps, zones, and levels around the game. These have their own format which can be read in more detail.

Maps are comprised of 2 core components
- `cells.json` - Cells Config
- `map.json` - Map Config


### Tilesets
The tilesets form the basis of the geometry, the tiles, and the various associated texture maps which apply to the world itself. They are inside of the `/tilesets` folder. These tilesets can be all-encompassing, or split out into smaller more specific themes. This allows for creative flexibility and for the mixing of asset packs.

Tilesets are comprised of 3 core components:
- `geometry.json` - Geometry Config
- `tiles.json` - Tiles Config
- `tileset.json` - Tileset Config


### Sprites
The sprites represent all in-game objects which are represented by 2D sprite sheets or tiles. They are located within the `/sprites` These can be characters, objects, decorations, animations, and anything else which can be drawn to the world in 2D. They have a few core variations which are setup to provide simple templates.

The 4 main types of sprites are:
- `sprite` - Simple Sprite
- `animated-sprite` - Animated Sprite
- `animated-tile` - Animated Tile
- `avatar` - Avatar Sprite


### Triggers
In order to provide scripting and interaction with the player, the creators can craft a variety of trigger scripts which can be then assigned to different actions and events within the game. Found within the `/triggers` folder they can be re-used between sprites or copied and modified as desired. The triggers are typically activated within a scope of operation and it is up to the creator to ensure that the appropriate scopes are available when assigning a trigger in the games.

```js
(_this, scope) => { ... perform trigger actions }
```

### Callbacks
    Note that Callbacks are still a WIP, and kind of rough at this time. There is a good chance they will be cleaned up and possibly merged into triggers, or perhaps just improved.*

Similar to Triggers, Callbacks provide additional ways of scripting logic within the game. They are found inside of `/callbacks` folder. 

Unlike triggers which tend to be more involved and take on a particular scope of reference (sprite, zone, model) the callbacks are typically contextual pieces of logic which are sometimes desired or required for the game. These have an implied scope of interaction and are usually done to trigger another action, close something, or perform a cleanup operation or to provide contextual operations. Callbacks are usually applied to actions and events or state changes. 

ex) addInventory callback to add inventory from a container which could be assigned to chests, barrels except occasionally, you may wish to trigger a trap instead and have a triggerTrap callback.

### Scenes
*Scenes will be found in the `/scenes` folder - TBB*

Scenes are essentially prescripted collections of actions, events, and various game logic that are intended to play out. These may link between one another, or may be instead stand-alone.

    TBB.


### Menus
*Menus will be found in the `/menus` folder - TBB*

Menus provide a way of prompting the user both through traditional game menus, but also through other things such as prompts, questions, surveys, and more.

    TBB.

### Models
In addition to 2D sprites, the Pixospritz engine has some support for 3D models as well. These will be live in the `/models` folder and can be placed in the world much like sprites and can be assigned various interactions, triggers, etc.

There will be support for animated models in the future as well, but for the time being only static models are supported.


### Textures
Anytime an image asset is required whether that be for the sprites or models, it will be stored inside of the `/textures` folder. This will allow for a simple way of keeping all the image assets in one place. They can be organized by subfolders if needed, but just update the references accordingly.


### Audio
All audio will reside within the `/audio` folder within the package. This can be further seperated into subfolders, and then referenced accordingly. 

---

# Specifications v0.7.x

## Manifest Specification

## Map Specification

## Sprite Specification

## Menu Specification

## Scene Specification

## Trigger Specification

## Callback Specification

---

# The Pixospritz Editor - WIP
There are plans for an editor to help with the creation of the Pixospritz packages. This will aim to alleviate most of the tedium involved and will instead streamline the process to make it mostly about crafting the story or game.

    Coming soon...TBD.

