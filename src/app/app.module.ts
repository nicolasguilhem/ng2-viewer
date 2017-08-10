import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { Ng2ViewerComponent } from './ng2-viewer/ng2-viewer.component';

@NgModule({
  declarations: [
    AppComponent,
    Ng2ViewerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [Ng2ViewerComponent]
})
export class AppModule { }
