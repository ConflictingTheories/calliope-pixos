-- get zone
local zone = pixos.get_caller();
pixos.log(pixos.as_obj({ msg = 'trigger:: room_load', zone = zone }));

-- play a cut scene when entering the room
-- not working still
pixos.play_cutscene('strange-legend')();