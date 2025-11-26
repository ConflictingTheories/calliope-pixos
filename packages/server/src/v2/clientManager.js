/**
 * High level Client Manager - todo - will support additional cleanup, analytics, debug, etc
 */
export default class ClientManager {
  constructor() {
    /** @type {Map<string, Client>} */
    this.clients = new Map();
  }

  /**
   * 
   * @param {string} id 
   * @returns {any}
   */
  getClient(id) {
    if (!this.clients.has(id)) return;
    return this.clients.get(id);
  }

  /**
 * 
 * @param {string} clientId 
 * @param {Client} clientData 
 * @returns {void}
 */
  setClient(clientId, clientData) {
    const client = new Client(clientId, clientData);
    this.clients.set(clientId, client);

    console.log(`Client ${clientId} connected`);
    client.sendMessage('connected', clientId);
  }


}

/**
 * Websocket Client wrapper
 */
export class Client {
  constructor(id, clientData) {
    this.id = id;
    this.ws = clientData.ws;
    this.zoneId = clientData.zoneId || null;
    this.avatar = clientData.avatar || null;
  }

  /**
 * 
 * @return {string} zoneId 
 */
  getZoneId() {
    return this.zoneId;
  }

  /**
   * 
   * @param {string} zoneId 
   */
  setZoneId(zoneId) {
    this.zoneId = zoneId;
  }

  /**
* 
* @return {string} 
*/
  getAvatar() {
    return this.avatar;
  }

  /**
   * 
   * @param {string} avatar 
   */
  setAvatar(avatar) {
    this.avatar = avatar;
  }

  /**
   * 
   * @returns {boolean}
   */
  isReady() {
    return this.ws && this.ws.readyState === 1;
  }

  /**
   * 
   * @param {string} type 
   * @param {any} payload 
   */
  sendMessage(type, payload) {
    this.ws.send(JSON.stringify({ type, payload }));
  }
}