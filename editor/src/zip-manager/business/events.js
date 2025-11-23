function getEventHandlers({
  entries,
  downloads,
  dialogDisplayed,
  onEntriesKeyUp,
  onFoldersKeyUp,
  onHighlightedEntriesKeyUp,
  onAppKeyUp,
  onEntriesKeyDown,
  onHighlightedEntriesKeyDown,
  onSelectedFolderKeyDown,
}) {
  function isInputElement(element) {
    if (!element) return false;
    const tagName = element.tagName.toLowerCase();
    const isEditable = element.isContentEditable;
    const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
    return isInput || isEditable;
  }

  function handleKeyUp(event) {
    // Ignore if focused on input/textarea/select or contenteditable
    if (isInputElement(event.target)) {
      return;
    }
    if (!dialogDisplayed) {
      onEntriesKeyUp(event);
      onFoldersKeyUp(event);
      onHighlightedEntriesKeyUp(event);
      onAppKeyUp(event);
    }
  }

  function handleKeyDown(event) {
    // Ignore if focused on input/textarea/select or contenteditable
    if (isInputElement(event.target)) {
      return;
    }
    if (!dialogDisplayed) {
      onEntriesKeyDown(event);
      onHighlightedEntriesKeyDown(event);
      onSelectedFolderKeyDown(event);
    }
  }

  function handlePageUnload(event) {
    if (entries.length || downloads.length) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  return {
    handlePageUnload,
    handleKeyUp,
    handleKeyDown,
  };
}

export default getEventHandlers;
