-- This script is executed when a sprite enters a portal.

-- The portal is the object that the sprite is entering.

local user_sprite = pixos.get_sprite();
local portal = pixos.get_caller();

pixos.log({ msg = 'entering portal', portal = portal, user_sprite = user_sprite });

-- Remove all zones from the world and load the zones from the portal.
pixos.remove_all_zones();

local zones = pixos.from(portal, 'zones');
local zip = pixos.from(portal, 'zip');

-- Load the zones from the portal.
if (type(zones) == 'array') then
    pixos.log(pixos.as_obj({ msg = 'loading zones', zones = zones, zip = zip }));
    for i = 1, #zones do
        local zone = zones[i];
        pixos.load_zone_from_zip(zones[i], zip);
    end
else
    pixos.log(pixos.as_obj({ msg = 'loading zone', zone = zones, zip = zip }));
    pixos.load_zone_from_zip(zones, zip);
end

pixos.log(pixos.as_obj({ msg = 'exiting portal' }));
return nil;
