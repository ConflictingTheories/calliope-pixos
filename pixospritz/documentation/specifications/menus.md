# Pixospritz - Menus Specification

## Introduction
Menus are interactive UI elements for player input, navigation, and game control. Menus can be context-sensitive, modal, or persistent, and support custom layouts, actions, and styling. Menus are defined in zone, scene, or manifest data, and can be extended via Lua or engine plugins.

## Format & Template
A menu is defined as:

```json
{
  "id": "mainMenu",
  "title": "Main Menu",
  "items": [
    { "label": "Start Game", "action": "start" },
    { "label": "Options", "action": "options" },
    { "label": "Exit", "action": "exit" }
  ],
  "style": { "background": "#222", "color": "#fff" },
  "modal": true
}
```

- `id`: Unique identifier for the menu.
- `title`: Menu title or heading.
- `items`: Array of menu items (label, action).
- `style`: Optional CSS-like styling.
- `modal`: Whether the menu blocks gameplay until closed.

## Engine Features
- Menus can be opened, closed, and customized at runtime.
- Menus support custom actions, styling, and layouts.
- Menus can be triggered by events, actions, or Lua scripts.
- Menus can be modal or persistent.

## Tips
- Use modal menus for important choices or game flow control.
- Style menus for clarity and accessibility.
- Use Lua or engine plugins to extend menu logic and actions.
- Menus can be nested or chained for complex UI flows.