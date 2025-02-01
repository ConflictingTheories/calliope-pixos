import { useEffect } from 'react';
import { keyboardService } from '../services/index.js'; // Import the i18nService module
import { windowService } from '../services/index.js'; // Import the i18nService module


function getHooks() {
  function useKeyUp(handleKeyUp) {
    useEffect(registerKeyUpHandler);

    function registerKeyUpHandler() {
      keyboardService.addKeyUpListener(handleKeyUp);
      return () => keyboardService.removeKeyUpListener(handleKeyUp);
    }
  }

  function useKeyDown(handleKeyDown) {
    useEffect(registerKeyDownHandler);

    function registerKeyDownHandler() {
      keyboardService.addKeyDownListener(handleKeyDown);
      return () => keyboardService.removeKeyDownListener(handleKeyDown);
    }
  }

  function usePageUnload(handlePageUnload) {
    useEffect(registerPageUnloadHandler);

    function registerPageUnloadHandler() {
      windowService.addUnloadListener(handlePageUnload);
      return () => windowService.removeUnloadListener(handlePageUnload);
    }
  }

  return { useKeyUp, useKeyDown, usePageUnload };
}

export { getHooks };
