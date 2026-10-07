/**
 * Menu system for PixoSpritz engine.
 *
 * Menus are UI overlays: main menu, pause menu, inventory, dialog boxes.
 * Defined as data (JSON), rendered by the player's UI layer.
 */

export class MenuManager {
  constructor(engine) {
    this.engine = engine;
    this.menus = new Map(); // id -> menu definition
    this.activeMenu = null;
    this.selection = 0;
  }

  /**
   * Register a menu definition.
   * @param {object} menu - { id, title, items: [{ id, label, action }] }
   */
  register(menu) {
    if (!menu.id) throw new Error('Menu must have an id');
    this.menus.set(menu.id, menu);
  }

  /**
   * Show a menu.
   * @param {string} id - Menu ID
   */
  show(id) {
    const menu = this.menus.get(id);
    if (!menu) {
      console.warn(`Menu not found: ${id}`);
      return;
    }
    this.activeMenu = menu;
    this.selection = 0;
    // Notify UI layer
    if (this.engine.world) {
      this.engine.world._activeMenu = menu;
    }
  }

  /**
   * Hide the active menu.
   */
  hide() {
    this.activeMenu = null;
    if (this.engine.world) {
      this.engine.world._activeMenu = null;
    }
  }

  /**
   * Move selection up/down.
   * @param {number} dir - -1 for up, 1 for down
   */
  moveSelection(dir) {
    if (!this.activeMenu) return;
    const count = this.activeMenu.items.length;
    this.selection = (this.selection + dir + count) % count;
  }

  /**
   * Activate the selected item.
   */
  select() {
    if (!this.activeMenu) return null;
    const item = this.activeMenu.items[this.selection];
    if (!item) return null;

    // Return the action for the game to handle
    return item.action;
  }

  /**
   * Get the active menu (for UI rendering).
   */
  getActive() {
    if (!this.activeMenu) return null;
    return {
      ...this.activeMenu,
      selection: this.selection,
    };
  }
}

export default MenuManager;
