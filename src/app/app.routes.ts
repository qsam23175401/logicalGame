import { Routes } from '@angular/router';
import { PlusingGame } from './plusingGame/plusing-game';


export const routes: Routes = [
    { path: '', component: PlusingGame },// 根目錄直接顯示遊戲
    { path: '**', redirectTo: '' }, // 萬用跳轉到首頁
];