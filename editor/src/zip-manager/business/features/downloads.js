import { downloadService } from '../../services/index.js'; // Import the downloadService module

function getDownloadsFeatures({ setDownloads }) {
  function abortDownload(deletedDownload) {
    removeDownload(deletedDownload);
    downloadService.abortDownload(deletedDownload.controller);
  }

  function removeDownload(deletedDownload) {
    setDownloads((downloads) => ({
      ...downloads,
      queue: downloads.queue.filter((download) => download.id !== deletedDownload.id),
    }));
  }

  return {
    removeDownload,
    abortDownload,
  };
}

export default getDownloadsFeatures;
