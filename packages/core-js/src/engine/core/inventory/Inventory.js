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

import Item from './Item.js';

/**
 * Inventory - Manages a collection of items with stacking and categories.
 */
export default class Inventory {
  /**
   * Creates an instance of Inventory.
   * @param {number} [maxSlots=30] - Maximum number of inventory slots.
   */
  constructor(maxSlots = 30) {
    /** @type {Array<Item|null>} */
    this.slots = new Array(maxSlots).fill(null);
    /** @type {number} */
    this.maxSlots = maxSlots;
    /** @type {Map<string, Item>} */
    this.itemDefinitions = new Map();
  }

  /**
   * Registers an item definition.
   * @param {Object} definition - Item definition.
   */
  registerItem(definition) {
    this.itemDefinitions.set(definition.id, definition);
  }

  /**
   * Gets an item definition by ID.
   * @param {string} itemId - Item ID.
   * @returns {Object|null} Item definition or null.
   */
  getItemDefinition(itemId) {
    return this.itemDefinitions.get(itemId) || null;
  }

  /**
   * Adds an item to the inventory.
   * @param {string|Object} itemIdOrDef - Item ID or item definition.
   * @param {number} [quantity=1] - Quantity to add.
   * @returns {boolean} True if item was added successfully.
   */
  addItem(itemIdOrDef, quantity = 1) {
    let definition;
    if (typeof itemIdOrDef === 'string') {
      definition = this.getItemDefinition(itemIdOrDef);
      if (!definition) {
        console.warn(`Item definition not found: ${itemIdOrDef}`);
        return false;
      }
    } else {
      definition = itemIdOrDef;
      this.registerItem(definition);
    }

    const item = new Item(definition, quantity);

    // Try to stack with existing items first
    if (item.stackable) {
      for (let i = 0; i < this.slots.length; i++) {
        const slot = this.slots[i];
        if (slot && slot.canStackWith(item)) {
          const added = slot.addQuantity(item.quantity);
          if (added === item.quantity) {
            return true; // Fully added
          }
          item.quantity -= added;
        }
      }
    }

    // Find empty slot
    if (item.quantity > 0) {
      for (let i = 0; i < this.slots.length; i++) {
        if (this.slots[i] === null) {
          if (item.quantity <= item.maxStack) {
            this.slots[i] = item;
            return true;
          } else {
            // Split into multiple stacks
            const stackSize = item.maxStack;
            this.slots[i] = new Item(definition, stackSize);
            item.quantity -= stackSize;
            // Continue adding remaining quantity
            return this.addItem(definition, item.quantity);
          }
        }
      }
    }

    return item.quantity === 0; // Return true if all was added
  }

  /**
   * Removes an item from the inventory.
   * @param {string} itemId - Item ID to remove.
   * @param {number} [quantity=1] - Quantity to remove.
   * @returns {boolean} True if item was removed successfully.
   */
  removeItem(itemId, quantity = 1) {
    let remaining = quantity;

    for (let i = 0; i < this.slots.length && remaining > 0; i++) {
      const slot = this.slots[i];
      if (slot && slot.id === itemId) {
        const removed = slot.removeQuantity(remaining);
        remaining -= removed;
        if (slot.isEmpty()) {
          this.slots[i] = null;
        }
      }
    }

    return remaining === 0;
  }

  /**
   * Gets the quantity of an item in the inventory.
   * @param {string} itemId - Item ID.
   * @returns {number} Total quantity.
   */
  getItemQuantity(itemId) {
    let total = 0;
    for (const slot of this.slots) {
      if (slot && slot.id === itemId) {
        total += slot.quantity;
      }
    }
    return total;
  }

  /**
   * Checks if the inventory has an item.
   * @param {string} itemId - Item ID.
   * @param {number} [quantity=1] - Minimum quantity required.
   * @returns {boolean} True if inventory has the item.
   */
  hasItem(itemId, quantity = 1) {
    return this.getItemQuantity(itemId) >= quantity;
  }

  /**
   * Gets an item at a specific slot.
   * @param {number} slotIndex - Slot index.
   * @returns {Item|null} Item or null.
   */
  getItemAt(slotIndex) {
    if (slotIndex < 0 || slotIndex >= this.slots.length) {
      return null;
    }
    return this.slots[slotIndex];
  }

  /**
   * Moves an item from one slot to another.
   * @param {number} fromSlot - Source slot index.
   * @param {number} toSlot - Destination slot index.
   * @returns {boolean} True if move was successful.
   */
  moveItem(fromSlot, toSlot) {
    if (
      fromSlot < 0 ||
      fromSlot >= this.slots.length ||
      toSlot < 0 ||
      toSlot >= this.slots.length
    ) {
      return false;
    }

    const fromItem = this.slots[fromSlot];
    const toItem = this.slots[toSlot];

    if (!fromItem) return false;

    // If destination is empty, just move
    if (!toItem) {
      this.slots[toSlot] = fromItem;
      this.slots[fromSlot] = null;
      return true;
    }

    // If items can stack, try to stack
    if (fromItem.canStackWith(toItem)) {
      const added = toItem.addQuantity(fromItem.quantity);
      fromItem.removeQuantity(added);
      if (fromItem.isEmpty()) {
        this.slots[fromSlot] = null;
      }
      return true;
    }

    // Otherwise, swap items
    this.slots[fromSlot] = toItem;
    this.slots[toSlot] = fromItem;
    return true;
  }

  /**
   * Uses an item (if usable).
   * @param {number} slotIndex - Slot index of item to use.
   * @param {Object} context - Context object (e.g., engine, sprite).
   * @returns {boolean} True if item was used successfully.
   */
  useItem(slotIndex, context = {}) {
    const item = this.getItemAt(slotIndex);
    if (!item || !item.usable) {
      return false;
    }

    // Execute onUse script if available
    if (item.onUse && context.engine) {
      try {
        // Load and execute script
        // This would integrate with the scripting system
        console.log(`Using item ${item.id}, executing script: ${item.onUse}`);
        // TODO: Execute script via engine.scripting system
      } catch (e) {
        console.error(`Failed to execute item script: ${item.onUse}`, e);
        return false;
      }
    }

    // Remove one from stack
    if (item.stackable) {
      item.removeQuantity(1);
      if (item.isEmpty()) {
        this.slots[slotIndex] = null;
      }
    } else {
      this.slots[slotIndex] = null;
    }

    return true;
  }

  /**
   * Gets all items of a specific category.
   * @param {string} category - Category name.
   * @returns {Array<Item>} Array of items.
   */
  getItemsByCategory(category) {
    const items = [];
    for (const slot of this.slots) {
      if (slot && slot.category === category) {
        items.push(slot);
      }
    }
    return items;
  }

  /**
   * Clears the inventory.
   */
  clear() {
    this.slots.fill(null);
  }

  /**
   * Serializes the inventory to a plain object.
   * @returns {Object} Serialized inventory data.
   */
  serialize() {
    return {
      slots: this.slots.map(slot => (slot ? slot.serialize() : null)),
      maxSlots: this.maxSlots,
    };
  }

  /**
   * Deserializes inventory from a plain object.
   * @param {Object} data - Serialized inventory data.
   * @param {Map<string, Object>} itemDefinitions - Map of item definitions.
   */
  deserialize(data, itemDefinitions = new Map()) {
    this.maxSlots = data.maxSlots || this.maxSlots;
    this.slots = new Array(this.maxSlots).fill(null);
    this.itemDefinitions = itemDefinitions;

    if (data.slots) {
      for (let i = 0; i < Math.min(data.slots.length, this.maxSlots); i++) {
        if (data.slots[i]) {
          this.slots[i] = Item.fromSerialized(data.slots[i]);
        }
      }
    }
  }
}
