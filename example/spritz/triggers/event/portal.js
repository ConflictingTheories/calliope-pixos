async (_this, sprite) => {
  console.log({ msg: 'entering portal', _this, sprite });
  let world = _this.zone.world;
  world.removeAllZones();
  if (_this.zones) _this.zones.forEach((z) => world.loadZoneFromZip(z, _this.zip));
  console.log({ msg: 'exiting portal', _this, sprite });
  return null;
};
