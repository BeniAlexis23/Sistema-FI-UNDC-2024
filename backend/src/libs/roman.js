const NUMERALS = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
];

/* Número de edición -> numeral romano (1 -> I, 8 -> VIII). Fuera de 1..3999 devuelve el número como texto */
export const toRoman = (value) => {
    const number = Number(value);
    if (!Number.isInteger(number) || number < 1 || number > 3999) return String(value ?? '');
    let rest = number;
    let result = '';
    for (const [amount, numeral] of NUMERALS) {
        while (rest >= amount) {
            result += numeral;
            rest -= amount;
        }
    }
    return result;
};
