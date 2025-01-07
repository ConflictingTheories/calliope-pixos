-- This script is executed when a sprite enters a portal.

-- The portal is the object that the sprite is entering.
local user_sprite = pixos.get_sprite();
local portal = pixos.get_caller();

print({ msg: 'entering portal', portal, user_sprite });

-- Remove all zones from the world and load the zones from the portal.
pixos.remove_all_zones();

-- Load the zones from the portal.
if (portal.zones) then
    for i = 1, #portal.zones do
        pixos.load_zone_from_zip(portal.zones[i], portal.zip);
    end
end

print({ msg: 'exiting portal', portal, user_sprite });
return nil;