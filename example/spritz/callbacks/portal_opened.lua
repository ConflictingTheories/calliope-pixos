local _this = pixos.get_caller();

pixos.log(pixos.as_obj({ msg = 'opening portal', scope = _this }));

local pos = pixos.as_table(pixos.from(_this, 'pos'));

pixos.emit_particles({pos.x, pos.y, pos.z}, { preset = 'flame', count = 20, life = 2000 });

pixos.to(_this, { 
  blocking = false, -- allow to pass through portal
  override = true,
  frames = { -- apply new texture frames (todo - look at improving the ease of this)
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