import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import { platformBrowserTesting } from '@angular/platform-browser/testing';
// 初始化 Angular 測試環境
getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting(),
);
