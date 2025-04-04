import { zipService } from '../../services/index.js'; // Import the zipService module

function getFilesystemFeatures({ dialogs, setZipFilesystem, setDialogs }) {
  function openConfirmReset() {
    setDialogs({
      ...dialogs,
      reset: {},
    });
  }

  function reset() {
    setZipFilesystem(zipService.createZipFileSystem());
  }

  function closeConfirmReset() {
    setDialogs({
      ...dialogs,
      reset: null,
    });
  }

  return {
    openConfirmReset,
    reset,
    closeConfirmReset,
  };
}

export default getFilesystemFeatures;
