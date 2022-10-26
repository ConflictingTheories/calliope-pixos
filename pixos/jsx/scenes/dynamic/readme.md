# Dynamically Loaded Games

The main idea is to move all the game assets and descriptive content into a package which can be loaded up by the player.

The player would be clearly seperate as a standalone package. This will be done for portability.

The game bundles will be based around a manifest which will be used to reference content and provide a central file for managing configurations.

There assets will be stored within their respective folders. Audio, Media will be stored typically in native formats.

The game logic will be mostly declarative in nature and will be defined through static json for the most part. This will determine the general deterministic components of the game, but where some additional complexity is called for, there will be a comprehensive trigger system. 

The trigger system will store javascript files inside the package that can be dynamically loaded and called within their respective scopes. This will allow for reuse and more complex scripting mechanics.

Triggers will be callable from their respective regions of the code where applicable as defined by the declarative JSON configs.

This will allow for designers and programmers to craft multi-zone games with various stateful logic and a continuity of memory.

