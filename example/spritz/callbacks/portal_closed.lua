local _this = pixos.get_caller();
pixos.log(pixos.as_obj({ msg = 'closing portal', scope = _this }));

-- set properties on the caller
pixos.to(_this, { 
  blocking = false, 
  override = true,
  frames = {
    N = {
      {96, 210},
      {114, 210},
      {132, 210},
      {150, 210},
    },
    E = {
      {96, 210},
      {114, 210},
      {132, 210},
      {150, 210},
    },
    W = {
      {96, 210},
      {114, 210},
      {132, 210},
      {150, 210},
    },
    S = {
      {96, 210},
      {114, 210},
      {132, 210},
      {150, 210},
    },
  }
});