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

export default class Store {
  /**
   * Store
   */
  constructor() {
    if (!Store._instance) {
      this.store = {};
      Store._instance = this;
    }
    return Store._instance;
    // Store setup - session based

  }

  /**
   * Returns a copy of the key-values in the store (note - only a copy is provided)
   * @returns 
   */
  all = () => {
    return Object.assign({}, this.store);
  }

  /**
   * Get list of keys (no values)
   * @returns 
   */
  keys = () => {
    return Object.keys(this.store);
  }

  /**
   * Gets list of values from store (no keys)
   * @returns 
   */
  values = () => {
    return Object.keys(this.store).map(key => this.store[key]);
  }

  /**
   * Return size of keystore
   * @returns 
   */
  size = () => {
    return Object.keys(this.store).length;
  }


  /**
   * fetch value from store
   * @param {*} key
   * @returns
   */
  get = (key) => {
    if (!this.store[key]) {
      throw 'no key set'
    }
    return this.store[key];
  }

  /**
   * add key to store but only if not existing
   * @param {*} key
   * @param {*} value
   * @returns
   * @throws 
   */
  add = (key, value) => {
    if (!!this.store[key]) {
      throw 'key already exists';
    }
    return (this.store[key] = { ...value });
  }

  /**
   * set key in store (no checks for existing - just overwrites)
   * @param {*} key
   * @param {*} changes
   * @returns
   */
  set = (key, changes) => {
    return (this.store[key] = { ...changes });
  }

  /**
   * delete key from store
   * @returns
   */
  delete = (key) => {
    return (this.store[key] = null);
  }
}
