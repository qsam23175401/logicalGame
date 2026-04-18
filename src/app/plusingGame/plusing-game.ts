import { Component, signal, computed, effect, inject } from '@angular/core';
import { PlusingSettingService } from './plusing-setting-service';

@Component({
  selector: 'app-plusing-game',
  standalone: true,
  imports: [],
  providers: [PlusingSettingService],
  templateUrl: './plusing-game.html',
  styleUrl: './plusing-game.css',
})
export class PlusingGame {
  plusingSettingService = inject(PlusingSettingService);

  page = signal<'setting' | 'game' | 'animation'>('setting'); //設定頁面或遊戲頁面，或是動畫演示



}
