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
    
    // Check if we're inside the cutscene tool at all - if so, ignore all zip manager keyboard shortcuts
    let current = element;
    while (current) {
      if (current.className && typeof current.className === 'string') {
        if (current.className.includes('cutscene-tool')) {
          return true; // Always ignore events inside cutscene tool
        }
      }
      current = current.parentElement;
    }
    
    // Check if it's an input element
    const tagName = element.tagName.toLowerCase();
    const isEditable = element.isContentEditable;
    const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
    
    // Check if it's inside an rsuite component or any interactive component
    current = element;
    while (current) {
      // Check for rsuite classes
      if (current.className && typeof current.className === 'string') {
        if (current.className.includes('rs-picker') || 
            current.className.includes('rs-input') ||
            current.className.includes('rs-btn') ||
            current.className.includes('editor-panel')) {
          return true;
        }
      }
      // Check for contenteditable or input-related attributes
      if (current.isContentEditable || current.getAttribute('contenteditable') === 'true') {
        return true;
      }
      current = current.parentElement;
    }
    
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
