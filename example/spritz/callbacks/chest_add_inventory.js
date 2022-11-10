() => {
  if (sprite.inventory) {
    sprite.inventory.push(..._this.inventory);
  }
  finish(true);
};
