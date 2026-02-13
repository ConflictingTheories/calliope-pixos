# PixoScript API Reference

PixoScript is the Lua-based scripting environment for the PixoSpritz engine. Better control your game logic, cutscenes, and triggers using the `pixos` global table.

## Core Functions

| Function              | Description                                                    |
| :-------------------- | :------------------------------------------------------------- |
| `pixos.get_world()`   | Returns the global World object.                               |
| `pixos.get_zone()`    | Returns the current Zone (map) object.                         |
| `pixos.get_map()`     | Alias for `get_zone()`.                                        |
| `pixos.get_caller()`  | Returns the object (e.g., Sprite) that triggered the script.   |
| `pixos.get_subject()` | Returns the subject of the trigger (e.g., the Sprite entered). |
| `pixos.log(msg)`      | Logs a message to the debug console.                           |
| `pixos.sync(actions)` | Executes a list of async actions sequentially.                 |

## Zone & World Management

| Function                           | Description                                          |
| :--------------------------------- | :--------------------------------------------------- |
| `pixos.load_zone_from_zip(zoneId)` | Loads a new zone by ID.                              |
| `pixos.remove_all_zones()`         | Clears all loaded zones.                             |
| `pixos.load_scripts(scripts)`      | Manually triggers `loadScripts` on the current zone. |
| `pixos.reload_scripts()`           | Hot-reloads all scripts for the current zone.        |

## Audio System

| Function                      | Description                                                         |
| :---------------------------- | :------------------------------------------------------------------ |
| `pixos.play_sound(src, loop)` | Plays a sound effect. `loop` defaults to false.                     |
| `pixos.play_music(src)`       | Plays a music track (loops by default). Stops other looping tracks. |
| `pixos.stop_music()`          | Stops all currently looping music tracks.                           |
| `pixos.stop_audio(src)`       | Stops a specific audio track by source path.                        |
| `pixos.set_volume(vol)`       | Sets global volume (0.0 to 1.0). (Partial Implementation)           |

## Camera Control

| Function                           | Description                                                                                                        |
| :--------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| `pixos.set_camera()`               | Resets camera to default.                                                                                          |
| `pixos.focus_camera(target, opts)` | Focuses on a target `{x,y,z}`. Options: `mode` ('orbital', 'top-down', 'isometric', 'fps'), `duration`, `instant`. |
| `pixos.zoom_camera(val, isDelta)`  | Zooms the camera. `isDelta`=true adds to current zoom.                                                             |
| `pixos.pan_camera(from, to, time)` | Pans camera between two vectors over `time` ms.                                                                    |
| `pixos.look_at(pos, target, up)`   | Manually sets camera view matrix.                                                                                  |
| `pixos._pan(dir, rads)`            | Orbit pan ('CW' or 'CCW').                                                                                         |
| `pixos.pitch(dir, rads)`           | Orbit pitch ('CW' or 'CCW').                                                                                       |
| `pixos.get_camera_state()`         | Returns table with `target`, `position`, `yaw`, `pitch`, `distance`.                                               |

## Cutscene System

| Function                               | Description                                                                 |
| :------------------------------------- | :-------------------------------------------------------------------------- |
| `pixos.play_cutscene(name_or_file)`    | Plays a registered cutscene or loads a `.pxc` file. Returns async function. |
| `pixos.register_cutscene(name, steps)` | Registers a cutscene (table of steps) with a name.                          |
| `pixos.start_cutscene(name)`           | Starts a previously registered cutscene immediately.                        |
| `pixos.skip_cutscene()`                | Skips the currently running cutscene.                                       |
| `pixos.run_cutscene(steps)`            | Runs an ad-hoc cutscene from a table of steps. Returns async function.      |
| `pixos.set_backdrop(path)`             | Sets the visual backdrop (for dialogue/cutscenes).                          |
| `pixos.show_cutout(sprite, cutout)`    | Shows a character cutout portrait.                                          |
| `pixos.play_pxc_script(script)`        | Plays an inline PXC script string.                                          |

## Effects & Particles

| Function                                 | Description                                                        |
| :--------------------------------------- | :----------------------------------------------------------------- |
| `pixos.set_effect(name, active, params)` | Enables/disables post-processing effects.                          |
| `pixos.emit_particles(pos, config)`      | Emits particles at `pos`. `config` can use `{ present = 'fire' }`. |
| `pixos.create_particles(pos, preset)`    | Helper to emit particles using a preset name.                      |
| `pixos.clear_particles()`                | Removes all active particles.                                      |
| `pixos.set_skybox_shader(name)`          | Changes the active skybox shader.                                  |

## Flags & State

| Function                               | Description                        |
| :------------------------------------- | :--------------------------------- |
| `pixos.set_flag(key, value)`           | Sets a game flag.                  |
| `pixos.get_flag(key)`                  | Gets a game flag value.            |
| `pixos.has_flag(key)`                  | Checks if a flag exists.           |
| `pixos.vector(table)`                  | Creates a Vector object `{x,y,z}`. |
| `pixos.bind_action(action, type, val)` | Binds an input to an action.       |

## Mode Management

| Function                              | Description                                                                   |
| :------------------------------------ | :---------------------------------------------------------------------------- |
| `pixos.set_mode(name, params)`        | Switches the current Game Mode.                                               |
| `pixos.get_mode()`                    | Returns current mode name.                                                    |
| `pixos.register_mode(name, handlers)` | Registers a new mode with `setup`, `update`, `teardown`, `check_input` hooks. |
