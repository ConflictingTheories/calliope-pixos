local _this = pixos.get_caller();
pixos.log(pixos.as_obj({ msg = 'trigger:: room_clear_path', zone = _this }));

-- setup camera
local from = pixos.get_camera_vector();
local to = pixos.vec_sub(pixos.get_camera_vector(),pixos.vector({0, 0, 1}));

-- lock to every 45 degrees
pixos.log(pixos.as_obj({ msg = 'trigger:: room_clear_path', from = from, to = to }));

-- to.z = to.z % 9;
-- if (to.z === 0 && from.z === 8) then
--   from.z = 0;
-- end;
-- if (to.z === 0 && from.z === 7) then
--   to.z = 8;
-- end;

-- run synchronously
pixos.sync({
    pixos.pan_camera(from, to, 1),
});

-- run synchronously
pixos.sync({
    pixos.move_sprite('avatar', {8, 8, 0}, false),
    pixos.sprite_dialogue('avatar', pixos.as_obj({'Welcome! This is Pixospritz!'}), pixos.as_obj({ duration = 3, autoclose = true })),
    pixos.move_sprite('avatar', {2, 7, 0}, false),
    pixos.sprite_dialogue('avatar', pixos.as_obj({'This is the first room!'}), pixos.as_obj({ duration = 3, autoclose = true })),
});



