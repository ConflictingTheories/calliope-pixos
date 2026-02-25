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

import Inventory from '../inventory/Inventory.js';
import Item from '../inventory/Item.js';

/**
 * InventoryUI - Renders inventory UI overlay on the HUD canvas.
 */
export default class InventoryUI {
  /**
   * Creates an instance of InventoryUI.
   * @param {import('../index.js').default} engine - The engine instance.
   */
  constructor(engine) {
    /** @type {import('../index.js').default} */
    this.engine = engine;
    /** @type {boolean} */
    this.visible = false;
    /** @type {number|null} */
    this.selectedSlot = null;
    /** @type {number} */
    this.slotSize = 48;
    /** @type {number} */
    this.slotSpacing = 4;
    /** @type {number} */
    this.columns = 6;
    /** @type {number} */
    this.rows = 5;
  }

  /**
   * Shows the inventory UI.
   */
  show() {
    this.visible = true;
  }

  /**
   * Hides the inventory UI.
   */
  hide() {
    this.visible = false;
    this.selectedSlot = null;
  }

  /**
   * Toggles inventory visibility.
   */
  toggle() {
    this.visible = !this.visible;
    if (!this.visible) {
      this.selectedSlot = null;
    }
  }

  /**
   * Renders the inventory UI.
   */
  render() {
    if (!this.visible) return;

    const hud = this.engine.hud;
    const ctx = this.engine.ctx;
    if (!ctx || !hud) return;

    const inventory = this.engine.world?.avatar?.inventory;
    if (!inventory) return;

    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;

    // Calculate inventory panel position (centered)
    const panelWidth = (this.slotSize + this.slotSpacing) * this.columns - this.slotSpacing;
    const panelHeight = (this.slotSize + this.slotSpacing) * this.rows - this.slotSpacing;
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;

    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(panelX - 10, panelY - 10, panelWidth + 20, panelHeight + 20);

    // Draw border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX - 10, panelY - 10, panelWidth + 20, panelHeight + 20);

    // Draw title
    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Inventory', width / 2, panelY - 20);

    // Draw slots
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        const slotIndex = row * this.columns + col;
        const x = panelX + col * (this.slotSize + this.slotSpacing);
        const y = panelY + row * (this.slotSize + this.slotSpacing);

        this.drawSlot(ctx, x, y, slotIndex, inventory);
      }
    }

    // Draw selected item info
    if (this.selectedSlot !== null) {
      const item = inventory.getItemAt(this.selectedSlot);
      if (item) {
        this.drawItemInfo(ctx, item, panelX + panelWidth + 20, panelY);
      }
    }
  }

  /**
   * Draws a single inventory slot.
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {number} x - X position.
   * @param {number} y - Y position.
   * @param {number} slotIndex - Slot index.
   * @param {Inventory} inventory - Inventory instance.
   */
  drawSlot(ctx, x, y, slotIndex, inventory) {
    const item = inventory.getItemAt(slotIndex);
    const isSelected = this.selectedSlot === slotIndex;

    // Draw slot background
    ctx.fillStyle = isSelected ? 'rgba(255, 255, 255, 0.3)' : 'rgba(100, 100, 100, 0.5)';
    ctx.fillRect(x, y, this.slotSize, this.slotSize);

    // Draw slot border
    ctx.strokeStyle = isSelected ? '#ffff00' : '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, this.slotSize, this.slotSize);

    if (item) {
      // Draw item icon (placeholder - would load actual texture)
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(item.name.substring(0, 4), x + this.slotSize / 2, y + this.slotSize / 2);

      // Draw quantity if stackable
      if (item.stackable && item.quantity > 1) {
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(item.quantity.toString(), x + this.slotSize - 2, y + this.slotSize - 2);
      }
    }
  }

  /**
   * Draws item information panel.
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {Item} item - Item to display info for.
   * @param {number} x - X position.
   * @param {number} y - Y position.
   */
  drawItemInfo(ctx, item, x, y) {
    const infoWidth = 200;
    const padding = 10;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(x, y, infoWidth, 150);

    // Border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, infoWidth, 150);

    // Item name
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(item.name, x + padding, y + 20);

    // Category
    ctx.fillStyle = '#aaa';
    ctx.font = '12px monospace';
    ctx.fillText(`Category: ${item.category}`, x + padding, y + 40);

    // Description
    if (item.description) {
      ctx.fillStyle = '#ccc';
      ctx.font = '11px monospace';
      const words = item.description.split(' ');
      let line = '';
      let lineY = y + 60;
      for (const word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > infoWidth - padding * 2 && line.length > 0) {
          ctx.fillText(line, x + padding, lineY);
          line = word + ' ';
          lineY += 15;
        } else {
          line = testLine;
        }
      }
      if (line.length > 0) {
        ctx.fillText(line, x + padding, lineY);
      }
    }

    // Quantity
    if (item.stackable) {
      ctx.fillStyle = '#aaa';
      ctx.font = '12px monospace';
      ctx.fillText(`Quantity: ${item.quantity}`, x + padding, y + 130);
    }
  }

  /**
   * Handles mouse click on inventory UI.
   * @param {number} x - Mouse X coordinate.
   * @param {number} y - Mouse Y coordinate.
   */
  handleClick(x, y) {
    if (!this.visible) return false;

    const inventory = this.engine.world?.avatar?.inventory;
    if (!inventory) return false;

    const canvas = this.engine.ctx?.canvas;
    if (!canvas) return false;

    const width = canvas.width;
    const height = canvas.height;

    const panelWidth = (this.slotSize + this.slotSpacing) * this.columns - this.slotSpacing;
    const panelHeight = (this.slotSize + this.slotSpacing) * this.rows - this.slotSpacing;
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;

    // Check if click is within inventory panel
    if (x < panelX || x > panelX + panelWidth || y < panelY || y > panelY + panelHeight) {
      return false;
    }

    // Calculate which slot was clicked
    const relX = x - panelX;
    const relY = y - panelY;
    const col = Math.floor(relX / (this.slotSize + this.slotSpacing));
    const row = Math.floor(relY / (this.slotSize + this.slotSpacing));
    const slotIndex = row * this.columns + col;

    if (slotIndex >= 0 && slotIndex < inventory.maxSlots) {
      // Toggle selection or use item
      if (this.selectedSlot === slotIndex) {
        // Use item if double-clicked or right-clicked
        inventory.useItem(slotIndex, { engine: this.engine });
        this.selectedSlot = null;
      } else {
        this.selectedSlot = slotIndex;
      }
      return true;
    }

    return false;
  }
}
