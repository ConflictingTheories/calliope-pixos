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
 * Store - A singleton key-value store for game state and session data.
 */
export default class Store {
  /**
   * Creates an instance of Store.
   * @returns {Store} The singleton instance.
   */
  constructor() {
    if (!Store._instance) {
      /** @type {Object.<string, any>} */
      this.store = {};
      Store._instance = this;
    }
    return Store._instance;
    // Store setup - session based
  }

  /**
   * Returns a copy of the key-values in the store (note - only a copy is provided).
   * @returns {Object.<string, any>} A copy of the store object.
   */
  all = () => {
    return Object.assign({}, this.store);
  }

  /**
   * Gets list of keys (no values).
   * @returns {string[]} Array of keys.
   */
  keys = () => {
    return Object.keys(this.store);
  }

  /**
   * Gets list of values from store (no keys).
   * @returns {any[]} Array of values.
   */
  values = () => {
    return Object.keys(this.store).map(key => this.store[key]);
  }

  /**
   * Returns size of keystore.
   * @returns {number} The number of keys in the store.
   */
  size = () => {
    return Object.keys(this.store).length;
  }


  /**
   * Fetches value from store.
   * @param {string} key - The key to retrieve.
   * @returns {any} The value associated with the key.
   * @throws {string} If the key does not exist.
   */
  get = (key) => {
    if (!this.store[key]) {
      throw 'no key set';
    }
    return this.store[key];
  }

  /**
   * Adds key to store but only if not existing.
   * @param {string} key - The key to add.
   * @param {any} value - The value to store.
   * @returns {any} The stored value.
   * @throws {string} If the key already exists.
   */
  add = (key, value) => {
    if (!!this.store[key]) {
      throw 'key already exists';
    }
    return (this.store[key] = { ...value });
  }

  /**
   * Sets key in store (no checks for existing - just overwrites).
   * @param {string} key - The key to set.
   * @param {any} changes - The value to store.
   * @returns {any} The stored value.
   */
  set = (key, changes) => {
    return (this.store[key] = { ...changes });
  }

  /**
   * Deletes key from store.
   * @param {string} key - The key to delete.
   * @returns {null} Null.
   */
  delete = (key) => {
    return (this.store[key] = null);
  }
}
