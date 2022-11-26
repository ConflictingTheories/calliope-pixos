async () => {
  // setup camera
  let from = _this.engine.cameraVector;
  let to = _this.engine.cameraVector.sub(new _this.engine.Vector(...[0, 0, 1]));
  to.z = to.z % 9; // lock to every 45 degrees
  if (to.z === 0 && from.z === 8) {
    from.z = 0;
  }
  if (to.z === 0 && from.z === 7) {
    to.z = 8;
  }

  // pan camera
  await _this.world.addEvent(
    new _this.EventLoader(
      _this.engine,
      'camera',
      [
        'pan',
        {
          from,
          to,
          duration: 1,
        },
      ],
      _this.world,
      async () => {}
    )
  );

  // move to center
  await _this.moveSprite('avatar', [8, 8, 0], false);

  await _this.spriteDialogue('avatar', ['Welcome! This is Pixospritz!']);

  await _this.moveSprite('avatar', [2, 7, 0], false);

  await _this.spriteDialogue('avatar', ['CHECK IT! This is Pixospritz!']);

};
