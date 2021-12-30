/*                                                 *\
** ----------------------------------------------- **
**             Calliope - Site Generator   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2021 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */
import { Direction } from "../utils/enums.jsx";
import Resources from "../utils/resources.jsx";
import ActionQueue from "./queue.jsx";
import { SpriteLoader, TilesetLoader, AudioLoader, ActionLoader, ObjectLoader } from "../utils/loaders.jsx";

export default class Zone {
  constructor(zoneId, world) {
    this.id = zoneId;
    this.world = world;
    this.data = {};
    this.spriteDict = {};
    this.spriteList = [];
    this.objectDict = {};
    this.objectList = [];
    this.lastKey = Date.now();
    this.engine = world.engine;
    this.onLoadActions = new ActionQueue();
    this.spriteLoader = new SpriteLoader(world.engine);
    this.objectLoader = new ObjectLoader(world.engine);
    this.tsLoader = new TilesetLoader(world.engine);
    // bind
    this.onTilesetDefinitionLoaded = this.onTilesetDefinitionLoaded.bind(this);
    this.onTilesetOrSpriteLoaded = this.onTilesetOrSpriteLoaded.bind(this);
    this.loadSprite = this.loadSprite.bind(this, this);
    this.loadObject = this.loadObject.bind(this, this);
    this.checkInput = this.checkInput.bind(this);
  }

  // Load Map Resource from URL
  async loadRemote() {
    const fileResponse = await fetch(Resources.zoneRequestUrl(this.id));
    if (fileResponse.ok) {
      try {
        // Extract and Read in Information
        let data = await fileResponse.json();
        this.bounds = data.bounds;
        this.size = [data.bounds[2] - data.bounds[0], data.bounds[3] - data.bounds[1]];
        this.cells = data.cells;
        // Load tileset and create level geometry & trigger updates
        this.tileset = await this.tsLoader.load(data.tileset);
        this.tileset.runWhenDefinitionLoaded(this.onTilesetDefinitionLoaded.bind(this));
        this.tileset.runWhenLoaded(this.onTilesetOrSpriteLoaded.bind(this));
        // Load sprites from tileset
        await Promise.all(data.sprites.map(this.loadSprite.bind(this)));
        await Promise.all(data.objects.map(this.loadObject.bind(this)));
        // Notify the zone sprites when the new sprite has loaded
        this.spriteList.forEach((sprite) => sprite.runWhenLoaded(this.onTilesetOrSpriteLoaded.bind(this)));
        this.objectList.forEach((object) => object.runWhenLoaded(this.onTilesetOrSpriteLoaded.bind(this)));
      } catch (e) {
        console.error("Error parsing zone " + this.id);
        console.error(e);
      }
    }
  }

  // Load Tileset Directly (precompiled)
  async load() {
    try {
      // Extract and Read in Information
      let data = require("../../scene/maps/" + this.id + "/map.jsx")["default"];
      Object.assign(this, data);
      if (this.audioSrc) {
        this.audio = new AudioLoader(this.audioSrc, true); // loop background music
      }
      // Load tileset and create level geometry & trigger updates
      this.size = [this.bounds[2] - this.bounds[0], this.bounds[3] - this.bounds[1]];
      this.tileset = await this.tsLoader.load(this.tileset);
      this.tileset.runWhenDefinitionLoaded(this.onTilesetDefinitionLoaded.bind(this));
      this.tileset.runWhenLoaded(this.onTilesetOrSpriteLoaded.bind(this));
      // Load Obj Files
      let obj = `
      mtllib apple.mtl

g apple

v -0.044744 0 -7.219114E-16
v -0.03163878 0 0.03163878
v -0.03163878 0 -0.03163878
v 3.609557E-16 0 -0.044744
v 3.609557E-16 0 0.044744
v 0.03163878 0 -0.03163878
v 0.03163878 0 0.03163878
v 0.044744 0 -7.219114E-16
v 3.609557E-16 0.03196 -0.07896
v 0.05583315 0.03196 -0.05583315
v -0.05583315 0.03196 -0.05583315
v -0.05583315 0.03196 0.05583315
v 3.609557E-16 0.03196 0.07896
v 0.05583315 0.03196 0.05583315
v 0.07896 0.03196 -3.609557E-16
v -0.07896 0.03196 -3.609557E-16
v -0.06162668 0.157016 -3.609557E-16
v -0.04357664 0.157016 -0.04357664
v -0.04357664 0.157016 0.04357664
v -0.0403565 0.157016 0
v -0.02853636 0.157016 0.02853636
v 0 0.157016 0.06162668
v -3.609557E-16 0.157016 0.0403565
v 0.02853636 0.157016 0.02853636
v 0.04357664 0.157016 0.04357664
v 0.0403565 0.157016 0
v -0.02853636 0.157016 -0.02853636
v 0 0.157016 -0.06162668
v -3.609557E-16 0.157016 -0.0403565
v 0.02853636 0.157016 -0.02853636
v 0.04357664 0.157016 -0.04357664
v 0.06162668 0.157016 -3.609557E-16
v 0.01854863 0.147016 -0.01854863
v 0.02623173 0.147016 -3.609557E-16
v -3.609557E-16 0.147016 0.02623173
v 0.01854863 0.147016 0.01854863
v 0.09814728 0.098664 0
v 0.08931402 0.134232 0
v 0.06940061 0.098664 -0.06940061
v 0.06315455 0.134232 -0.06315455
v 0.06940061 0.098664 0.06940061
v -0.06940061 0.098664 0.06940061
v -0.09814728 0.098664 0
v 3.609557E-16 0.098664 -0.09814728
v -0.06940061 0.098664 -0.06940061
v 3.609557E-16 0.134232 -0.08931402
v 3.609557E-16 0.098664 0.09814728
v 0.06315455 0.134232 0.06315455
v 3.609557E-16 0.134232 0.08931402
v -0.08931402 0.134232 0
v -0.06315455 0.134232 -0.06315455
v -0.06315455 0.134232 0.06315455
v -0.01854863 0.147016 -0.01854863
v -3.609557E-16 0.147016 -0.02623173
v -0.02623173 0.147016 -3.609557E-16
v -0.01854863 0.147016 0.01854863
v -0.005381376 0.147016 0.005381376
v 0.005381376 0.147016 0.005381376
v 0.005381376 0.147016 -0.005381376
v -0.005381376 0.147016 -0.005381376
v 0.0096096 0.1907534 0.0096096
v -0.0096096 0.1907534 0.0096096
v 0.0096096 0.1907534 -0.0096096
v -0.0096096 0.1907534 -0.0096096
v 0 0.1618498 0.03919644
v 0 0.1688847 0.007495488
v 0.02291026 0.1710679 0.01564339
v 0.0324 0.1763387 0.03531415
v -0.0324 0.1763387 0.03531415
v -0.02291026 0.1710679 0.01564339
v 0 0.1767578 0.09483376

vn 0 -1 0
vn 0.2720776 -0.7032194 -0.6568533
vn -0.2720776 -0.7032194 -0.6568533
vn -0.2720776 -0.7032194 0.6568533
vn 0.6568533 -0.7032194 0.2720776
vn -0.6568533 -0.7032194 0.2720776
vn 0.2720776 -0.7032194 0.6568533
vn 0.6568533 -0.7032194 -0.2720776
vn -0.6568533 -0.7032194 -0.2720776
vn 0 1 0
vn -0.5619516 0.793744 0.2327679
vn -0.2327679 0.793744 -0.5619516
vn -0.5619516 0.793744 -0.2327679
vn 0.9004808 0.223633 -0.3729914
vn 0.8928877 -0.2568375 0.3698462
vn -0.8928877 -0.2568375 0.3698462
vn 0.3698462 -0.2568375 -0.8928877
vn -0.8928877 -0.2568375 -0.3698462
vn 0.3729914 0.223633 -0.9004808
vn 0.3729914 0.223633 0.9004808
vn -0.9004808 0.223633 -0.3729914
vn 0.8928877 -0.2568375 -0.3698462
vn -0.9004808 0.223633 0.3729914
vn 0.3698462 -0.2568375 0.8928877
vn 0.9004808 0.223633 0.3729914
vn -0.3729914 0.223633 -0.9004808
vn -0.3698462 -0.2568375 0.8928877
vn -0.3698462 -0.2568375 -0.8928877
vn -0.3729914 0.223633 0.9004808
vn 0.2327679 0.793744 0.5619516
vn -0.2327679 0.793744 0.5619516
vn 0.5619516 0.793744 0.2327679
vn 0.5619516 0.793744 -0.2327679
vn 0.2327679 0.793744 -0.5619516
vn 0.2545306 0.746736 -0.6144913
vn -0.6144913 0.746736 -0.2545306
vn -0.2545306 0.746736 -0.6144913
vn 0.2545306 0.746736 0.6144913
vn 0.6144913 0.746736 0.2545306
vn -0.2545306 0.746736 0.6144913
vn 0.6144913 0.746736 -0.2545306
vn -0.6144913 0.746736 0.2545306
vn 0 -0.09622436 0.9953597
vn 0.9953597 -0.09622436 0
vn 0 -0.09622436 -0.9953597
vn -0.9953597 -0.09622436 0
vn 0 0.9951073 0.09880029
vn 0 0.9762506 0.2166441
vn -0.3037909 0.9496877 0.07618576
vn 0.3037909 -0.9496877 -0.07618576
vn 0 -0.9762506 -0.2166441
vn 0 -0.9951073 -0.09880029
vn -0.4122968 0.9099418 -0.04491442
vn 0.4122968 -0.9099418 0.04491442
vn 0.4122968 0.9099418 -0.04491442
vn 0.3037909 0.9496877 0.07618576
vn -0.3037909 -0.9496877 -0.07618576
vn -0.4122968 -0.9099418 0.04491442
vn -0.4201235 0.8765457 -0.2348697
vn 0.4201235 -0.8765457 0.2348697
vn 0.4201235 0.8765457 -0.2348697
vn -0.4201235 -0.8765457 0.2348697

vt 1.761575 2.842171E-14
vt 1.245621 -1.245621
vt 1.245621 1.245621
vt -1.421085E-14 1.761575
vt -1.421085E-14 -1.761575
vt -1.245621 1.245621
vt -1.245621 -1.245621
vt -1.761575 2.842171E-14
vt 1.189633 2.914261
vt 0.6741255 1.144478
vt -1.189633 2.914261
vt -0.6741255 1.144478
vt -2.426247 1.421085E-14
vt -1.715616 1.715616
vt -1.715616 -1.715616
vt -1.588839 0
vt -1.123479 -1.123479
vt 0 -2.426247
vt -1.421085E-14 -1.588839
vt 1.123479 -1.123479
vt 1.715616 -1.715616
vt 1.588839 0
vt -1.123479 1.123479
vt 0 2.426247
vt -1.421085E-14 1.588839
vt 1.123479 1.123479
vt 1.715616 1.715616
vt 2.426247 1.421085E-14
vt -0.3952144 4.277918
vt -0.6080222 4.925184
vt 0.3952144 4.277918
vt 0.6080222 4.925184
vt -1.478714 2.987676
vt -1.34563 4.424378
vt 1.478714 2.987676
vt 1.34563 4.424378
vt -1.478714 4.670998
vt 1.478714 4.670998
vt -1.189633 1.953703
vt 1.189633 1.953703
vt -1.032745 1.421085E-14
vt -0.730261 0.730261
vt -0.730261 -0.730261
vt -1.421085E-14 -1.032745
vt -0.2118652 -0.2118652
vt 0.2118652 -0.2118652
vt 0.730261 -0.730261
vt 0.2118652 0.2118652
vt -0.2118652 0.2118652
vt -1.421085E-14 1.032745
vt 0.730261 0.730261
vt 1.032745 1.421085E-14
vt 0.9284846 2.437743
vt 1.34563 1.089104
vt -0.9284846 2.437743
vt -1.34563 1.089104
vt 0.2118652 5.78156
vt -0.2118652 5.78156
vt 0.3783307 7.511533
vt -0.3783307 7.511533
vt -0.3783307 -0.3783307
vt -0.3783307 0.3783307
vt 0.3783307 -0.3783307
vt 0.3783307 0.3783307
vt 0.9529138 0.5620043
vt 0.1822246 1.582016
vt 1.089776 1.898568
vt 1.534091 2.794783
vt 0.514578 3.669841
vt 1.244002 4.170185
vt -1.244002 4.170185
vt -0.514578 3.669841
vt -1.534091 2.794783
vt 3.25892 4.946456
vt 1.346968 3.727039
vt 0.5911033 4.912176
vt -3.25892 4.946456
vt -0.5911033 4.912176
vt -1.346968 3.727039
vt -0.9529138 0.5620043
vt -1.089776 1.898568
vt -0.1822246 1.582016

usemtl red

f 3/3/1 2/2/1 1/1/1
f 2/2/1 3/3/1 4/4/1
f 2/2/1 4/4/1 5/5/1
f 5/5/1 4/4/1 6/6/1
f 5/5/1 6/6/1 7/7/1
f 7/7/1 6/6/1 8/8/1
f 10/11/2 4/10/2 9/9/2
f 4/10/2 10/11/2 6/12/2
f 9/11/3 3/10/3 11/9/3
f 3/10/3 9/11/3 4/12/3
f 2/12/4 13/9/4 12/11/4
f 13/9/4 2/12/4 5/10/4
f 8/10/5 14/11/5 7/12/5
f 14/11/5 8/10/5 15/9/5
f 1/12/6 12/9/6 16/11/6
f 12/9/6 1/12/6 2/10/6
f 7/10/7 13/11/7 5/12/7
f 13/11/7 7/10/7 14/9/7
f 10/9/8 8/12/8 6/10/8
f 8/12/8 10/9/8 15/11/8
f 11/11/9 1/10/9 16/9/9
f 1/10/9 11/11/9 3/12/9
f 19/15/10 18/14/10 17/13/10
f 18/14/10 19/15/10 20/16/10
f 20/16/10 19/15/10 21/17/10
f 21/17/10 19/15/10 22/18/10
f 21/17/10 22/18/10 23/19/10
f 23/19/10 22/18/10 24/20/10
f 24/20/10 22/18/10 25/21/10
f 24/20/10 25/21/10 26/22/10
f 27/23/10 18/14/10 20/16/10
f 18/14/10 27/23/10 28/24/10
f 28/24/10 27/23/10 29/25/10
f 28/24/10 29/25/10 30/26/10
f 28/24/10 30/26/10 31/27/10
f 31/27/10 30/26/10 26/22/10
f 31/27/10 26/22/10 25/21/10
f 31/27/10 25/21/10 32/28/10
f 34/31/11 30/30/11 33/29/11
f 30/30/11 34/31/11 26/32/11
f 24/30/12 35/31/12 23/32/12
f 35/31/12 24/30/12 36/29/12
f 24/32/13 34/29/13 36/31/13
f 34/29/13 24/32/13 26/30/13
f 39/35/14 38/34/14 37/33/14
f 38/34/14 39/35/14 40/36/14
f 14/39/15 37/38/15 41/37/15
f 37/38/15 14/39/15 15/40/15
f 43/37/16 12/40/16 42/38/16
f 12/40/16 43/37/16 16/39/16
f 44/38/17 10/39/17 9/40/17
f 10/39/17 44/38/17 39/37/17
f 45/37/18 16/40/18 43/38/18
f 16/40/18 45/37/18 11/39/18
f 46/36/19 39/33/19 44/35/19
f 39/33/19 46/36/19 40/34/19
f 48/36/20 47/33/20 41/35/20
f 47/33/20 48/36/20 49/34/20
f 51/34/21 43/35/21 50/36/21
f 43/35/21 51/34/21 45/33/21
f 15/39/22 39/38/22 37/37/22
f 39/38/22 15/39/22 10/40/22
f 52/36/23 43/33/23 42/35/23
f 43/33/23 52/36/23 50/34/23
f 41/38/24 13/39/24 14/40/24
f 13/39/24 41/38/24 47/37/24
f 37/35/25 48/34/25 41/33/25
f 48/34/25 37/35/25 38/36/25
f 51/36/26 44/33/26 45/35/26
f 44/33/26 51/36/26 46/34/26
f 47/38/27 12/39/27 13/40/27
f 12/39/27 47/38/27 42/37/27
f 45/38/28 9/39/28 11/40/28
f 9/39/28 45/38/28 44/37/28
f 49/36/29 42/33/29 47/35/29
f 42/33/29 49/36/29 52/34/29
f 53/29/30 29/32/30 27/30/30
f 29/32/30 53/29/30 54/31/30
f 33/31/31 29/30/31 54/29/31
f 29/30/31 33/31/31 30/32/31
f 55/29/32 27/32/32 20/30/32
f 27/32/32 55/29/32 53/31/32
f 21/30/33 55/31/33 20/32/33
f 55/31/33 21/30/33 56/29/33
f 23/30/34 56/31/34 21/32/34
f 56/31/34 23/30/34 35/29/34
f 56/43/10 53/42/10 55/41/10
f 53/42/10 56/43/10 35/44/10
f 53/42/10 35/44/10 57/45/10
f 57/45/10 35/44/10 58/46/10
f 58/46/10 35/44/10 36/47/10
f 58/46/10 36/47/10 59/48/10
f 60/49/10 53/42/10 57/45/10
f 53/42/10 60/49/10 54/50/10
f 54/50/10 60/49/10 59/48/10
f 54/50/10 59/48/10 33/51/10
f 33/51/10 59/48/10 36/47/10
f 33/51/10 36/47/10 34/52/10
f 31/55/35 46/54/35 28/53/35
f 46/54/35 31/55/35 40/56/35
f 17/53/36 51/56/36 50/54/36
f 51/56/36 17/53/36 18/55/36
f 18/53/37 46/56/37 51/54/37
f 46/56/37 18/53/37 28/55/37
f 49/56/38 25/53/38 22/55/38
f 25/53/38 49/56/38 48/54/38
f 48/56/39 32/53/39 25/55/39
f 32/53/39 48/56/39 38/54/39
f 49/54/40 19/55/40 52/56/40
f 19/55/40 49/54/40 22/53/40
f 32/55/41 40/54/41 31/53/41
f 40/54/41 32/55/41 38/56/41
f 52/54/42 17/55/42 50/56/42
f 17/55/42 52/54/42 19/53/42

usemtl brown

f 61/59/43 57/58/43 58/57/43
f 57/58/43 61/59/43 62/60/43
f 58/58/44 63/59/44 61/60/44
f 63/59/44 58/58/44 59/57/44
f 61/63/10 64/62/10 62/61/10
f 64/62/10 61/63/10 63/64/10
f 64/59/45 59/58/45 60/57/45
f 59/58/45 64/59/45 63/60/45
f 64/60/46 57/57/46 62/59/46
f 57/57/46 64/60/46 60/58/46

usemtl green

f 67/67/49 66/66/48 65/65/47
f 65/65/52 66/66/51 67/67/50
f 68/70/53 67/69/49 65/68/47
f 65/68/52 67/69/50 68/70/54
f 65/73/47 70/72/56 69/71/55
f 69/71/58 70/72/57 65/73/52
f 68/76/59 65/75/59 71/74/59
f 71/74/60 65/75/60 68/76/60
f 65/79/61 69/78/61 71/77/61
f 71/77/62 69/78/62 65/79/62
f 66/82/48 70/81/56 65/80/47
f 65/80/52 70/81/57 66/82/51
      `;
      // obj - mesh
      this.test = new this.engine.objLoader.Mesh(obj);
      this.engine.objLoader.initMeshBuffers(this.engine.gl, this.test);
      // Load sprites
      let self = this;
      await Promise.all(self.sprites.map(self.loadSprite));
      await Promise.all(self.objects.map(self.loadObject));
      // Notify the zone sprites when the new sprite has loaded
      console.log(self.spriteDict, self.objectDict);
      self.spriteList.forEach((sprite) => sprite.runWhenLoaded(self.onTilesetOrSpriteLoaded));
      self.objectList.forEach((object) => object.runWhenLoaded(self.onTilesetOrSpriteLoaded));
    } catch (e) {
      console.error("Error parsing zone " + this.id);
      console.error(e);
    }
  }

  // Actions to run when the map has loaded
  runWhenLoaded(action) {
    if (this.loaded) action();
    else this.onLoadActions.add(action);
  }

  // When tileset loads
  onTilesetDefinitionLoaded() {
    this.vertexPosBuf = [];
    this.vertexTexBuf = [];
    this.walkability = [];
    // Determine Walkability and Load Vertices
    for (let j = 0, k = 0; j < this.size[1]; j++) {
      let vertices = [];
      let vertexTexCoords = [];
      // Loop over Tiles
      for (let i = 0; i < this.size[0]; i++, k++) {
        let cell = this.cells[k];
        this.walkability[k] = Direction.All;
        let n = Math.floor(cell.length / 3);
        // Calc Walk, Vertex positions and Textures for each cell
        for (let l = 0; l < n; l++) {
          let tilePos = [this.bounds[0] + i, this.bounds[1] + j, cell[3 * l + 2]];
          this.walkability[k] &= this.tileset.getWalkability(cell[3 * l]);
          vertices = vertices.concat(this.tileset.getTileVertices(cell[3 * l], tilePos));
          vertexTexCoords = vertexTexCoords.concat(this.tileset.getTileTexCoords(cell[3 * l], cell[3 * l + 1]));
        }
        // Custom walkability
        if (cell.length == 3 * n + 1) this.walkability[k] = cell[3 * n];
      }
      this.vertexPosBuf[j] = this.engine.createBuffer(vertices, this.engine.gl.STATIC_DRAW, 3);
      this.vertexTexBuf[j] = this.engine.createBuffer(vertexTexCoords, this.engine.gl.STATIC_DRAW, 2);
    }
  }

  // run after each tileset / sprite is loaded
  onTilesetOrSpriteLoaded() {
    if (
      this.loaded ||
      !this.tileset.loaded ||
      !this.spriteList.every((sprite) => sprite.loaded) ||
      !this.objectList.every((object) => object.loaded)
    )
      return;
    console.log("Initialized zone '" + this + "'");
    // Load Scene Triggers
    let zone = this;
    this.scripts.forEach((x) => {
      if (x.id === "load-scene") {
        this.runWhenLoaded(x.trigger.bind(zone));
      }
    });
    // loaded
    this.loaded = true;
    this.onLoadActions.run();
  }

  // load obj model
  async loadObject(_this, data) {
    data.zone = _this;
    let newObject = await this.objectLoader.load(data, (sprite) => sprite.onLoad(sprite));
    console.log(["this", this.objectDict, this.objectList, data, newObject]);
    this.objectDict[data.id] = newObject;
    this.objectList.push(newObject);
  }

  // Load Sprite
  async loadSprite(_this, data) {
    data.zone = _this;
    let newSprite = await this.spriteLoader.load(data.type, (sprite) => sprite.onLoad(data));
    console.log(["this", this.spriteDict, this.spriteList, data, newSprite]);
    this.spriteDict[data.id] = newSprite;
    this.spriteList.push(newSprite);
  }

  // Add an existing sprite to the zone
  addSprite(sprite) {
    sprite.zone = this;
    this.spriteDict[sprite.id] = sprite;
    this.spriteList.push(sprite);
  }

  // Remove an sprite from the zone
  removeSprite(id) {
    this.spriteList = this.spriteList.filter((sprite) => {
      if (sprite.id !== id) {
        return true;
      } else {
        sprite.removeAllActions();
      }
    });
    delete this.spriteDict[id];
  }

  // Remove all sprites from the zone
  removeAllSprites() {
    this.spriteList = [];
    this.spriteDict = {};
  }

  // Remove an sprite from the zone
  getSpriteById(id) {
    return this.spriteDict[id];
  }

  // Calculate the height of a point in the zone
  getHeight(x, y) {
    if (!this.isInZone(x, y)) {
      console.error("Requesting height for [" + x + ", " + y + "] outside zone bounds");
      return 0;
    }

    let i = Math.floor(x);
    let j = Math.floor(y);
    let dp = [x - i, y - j];

    // Calculate point inside a triangle
    let getUV = (t, p) => {
      // Vectors relative to first vertex
      let u = [t[1][0] - t[0][0], t[1][1] - t[0][1]];
      let v = [t[2][0] - t[0][0], t[2][1] - t[0][1]];

      // Calculate basis transformation
      let d = 1 / (u[0] * v[1] - u[1] * v[0]);
      let T = [d * v[1], -d * v[0], -d * u[1], d * u[0]];

      // Return new coords
      u = (p[0] - t[0][0]) * T[0] + (p[1] - t[0][1]) * T[1];
      v = (p[0] - t[0][0]) * T[2] + (p[1] - t[0][1]) * T[3];
      return [u, v];
    };

    // Check if any of the tiles defines a custom walk polygon
    let cell = this.cells[(j - this.bounds[1]) * this.size[0] + i - this.bounds[0]];
    let n = Math.floor(cell.length / 3);
    for (let l = 0; l < n; l++) {
      let poly = this.tileset.getTileWalkPoly(cell[3 * l]);
      if (!poly) continue;

      // Loop over triangles
      for (let p = 0; p < poly.length; p++) {
        let uv = getUV(poly[p], dp);
        let w = uv[0] + uv[1];
        if (w <= 1) return cell[3 * l + 2] + (1 - w) * poly[p][0][2] + uv[0] * poly[p][1][2] + uv[1] * poly[p][2][2];
      }
    }

    // Use the height of the first tile in the cell
    return cell[2];
  }

  // Draw Row of Zone
  drawRow(row) {
    // vertice positions
    this.engine.bindBuffer(this.vertexPosBuf[row], this.engine.shaderProgram.vertexPositionAttribute);
    // texture positions
    this.engine.bindBuffer(this.vertexTexBuf[row], this.engine.shaderProgram.textureCoordAttribute);
    // texturize
    this.tileset.texture.attach();
    // set shader
    this.engine.shaderProgram.setMatrixUniforms();
    // draw triangles
    this.engine.gl.drawArrays(this.engine.gl.TRIANGLES, 0, this.vertexPosBuf[row].numItems);
  }

  // Draw Obj to scene
  drawObj(mesh) {
    let { engine } = this;
    engine.mvPushMatrix();
    engine.objLoader.initMeshBuffers(engine.gl, mesh);
    // Vertices
    engine.bindBuffer(mesh.vertexBuffer, engine.shaderProgram.vertexPositionAttribute);
    // Texture
    if (!mesh.textures.length) {
      engine.gl.disableVertexAttribArray(engine.shaderProgram.textureCoordAttribute);
    } else {
      this.tileset.texture.attach();
      engine.bindBuffer(mesh.textureBuffer, engine.shaderProgram.textureCoordAttribute);
    }
    // Normals
    engine.bindBuffer(mesh.normalBuffer, engine.shaderProgram.vertexNormalAttribute);
    // Indices
    engine.gl.bindBuffer(engine.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
    // draw triangles
    engine.shaderProgram.setMatrixUniforms();
    engine.gl.drawElements(engine.gl.TRIANGLES, mesh.indexBuffer.numItems, engine.gl.UNSIGNED_SHORT, 0);
    // Draw
    engine.mvPopMatrix();
    engine.gl.enableVertexAttribArray(engine.shaderProgram.textureCoordAttribute);
  }

  // Draw Frame
  draw() {
    if (!this.loaded) return;
    this.engine.gl.disableVertexAttribArray(this.engine.shaderProgram.vertexNormalAttribute);
    // Organize by Depth
    this.spriteList?.sort((a, b) => a.pos.y - b.pos.y);
    this.objectList?.sort((a, b) => a.pos.y - b.pos.y);
    this.engine.mvPushMatrix();
    this.engine.setCamera();
    // Draw tile terrain row by row (back to front)
    let k = 0;
    let z = 0;
    for (let j = 0; j < this.size[1]; j++) {
      this.drawRow(j);
      // draw each sprite in front of floor tiles if positioned in front
      while (k < this.spriteList.length && this.spriteList[k].pos.y - this.bounds[1] <= j) {
        this.spriteList[k++].draw(this.engine);
      }
    }
    // draw each sprite (fixes tearing)
    while (k < this.spriteList.length) {
      this.spriteList[k++].draw(this.engine);
    }
    // draw objects
    this.engine.gl.enableVertexAttribArray(this.engine.shaderProgram.vertexNormalAttribute);
    this.objectList.map((obj) => obj.draw());
    this.drawObj(this.test);
    this.engine.mvPopMatrix();
  }

  // Update
  tick(time) {
    if (!this.loaded) return;
    this.checkInput(time);
    this.spriteList.forEach(async (sprite) => sprite.tickOuter(time));
  }

  // read input
  checkInput(time) {
    if (time > this.lastKey + 100) {
      let touchmap = this.engine.gamepad.checkInput();
      this.lastKey = time;
      switch (this.engine.keyboard.lastPressedKey("o")) {
        case "o":
          if (this.audio) this.audio.playAudio();
          break;
      } // play audio
      // Gamepad controls - TODO
      if (touchmap["start"] === 1) {
        // select
        if (this.audio && !this.audio.isPlaying()) this.audio.playAudio();
        if (this.audio && this.audio.isPlaying()) this.audio.pauseAudio();
      }
      if (touchmap["select"] === 1) {
        // select
        touchmap["select"] = 0;
        this.engine.toggleFullscreen();
      }
    }
  }

  // Check for zone inclusion
  isInZone(x, y) {
    return x >= this.bounds[0] && y >= this.bounds[1] && x < this.bounds[2] && y < this.bounds[3];
  }

  // Cell Walkable
  isWalkable(x, y, direction) {
    if (!this.isInZone(x, y)) return null;
    for (let sprite in this.spriteDict) {
      if (
        // if sprite bypass & override
        !this.spriteDict[sprite].walkable &&
        this.spriteDict[sprite].pos.x === x &&
        this.spriteDict[sprite].pos.y === y &&
        !this.spriteDict[sprite].blocking &&
        this.spriteDict[sprite].override
      )
        return true;

      if (
        // else if sprite blocking
        !this.spriteDict[sprite].walkable &&
        this.spriteDict[sprite].pos.x === x &&
        this.spriteDict[sprite].pos.y === y &&
        this.spriteDict[sprite].blocking
      )
        return false;
    }
    for (let object in this.objectDict) {
      console.log(this.objectDict[object], x, y, this.within(
        x,
        this.objectDict[object].pos.x - this.objectDict[object].size.x / 2,
        this.objectDict[object].pos.x + this.objectDict[object].size.x / 2
      ), this.objectDict[object].size) 
      if (
        // if sprite bypass & override
        !this.objectDict[object].walkable &&
        this.within(
          x,
          this.objectDict[object].pos.x - this.objectDict[object].size.x / 2,
          this.objectDict[object].pos.x
        ) &&
        this.within(
          y,
          this.objectDict[object].pos.y - this.objectDict[object].size.y / 2,
          this.objectDict[object].pos.y
        ) &&
        !this.objectDict[object].blocking &&
        this.objectDict[object].override
      )
        return true;

      if (
        // else if object blocking
        !this.objectDict[object].walkable &&
        this.within(
          x,
          this.objectDict[object].pos.x - this.objectDict[object].size.x / 2,
          this.objectDict[object].pos.x, true
        ) &&
        this.within(
          y,
          this.objectDict[object].pos.y - this.objectDict[object].size.y / 2,
          this.objectDict[object].pos.y, true
        ) &&
        this.objectDict[object].blocking
      )
        return false;
    }
    // else tile specific
    return (this.walkability[(y - this.bounds[1]) * this.size[0] + x - this.bounds[0]] & direction) != 0;
  }

  within(x, a, b, include = false) {
    if (include && x >= a && x <= b) return true;
    if (!include && x > a && x < b) return true;
    return false;
  }

  // Trigger Script
  triggerScript(id) {
    this.scripts.forEach((x) => {
      if (x.id === id) {
        this.runWhenLoaded(x.trigger.bind(this));
      }
    });
  }

  // Move the sprite
  async moveSprite(id, location, running = false) {
    return new Promise((resolve, reject) => {
      let sprite = this.getSpriteById(id);
      sprite.addAction(
        new ActionLoader(this.engine, "patrol", [sprite.pos.toArray(), location, running ? 200 : 600, this], sprite, resolve)
      );
    });
  }

  // Sprite Dialogue
  async spriteDialogue(id, dialogue, options = { autoclose: true }) {
    return new Promise((resolve, reject) => {
      let sprite = this.getSpriteById(id);
      sprite.addAction(new ActionLoader(this.engine, "dialogue", [dialogue, false, options], sprite, resolve));
    });
  }

  // Run Action configuration from JSON description
  async runActions(actions) {
    let self = this;
    return await actions.reduce(async (prev, action) => {
      return await prev
        .then(
          async () =>
            new Promise((resolve, reject) => {
              console.log("working on action ---- ", action);

              if (!action) resolve();
              try {
                if (!action.scope) action.scope = self;
                if (action.sprite) {
                  let sprite = action.scope.getSpriteById(action.sprite);
                  // apply action
                  if (sprite && action.action) {
                    console.log("playing scene action in zone", self);
                    let args = action.args;
                    let options = args.pop();
                    sprite.addAction(
                      new ActionLoader(self.engine, action.action, [...args, { ...options }], sprite, () => resolve(self))
                    );
                  }
                }
                // trigger script
                if (action.trigger) {
                  console.log("trigger", action);
                  let sprite = action.scope.getSpriteById("avatar");
                  console.log("triggered by ", sprite);
                  if (sprite && action.trigger) {
                    sprite.addAction(
                      new ActionLoader(self.engine, "script", [action.trigger, action.scope, () => resolve(self)], sprite)
                    );
                  }
                }
              } catch (e) {
                reject(e);
              }
            })
        )
        .catch((err) => {
          console.warn("err", err.message);
        });
    }, Promise.resolve());
  }

  // Play a scene
  async playScene(id) {
    let self = this;
    self.scenes.forEach(async function runScene(x) {
      try {
        if (!x.currentStep) {
          x.currentStep = 0; // Starting
        }
        if (x.currentStep > self.scenes.length) {
          return; // scene finished
        }
        if (x.id === id) {
          // found scene
          console.log("found scene ---> ", x);
          await self.runActions(x.actions);
        }
      } catch (e) {
        console.error(e);
      }
    });
  }
}
