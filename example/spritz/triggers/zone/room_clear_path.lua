local _this = pixos.get_caller();
pixos.log(pixos.as_obj({ msg = 'trigger:: room_clear_path', zone = _this }));

-- todo - need to convert to lua 

-- // setup camera
-- let from = _this.engine.renderManager.camera.cameraVector;
-- let to = _this.engine.renderManager.camera.cameraVector.sub(new _this.engine.utils.Vector(...[0, 0, 1]));
-- to.z = to.z % 9; // lock to every 45 degrees
-- if (to.z === 0 && from.z === 8) {
--   from.z = 0;
-- }
-- if (to.z === 0 && from.z === 7) {
--   to.z = 8;
-- }

-- // pan camera
-- await _this.world.addEvent(
--   new _this.EventLoader(
--     _this.engine,
--     'camera',
--     [
--       'pan',
--       {
--         from,
--         to,
--         duration: 1,
--       },
--     ],
--     _this.world,
--     async () => {}
--   )
-- );

-- run synchronously
pixos.sync({
    pixos.move_sprite('avatar', {8, 8, 0}, false),
    pixos.sprite_dialogue('avatar', pixos.as_obj({'Welcome! This is Pixospritz!'}), pixos.as_obj({ duration = 3, autoclose = true })),
    pixos.move_sprite('avatar', {2, 7, 0}, false),
    pixos.sprite_dialogue('avatar', pixos.as_obj({'This is the first room!'}), pixos.as_obj({ duration = 3, autoclose = true })),
});



