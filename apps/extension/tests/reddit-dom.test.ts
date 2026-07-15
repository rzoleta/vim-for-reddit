import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clickNativeControl,
  findActionControl,
  findPostLink,
  findPostReplyControl,
  getFeedPosts,
  getPostPagePost,
  getStableElementKey,
  getVisibleComments,
  isVisibleComment,
  setCommentExpanded,
} from '../lib/reddit-dom';
import { element, setDocument } from './helpers';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('new Reddit DOM discovery', () => {
  it('discovers visible shreddit posts in main and excludes hidden posts and unrelated copies', () => {
    setDocument(`
      <shreddit-post id="outside"></shreddit-post>
      <main>
        <shreddit-post id="post-1"></shreddit-post>
        <section hidden><shreddit-post id="post-hidden"></shreddit-post></section>
        <shreddit-post id="post-2"></shreddit-post>
      </main>
    `);
    expect(getFeedPosts(document).map((post) => post.id)).toEqual(['post-1', 'post-2']);
    expect(getPostPagePost(document)?.id).toBe('post-1');
  });

  it('falls back to document-wide post discovery when there is no main feed', () => {
    setDocument('<shreddit-post id="post"></shreddit-post>');
    expect(getFeedPosts(document).map((post) => post.id)).toEqual(['post']);
  });

  it('keeps visible comments in document order while filtering hidden and collapsed descendants', () => {
    setDocument(`
      <main>
        <shreddit-comment id="first" comment-id="t1_first">
          <div><shreddit-comment id="first-child" comment-id="t1_first_child"></shreddit-comment></div>
        </shreddit-comment>
        <shreddit-comment id="collapsed" collapsed comment-id="t1_collapsed">
          <div><shreddit-comment id="under-collapsed"></shreddit-comment></div>
        </shreddit-comment>
        <div aria-hidden="true"><shreddit-comment id="aria-hidden"></shreddit-comment></div>
        <div style="display:none"><shreddit-comment id="display-hidden"></shreddit-comment></div>
        <shreddit-comment id="last" comment-id="t1_last"></shreddit-comment>
      </main>
    `);

    expect(getVisibleComments(document).map((comment) => comment.id)).toEqual([
      'first',
      'first-child',
      'collapsed',
      'last',
    ]);
    expect(isVisibleComment(element('#under-collapsed'))).toBe(false);
    expect(isVisibleComment(element('#collapsed'))).toBe(true);
  });

  it('treats descendants of a closed Reddit details thread as collapsed', () => {
    setDocument(`
      <shreddit-comment id="parent">
        <details>
          <summary>Parent</summary>
          <shreddit-comment id="child"></shreddit-comment>
        </details>
      </shreddit-comment>
    `);

    expect(isVisibleComment(element('#parent'))).toBe(true);
    expect(isVisibleComment(element('#child'))).toBe(false);
    element<HTMLDetailsElement>('#parent > details').open = true;
    expect(isVisibleComment(element('#child'))).toBe(true);
  });

});

describe('native Reddit controls', () => {
  it('locates each action by semantic new-Reddit attributes and clicks it natively', () => {
    setDocument(`
      <shreddit-comment id="comment">
        <button aria-label="Upvote comment" id="up"></button>
        <button data-testid="downvote-button" id="down"></button>
        <button aria-label="Collapse comment" id="collapse"></button>
        <button slot="reply-button" id="reply"></button>
      </shreddit-comment>
    `);
    const clicks = new Map<string, ReturnType<typeof vi.fn>>();
    for (const id of ['up', 'down', 'collapse', 'reply']) {
      const spy = vi.fn();
      clicks.set(id, spy);
      element(`#${id}`).addEventListener('click', spy);
    }

    const comment = element('#comment');
    expect(findActionControl(comment, 'upvote')?.id).toBe('up');
    expect(findActionControl(comment, 'downvote')?.id).toBe('down');
    expect(findActionControl(comment, 'collapse')?.id).toBe('collapse');
    expect(findActionControl(comment, 'reply')?.id).toBe('reply');
    expect(clickNativeControl(findActionControl(comment, 'upvote'))).toBe(true);
    expect(clicks.get('up')).toHaveBeenCalledOnce();
  });

  it('searches controls nested in open shadow roots, including the scope root', () => {
    setDocument('<shreddit-comment id="comment"></shreddit-comment>');
    const shadow = element('#comment').attachShadow({ mode: 'open' });
    const button = document.createElement('button');
    button.setAttribute('aria-label', 'Upvote comment');
    shadow.append(button);
    expect(findActionControl(element('#comment'), 'upvote')).toBe(button);
  });

  it('supports the current Shreddit post and comment action contracts', () => {
    setDocument(`
      <shreddit-post id="post"></shreddit-post>
      <shreddit-comment id="comment">
        <details open>
          <summary id="collapse">Comment</summary>
          <shreddit-comment-action-row id="actions">
            <button slot="comment-reply" id="reply">Reply</button>
          </shreddit-comment-action-row>
        </details>
      </shreddit-comment>
    `);
    const postShadow = element('#post').attachShadow({ mode: 'open' });
    postShadow.innerHTML = `
      <button upvote data-action-bar-action="upvote" id="post-up">Upvote</button>
      <button downvote data-action-bar-action="downvote" id="post-down">Downvote</button>
    `;
    const actionShadow = element('#actions').attachShadow({ mode: 'open' });
    actionShadow.innerHTML = `
      <button upvote id="comment-up">Upvote</button>
      <button downvote id="comment-down">Downvote</button>
      <slot name="comment-reply"></slot>
    `;

    expect(findActionControl(element('#post'), 'upvote')?.id).toBe('post-up');
    expect(findActionControl(element('#post'), 'downvote')?.id).toBe('post-down');
    expect(findActionControl(element('#comment'), 'upvote')?.id).toBe('comment-up');
    expect(findActionControl(element('#comment'), 'downvote')?.id).toBe('comment-down');
    expect(findActionControl(element('#comment'), 'collapse')?.id).toBe('collapse');
    expect(findActionControl(element('#comment'), 'reply')?.id).toBe('reply');
    expect(setCommentExpanded(element('#comment'), false)).toBe(true);
    expect(element<HTMLDetailsElement>('#comment > details').open).toBe(false);
    expect(setCommentExpanded(element('#comment'), false)).toBe(true);
    expect(element<HTMLDetailsElement>('#comment > details').open).toBe(false);
    expect(setCommentExpanded(element('#comment'), true)).toBe(true);
    expect(element<HTMLDetailsElement>('#comment > details').open).toBe(true);
  });

  it('does not borrow an action control from a nested reply', () => {
    setDocument(`
      <shreddit-comment id="parent">
        <shreddit-comment id="child">
          <button slot="comment-reply" id="child-reply">Reply</button>
        </shreddit-comment>
      </shreddit-comment>
    `);

    expect(findActionControl(element('#parent'), 'reply')).toBeNull();
    expect(findActionControl(element('#child'), 'reply')?.id).toBe('child-reply');
  });

  it('finds the post reply composer and canonical comment permalink', () => {
    setDocument(`
      <main>
        <shreddit-post id="post">
          <a href="/r/svelte/comments/abc/title/">comments</a>
        </shreddit-post>
        <button aria-label="Add a comment" id="post-reply"></button>
      </main>
    `);
    expect(findPostReplyControl(document)?.id).toBe('post-reply');
    expect(findPostLink(element('#post'))?.pathname).toBe('/r/svelte/comments/abc/title/');
  });

  it('does not click missing or disabled native controls', () => {
    setDocument('<button id="disabled" disabled></button><button id="aria" aria-disabled="true"></button>');
    expect(clickNativeControl(null)).toBe(false);
    expect(clickNativeControl(element('#disabled'))).toBe(false);
    expect(clickNativeControl(element('#aria'))).toBe(false);
  });

  it('uses stable Reddit identifiers before permalink fallback', () => {
    setDocument(`
      <shreddit-post id="post-id" post-id="t3_abc"><a href="/comments/abc/title/">open</a></shreddit-post>
      <shreddit-post id="fallback"><a href="/comments/xyz/title/">open</a></shreddit-post>
      <shreddit-post id="empty"></shreddit-post>
    `);
    expect(getStableElementKey(element('#post-id'))).toBe('post-id:t3_abc');
    expect(getStableElementKey(element('#fallback'))).toBe('id:fallback');
    element('#fallback').removeAttribute('id');
    expect(getStableElementKey(document.querySelectorAll<HTMLElement>('shreddit-post')[1])).toBe(
      'href:/comments/xyz/title/',
    );
    expect(getStableElementKey(element('#empty'))).toBe('id:empty');
    element('#empty').removeAttribute('id');
    expect(getStableElementKey(document.querySelectorAll<HTMLElement>('shreddit-post')[2])).toBeNull();
  });
});
