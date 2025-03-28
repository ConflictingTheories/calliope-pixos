local _this = pixos.get_caller();
pixos.log({msg = 'trigger:: room_custom', zone = _this});

pixos.sync({pixos.sprite_dialogue('avatar', ['Lets get in there!'])});
