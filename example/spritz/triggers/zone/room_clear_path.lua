local _this = pixos.get_caller();
pixos.log(pixos.as_obj({ msg = 'trigger:: room_clear_path', zone = _this }));

-- setup camera
local from = pixos.get_camera_vector();
local to = pixos.vec_sub(pixos.get_camera_vector(),pixos.vector({0, 0, 1}));

-- lock to every 45 degrees
pixos.log(pixos.as_obj({ msg = 'trigger:: room_clear_path', from = from, to = to }));

-- change skybox on room load
pixos.set_skybox_shader('matrix');
-- There are multiple ways to script things - though each is suited to a particular use.
-- for example - cutscenes can be scripted using the cutscene manager (preferred way) or they
-- can be drafted up manually. Likewise, the cutscene manager can be used to script other events
-- or they can be triggered manually.

-- Using Cutscene Manager
local steps = {}
-- table.insert(steps, { type = 'action', action = pixos.set_flag('test-flag', {msg = 'test'}, true)})
table.insert(steps, { type = 'transition', effect = 'fade', direction = 'in', duration = 500 })
table.insert(steps, { type = 'action', action = pixos.pan_camera(from, to, 1) })
table.insert(steps, { type = 'action', action = pixos.move_sprite('avatar', {8, 8, 0}, false) })
table.insert(steps, { type = 'action', action = pixos.sprite_dialogue('avatar', pixos.as_obj({'Welcome! This is Pixospritz!'}), pixos.as_obj({ duration = 3, autoclose = true })) })
table.insert(steps, { type = 'action', action = pixos.move_sprite('avatar', {2, 7, 0}, false) })
table.insert(steps, { type = 'action', action = pixos.sprite_dialogue('avatar', pixos.as_obj({'This is the first room!'}), pixos.as_obj({ duration = 3, autoclose = true }))})
table.insert(steps, { type = 'wait', duration = 500})
pixos.sync({ pixos.run_cutscene(steps) })

-- local flag = pixos.get_flag('test-flag');
-- pixos.log(pixos.as_obj({result = from(flag, 'msg')}));
-- Alternatively - can be manually run synchronously (via Pixos Sync)
-- pixos.sync({
--     pixos.run_transition('fade', 'in', 500),
--     pixos.pan_camera(from, to, 1),
--     pixos.move_sprite('avatar', {8, 8, 0}, false),
--     pixos.sprite_dialogue('avatar', pixos.as_obj({'Welcome! This is Pixospritz!'}), pixos.as_obj({ duration = 3, autoclose = true })),
--     pixos.move_sprite('avatar', {2, 7, 0}, false),
--     pixos.sprite_dialogue('avatar', pixos.as_obj({'This is the first room!'}), pixos.as_obj({ duration = 3, autoclose = true })),
-- });



