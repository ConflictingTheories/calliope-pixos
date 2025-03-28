local _this = pixos.get_caller();
local world = pixos.get_world();
local menu = pixos.get_subject();

pixos.log(pixos.as_obj({ msg = 'opening main', menu = menu, scope = _this }));

pixos.to( menu, { 
  completed = true, 
});

pixos.to( world, { 
  isPaused = false, 
});

pixos.load_scripts(true);
