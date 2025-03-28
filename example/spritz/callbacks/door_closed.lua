local _this = pixos.get_caller();

pixos.log(pixos.as_obj({ msg = 'closing door', scope = _this }));

-- update the caller's properties
pixos.to(_this, { 
  blocking = false, 
  override = true 
});
