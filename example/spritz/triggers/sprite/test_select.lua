-- This script is executed when a sprite enters a portal.

-- The portal is the object that the sprite is entering.

local user_sprite = pixos.get_subject();
local selecter = pixos.get_caller();

pixos.log({ msg = 'clicking select', selecter = selecter, user_sprite = user_sprite });

pixos.sync({
    pixos.sprite_dialogue('avatar', pixos.as_obj({'Clicked Me, eh?!'}), pixos.as_obj({ duration = 3, autoclose = true }))
});

return nil;
