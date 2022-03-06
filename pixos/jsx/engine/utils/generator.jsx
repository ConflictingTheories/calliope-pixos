import { Vector } from "./math/vector.jsx";
import { Direction } from "./enums.jsx";
import { store } from "react-recollect";
export async function generateZone(self, storeName, cyoa) {
  // load current scene or play welcome
  let tome = self.engine.fetchStore(storeName);

  console.log("welcome -- loading - found the following: ", self, tome, cyoa);

  if (!tome) {
    // Initialize the garden
    tome = {
      position: new Vector(...[8, 3, 0]),
      selected: 0,
      rain: true,
      snow: false,
      scenes: [],
      sprites: [],
      objects: [],
    };

    // Load CYOA config
    Object.assign(tome, cyoa);

    self.engine.addStore(storeName, tome);

    // Generate a collection of scenes programmably
    // and append them to the scenes collection.

    // self.randomlyGenerateSprites();
    // self.randomlySprites();
    await self.playScene("welcome");
  } else {
    // load Sprites
    await Promise.all(
      tome.sprites
        .filter((x) => {
          // Determine whether to load sprite or not
          // base on the tome settings and cyoa

          return x.id == tome.selected;
        })
        .map(self.loadSprite.bind(self))
    );

    // Load Objects
    await Promise.all(
      tome.objects
        .filter((x) => {
          // Determine whether to load object or not
          // base on the tome settings and cyoa

          return x.id == tome.selected;
        })
        .map(self.loadObject.bind(self))
    );

    // Load NPCs for the zone
    await Promise.all(
      tome.npcs
        .filter((x) => {
          // Determine whether to load NPC and decide what
          // dialogue is base on the tome settings and cyoa

          return x.id == tome.selected;
        })
        .map(async (trigger) => {
          // run trigger
        })
    );

    // Apply any Triggers & Setup New Scenes if needed
    await Promise.all(
      tome.triggers
        .filter((x) => {
          // Determine whether to load trigger
          // base on the tome settings and cyoa

          return x.id == tome.selected;
        })
        .map(async (trigger) => {
          // run trigger
        })
    );

    // Finally - Play appropriate scenes
    await Promise.all(
      tome.scenes
        .filter((x) => {
          return x.id == tome.selected;
        })
        .map(async (scene) => {
          await self.playScene(scene.id, tome.scenes);
        })
    );

    // run custom scene
    let scene = [
      {
        id: "new-space" + Math.random(),
        actions: [
          // manual actions
          // Scripted Dialogue Action Controls directly on sprites
          {
            sprite: "avatar",
            action: "dialogue",
            args: [
              [
                "Welcome traveler... I see you are exploring. Good. Please continue to look",
                "You have travelled into the the number " +
                  (store.pixos && store.pixos[storeName] ? store.pixos[storeName].selected : 0) +
                  " room",
              ],
              false,
              { autoclose: true },
            ],
            scope: self, // scoped to the zone
          },
        ],
      },
    ];
    await self.playScene(scene[0].id, scene);
  }
}
