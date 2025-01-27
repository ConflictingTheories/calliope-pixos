  local sprite = pixos.get_sprite();
  local _this = pixos.get_caller();

  pixos.log(pixos.as_obj({ msg = 'adding inventory', scope = _this, sprite = sprite }));

  -- read inventory
  local newInventory = pixos.from(_this, 'inventory');
  local existingInventory = pixos.from(sprite, 'inventory');

  -- add to character inventory
  if (existingInventory) then
    for i = 1, #newInventory do
      existingInventory[#existingInventory + 1] =  newInventory[i];
    end;
  end;

  -- update sprite inventory
  pixos.to(sprite, { inventory = existingInventory });

  -- look into figuring this call back out.
  pixos.finish(pixos.as_obj(true));
