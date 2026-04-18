import { Injectable, signal } from '@angular/core';

@Injectable()
export class PlusingSettingService {

  numA = signal<number>(0); //數字1號
  numB = signal<number>(0); //數字2號

  numC = signal<number>(0); //數字3號
  numD = signal<number>(0); //數字4號
  numE = signal<number>(0); //數字5號

  mode = signal<'add' | 'sub'>('add'); //加減模式

  constructor() {
    console.log('PlusingSettingService');
  }
  
  
}
