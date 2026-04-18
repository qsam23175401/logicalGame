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
        const digitValue = digitMap[digit as keyof typeof digitMap];
        return Math.floor(value / digitValue) % 10;
    }
}