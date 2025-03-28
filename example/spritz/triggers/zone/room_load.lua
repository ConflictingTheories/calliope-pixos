-- get zone
local _this = pixos.get_caller();
pixos.log(pixos.as_obj({ msg = 'trigger:: room_load', zone = _this }));

-- play a cut scene when entering the room
-- not working still (does not play the cutscene)
pixos.sync({pixos.play_cutscene('strange-legend')});