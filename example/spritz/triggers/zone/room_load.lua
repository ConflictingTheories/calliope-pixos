-- get zone
local _this = pixos.get_caller();
pixos.log(pixos.as_obj({ msg = 'trigger:: room_load', zone = _this }));

-- play a cut scene when entering the room
-- not working still (does not play the cutscene)
-- Force-enable tactics mode for example demonstration
pixos.log('room_load: setting mode -> tactics');
pixos.set_mode('tactics');
pixos.sync({pixos.play_cutscene('strange-legend')});