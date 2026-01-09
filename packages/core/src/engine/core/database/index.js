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
    // Version 2: Add saves table for game state persistence
    this.db.version(2).stores({
      tileset: '++id, name, creator, type, checksum, signature, timestamp',
      inventory: '++id, name, creator, type, checksum, signature, timestamp',
      spirits: '++id, name, creator, type, checksum, signature, timestamp',
      abilities: '++id, name, creator, type checksum, signature, timestamp',
      models: '++id, name, creator, type, checksum, signature, timestamp',
      accounts: '++id, name, type, checksum, signature, timestamp',
      dht: '++id, name, type, ip, checksum, signature, timestamp',
      msg: '++id, name, type, ip, checksum, signature, timestamp',
      tmp: '++id, key, value, timestamp',
      // Save game slots - .pxsave format storage
      saves: '++id, slotId, gameId, timestamp, playTime, checksum',
    });
  }

  /**
   * fetch value
   * @param {*} store
   * @param {*} key
   * @returns
   */
  dbGet = async (store, key) => {
    return await this.db[store].get(key);
  }

  /**
   * add key to db store and returns id
   * @param {*} store
   * @param {*} value
   * @returns
   */
  dbAdd = async (store, value) => {
    return await this.db[store].add({ ...value });
  }

  /**
   * update key to db store returns number of rows
   * @param {*} store
   * @param {*} id
   * @param {*} changes
   * @returns
   */
  dbUpdate = async (store, id, changes) => {
    return await this.db[store].update(id, { ...changes });
  }

  /**
   * update key to db store returns number of rows
   * @param {*} store
   * @param {*} id
   * @returns
   */
  dbRemove = async (store, id) => {
    return await this.db[store].delete(id);
  }
}
