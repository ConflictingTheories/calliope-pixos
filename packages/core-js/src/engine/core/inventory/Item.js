/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

/**
 * Item - Represents a single item in the inventory system.
 */
export default class Item {
  /**
   * Creates an instance of Item.
   * @param {Object} definition - Item definition from manifest.
   * @param {string} definition.id - Unique item ID.
   * @param {string} definition.name - Display name.
   * @param {string} [definition.description] - Item description.
   * @param {string} [definition.icon] - Icon sprite/texture path.
   * @param {boolean} [definition.stackable] - Whether item can stack (default: false).
   * @param {number} [definition.maxStack] - Maximum stack size (default: 1).
   * @param {string} [definition.category] - Item category (e.g., 'consumable', 'weapon', 'armor').
   * @param {boolean} [definition.usable] - Whether item can be used (default: false).
   * @param {string} [definition.onUse] - Script to run on use.
   * @param {number} [quantity=1] - Initial quantity.
   */
  constructor(definition, quantity = 1) {
    if (!definition || !definition.id) {
      throw new Error('Item definition must have an id');
    }

    /** @type {string} */
    this.id = definition.id;
    /** @type {string} */
    this.name = definition.name || definition.id;
    /** @type {string} */
    this.description = definition.description || '';
    /** @type {string|null} */
    this.icon = definition.icon || null;
    /** @type {boolean} */
    this.stackable = definition.stackable || false;
    /** @type {number} */
    this.maxStack = definition.maxStack || 1;
    /** @type {string} */
    this.category = definition.category || 'misc';
    /** @type {boolean} */
    this.usable = definition.usable || false;
    /** @type {string|null} */
    this.onUse = definition.onUse || null;
    /** @type {Object} */
    this.data = definition.data || {};
    /** @type {number} */
    this.quantity = Math.min(quantity, this.maxStack);
  }

  /**
   * Creates an item from a serialized object.
   * @param {Object} serialized - Serialized item data.
   * @returns {Item} New item instance.
   */
  static fromSerialized(serialized) {
    const item = new Item(
      {
        id: serialized.id,
        name: serialized.name,
        description: serialized.description,
        icon: serialized.icon,
        stackable: serialized.stackable,
        maxStack: serialized.maxStack,
        category: serialized.category,
        usable: serialized.usable,
        onUse: serialized.onUse,
        data: serialized.data,
      },
      serialized.quantity
    );
    return item;
  }

  /**
   * Serializes the item to a plain object.
   * @returns {Object} Serialized item data.
   */
  serialize() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      icon: this.icon,
      stackable: this.stackable,
      maxStack: this.maxStack,
      category: this.category,
      usable: this.usable,
      onUse: this.onUse,
      data: this.data,
      quantity: this.quantity,
    };
  }

  /**
   * Checks if this item can stack with another item.
   * @param {Item} other - Other item to check.
   * @returns {boolean} True if items can stack.
   */
  canStackWith(other) {
    return (
      this.stackable && other.stackable && this.id === other.id && this.quantity < this.maxStack
    );
  }

  /**
   * Adds quantity to this item (if stackable).
   * @param {number} amount - Amount to add.
   * @returns {number} Amount that was actually added.
   */
  addQuantity(amount) {
    if (!this.stackable) return 0;
    const oldQuantity = this.quantity;
    this.quantity = Math.min(this.quantity + amount, this.maxStack);
    return this.quantity - oldQuantity;
  }

  /**
   * Removes quantity from this item.
   * @param {number} amount - Amount to remove.
   * @returns {number} Amount that was actually removed.
   */
  removeQuantity(amount) {
    const removed = Math.min(amount, this.quantity);
    this.quantity -= removed;
    return removed;
  }

  /**
   * Checks if the item is empty (quantity 0).
   * @returns {boolean}
   */
  isEmpty() {
    return this.quantity <= 0;
  }

  /**
   * Creates a copy of this item.
   * @returns {Item} New item instance.
   */
  clone() {
    return Item.fromSerialized(this.serialize());
  }
}
