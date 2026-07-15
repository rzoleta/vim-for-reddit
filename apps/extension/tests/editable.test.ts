import { afterEach, describe, expect, it } from 'vitest';
import { isEditableElement, shouldIgnoreKeyboardEvent } from '../lib/editable';
import { element, setDocument } from './helpers';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('editable target detection', () => {
  it.each([
    '<input id="target">',
    '<textarea id="target"></textarea>',
    '<select id="target"><option>one</option></select>',
    '<div contenteditable="true"><span id="target">cursor</span></div>',
    '<div role="textbox"><span id="target">cursor</span></div>',
    '<div role="combobox"><span id="target">cursor</span></div>',
    '<shreddit-composer><div id="target">editor</div></shreddit-composer>',
  ])('recognizes an editable target or descendant: %s', (markup) => {
    setDocument(markup);
    expect(isEditableElement(element('#target'))).toBe(true);
  });

  it('does not treat contenteditable=false or ordinary controls as editable', () => {
    setDocument('<button id="button">vote</button><div id="plain"></div><div id="off" contenteditable="false"></div>');
    expect(isEditableElement(element('#button'))).toBe(false);
    expect(isEditableElement(element('#plain'))).toBe(false);
    expect(isEditableElement(element('#off'))).toBe(false);
    expect(isEditableElement(null)).toBe(false);
  });

  it('walks from an open shadow root back to its editable host', () => {
    setDocument('<div role="textbox" id="host"></div>');
    const shadow = element('#host').attachShadow({ mode: 'open' });
    const child = document.createElement('span');
    shadow.append(child);
    expect(isEditableElement(child)).toBe(true);
  });

  it('recognizes an input inside a shadow root from the event composed path', () => {
    setDocument('<search-box id="host"></search-box>');
    const shadow = element('#host').attachShadow({ mode: 'open' });
    const input = document.createElement('input');
    shadow.append(input);

    const event = new KeyboardEvent('keydown', { key: 'j', bubbles: true, composed: true });
    let shouldIgnore = false;
    document.addEventListener(
      'keydown',
      (dispatchedEvent) => {
        shouldIgnore = shouldIgnoreKeyboardEvent(dispatchedEvent, document);
      },
      { once: true },
    );
    input.dispatchEvent(event);

    expect(event.target).toBe(element('#host'));
    expect(shouldIgnore).toBe(true);
  });

  it('recognizes the deeply focused input when the event target is elsewhere', () => {
    setDocument('<search-box id="host"></search-box>');
    const shadow = element('#host').attachShadow({ mode: 'open' });
    const input = document.createElement('input');
    shadow.append(input);
    input.focus();

    expect(document.activeElement).toBe(element('#host'));
    expect(
      shouldIgnoreKeyboardEvent(new KeyboardEvent('keydown', { key: 'j' }), document),
    ).toBe(true);
  });

  it('suppresses modified, prevented, directly editable, and active-editable key events', () => {
    setDocument('<input id="input"><button id="button">vote</button>');
    const input = element<HTMLInputElement>('#input');
    const button = element('#button');

    expect(
      shouldIgnoreKeyboardEvent(new KeyboardEvent('keydown', { metaKey: true }), document),
    ).toBe(true);
    expect(
      shouldIgnoreKeyboardEvent(new KeyboardEvent('keydown', { ctrlKey: true }), document),
    ).toBe(true);
    expect(
      shouldIgnoreKeyboardEvent(new KeyboardEvent('keydown', { altKey: true }), document),
    ).toBe(true);
    expect(
      shouldIgnoreKeyboardEvent(new KeyboardEvent('keydown', { shiftKey: true }), document),
    ).toBe(true);

    const prevented = new KeyboardEvent('keydown', { cancelable: true });
    prevented.preventDefault();
    expect(shouldIgnoreKeyboardEvent(prevented, document)).toBe(true);
    expect(
      shouldIgnoreKeyboardEvent(prevented, document, { respectDefaultPrevented: false }),
    ).toBe(false);

    input.focus();
    expect(
      shouldIgnoreKeyboardEvent(new KeyboardEvent('keydown', { key: 'j' }), document),
    ).toBe(true);

    button.focus();
    const direct = new KeyboardEvent('keydown', { key: 'j', bubbles: true });
    input.dispatchEvent(direct);
    expect(shouldIgnoreKeyboardEvent(direct, document)).toBe(true);
  });

  it('allows an unmodified key from a non-editable target', () => {
    setDocument('<button id="button">vote</button>');
    const event = new KeyboardEvent('keydown', { key: 'j' });
    expect(shouldIgnoreKeyboardEvent(event, document)).toBe(false);
  });
});
