import { Injectable, signal, effect, computed } from '@angular/core';

@Injectable()
export class PlusingSettingService {

  numA = signal<number>(1); //數字1號
  numB = signal<number>(20); //數字2號

  numC = signal<number>(40000); //數字3號
  numD = signal<number>(3.5); //數字4號
  numE = signal<number>(56666.78); //數字5號

  mode = signal<'add' | 'sub'>('add'); //加減模式

  maxDigit = computed(() => this.mode() === 'add' ? 6 : 3); //最大位數
  digitNow = signal<number>(1); //當前位數

  answer = signal<number>(0); //答案

  constructor() {
    console.log('PlusingSettingService');
    effect(() => {
      if (this.mode() === 'add') {
        this.answer.set(this.numA() + this.numB() + this.numC() + this.numD() + this.numE());
      } else {
        this.answer.set(this.numA() - this.numB() - this.numC() + this.numD() - this.numE());
      }
    });

    //設定初始題目 4+9
    this.numA.set(4);
    this.numB.set(9);
  }


}
