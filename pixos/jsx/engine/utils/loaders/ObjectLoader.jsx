/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2022 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import Resources from '../resources.jsx';
import ModelObject from '@Engine/core/object.jsx';

//helps load models
export class ObjectLoader {
  constructor(engine) {
    this.engine = engine;
    this.definitions = [];
    this.instances = {};
  }

  // Load 3d model
  async loadFromZip(model, zip) {
    let afterLoad = arguments[2];
    let runConfigure = arguments[3];
    if (!this.instances[model.id]) {
      this.instances[model.id] = [];
    }

    let instance = new ModelObject(this.engine);
    instance.update(model);
    // New Instance
    let modelreq = {
      obj: `${instance.type}.obj`,
      mtl: model.mtl ?? false,
      mtlTextureRoot: 'textures',
      downloadMtlTextures: true,
      enableWTextureCoord: false,
      name: instance.id,
    };

    let models = await this.engine.objLoader.downloadModelsFromZip(this.engine.gl, [modelreq], zip);

    instance.mesh = models[model.type];
    instance.templateLoaded = true;

    // Update Existing
    this.instances[instance.id].forEach(function (instance) {
      if (instance.afterLoad) instance.afterLoad(instance.instance);
    });

    // Configure if needed
    if (runConfigure) runConfigure(instance);

    // once loaded
    if (afterLoad) {
      if (instance.templateLoaded) afterLoad(instance);
      else this.instances[instance.id].push({ instance, afterLoad });
    }

    instance.loaded = true;
    return instance;
  }
}
