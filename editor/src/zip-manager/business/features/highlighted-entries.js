import * as constants from '../constants.js'; // Import the constants module
import { filesystemService } from '../../services/index.js'; // Import the stylesheetService module

function getHighlightedEntriesFeatures({
  disabledCopy,
  disabledCut,
  disabledExtract,
  disabledRename,
  disabledDelete,
  entries,
  highlightedIds,
  highlightedEntry,
  highlightedEntries,
  navigation,
  dialogs,
  setClipboardData,
  setHighlightedIds,
  setNavigation,
  setDialogs,
  zipFilesystem,
  setClickedButtonName,
  refreshSelectedFolder,
  updateHistoryData,
  saveEntries,
  getOptions,
  openDisplayError,
  modifierKeyPressed,
}) {
  const {
    CUT_KEY,
    COPY_KEY,
    EXTRACT_KEY,
    RENAME_KEY,
    CUT_BUTTON_NAME,
    COPY_BUTTON_NAME,
    EXTRACT_BUTTON_NAME,
    RENAME_BUTTON_NAME,
    DELETE_KEYS,
    DELETE_BUTTON_NAME,
  } = constants;

  function copy() {
    setClipboardData({
      entries: highlightedEntries.map((entry) => entry.clone(true)),
    });
  }

  function cut() {
    setClipboardData({
      entries: highlightedEntries,
      cut: true,
    });
  }

  function openPromptRename() {
    setDialogs({
      ...dialogs,
      rename: {
        filename: highlightedEntry.name,
      },
    });
  }

  function rename({ filename }) {
    try {
      if (filename !== highlightedEntry.name) {
        highlightedEntry.rename(filename);
        refreshSelectedFolder();
      }
    } catch (error) {
      openDisplayError(error.message);
    }
  }
  function closePromptRename() {
    setDialogs({
      ...dialogs,
      rename: null,
    });
  }

  function openConfirmDeleteEntries() {
    setDialogs({
      ...dialogs,
      deleteEntries: {},
    });
  }

  function deleteEntries() {
    highlightedEntries.forEach((entry) => zipFilesystem.remove(entry));
    if (entries.length) {
      const indexEntry = Math.max(
        ...entries
          .map((entry, index) => ({ entry, index }))
          .filter(({ entry }) => highlightedIds.includes(entry.id))
          .map(({ index }) => index)
      );
      let indexNextEntry = indexEntry;
      while (indexNextEntry < entries.length && highlightedIds.includes(entries[indexNextEntry].id)) {
        indexNextEntry++;
      }
      if (indexNextEntry === entries.length) {
        indexNextEntry = indexEntry;
        while (indexNextEntry >= 0 && highlightedIds.includes(entries[indexNextEntry].id)) {
          indexNextEntry--;
        }
      }
      if (entries[indexNextEntry]) {
        setNavigation({
          ...navigation,
          previousHighlight: entries[indexNextEntry],
        });
        setHighlightedIds([entries[indexNextEntry].id]);
      } else {
        setNavigation({
          ...navigation,
          previousHighlight: null,
        });
        setHighlightedIds([]);
      }
    }
    updateHistoryData();
    refreshSelectedFolder();
  }

  function closeConfirmDeleteEntries() {
    setDialogs({
      ...dialogs,
      deleteEntries: null,
    });
  }

  function openFile(entry = highlightedEntry) {
    const options = {
      entries: [entry],
      filename: entry.name,
    };

    // todo -- this is where we can add additional
    // functionality to handle the various file types
    // and their locations.

    // ex) if lua - open in lua editor
    // ex) if image - open in image viewer
    // etc.

    // prompt to save file
    if (filesystemService.savePickersSupported()) {
      extract(options);
    } else {
      setDialogs({
        ...dialogs,
        extract: options,
      });
    }
  }

  function extract({ entries = highlightedEntries, filename } = {}) {
    async function download() {
      try {
        const options = getOptions();
        filename = entries.length === 1 ? filename : null;
        await saveEntries(entries, filename, options);
      } catch (error) {
        openDisplayError(error.message);
      }
    }

    download();
  }

  function closePromptExtract() {
    setDialogs({
      ...dialogs,
      extract: null,
    });
  }

  function onHighlightedEntriesKeyUp(event) {
    if (!event.altKey && !modifierKeyPressed(event) && !event.shiftKey) {
      if (DELETE_KEYS.includes(event.key) && !disabledDelete) {
        setClickedButtonName(DELETE_BUTTON_NAME);
      }
    }
  }

  function onHighlightedEntriesKeyDown(event) {
    if (modifierKeyPressed(event)) {
      if (event.key === COPY_KEY && !disabledCopy) {
        setClickedButtonName(COPY_BUTTON_NAME);
        event.preventDefault();
      }
      if (event.key === CUT_KEY && !disabledCut) {
        setClickedButtonName(CUT_BUTTON_NAME);
        event.preventDefault();
      }
      if (event.key === EXTRACT_KEY && !disabledExtract) {
        setClickedButtonName(EXTRACT_BUTTON_NAME);
        event.preventDefault();
      }
      if (event.key === RENAME_KEY && !disabledRename) {
        setClickedButtonName(RENAME_BUTTON_NAME);
        event.preventDefault();
      }
    }
  }

  return {
    copy,
    cut,
    openPromptRename,
    rename,
    closePromptRename,
    openConfirmDeleteEntries,
    deleteEntries,
    closeConfirmDeleteEntries,
    openFile,
    extract,
    closePromptExtract,
    onHighlightedEntriesKeyUp,
    onHighlightedEntriesKeyDown,
  };
}

export default getHighlightedEntriesFeatures;
