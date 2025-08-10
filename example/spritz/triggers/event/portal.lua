-- This script is executed when a sprite enters a portal.

-- The portal is the object that the sprite is entering.

local user_sprite = pixos.get_subject();
local portal = pixos.get_caller();

pixos.log({ msg = 'entering portal', portal = portal, user_sprite = user_sprite });

-- Remove all zones from the world and load the zones from the portal.
pixos.remove_all_zones();

local zones = pixos.from(portal, 'zones');
local zip = pixos.from(portal, 'zip');

-- Define a cutscene sequence for loading zone(s) via portal. The sequence
-- will fade out, load each zone from the specified zip file, then fade in.
local steps = {}
-- Fade out 
table.insert(steps, { type = 'transition', effect = 'blur', direction = 'out', duration = 500 })

if (type(zones) == 'string') then
    pixos.log(pixos.as_obj({ msg = 'loading zone via cutscene', zone = zones, zip = zip }));
    table.insert(steps, { type = 'load_zone', zone = zones, zip = zip, effect = 'blur', duration = 500 })
else
    pixos.log(pixos.as_obj({ msg = 'loading zones via cutscene', zones = zones, zip = zip }));
    -- needs work -- In theory this will run multiple back-to-back transitions if it loads multiple zones.
    -- will need to instead have it play on possibly the last one? Or - so some kind of general cross fade
    -- once all are loaded to achieve the effect? Will revisit - todo.
    for i = 1, #zones do
        local zone = zones[i];
        table.insert(steps, { type = 'load_zone', zone = zone, zip = zip, effect = 'blur', duration = 500 })
    end
end

-- Fade back in
table.insert(steps, { type = 'transition', effect = 'blur', direction = 'in', duration = 500 })

-- Run the cutscene. Using pixos.sync ensures the script waits for completion.
pixos.sync({ pixos.run_cutscene(steps) })

pixos.log(pixos.as_obj({ msg = 'exiting portal' }));

return nil;
