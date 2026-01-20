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
 * BinaryHeap - A min-heap priority queue implementation for A* pathfinding.
 * Provides O(log n) insertion and O(log n) extraction of minimum element.
 */
export default class BinaryHeap {
  /**
   * Creates an instance of BinaryHeap.
   * @param {Function} compareFunction - Comparison function (a, b) => number.
   *   Returns negative if a < b, positive if a > b, 0 if equal.
   */
  constructor(compareFunction) {
    /** @type {Array} */
    this.heap = [];
    /** @type {Function} */
    this.compare = compareFunction || ((a, b) => a - b);
  }

  /**
   * Gets the size of the heap.
   * @returns {number}
   */
  size() {
    return this.heap.length;
  }

  /**
   * Checks if the heap is empty.
   * @returns {boolean}
   */
  isEmpty() {
    return this.heap.length === 0;
  }

  /**
   * Inserts an element into the heap.
   * @param {*} element - Element to insert.
   */
  push(element) {
    this.heap.push(element);
    this._bubbleUp(this.heap.length - 1);
  }

  /**
   * Removes and returns the minimum element.
   * @returns {*} The minimum element.
   */
  pop() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._bubbleDown(0);
    return min;
  }

  /**
   * Returns the minimum element without removing it.
   * @returns {*} The minimum element.
   */
  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  /**
   * Removes an element from the heap.
   * @param {*} element - Element to remove.
   * @returns {boolean} True if element was found and removed.
   */
  remove(element) {
    const index = this.heap.indexOf(element);
    if (index === -1) return false;

    if (index === this.heap.length - 1) {
      this.heap.pop();
      return true;
    }

    this.heap[index] = this.heap.pop();
    this._bubbleDown(index);
    this._bubbleUp(index);
    return true;
  }

  /**
   * Checks if the heap contains an element.
   * @param {*} element - Element to check.
   * @returns {boolean}
   */
  contains(element) {
    return this.heap.indexOf(element) !== -1;
  }

  /**
   * Clears the heap.
   */
  clear() {
    this.heap = [];
  }

  /**
   * Bubbles up an element to maintain heap property.
   * @private
   * @param {number} index - Index to bubble up.
   */
  _bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parentIndex]) >= 0) {
        break;
      }
      this._swap(index, parentIndex);
      index = parentIndex;
    }
  }

  /**
   * Bubbles down an element to maintain heap property.
   * @private
   * @param {number} index - Index to bubble down.
   */
  _bubbleDown(index) {
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < this.heap.length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }
      if (right < this.heap.length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }

      if (smallest === index) break;
      this._swap(index, smallest);
      index = smallest;
    }
  }

  /**
   * Swaps two elements in the heap.
   * @private
   * @param {number} i - First index.
   * @param {number} j - Second index.
   */
  _swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}
