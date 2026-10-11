local tile = pixos.get_subject();
pixos.log({ msg = 'clicking select', tile = pixos.as_obj(tile)});

local row = tile[1];
local column = tile[2];

local zone = pixos.get_zone();

pixos.log({ msg = 'clicking select', zone = zone, tile = tile, row=row, column=column });

pixos.sync({
    pixos.move_sprite('avatar', {column, row, 0}, false),
});

return nil;
