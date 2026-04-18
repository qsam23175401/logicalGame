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
  howManyNumbers = signal<number>(2); //有2~5個數字(加或減)
  // 2個數字: A+B  /  A-B
  // 3個數字: A+B+C  /  A+B-C
  // 4個數字: A+B+C+D / A+B-C+D
  // 5個數字: A+B+C+D+E / A+B-C+D-E

  // 1: 個位數 2: 十位數 3: 百位數 4: 千位數 5: 萬位數
  digitNow = signal<number>(1); //當前位數，注意個位數加法答案可能是十位數
  decimalPoint = signal<0 | 1 | 2>(0); //小數點後幾位

  answer = signal<number>(0); //答案

  //是否允許負數
  allowNegative = signal<boolean>(false);

  constructor() {
    console.log('PlusingSettingService');

    //出題
    this.setNewQuestion();

    effect(() => {
      const dp = this.decimalPoint(); // 小數點位數，用來修正浮點數誤差
      if (this.mode() === 'add') {
        const nums = [this.numA(), this.numB(), this.numC(), this.numD(), this.numE()];
        let result = 0;
        for (let i = 0; i < this.howManyNumbers(); i++) {
          result += nums[i] ?? 0;
        }
        // 修正浮點數精度誤差
        result = parseFloat(result.toFixed(dp));
        console.log(nums, 'result', result);
        this.answer.set(result);
      } else {
        const nums = [this.numA(), this.numB(), this.numC(), this.numD(), this.numE()];
        let result = 0;
        if (this.howManyNumbers() === 2) {
          result = nums[0] - nums[1];
        } else if (this.howManyNumbers() === 3) {
          result = nums[0] + nums[1] - nums[2];
        } else if (this.howManyNumbers() === 4) {
          result = nums[0] + nums[1] - nums[2] + nums[3];
        } else if (this.howManyNumbers() === 5) {
          result = nums[0] + nums[1] - nums[2] + nums[3] - nums[4];
        }
        // 修正浮點數精度誤差
        result = parseFloat(result.toFixed(dp));
        console.log(nums, 'result', result);
        this.answer.set(result);
      }
    });
  }

  setNewQuestion() {
    if (this.mode() === 'add') {
      //根據位數決定數字 (整數)
      let nums = []
      for (let i = 0; i < this.howManyNumbers(); i++) {
        nums[i] = Math.floor(Math.random() * 10 ** (this.digitNow() + this.decimalPoint()));
      }
      //如果允許小數點
      if (this.decimalPoint() > 0) {
        for (let i = 0; i < this.howManyNumbers(); i++) {
          nums[i] = nums[i] / (10 ** this.decimalPoint());
        }
      }
      // 只 set 需要的數字，其餘設為 0 避免 undefined
      this.numA.set(nums[0] ?? 0);
      this.numB.set(nums[1] ?? 0);
      this.numC.set(nums[2] ?? 0);
      this.numD.set(nums[3] ?? 0);
      this.numE.set(nums[4] ?? 0);
    } else {
      //減法
      let nums = []
      for (let i = 0; i < this.howManyNumbers(); i++) {
        nums[i] = Math.floor(Math.random() * 10 ** (this.digitNow() + this.decimalPoint()));
      }
      //如果允許小數點
      if (this.decimalPoint() > 0) {
        for (let i = 0; i < this.howManyNumbers(); i++) {
          nums[i] = nums[i] / (10 ** this.decimalPoint());
        }
      }
      //排序nums
      nums.sort((a, b) => b - a);
      //最小的兩個放到C和E
      // 只 set 需要的數字，其餘設為 0 避免 undefined
      this.numA.set(nums[0] ?? 0);
      this.numB.set(nums[1] ?? 0);
      this.numC.set(nums[nums.length - 2] ?? 0);
      this.numD.set(nums[nums.length - 3] ?? 0);
      this.numE.set(nums[nums.length - 1] ?? 0);
    }


  }

}
