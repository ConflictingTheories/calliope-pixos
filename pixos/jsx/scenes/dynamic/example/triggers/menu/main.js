async (_this, menu) => {
  console.log('menu',menu);
  console.log({ msg: 'opening menu', menu, scope: _this });
  
  menu.completed = true;
  _this.world.isPaused = false;
  _this.loadScripts(true);
};
