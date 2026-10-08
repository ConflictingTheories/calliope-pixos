/**
 * PixoSpritz editor — SVRN bundle upload interface.
 *
 * The SVRN hub does not exist yet, so there is deliberately NO network
 * layer here. This module defines the upload contract the future hub
 * client will implement, plus working local targets so "Publish to SVRN"
 * is useful today (produce the bundle file, hand it to the hub later).
 *
 * Upload target contract:
 *
 *   {
 *     name: string,                       // e.g. 'local-download', 'svrn-hub'
 *     upload({ bytes, manifest, filename, onProgress }): Promise<{ url?: string|null, ... }>
 *   }
 *
 * `uploadBundle(bundle, target)` validates both sides and delegates.
 * When the hub exists, implement a target with this shape — no changes
 * to the editor's publish flow are needed.
 */

import { BUNDLE_MIME } from './bundle.js';

/** Thrown when code tries to upload to the hub before it exists. */
export class SvrnHubNotAvailableError extends Error {
  constructor(
    message = 'SVRN hub upload is not available yet: the hub does not exist. ' +
      'The bundle was built locally — use the local-download target for now.'
  ) {
    super(message);
    this.name = 'SvrnHubNotAvailableError';
    this.code = 'svrn-hub-not-available';
  }
}

/**
 * Upload a bundle through a target.
 * @param {{ bytes: Uint8Array, manifest: object, filename: string }} bundle
 * @param {{ name: string, upload: Function }} target
 * @param {object} [opts] - { onProgress?: (ratio: number) => void }
 */
export async function uploadBundle(bundle, target, opts = {}) {
  if (!bundle || !(bundle.bytes instanceof Uint8Array)) {
    throw new Error('uploadBundle: bundle.bytes (Uint8Array) is required');
  }
  if (!bundle.manifest || typeof bundle.manifest !== 'object') {
    throw new Error('uploadBundle: bundle.manifest is required');
  }
  if (!target || typeof target.upload !== 'function') {
    throw new Error('uploadBundle: target with an upload() function is required');
  }
  return target.upload({
    bytes: bundle.bytes,
    manifest: bundle.manifest,
    filename: bundle.filename,
    onProgress: typeof opts.onProgress === 'function' ? opts.onProgress : () => {},
  });
}

/**
 * Local target: saves the `.svrn` file via the browser download mechanism.
 * This is the default target until the hub exists.
 */
export const localDownloadTarget = {
  name: 'local-download',
  async upload({ bytes, filename }) {
    const blob = new Blob([bytes], { type: BUNDLE_MIME });
    const url = URL.createObjectURL(blob);
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
    return { url: null, local: true, filename };
  },
};

/**
 * Future hub target. The `upload` implementation is intentionally a stub:
 * when the SVRN hub exists, replace the throw with the real client call
 * (POST the bytes + manifest to the hub ingestion endpoint, report
 * progress via onProgress, resolve with the canonical bundle URL).
 */
export function createHubTarget({ endpoint = null } = {}) {
  return {
    name: 'svrn-hub',
    endpoint,
    async upload() {
      throw new SvrnHubNotAvailableError();
    },
  };
}
