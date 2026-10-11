/*
 * ---------------------------------------------------------------
 *                     PixoSpritz – Editor – useConfirm
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Hook for confirmation dialogs. Replaces native confirm() with the
 * ui Modal component. Ensures destructive actions require explicit
 * user confirmation.
 */

import React, { useState, useCallback } from 'react';
import { Modal, Button } from '../../ui';

/**
 * Hook that provides a confirm dialog.
 * @returns {{ confirm: (message: string) => Promise<boolean>, ConfirmDialog: React.Component }}
 */
export function useConfirm() {
  const [state, setState] = useState(null);

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setState({ message, resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (state) {
      state.resolve(true);
      setState(null);
    }
  }, [state]);

  const handleCancel = useCallback(() => {
    if (state) {
      state.resolve(false);
      setState(null);
    }
  }, [state]);

  const ConfirmDialog = useCallback(() => {
    if (!state) return null;
    return (
      <Modal open={true} onClose={handleCancel} title="Confirm">
        <p>{state.message}</p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button appearance="primary" onClick={handleConfirm}>
            Confirm
          </Button>
        </div>
      </Modal>
    );
  }, [state, handleConfirm, handleCancel]);

  return { confirm, ConfirmDialog };
}
