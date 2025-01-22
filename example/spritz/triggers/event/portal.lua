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
for i = 1, #zones do
    pixos.log(pixos.as_obj({ msg = 'loading zone', zones = zones, zip = zip }));
    pixos.load_zone_from_zip(zones[i], zip);
end

pixos.log(pixos.as_obj({ msg = 'exiting portal' }));
return nil;