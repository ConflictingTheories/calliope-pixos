/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2022 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */
import Dexie from 'dexie';

export default class Database {
  /**
   * Database
   */
  constructor() {
    this.db = new Dexie('hyperspace');
    this.db.version(1).stores({
      tileset: '++id, name, creator, type, checksum, signature, timestamp', // Primary key and indexed props
      inventory: '++id, name, creator, type, checksum, signature, timestamp', // Primary key and indexed props
      spirits: '++id, name, creator, type, checksum, signature, timestamp', // Primary key and indexed props
      abilities: '++id, name, creator, type checksum, signature, timestamp', // Primary key and indexed props
      models: '++id, name, creator, type, checksum, signature, timestamp', // Primary key and indexed props
      accounts: '++id, name, type, checksum, signature, timestamp', // Primary key and indexed props
      dht: '++id, name, type, ip, checksum, signature, timestamp', // Primary key and indexed props
      msg: '++id, name, type, ip, checksum, signature, timestamp', // Primary key and indexed props
      tmp: '++id, key, value, timestamp', // key-store
    });
    this.dbAdd = this.dbAdd.bind(this);
    this.dbGet = this.dbGet.bind(this);
    this.dbRemove = this.dbRemove.bind(this);
    this.dbUpdate = this.dbUpdate.bind(this);
  }

  /**
   * fetch value
   * @param {*} store
   * @param {*} key
   * @returns
   */
  async dbGet(store, key) {
    return await this.db[store].get(key);
  }

  /**
   * add key to db store and returns id
   * @param {*} store
   * @param {*} value
   * @returns
   */
  async dbAdd(store, value) {
    return await this.db[store].add({ ...value });
  }

  /**
   * update key to db store returns number of rows
   * @param {*} store
   * @param {*} id
   * @param {*} changes
   * @returns
   */
  async dbUpdate(store, id, changes) {
    return await this.db[store].update(id, { ...changes });
  }

  /**
   * update key to db store returns number of rows
   * @param {*} store
   * @param {*} id
   * @returns
   */
  async dbRemove(store, id) {
    return await this.db[store].delete(id);
  }
}
