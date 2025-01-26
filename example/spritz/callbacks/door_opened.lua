local _this = pixos.get_caller();

pixos.log(pixos.as_obj({ msg = 'opening door', scope = _this }));

pixos.to(_this, { 
  blocking = true, 
  override = false 
});