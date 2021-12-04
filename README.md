# Calliope Pixos Plugin

This plugin is for [Calliope](https://calliope.site) and is designed to provide functionality for mermaid diagrams inside of pages and posts.

### Installation

The plugin can be installed from NPM via:

        npm install calliope-pixos

### Usage

Inside of your `_calliope/app/config/plugins/index.jsx` file, add the following:

```javascript
    // Import the module at the top
    import Pixos from "calliope-pixos";
    // and then further down inside of the switch statement add the following
    // ...
    case "pixos":
      let Plugin = Pixos['calliope-pixos'].default;
      return <Plugin />;
    // ...
```

### Assets

All paths are relative to the a /pixos folder from the public directory when loading asssets. Place any of your assets used such as tilesets, sprites, and fonts and place them within the pixos directory for proper fetching.