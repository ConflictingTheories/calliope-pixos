async (_this, menu) => {
  menu.completed = true;
  _this.world.isPaused = false;
  _this.loadScripts(true);
};
