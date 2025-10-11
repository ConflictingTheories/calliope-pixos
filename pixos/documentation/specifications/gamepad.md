# Pixospritz - Gamepad Specification

## Introduction
Gamepad support enables players to control avatars, menus, and gameplay using standard game controllers. The engine supports multiple gamepad types, button mapping, analog sticks, and vibration feedback. Gamepad input can be used for movement, actions, menu navigation, and more.

## Format & Template
Gamepad configuration is defined as:

```json
{
  "id": "default",
  "buttons": {
    "A": "interact",
    "B": "cancel",
    "X": "menu",
    "Y": "chat"
  },
  "axes": {
    "left": "move",
    "right": "camera"
  },
  "vibration": true
}
```

- `id`: Unique identifier for the gamepad config.
- `buttons`: Mapping of buttons to actions.
- `axes`: Mapping of analog sticks to movement/camera.
- `vibration`: Whether vibration feedback is enabled.

## Engine Features
- Supports multiple gamepad types and configs.
- Button and axis mapping for custom controls.
- Vibration feedback for immersive gameplay.
- Gamepad input for movement, actions, and menus.
- Gamepad events can trigger actions, events, or scripts.

## Tips
- Customize button mapping for accessibility and player preference.
- Use vibration feedback for important events or actions.
- Support multiple gamepad types for broad compatibility.
- Use Lua or engine plugins to extend gamepad logic and events.