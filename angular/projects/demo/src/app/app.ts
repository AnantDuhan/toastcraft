import { Component, inject, input, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timer } from 'rxjs';
import { ToastRef, ToastService, builtInDesigns } from 'ngx-toastcraft';

@Component({
  selector: 'app-invite-toast',
  template: `
    <strong>{{ name() }} invited you</strong>
    <p>Join the Q4 planning board?</p>
    <button class="accept" (click)="accept()">Accept</button>
  `,
  styles: `
    strong { display: block }
    p { margin: 2px 0 8px; opacity: .8 }
    button { font: inherit; font-weight: 600; border: 0; border-radius: 7px; padding: 6px 12px; background: #2563eb; color: #fff; cursor: pointer }
  `,
})
export class InviteToast {
  name = input.required<string>();
  private toastRef = inject(ToastRef);
  accept() {
    this.toastRef.replace({ type: 'success', title: 'Joined the board', duration: 3000 });
  }
}

@Component({
  selector: 'app-root',
  template: `
    <main>
      <h1>ngx-toastcraft demo</h1>
      <label>Design
        <select (change)="setDesign($any($event.target).value)">
          @for (d of designs; track d) { <option [selected]="d === design()">{{ d }}</option> }
        </select>
      </label>
      <div class="buttons">
        <button id="success" (click)="toast.success('Changes saved', { description: 'Your profile is up to date.' })">Success</button>
        <button id="component" (click)="invite()">Component toast</button>
        <button id="template" (click)="toast.template(tpl, { context: { file: 'report.pdf' }, duration: 0 })">Template toast</button>
        <button id="track" (click)="save()">track() operator</button>
        <button id="http" (click)="brokenRequest()">Failing HTTP request</button>
        <button id="clear" (click)="toast.dismiss()">Dismiss all</button>
      </div>
      <p id="count">Clicks handled: {{ clicks() }}</p>
    </main>

    <ng-template #tpl let-toast let-file="file">
      <strong>{{ file }} uploaded</strong>
      <button class="tpl-close" (click)="clicks.set(clicks() + 1); toast.dismiss()">Got it</button>
    </ng-template>
  `,
  styles: `
    main { font: 15px system-ui; padding: 32px; max-width: 640px }
    .buttons { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 }
    button { font: inherit; padding: 8px 12px; cursor: pointer }
  `,
})
export class App {
  protected toast = inject(ToastService);
  private http = inject(HttpClient);
  protected designs = builtInDesigns;
  protected design = signal('glass');
  protected clicks = signal(0);

  setDesign(design: string) {
    this.design.set(design);
    this.toast.configure({ design });
  }

  invite() {
    this.toast.component(InviteToast, { inputs: { name: 'Priya' }, duration: 0 });
  }

  save() {
    timer(1200)
      .pipe(this.toast.track({ loading: 'Saving report…', success: 'Report saved', error: 'Save failed' }))
      .subscribe(() => this.clicks.set(this.clicks() + 1));
  }

  brokenRequest() {
    this.http.get('/api/does-not-exist').subscribe({ error: () => this.clicks.set(this.clicks() + 1) });
  }
}
