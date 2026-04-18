import { Pipe, PipeTransform } from "@angular/core";

const digitMap = {
    '十萬位': 100000,
    '萬位': 10000,
    '千位': 1000,
    '百位': 100,
    '十位': 10,
    '個位': 1,
    '十分位': 0.1,
    '百分位': 0.01
}
@Pipe({
    name: 'showDigit',
    standalone: true
})
export class ShowDigitPipe implements PipeTransform {
    transform(value: number, digit: string): number {
        // 統一先放大成整數再做除法，避免小數除法的浮點數誤差
        // 例如: 12.3 / 0.1 → 122.999... → Math.floor → 122 → 顯示2 (錯誤)
        // 修正: Math.round(12.3 * 100) / (0.1 * 100) = 1230 / 10 = 123 → 顯示3 (正確)
        const SCALE = 100; // 支援最多到百分位
        const digitValue = digitMap[digit as keyof typeof digitMap];
        const scaledValue = Math.round(value * SCALE);
        const scaledDigit = Math.round(digitValue * SCALE);
        return Math.floor(scaledValue / scaledDigit) % 10;
    }
}