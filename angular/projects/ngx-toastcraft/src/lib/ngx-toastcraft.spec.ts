import { Component, OnDestroy, TemplateRef, inject, input, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Subject, of, throwError } from 'rxjs';
import { SKIP_ERROR_TOAST, ToastRef, ToastService, provideToastcraft, toastcraftHttpErrors } from '../public-api';

const q = (s: string) => document.querySelectorAll<HTMLElement>(s);
const visible = () => q('.tc-item[data-state="visible"]');
const titles = () => [...visible()].map((el) => el.querySelector('.tc-title')?.textContent ?? '');

let destroyed = 0;

@Component({
  selector: 'test-invite-toast',
  template: `<p class="invite">Invite from {{ name() }}</p><button class="accept" (click)="accept()">Accept</button>`,
})
class InviteToast implements OnDestroy {
  name = input('nobody');
  toastRef = inject(ToastRef);
  accept() {
    this.toastRef.dismiss();
  }

  ngOnDestroy() {
    destroyed++;
  }
}

@Component({
  selector: 'test-host',
  template: `<ng-template #tpl let-toast let-file="file">
    <span class="tpl">Uploaded {{ file }}</span>
    <button class="tpl-close" (click)="toast.dismiss()">Close</button>
  </ng-template>`,
})
class Host {
  tpl = viewChild.required<TemplateRef<any>>('tpl');
}

function setup(...providers: unknown[]) {
  TestBed.configureTestingModule({
    providers: [provideToastcraft({ animation: 'none', design: 'glass' }), ...(providers as never[])],
  });
  return TestBed.inject(ToastService);
}

beforeEach(() => {
  destroyed = 0;
});

describe('ToastService', () => {
  it('shows typed toasts using the provided config', () => {
    const toast = setup();
    toast.success('Saved', { description: 'All changes stored' });
    const el = q('.tc-toast')[0];
    expect(el.dataset['type']).toBe('success');
    expect(el.dataset['design']).toBe('glass');
    expect(titles()).toEqual(['Saved']);
  });

  it('works without provideToastcraft', () => {
    TestBed.configureTestingModule({});
    TestBed.inject(ToastService).info('Hello');
    expect(q('.tc-toast')[0].dataset['design']).toBe('minimal');
  });

  it('runs action callbacks and dismisses', () => {
    const toast = setup();
    let clicked = false;
    toast.show('Deleted', { actions: [{ label: 'Undo', onClick: () => (clicked = true) }] });
    q('.tc-action')[0].click();
    expect(clicked).toBe(true);
    expect(visible().length).toBe(0);
  });

  it('emits events', () => {
    const toast = setup();
    const seen: string[] = [];
    const sub = toast.events.subscribe((e) => seen.push(e.type));
    const id = toast.show('Hi');
    toast.dismiss(id);
    sub.unsubscribe();
    expect(seen).toEqual(['show', 'dismiss']);
  });

  it('removes its toasts when the app is destroyed', () => {
    const toast = setup();
    toast.show('Bye');
    expect(q('.tc-region').length).toBe(1);
    TestBed.resetTestingModule();
    expect(q('.tc-region').length).toBe(0);
  });
});

describe('component toasts', () => {
  it('renders a component with inputs and injects ToastRef', () => {
    const toast = setup();
    toast.component(InviteToast, { inputs: { name: 'Priya' } });
    expect(q('.invite')[0].textContent).toBe('Invite from Priya');
    q('.accept')[0].click();
    expect(visible().length).toBe(0);
    expect(destroyed).toBe(1);
  });

  it('replace() turns a component toast into a plain toast', () => {
    const toast = setup();
    const id = toast.component(InviteToast, { inputs: { name: 'Priya' }, duration: 0 });
    toast.replace(id, { type: 'success', title: 'Joined' });
    expect(q('.invite').length).toBe(0);
    expect(destroyed).toBe(1);
    expect(titles()).toEqual(['Joined']);
    expect(q('.tc-toast')[0].dataset['type']).toBe('success');
  });

  it('destroys the component when dismissed from outside', () => {
    const toast = setup();
    const id = toast.component(InviteToast);
    toast.dismiss(id);
    expect(destroyed).toBe(1);
  });
});

describe('template toasts', () => {
  it('renders a template with context and the ToastRef as $implicit', () => {
    const toast = setup();
    const host = TestBed.createComponent(Host);
    host.detectChanges();
    toast.template(host.componentInstance.tpl(), { context: { file: 'report.pdf' } });
    expect(q('.tpl')[0].textContent).toBe('Uploaded report.pdf');
    q('.tpl-close')[0].click();
    expect(visible().length).toBe(0);
  });
});

describe('track()', () => {
  it('shows loading, then success with the last value', () => {
    const toast = setup();
    const source = new Subject<number>();
    source.pipe(toast.track({ loading: 'Saving', success: (n) => `Saved ${n}`, error: 'Failed' })).subscribe();
    expect(q('.tc-toast')[0].dataset['type']).toBe('loading');
    source.next(1);
    source.next(3);
    source.complete();
    expect(q('.tc-toast')[0].dataset['type']).toBe('success');
    expect(titles()).toEqual(['Saved 3']);
  });

  it('shows the error message and re-throws', () => {
    const toast = setup();
    let caught: unknown;
    throwError(() => new Error('boom'))
      .pipe(toast.track({ loading: 'Saving', success: 'Saved', error: (e) => `Failed: ${(e as Error).message}` }))
      .subscribe({ error: (e) => (caught = e) });
    expect(q('.tc-toast')[0].dataset['type']).toBe('error');
    expect(titles()).toEqual(['Failed: boom']);
    expect(caught).toBeInstanceOf(Error);
  });

  it('dismisses the loading toast when unsubscribed early', () => {
    const toast = setup();
    const sub = new Subject<void>().pipe(toast.track({ loading: 'Saving', success: 'Saved', error: 'Failed' })).subscribe();
    expect(visible().length).toBe(1);
    sub.unsubscribe();
    expect(visible().length).toBe(0);
  });

  it('passes values through unchanged', () => {
    const toast = setup();
    const values: number[] = [];
    of(1, 2).pipe(toast.track({ loading: 'a', success: 'b', error: 'c' })).subscribe((v) => values.push(v));
    expect(values).toEqual([1, 2]);
  });
});

describe('toastcraftHttpErrors()', () => {
  function http(config?: Parameters<typeof toastcraftHttpErrors>[0]) {
    setup(provideHttpClient(withInterceptors([toastcraftHttpErrors(config)])), provideHttpClientTesting());
    return { client: TestBed.inject(HttpClient), ctrl: TestBed.inject(HttpTestingController) };
  }

  it('shows a readable toast and still re-throws', () => {
    const { client, ctrl } = http();
    let failed = false;
    client.get('/api/report').subscribe({ error: () => (failed = true) });
    ctrl.expectOne('/api/report').flush('boom', { status: 500, statusText: 'Server Error' });
    expect(failed).toBe(true);
    expect(q('.tc-toast')[0].dataset['type']).toBe('error');
    expect(titles()).toEqual(['Server error']);
  });

  it('shows one toast for many parallel failures with the same status', () => {
    const { client, ctrl } = http();
    for (const url of ['/a', '/b', '/c']) client.get(url).subscribe({ error: () => {} });
    for (const url of ['/a', '/b', '/c']) ctrl.expectOne(url).error(new ProgressEvent('error'));
    expect(titles()).toEqual(["Can't reach the server"]);
  });

  it('skips requests marked with SKIP_ERROR_TOAST or matching skip()', () => {
    const { client, ctrl } = http({ skip: (e) => e.status === 404 });
    client.get('/x', { context: new HttpContext().set(SKIP_ERROR_TOAST, true) }).subscribe({ error: () => {} });
    client.get('/y').subscribe({ error: () => {} });
    ctrl.expectOne('/x').flush('', { status: 500, statusText: 'Server Error' });
    ctrl.expectOne('/y').flush('', { status: 404, statusText: 'Not Found' });
    expect(visible().length).toBe(0);
  });

  it('uses a custom message', () => {
    const { client, ctrl } = http({ message: (e) => `Oops ${e.status}` });
    client.get('/z').subscribe({ error: () => {} });
    ctrl.expectOne('/z').flush('', { status: 418, statusText: 'Teapot' });
    expect(titles()).toEqual(['Oops 418']);
  });
});
