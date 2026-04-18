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

  memeryBox = [null, null, null, null, null, null, null, null]
  inputAnswer = signal<(number | null)[]>([null, null, null, null, null, null, null, null])

  inputAnswers(index: number, event: Event) {
    this.inputAnswer.update((value) => {
      value[index] = Number((event.target as HTMLInputElement).value);
      return value;
    });
  }

}
