# Calliope Pixos Plugin

This plugin is for [Calliope](https://calliope.site) and is designed to provide Pixospritz player functionality.

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

All paths are relative to the a core package folder (see /example/spritz) from the public directory when loading asssets. Place any of your assets used such as tilesets, sprites, and fonts and place them within the package folder directories for proper fetching. Please see example for how to load and extend assets.

### LICENSE

<a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/">Creative Commons Attribution-NonCommercial 4.0 International License</a>.

This plugin is free to use for non-commercial use only. If you are an individual, a hobbyist, or a tinkerer than this is free to use for your personal use excluding any commercial use. All modifications to the source code must be released back as open source to the community and preferably a pull request will be made with the available updates and improvements if applicable. There is commercial licensing available upon an individual request basis. The licensing will be based upon the scope and revenue expectations of the commercial use-case. For more information, please reach out via email to director@sovereign.enterprises for licensing details. For more information on the non-commerical license which is included by default - please see [LICENSE](LICENSE)
