const EDITABLE_SELECTOR = [
  'input',
  'textarea',
  'select',
  '[contenteditable]:not([contenteditable="false"])',
  '[role="textbox"]',
  '[role="combobox"]',
  'shreddit-composer',
].join(',');

export function isEditableElement(value: EventTarget | Element | null): boolean {
  if (!(value instanceof Element)) return false;

  if (value.matches(EDITABLE_SELECTOR) || value.closest(EDITABLE_SELECTOR)) {
    return true;
  }

  const root = value.getRootNode();
  return root instanceof ShadowRoot ? isEditableElement(root.host) : false;
}

type KeyboardEventIgnoreOptions = {
  respectDefaultPrevented?: boolean;
  allowShift?: boolean;
};

export function shouldIgnoreKeyboardEvent(
  event: KeyboardEvent,
  document: Document,
  { respectDefaultPrevented = true, allowShift = false }: KeyboardEventIgnoreOptions = {},
): boolean {
  return (
    (respectDefaultPrevented && event.defaultPrevented) ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    (event.shiftKey && !allowShift) ||
    isEditableElement(event.target) ||
    isEditableElement(document.activeElement)
  );
}
