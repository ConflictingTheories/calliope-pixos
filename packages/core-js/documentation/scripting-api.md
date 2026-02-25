# PixoSpritz Engine API for Scripts

**Version:** 1.0.0  
**Last Updated:** January 2, 2026

This document describes the engine API available to PixoScript scripts running in the PixoSpritz game engine.

---

## Table of Contents

1. [Game Object](#game-object)
2. [Entity API](#entity-api)
3. [Sprite API](#sprite-api)
4. [Input API](#input-api)
5. [Audio API](#audio-api)
6. [Camera API](#camera-api)
7. [World API](#world-api)
8. [Zone API](#zone-api)
9. [HUD API](#hud-api)
10. [Event System](#event-system)
11. [Action System](#action-system)
12. [Trigger System](#trigger-system)
13. [Cutscene API](#cutscene-api)
14. [Network API](#network-api)
15. [Callbacks](#callbacks)

---

## Game Object

The global `game` object provides access to core engine functionality.

### Properties

```lua
game.time       -- Total elapsed time (seconds)
game.deltaTime  -- Frame delta time (seconds)
game.fps        -- Current frames per second
game.paused     -- Is game paused?
game.debug      -- Is debug mode enabled?
```

### Methods

```lua
game.pause()            -- Pause the game
game.resume()           -- Resume the game
game.restart()          -- Restart current zone
game.quit()             -- Exit the game

game.save(slot)         -- Save game state
game.load(slot)         -- Load game state
game.hasSave(slot)      -- Check if save exists

game.setVariable(key, value)  -- Set persistent variable
game.getVariable(key)         -- Get persistent variable
game.hasVariable(key)         -- Check if variable exists

game.showMessage(text, duration)  -- Show message on screen
game.hideMessage()                -- Hide current message
```

---

## Entity API

The `entity` object is available to scripts attached to entities.

### Position and Movement

```lua
entity.getX()               -- Get X position
entity.getY()               -- Get Y position
entity.getZ()               -- Get Z position (3D)
entity.getPosition()        -- Returns x, y, z

entity.setX(x)              -- Set X position
entity.setY(y)              -- Set Y position
entity.setZ(z)              -- Set Z position
entity.setPosition(x, y, z) -- Set all coordinates

entity.move(dx, dy, dz)     -- Relative move
entity.moveTo(x, y, z, speed)    -- Move to position over time
entity.moveToward(target, speed) -- Move toward entity
```

### Properties

```lua
entity.id              -- Entity ID (string)
entity.name            -- Display name
entity.type            -- Entity type
entity.tag             -- Tag for grouping
entity.visible         -- Is visible?
entity.active          -- Is active/updating?
entity.solid           -- Has collision?

entity.width           -- Bounding box width
entity.height          -- Bounding box height
entity.depth           -- Bounding box depth (3D)
```

### Lifecycle

```lua
entity.destroy()       -- Remove from world
entity.spawn(type, x, y, z)  -- Create new entity
entity.clone()         -- Duplicate entity
```

### Relationships

```lua
entity.getParent()     -- Get parent entity
entity.getChildren()   -- Get child entities
entity.addChild(e)     -- Add child
entity.removeChild(e)  -- Remove child
```

### Custom Data

```lua
entity.setData(key, value)  -- Store custom data
entity.getData(key)         -- Retrieve custom data
entity.hasData(key)         -- Check for data
```

---

## Sprite API

For entities with sprites attached.

### Animation

```lua
sprite.play(name)           -- Play animation
sprite.stop()               -- Stop animation
sprite.pause()              -- Pause animation
sprite.resume()             -- Resume animation

sprite.getAnimation()       -- Current animation name
sprite.getFrame()           -- Current frame index
sprite.setFrame(index)      -- Jump to frame

sprite.isPlaying()          -- Is animating?
sprite.isFinished()         -- Animation complete?
```

### Appearance

```lua
sprite.setAlpha(alpha)      -- Set transparency (0-1)
sprite.getAlpha()           -- Get transparency
sprite.setColor(r, g, b)    -- Tint color
sprite.setScale(sx, sy)     -- Scale factor
sprite.setRotation(angle)   -- Rotation (radians)
sprite.setFlipX(flip)       -- Horizontal flip
sprite.setFlipY(flip)       -- Vertical flip
```

### Animation Events

```lua
sprite.onAnimationEnd(callback)  -- Called when animation ends
sprite.onFrameChange(callback)   -- Called on each frame
```

---

## Input API

The global `input` object handles player input.

### Keyboard/Gamepad

```lua
input.isDown(key)       -- Key is currently pressed
input.isPressed(key)    -- Key was just pressed this frame
input.isReleased(key)   -- Key was just released this frame

input.getAxis(name)     -- Get axis value (-1 to 1)
-- Axes: "horizontal", "vertical", "lookX", "lookY"
```

### Key Names

Standard keys: `"up"`, `"down"`, `"left"`, `"right"`, `"a"`, `"b"`, `"x"`, `"y"`, `"start"`, `"select"`, `"l1"`, `"r1"`, `"l2"`, `"r2"`, `"space"`, `"enter"`, `"escape"`, letters `"a"`-`"z"`, numbers `"0"`-`"9"`

### Mouse/Touch

```lua
input.getMouseX()       -- Mouse X position
input.getMouseY()       -- Mouse Y position
input.isMouseDown(button)  -- Mouse button state (0=left, 1=right, 2=middle)
input.isMousePressed(button)
input.isMouseReleased(button)

input.getTouchCount()   -- Number of active touches
input.getTouch(index)   -- Returns x, y, id
```

### Vibration

```lua
input.vibrate(intensity, duration)  -- Haptic feedback
```

---

## Audio API

The global `audio` object handles sound playback.

### Music

```lua
audio.playMusic(path, loop)     -- Play background music
audio.stopMusic()               -- Stop music
audio.pauseMusic()              -- Pause music
audio.resumeMusic()             -- Resume music
audio.setMusicVolume(vol)       -- Set volume (0-1)
audio.fadeMusic(vol, duration)  -- Fade to volume
audio.crossfadeMusic(path, duration)  -- Crossfade to new track
```

### Sound Effects

```lua
audio.playSfx(path)             -- Play sound effect
audio.playSfxAt(path, x, y, z)  -- Play at position (3D)
audio.stopSfx(id)               -- Stop specific sound
audio.setSfxVolume(vol)         -- Set SFX volume
```

### Spatial Audio

```lua
audio.setListener(x, y, z)      -- Set listener position
audio.setListenerOrientation(fx, fy, fz, ux, uy, uz)  -- Forward and up vectors
```

### Channels

```lua
audio.setMasterVolume(vol)      -- Master volume
audio.setChannelVolume(channel, vol)  -- Channel volume
-- Channels: "master", "music", "sfx", "dialogue", "ambient"
```

### BPM Analysis

```lua
audio.getBPM()                  -- Get detected BPM
audio.onBeat(callback)          -- Called on each beat
audio.syncToBeat(offset)        -- Sync timing to beat
```

---

## Camera API

The global `camera` object controls the view.

### Position

```lua
camera.getX()               -- Get X position
camera.getY()               -- Get Y position
camera.getZ()               -- Get Z position
camera.getPosition()        -- Returns x, y, z

camera.setPosition(x, y, z) -- Set position
camera.moveTo(x, y, z, duration, easing)  -- Animated move
```

### Following

```lua
camera.follow(entity)       -- Follow an entity
camera.stopFollowing()      -- Stop following
camera.setFollowOffset(x, y)     -- Offset from target
camera.setFollowSpeed(speed)     -- Lerp speed
camera.setDeadzone(w, h)         -- Deadzone size
camera.setBounds(x1, y1, x2, y2) -- Camera bounds
```

### Zoom

```lua
camera.getZoom()            -- Get zoom level
camera.setZoom(level)       -- Set zoom (1.0 = normal)
camera.zoomTo(level, duration, easing)  -- Animated zoom
```

### Effects

```lua
camera.shake(intensity, duration)  -- Screen shake
camera.flash(r, g, b, duration)    -- Screen flash
camera.fade(color, duration)       -- Fade to color
camera.punch(direction, intensity) -- Quick impact
```

---

## World API

The global `world` object manages the game world.

### Zone Management

```lua
world.loadZone(name)        -- Load a zone
world.getCurrentZone()      -- Get current zone object
world.getZoneName()         -- Get current zone name
```

### Entity Queries

```lua
world.getEntity(id)         -- Get entity by ID
world.getEntitiesByTag(tag) -- Get all with tag
world.getEntitiesByType(type)    -- Get all of type
world.getEntitiesInArea(x, y, w, h)  -- Area query
world.getEntitiesNear(x, y, radius)  -- Radius query
```

### Collision

```lua
world.raycast(x1, y1, x2, y2)    -- Line collision check
world.checkCollision(e1, e2)     -- Entity collision check
world.getColliders(x, y, w, h)   -- Get colliders in area
```

### Spawning

```lua
world.spawn(type, x, y, z, properties)  -- Create entity
world.spawnFromPrefab(prefab, x, y, z)  -- From prefab
```

---

## Zone API

Zone objects represent individual maps/levels.

### Properties

```lua
zone.name               -- Zone name
zone.width              -- Width in tiles
zone.height             -- Height in tiles
zone.tileSize           -- Tile size in pixels
```

### Tiles

```lua
zone.getTile(layer, x, y)       -- Get tile ID at position
zone.setTile(layer, x, y, id)   -- Set tile
zone.getTileProperty(x, y, prop) -- Get tile property
```

### Layers

```lua
zone.getLayers()                -- Get all layer names
zone.setLayerVisible(name, visible)  -- Toggle layer
zone.getLayerAlpha(name)        -- Get layer opacity
zone.setLayerAlpha(name, alpha) -- Set layer opacity
```

### Triggers

```lua
zone.getTriggers()              -- Get all triggers
zone.enableTrigger(id)          -- Enable trigger
zone.disableTrigger(id)         -- Disable trigger
```

---

## HUD API

The global `hud` object manages the user interface.

### Text Display

```lua
hud.showText(id, text, x, y, options)  -- Show text
hud.hideText(id)                -- Hide text
hud.updateText(id, text)        -- Update text content
```

Options: `{font, size, color, align, shadow}`

### Dialog Box

```lua
hud.showDialog(text, speaker, portrait)  -- Show dialog
hud.hideDialog()                         -- Hide dialog
hud.showChoice(options, callback)        -- Show choices
```

### Bars and Meters

```lua
hud.showBar(id, value, max, x, y, options)  -- Show progress bar
hud.updateBar(id, value, max)               -- Update bar
hud.hideBar(id)                             -- Hide bar
```

### Notifications

```lua
hud.notify(message, type, duration)  -- Show notification
-- Types: "info", "success", "warning", "error"
```

### Custom Elements

```lua
hud.createElement(id, type, properties)  -- Create element
hud.updateElement(id, properties)        -- Update element
hud.removeElement(id)                    -- Remove element
```

---

## Event System

Events allow communication between entities and systems.

### Sending Events

```lua
event.send(name, data)              -- Send to all listeners
event.sendTo(target, name, data)    -- Send to specific entity
event.broadcast(name, data)         -- Send globally
```

### Listening for Events

```lua
event.on(name, callback)            -- Listen for event
event.once(name, callback)          -- Listen once
event.off(name, callback)           -- Stop listening
event.off(name)                     -- Remove all listeners
```

### Example

```lua
-- Sender
event.send("damage", { amount = 10, source = entity.id })

-- Receiver
event.on("damage", function(data)
  health = health - data.amount
  if health <= 0 then
    entity.destroy()
  end
end)
```

---

## Action System

Actions are predefined behaviors for entities.

### Running Actions

```lua
action.run(name, params)            -- Run action on entity
action.runSequence(actions)         -- Run multiple actions
action.stop()                       -- Stop current action
action.stopAll()                    -- Stop all actions
```

### Built-in Actions

```lua
action.run("moveTo", { x = 100, y = 100, speed = 2 })
action.run("wait", { duration = 1000 })
action.run("animate", { name = "walk" })
action.run("speak", { text = "Hello!", portrait = "npc" })
action.run("fade", { alpha = 0, duration = 500 })
```

### Custom Actions

```lua
action.define("customAction", function(params, done)
  -- Do something
  done()  -- Call when complete
end)
```

---

## Trigger System

Triggers are zones that fire events when entities enter/exit.

### Creating Triggers

```lua
trigger.create(id, x, y, w, h, options)
trigger.destroy(id)
trigger.enable(id)
trigger.disable(id)
```

### Trigger Callbacks

```lua
function onTriggerEnter(triggerId, entity)
  -- Called when entity enters trigger
end

function onTriggerExit(triggerId, entity)
  -- Called when entity exits trigger
end

function onTriggerStay(triggerId, entity, dt)
  -- Called each frame entity is inside
end
```

---

## Cutscene API

The `cutscene` object controls cutscene playback.

### Playback

```lua
cutscene.play(path)             -- Play cutscene file
cutscene.stop()                 -- Stop cutscene
cutscene.pause()                -- Pause cutscene
cutscene.resume()               -- Resume cutscene
cutscene.skip()                 -- Skip to end
cutscene.isPlaying()            -- Is cutscene active?
```

### In-Script Cutscenes

```lua
cutscene.start()                -- Begin cutscene mode
cutscene.dialog(speaker, text)  -- Show dialog
cutscene.choice(options)        -- Show choices, returns index
cutscene.wait(duration)         -- Wait in milliseconds
cutscene.waitInput()            -- Wait for player input
cutscene.finish()               -- End cutscene mode
```

### Example

```lua
cutscene.start()
cutscene.dialog("Hero", "I must save the kingdom!")
cutscene.wait(1000)
camera.moveTo(100, 50, 2)
cutscene.dialog("Villain", "You will never succeed!")
local choice = cutscene.choice({"Fight!", "Run away"})
if choice == 1 then
  action.run("battle", { enemy = "villain" })
else
  world.loadZone("escape")
end
cutscene.finish()
```

---

## Network API

For multiplayer games (requires server).

### Connection

```lua
network.connect(host, port)     -- Connect to server
network.disconnect()            -- Disconnect
network.isConnected()           -- Connection status
```

### Messages

```lua
network.send(type, data)        -- Send to server
network.on(type, callback)      -- Receive from server
```

### Player Sync

```lua
network.getPlayers()            -- Get all connected players
network.getLocalPlayer()        -- Get local player ID
network.syncPosition()          -- Auto-sync position
network.syncVariable(key, value)     -- Sync custom data
```

---

## Callbacks

Script callbacks are automatically called by the engine.

### Lifecycle

```lua
function onLoad()
  -- Called when entity is created
end

function onUpdate(dt)
  -- Called every frame
  -- dt = delta time in seconds
end

function onDestroy()
  -- Called when entity is destroyed
end
```

### Interaction

```lua
function onInteract()
  -- Called when player interacts
end

function onClick()
  -- Called when clicked
end

function onHover()
  -- Called when mouse hovers
end
```

### Collision

```lua
function onCollide(other)
  -- Called on collision with other entity
end

function onCollisionEnter(other)
  -- Called when collision starts
end

function onCollisionExit(other)
  -- Called when collision ends
end
```

### Zone Events

```lua
function onZoneEnter(zone, player)
  -- Called when player enters zone
end

function onZoneExit(zone, player)
  -- Called when player exits zone
end
```

### Animation Events

```lua
function onAnimationEnd(name)
  -- Called when animation completes
end

function onAnimationLoop(name)
  -- Called when animation loops
end
```

---

## Best Practices

1. **Use callbacks efficiently** - Heavy work in onUpdate can slow games
2. **Cache references** - Store entity references in locals
3. **Check for nil** - Always verify entities exist before accessing
4. **Use events** - Decouple systems with the event system
5. **Batch operations** - Group similar operations together
6. **Clean up** - Remove listeners in onDestroy

---

_This API reference covers the core PixoSpritz engine functionality available to PixoScript._
