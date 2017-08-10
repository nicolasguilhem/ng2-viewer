import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
            <input type='file' (change)="getFile($event)" >
            <ng2-viewer [src]="imageSrc"></ng2-viewer>`,
  styles: []
})
export class AppComponent {

  imageSrc: File;

  getFile(event) {
    this.imageSrc = event.target.files[0];
  }
}
