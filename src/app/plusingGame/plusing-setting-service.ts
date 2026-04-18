import { Injectable, signal, effect, computed } from '@angular/core';

@Injectable()
export class PlusingSettingService {

  numA = signal<number>(1); //數字1號
  numB = signal<number>(20); //數字2號
  numC = signal<number>(40000); //數字3號
  numD = signal<number>(3.5); //數字4號
  numE = signal<number>(56666.78); //數字5號

  //預設為加法模式 (減法模式只有最多兩個減號)
  mode = signal<'add' | 'sub'>('add'); //加減模式
  howManyNumbers = signal<number>(2); //有幾個數字(加或減)
  // 2個數字: A+B  /  A-B
  // 3個數字: A+B+C  /  A+B-C
  // 4個數字: A+B+C+D / A+B-C+D
  // 5個數字: A+B+C+D+E / A+B-C+D-E

  maxDigit = computed(() => this.mode() === 'add' ? 6 : 3); //最大位數
  // 1: 個位數 2: 十位數 3: 百位數 4: 千位數 5: 萬位數
  digitNow = signal<number>(1); //當前位數
  decimalPoint = signal<0|1|2>(0); //小數點後幾位

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

  }


}
