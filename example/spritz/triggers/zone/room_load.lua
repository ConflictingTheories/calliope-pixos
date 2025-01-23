-- get zone
local zone = pixos.get_caller();
pixos.log(pixos.as_obj({ msg = 'entering room', zone = zone }));

-- play a cut scene when entering the room
pixos.play_cutscene('strange-legend');
return nil;