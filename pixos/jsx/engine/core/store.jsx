/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2023 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */
import { store } from 'react-recollect';

export default class Store {
  /**
   * Store
   */
  constructor() {
       // Store setup - session based
       store.pixos = {};
       this.store = store.pixos;
       this.fetchStore = this.fetchStore.bind(this);
       this.addStore = this.addStore.bind(this);
       this.delStore = this.delStore.bind(this);
       this.updateStore = this.updateStore.bind(this);
  }

    /**
   * fetch value from store
   * @param {*} key
   * @returns
   */
    fetchStore(key) {
      return this.store[key];
    }
  
    /**
     * add key to store and returns id
     * @param {*} key
     * @param {*} value
     * @returns
     */
    addStore(key, value) {
      return (this.store[key] = { ...value });
    }
  
    /**
     * update key in store returns number of rows
     * @param {*} key
     * @param {*} changes
     * @returns
     */
    updateStore(key, changes) {
      return (this.store[key] = { ...changes });
    }
  
    /**
     * delete key from store returns number of rows
     * @param {*} key
     * @returns
     */
    delStore(key) {
      return (this.store[key] = null);
    }
}
