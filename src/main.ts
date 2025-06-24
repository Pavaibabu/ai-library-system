import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { enableProdMode } from '@angular/core';


ModuleRegistry.registerModules([ClientSideRowModelModule]);


bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
