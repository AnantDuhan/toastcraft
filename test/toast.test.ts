import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createToaster, listDesigns, registerDesign, type ToastApi } from '../src';

let toast: ToastApi;
const q = (s: string) => document.querySelectorAll<HTMLElement>(s);

beforeEach(() => {
  vi.useFakeTimers();
  toast = createToaster({ animation: 'none' });
});
afterEach(() => {
  toast.toaster.destroy();
  vi.useRealTimers();
});

describe('toastcraft', () => {
  it('ships at least 10 designs', () => {
    expect(listDesigns().length).toBeGreaterThanOrEqual(10);
  });

  it('renders title, description, type and design', () => {
    toast.success('Saved', { description: 'All changes stored', design: 'neon' });
    const t = q('.tc-toast')[0];
    expect(t.dataset.type).toBe('success');
    expect(t.dataset.design).toBe('neon');
    expect(t.querySelector('.tc-title')!.textContent).toBe('Saved');
    expect(t.querySelector('.tc-desc')!.textContent).toBe('All changes stored');
    expect(t.getAttribute('role')).toBe('status');
  });

  it('escapes text unless html is enabled', () => {
    toast('<b>x</b>');
    expect(q('.tc-title')[0].innerHTML).toBe('&lt;b&gt;x&lt;/b&gt;');
    toast('<b>y</b>', { html: true });
    expect(q('.tc-title b').length).toBe(1);
  });

  it('auto-dismisses after duration and pauses on hover', () => {
    toast('Hi', { duration: 1000 });
    const t = q('.tc-toast')[0];
    vi.advanceTimersByTime(500);
    t.dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(5000);
    expect(t.closest('.tc-item')!.getAttribute('data-state')).toBe('visible');
    t.dispatchEvent(new Event('mouseleave'));
    vi.advanceTimersByTime(499);
    expect(t.closest('.tc-item')!.getAttribute('data-state')).toBe('visible');
    vi.advanceTimersByTime(2);
    expect(t.closest('.tc-item')!.getAttribute('data-state')).toBe('leave');
  });

  it('updates an existing toast when reusing an id', () => {
    toast('One', { id: 'job' });
    toast('Two', { id: 'job' });
    expect(q('.tc-toast').length).toBe(1);
    expect(q('.tc-title')[0].textContent).toBe('Two');
  });

  it('respects maxVisible with dismiss-oldest', () => {
    toast.configure({ maxVisible: 2 });
    toast('a'); toast('b'); toast('c');
    expect(q('.tc-item[data-state="visible"]').length).toBe(2);
  });

  it('queues overflow when configured', () => {
    toast.configure({ maxVisible: 1, overflow: 'queue' });
    toast('a', { duration: 100 });
    toast('b');
    expect(q('.tc-toast').length).toBe(1);
    vi.advanceTimersByTime(200);
    expect(q('.tc-title')[0].textContent).toBe('b');
  });

  it('handles promises', async () => {
    const p = toast.promise(Promise.resolve(42), {
      loading: 'Uploading',
      success: (n) => `Done: ${n}`,
      error: 'Failed',
    });
    expect(q('.tc-toast')[0].dataset.type).toBe('loading');
    await p;
    await Promise.resolve();
    expect(q('.tc-toast')[0].dataset.type).toBe('success');
    expect(q('.tc-title')[0].textContent).toBe('Done: 42');
  });

  it('runs actions and dismisses', () => {
    const onClick = vi.fn();
    const onDismiss = vi.fn();
    toast('Deleted', { actions: [{ label: 'Undo', onClick }], onDismiss });
    q('.tc-action')[0].click();
    expect(onClick).toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalledWith(expect.anything(), 'action');
  });

  it('applies per-type defaults and global colors', () => {
    toast.configure({ typeDefaults: { error: { design: 'brutalist' } }, colors: { error: 'rgb(1, 2, 3)' } });
    toast.error('Nope');
    expect(q('.tc-toast')[0].dataset.design).toBe('brutalist');
    expect(q('.tc-toast')[0].getAttribute('role')).toBe('alert');
    expect(q('.tc-region')[0].style.getPropertyValue('--tc-c-error')).toBe('rgb(1, 2, 3)');
  });

  it('supports custom render with cleanup', () => {
    const cleanup = vi.fn();
    const id = toast.custom((el) => {
      el.innerHTML = '<p class="mine">custom</p>';
      return cleanup;
    });
    expect(q('.mine').length).toBe(1);
    toast.dismiss(id);
    expect(cleanup).toHaveBeenCalled();
  });

  it('registers custom designs', () => {
    registerDesign('sunset', '& { --tc-bg: orange; }');
    expect(listDesigns()).toContain('sunset');
    toast('x', { design: 'sunset' });
    expect(document.getElementById('toastcraft-styles')!.textContent).toContain('[data-design="sunset"]');
  });

  it('rejects invalid custom design names', () => {
    expect(() =>
      registerDesign('bad;body{display:none}', '.tc-item {}')
    ).toThrow('Invalid design name');

    expect(() =>
      registerDesign('bad selector', '.tc-item {}')
    ).toThrow('Invalid design name');
  });

  it('escapes HTML by default', () => {
    const toaster = createToaster();

    toaster.success('<img src=x onerror=alert(1)>');

    const item = document.querySelector('.tc-item');

    expect(item?.querySelector('img')).toBeNull();
    expect(item?.textContent).toContain('<img src=x onerror=alert(1)>');
  });
});
