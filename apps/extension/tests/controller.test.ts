import { afterEach, describe, expect, it, vi } from 'vitest';
import { RedditController } from '../lib/controller';
import { installPostComposerBridge } from '../lib/page-bridge';
import { SELECTED_CLASS } from '../lib/selection';
import { element, makeControllerWindow, setDocument } from './helpers';

function dispatchKey(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  document.body.dispatchEvent(event);
  return event;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('RedditController feed behavior', () => {
  it('navigates, highlights, votes, opens, and runs browser history back', () => {
    setDocument(`
      <main>
        <shreddit-post post-id="t3_one" id="post-one">
          <button aria-label="Upvote" id="up-one"></button>
          <button aria-label="Downvote" id="down-one"></button>
          <a slot="title" href="/r/svelte/comments/one/title/" id="link-one">one</a>
        </shreddit-post>
        <shreddit-post post-id="t3_two" id="post-two">
          <button aria-label="Upvote" id="up-two"></button>
          <button aria-label="Downvote" id="down-two"></button>
          <a slot="title" href="/r/svelte/comments/two/title/" id="link-two">two</a>
        </shreddit-post>
      </main>
    `);
    for (const post of document.querySelectorAll<HTMLElement>('shreddit-post')) {
      post.scrollIntoView = vi.fn();
    }
    const up = vi.fn();
    const down = vi.fn();
    const open = vi.fn((event: Event) => event.preventDefault());
    element('#up-one').addEventListener('click', up);
    element('#down-one').addEventListener('click', down);
    element('#link-one').addEventListener('click', open);
    const fakeWindow = makeControllerWindow('https://www.reddit.com/r/svelte/');
    const controller = new RedditController(document, fakeWindow);
    controller.setEnabled(true);

    expect(controller.execute('next')).toBe(true);
    expect(element('#post-one').classList.contains(SELECTED_CLASS)).toBe(true);
    expect(controller.execute('upvote')).toBe(true);
    expect(controller.execute('downvote')).toBe(true);
    expect(up).toHaveBeenCalledOnce();
    expect(down).toHaveBeenCalledOnce();
    expect(controller.execute('open')).toBe(true);
    expect(open).toHaveBeenCalledOnce();
    expect(controller.execute('back')).toBe(true);
    expect(fakeWindow.history.back).toHaveBeenCalledOnce();
  });

  it('starts key handling, permits repeated motion, suppresses repeated actions and editable targets', () => {
    setDocument(`
      <main>
        <shreddit-post post-id="t3_one" id="post-one"><button aria-label="Upvote" id="up-one"></button></shreddit-post>
        <shreddit-post post-id="t3_two" id="post-two"></shreddit-post>
      </main>
      <input id="editor">
    `);
    for (const post of document.querySelectorAll<HTMLElement>('shreddit-post')) post.scrollIntoView = vi.fn();
    const up = vi.fn();
    element('#up-one').addEventListener('click', up);
    const controller = new RedditController(
      document,
      makeControllerWindow('https://www.reddit.com/r/svelte/'),
    );
    controller.start();
    controller.setEnabled(true);

    expect(dispatchKey('j').defaultPrevented).toBe(true);
    expect(controller.feedSelection.current?.id).toBe('post-one');
    expect(dispatchKey('j', { repeat: true }).defaultPrevented).toBe(true);
    expect(controller.feedSelection.current?.id).toBe('post-two');

    controller.execute('previous');
    expect(dispatchKey('u', { repeat: true }).defaultPrevented).toBe(false);
    expect(up).not.toHaveBeenCalled();

    const editableEvent = new KeyboardEvent('keydown', {
      key: 'j',
      bubbles: true,
      cancelable: true,
    });
    element('#editor').dispatchEvent(editableEvent);
    expect(editableEvent.defaultPrevented).toBe(false);
    expect(controller.feedSelection.current?.id).toBe('post-one');

    controller.setEnabled(false);
    expect(dispatchKey('j').defaultPrevented).toBe(false);
    expect(controller.feedSelection.current).toBeNull();
    controller.stop();
  });
});

describe('RedditController post behavior', () => {
  it('navigates from the post into comments and delegates actions by selected item', () => {
    setDocument(`
      <main>
        <shreddit-post post-id="t3_post"></shreddit-post>
        <button aria-label="Add a comment" id="post-reply"></button>
        <shreddit-comment comment-id="t1_parent" id="parent">
          <details open>
            <summary id="parent-toggle">Parent comment</summary>
            <button aria-label="Upvote comment" id="parent-up"></button>
            <button aria-label="Downvote comment" id="parent-down"></button>
            <button aria-label="Reply" id="parent-reply"></button>
            <div>
              <shreddit-comment comment-id="t1_child" id="child">
                <button aria-label="Reply" id="child-reply"></button>
              </shreddit-comment>
            </div>
          </details>
        </shreddit-comment>
        <shreddit-comment comment-id="t1_second" id="second"></shreddit-comment>
      </main>
    `);
    for (const item of document.querySelectorAll<HTMLElement>('shreddit-post, shreddit-comment')) {
      item.scrollIntoView = vi.fn();
    }
    const spies: Record<string, () => void> = {};
    for (const id of ['parent-up', 'parent-down', 'parent-toggle', 'parent-reply', 'post-reply']) {
      const spy = vi.fn();
      spies[id] = spy;
      element(`#${id}`).addEventListener('click', spy);
    }
    const controller = new RedditController(
      document,
      makeControllerWindow('https://www.reddit.com/r/svelte/comments/abc/title/'),
    );
    controller.start();
    controller.setEnabled(true);

    expect(controller.execute('next')).toBe(true);
    expect(controller.commentSelection.current?.getAttribute('post-id')).toBe('t3_post');
    expect(controller.execute('reply')).toBe(true);
    expect(spies['post-reply']).toHaveBeenCalledOnce();

    expect(controller.execute('next')).toBe(true);
    expect(controller.commentSelection.current?.id).toBe('parent');
    expect(controller.execute('upvote')).toBe(true);
    expect(controller.execute('downvote')).toBe(true);
    expect(controller.execute('collapse')).toBe(true);
    expect(element<HTMLDetailsElement>('#parent > details').open).toBe(false);
    expect(controller.execute('collapse')).toBe(true);
    expect(element<HTMLDetailsElement>('#parent > details').open).toBe(false);
    const expandEvent = new KeyboardEvent('keydown', {
      key: 'l',
      bubbles: true,
      cancelable: true,
    });
    expandEvent.preventDefault();
    document.body.dispatchEvent(expandEvent);
    expect(expandEvent.defaultPrevented).toBe(true);
    expect(element<HTMLDetailsElement>('#parent > details').open).toBe(true);
    expect(controller.execute('expand')).toBe(true);
    expect(controller.execute('reply')).toBe(true);
    expect(spies['parent-up']).toHaveBeenCalledOnce();
    expect(spies['parent-down']).toHaveBeenCalledOnce();
    expect(spies['parent-toggle']).toHaveBeenCalledTimes(2);
    expect(spies['parent-reply']).toHaveBeenCalledOnce();

    expect(controller.execute('next')).toBe(true);
    expect(controller.commentSelection.current?.id).toBe('child');
    controller.stop();
  });

  it('comments on the selected post and Esc returns selection to the post', () => {
    setDocument(`
      <main>
        <shreddit-post post-id="t3_post"></shreddit-post>
        <button aria-label="Add a comment" id="post-reply"></button>
        <shreddit-comment comment-id="t1_comment" id="comment">
          <button aria-label="Reply" id="comment-reply"></button>
        </shreddit-comment>
      </main>
    `);
    element('shreddit-post').scrollIntoView = vi.fn();
    element('#comment').scrollIntoView = vi.fn();
    const postReply = vi.fn();
    const commentReply = vi.fn();
    element('#post-reply').addEventListener('click', postReply);
    element('#comment-reply').addEventListener('click', commentReply);
    const controller = new RedditController(
      document,
      makeControllerWindow('https://www.reddit.com/r/svelte/comments/abc/title/'),
    );
    controller.start();
    controller.setEnabled(true);

    expect(dispatchKey('c').defaultPrevented).toBe(true);
    expect(postReply).toHaveBeenCalledOnce();
    expect(dispatchKey('j').defaultPrevented).toBe(true);
    expect(dispatchKey('c').defaultPrevented).toBe(true);
    expect(postReply).toHaveBeenCalledTimes(2);
    expect(commentReply).not.toHaveBeenCalled();
    expect(dispatchKey('j').defaultPrevented).toBe(true);
    expect(dispatchKey('c').defaultPrevented).toBe(true);
    expect(commentReply).toHaveBeenCalledOnce();
    expect(dispatchKey('Escape').defaultPrevented).toBe(true);
    expect(controller.commentSelection.current?.getAttribute('post-id')).toBe('t3_post');
    expect(element('shreddit-post').classList.contains(SELECTED_CLASS)).toBe(true);
    expect(dispatchKey('c').defaultPrevented).toBe(true);
    expect(postReply).toHaveBeenCalledTimes(3);
    controller.stop();
  });

  it('focuses Reddit\'s current post composer when commenting on the post', () => {
    setDocument(`
      <main>
        <shreddit-post post-id="t3_post"></shreddit-post>
        <comment-composer-host id="post-composer-host">
          <shreddit-composer placeholder="Join the conversation">
            <div
              slot="rte"
              contenteditable="true"
              aria-placeholder="Join the conversation"
            ></div>
          </shreddit-composer>
        </comment-composer-host>
      </main>
    `);
    element('shreddit-post').scrollIntoView = vi.fn();
    const composerFocus = vi.fn();
    element('#post-composer-host').focus = composerFocus;
    const removeBridge = installPostComposerBridge(document);
    const controller = new RedditController(
      document,
      makeControllerWindow('https://www.reddit.com/r/svelte/comments/abc/title/'),
    );
    controller.setEnabled(true);

    expect(controller.execute('next')).toBe(true);
    expect(controller.execute('reply')).toBe(true);
    expect(composerFocus).toHaveBeenCalledOnce();
    removeBridge();
  });

  it('returns false for item actions when no current item or native control exists', () => {
    setDocument('<main><shreddit-post></shreddit-post></main>');
    const postController = new RedditController(
      document,
      makeControllerWindow('https://www.reddit.com/comments/abc/title/'),
    );
    postController.setEnabled(true);
    expect(postController.execute('upvote')).toBe(false);
    expect(postController.execute('reply')).toBe(false);

    const disabled = new RedditController(
      document,
      makeControllerWindow('https://www.reddit.com/'),
    );
    expect(disabled.execute('next')).toBe(false);
  });
});
