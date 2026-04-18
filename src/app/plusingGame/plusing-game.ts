import { Component, signal, computed, effect, inject } from '@angular/core';
import { PlusingSettingService } from './plusing-setting-service';
import { ShowDigitPipe } from './pipes';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-plusing-game',
  standalone: true,
  imports: [ShowDigitPipe, FormsModule],
  providers: [PlusingSettingService],
  templateUrl: './plusing-game.html',
  styleUrl: './plusing-game.css',
})
export class PlusingGame {
  plusingSettingService = inject(PlusingSettingService);

  page = signal<'setting' | 'game' | 'animation'>('setting'); //設定頁面或遊戲頁面，或是動畫演示

  numA = computed(() => this.plusingSettingService.numA());
  numB = computed(() => this.plusingSettingService.numB());
  numC = computed(() => this.plusingSettingService.numC());
  numD = computed(() => this.plusingSettingService.numD());
  numE = computed(() => this.plusingSettingService.numE());
  answer = computed(() => this.plusingSettingService.answer());
  mode = computed(() => this.plusingSettingService.mode());
  howManyNumbers = computed(() => this.plusingSettingService.howManyNumbers());
  digitalNow = computed(() => this.plusingSettingService.digitNow());
  decimalPoint = computed(() => this.plusingSettingService.decimalPoint());

  memeryBox = [null, null, null, null, null, null, null, null]

  //輸入框 例如 123.45 -> [0,0,0,1,2,3,4,5]
  inputAnswer = signal<(number | null)[]>([null, null, null, null, null, null, null, null])

  needCkeckAnswer = signal<number>(0);
  constructor() {
    //將inputAnswer轉成數字
    effect(() => {
      const inputAnswer = this.inputAnswer();
      let result = 0.01 * (inputAnswer[7] ?? 0) + 0.1 * (inputAnswer[6] ?? 0) + 1 * (inputAnswer[5] ?? 0) + 10 * (inputAnswer[4] ?? 0) + 100 * (inputAnswer[3] ?? 0) + 1000 * (inputAnswer[2] ?? 0) + 10000 * (inputAnswer[1] ?? 0) + 100000 * (inputAnswer[0] ?? 0);
      console.log('result', result);
      const dp = this.decimalPoint(); // 小數點位數，用來修正浮點數誤差
      result = parseFloat(result.toFixed(dp));
      this.needCkeckAnswer.set(result);
    });
  }

  //輸入框
  inputAnswers(index: number, event: Event) {
    const inputAnswer = [...this.inputAnswer()];  // 建立新 array，signal 才能偵測變化
    inputAnswer[index] = Number((event.target as HTMLInputElement).value);
    this.inputAnswer.set(inputAnswer);
  }

  setMode(mode: 'add' | 'sub') {
    this.plusingSettingService.mode.set(mode);
    this.plusingSettingService.setNewQuestion();
    this.inputAnswer.set([null, null, null, null, null, null, null, null]);
  }

  setHowManyNumbers(howManyNumbers: number) {
    this.plusingSettingService.howManyNumbers.set(howManyNumbers);
    this.plusingSettingService.setNewQuestion();
    this.inputAnswer.set([null, null, null, null, null, null, null, null]);
  }

  setDigitNow(digitNow: number) {
    this.plusingSettingService.digitNow.set(digitNow);
    this.plusingSettingService.setNewQuestion();
    this.inputAnswer.set([null, null, null, null, null, null, null, null]);
  }

  setDecimalPoint(decimalPoint: 0 | 1 | 2) {
    this.plusingSettingService.decimalPoint.set(decimalPoint);
    this.plusingSettingService.setNewQuestion();
    this.inputAnswer.set([null, null, null, null, null, null, null, null]);
  }

}
