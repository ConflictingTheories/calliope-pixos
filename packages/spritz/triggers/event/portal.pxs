-- This script is executed when a sprite enters a portal.

-- The portal is the object that the sprite is entering.

local user_sprite = pixos.get_subject();
local portal = pixos.get_caller();

pixos.set_skybox_shader('cosmic');

pixos.log({ msg = 'entering portal', portal = portal, user_sprite = user_sprite });

-- Remove all zones from the world and load the zones from the portal.
pixos.remove_all_zones(); -- only needed if we want to do so - could in theory just load a new addition

local zones = pixos.from(portal, 'zones');
local zip = pixos.from(portal, 'zip');

-- Define a cutscene sequence for loading zone(s) via portal. The sequence
-- will fade out, load each zone from the specified zip file, then fade in.
-- todo: in future - can also animate character walking into/out of door in theory?
-- or some kind of 'narration'
local steps = {}

-- Fade out 
table.insert(steps, { type = 'transition', effect = 'blur', direction = 'out', duration = 500 })

if (type(zones) == 'string') then -- single zone
    pixos.log(pixos.as_obj({ msg = 'loading zone via cutscene', zone = zones, zip = zip }));
    table.insert(steps, { type = 'load_zone', zone = zones, zip = zip, effect = nil})
else -- multiple zones
    pixos.log(pixos.as_obj({ msg = 'loading zones via cutscene', zones = zones, zip = zip}));
    for i = 1, #zones do
        local zone = zones[i];
        table.insert(steps, { type = 'load_zone', zone = zone, zip = zip, effect = nil })
    end
end

-- Fade back in
table.insert(steps, { type = 'transition', effect = 'blur', direction = 'in', duration = 500 })

-- Run the cutscene. Using pixos.sync ensures the script waits for completion.
pixos.sync({ pixos.run_cutscene(steps) })

pixos.log(pixos.as_obj({ msg = 'exiting portal' }));

pixos.set_skybox_shader('sunset');

return nil;
