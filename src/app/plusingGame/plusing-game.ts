import { Component, signal, computed, effect, inject } from '@angular/core';
import { PlusingSettingService } from './plusing-setting-service';
import { ShowDigitPipe } from './pipes';
import { FormsModule } from '@angular/forms';
import { AnimationEngine } from './animation/animation-engine';

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
  allowNegative = computed(() => this.plusingSettingService.allowNegative());
  memeryBox: (number | null)[] = [null, null, null, null, null, null, null, null]

  //輸入框 例如 123.45 -> [0,0,0,1,2,3,4,5]
  inputAnswer = signal<(number | null)[]>([null, null, null, null, null, null, null, null])

  needCkeckAnswer = signal<number>(0);
  needClearInput = signal<boolean>(false);
  constructor() {
    //將inputAnswer轉成數字->送到service檢查
    effect(async () => {
      const inputAnswer = this.inputAnswer();
      let result = 0.01 * (inputAnswer[7] ?? 0) + 0.1 * (inputAnswer[6] ?? 0) + 1 * (inputAnswer[5] ?? 0) + 10 * (inputAnswer[4] ?? 0) + 100 * (inputAnswer[3] ?? 0) + 1000 * (inputAnswer[2] ?? 0) + 10000 * (inputAnswer[1] ?? 0) + 100000 * (inputAnswer[0] ?? 0);
      const dp = this.decimalPoint(); // 小數點位數，用來修正浮點數誤差
      result = parseFloat(result.toFixed(dp));
      if(this.putNegative()){
        result = -result;
      }
      console.log('result', result);
      this.needCkeckAnswer.set(result);
      const isCorrect = await this.plusingSettingService.checkAnswer(result);
      if (isCorrect) {
        this.needClearInput.set(true);
      }
    });

    //如果答對了，重新渲染題目->清空輸入框->清空筆記區
    effect(() => {
      if (this.needClearInput()) {
        this.claerInput();
        this.needClearInput.set(false);
      }
    });
  }

  putNegative = signal<boolean>(false);
    
  //輸入框
  inputAnswers(index: number, event: Event) {
    const inputAnswer = [...this.inputAnswer()];  // 建立新 array，signal 才能偵測變化
    const target = event.target as HTMLInputElement;
    let valueStr = target.value;
    if(valueStr.includes('-') && this.allowNegative()){
      valueStr = valueStr.replace('-', '');
      this.putNegative.set(!this.putNegative());
    }else if (valueStr.includes('-')){
      console.log('not allow negative');
      target.value = '';
      inputAnswer[index] = null;
      this.inputAnswer.set(inputAnswer);
      return;
    }
    let value:number = Number(valueStr);
    if (value > 9 && value < 100) {
      if (this.mode() === 'add') {
        this.memeryBox[index] = Math.floor(value / 10);//(超過位數)幫忙填上筆記區
        value = value % 10;
      } else {
        inputAnswer[index - 1] = Math.floor(value / 10);//(超過位數)幫忙填上筆記區
        value = value % 10;
      }
    }
    inputAnswer[index] = value;
    this.inputAnswer.set(inputAnswer);
  }

  claerInput(){
    this.inputAnswer.set([null, null, null, null, null, null, null, null]);
    this.memeryBox = [null, null, null, null, null, null, null, null];
    this.putNegative.set(false);
  }
  setMode(mode: 'add' | 'sub') {
    this.plusingSettingService.mode.set(mode);
    this.plusingSettingService.setNewQuestion();
    this.claerInput();
  }

  setHowManyNumbers(howManyNumbers: number) {
    this.plusingSettingService.howManyNumbers.set(howManyNumbers);
    this.plusingSettingService.setNewQuestion();
    this.claerInput();
  }

  setDigitNow(digitNow: number) {
    this.plusingSettingService.digitNow.set(digitNow);
    this.plusingSettingService.setNewQuestion();
    this.claerInput();
  }

  setDecimalPoint(decimalPoint: 0 | 1 | 2) {
    this.plusingSettingService.decimalPoint.set(decimalPoint);
    this.plusingSettingService.setNewQuestion();
    this.claerInput();
  }

  setAllowNegative(allowNegative: boolean) {
    this.plusingSettingService.allowNegative.set(allowNegative);
    this.plusingSettingService.setNewQuestion();
    this.claerInput();
  }

  toggleNegative(){
    if(this.allowNegative()){
      this.putNegative.set(!this.putNegative());
    }
  }

  num54 = signal(54);
  num39 = signal(39);
  isPlaying = false;
  playMode = signal<'add' | 'sub'>('add');
  animPaused = signal(false);
  private animEngine = new AnimationEngine();

  putNum54(event: Event){
    const target = event.target as HTMLInputElement;
    let valueStr = target.value;//只能是整數，小於100
    let value = parseInt(valueStr);
    if(value > 0 && value < 100){
      this.num54.set(value);
    }else{
      target.value = '54';
      this.num54.set(54);
    }
  }

  putNum39(event: Event){
    const target = event.target as HTMLInputElement;
    let valueStr = target.value;//只能是整數，小於100，且不大於num54
    let value = parseInt(valueStr);
    if(value > 0 && value < 100 && value <= this.num54()){
      this.num39.set(value);
    }else{
      target.value = '39';
      this.num39.set(39);
    }
  }

  /** 播放動畫 */
  playAnimation() {
    this.animPaused.set(false);
    const canvas = document.getElementById('animationCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    this.animEngine.init(canvas);

    let a = this.num54();
    let b = this.num39();

    if (this.playMode() === 'add') {
      // 加法模式：A + B 不能超過 99
      if (a + b > 99) {
        b = 99 - a;
        if (b <= 0) { a = 99; b = 0; }
        this.num54.set(a);
        this.num39.set(b);
      }
      this.animEngine.playAddition(a, b);
    } else {
      // 減法模式：B 不能大於 A（已在 putNum39 中限制）
      this.animEngine.playSubtraction(a, b);
    }
  }

  /** 暫停 / 繼續動畫 */
  togglePause() {
    this.animEngine.togglePause();
    this.animPaused.set(this.animEngine.paused);
  }

  /** 重置動畫 */
  resetAnimation() {
    this.animPaused.set(false);
    this.animEngine.reset();
  }
}
