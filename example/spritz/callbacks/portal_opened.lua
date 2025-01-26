local _this = pixos.get_caller();

pixos.log(pixos.as_obj({ msg: 'opening portal', scope: _this }));

pixos.to(_this, { 
  blocking = false, 
  override = true,
  frames = {
    N = {
      {0, 210},
      {18, 210},
      {36, 210},
      {54, 210},
    },
    E = {
      {0, 210},
      {18, 210},
      {36, 210},
      {54, 210},
    },
    W = {
      {0, 210},
      {18, 210},
      {36, 210},
      {54, 210},
    },
    S = {
      {0, 210},
      {18, 210},
      {36, 210},
      {54, 210},
    },
  }
});