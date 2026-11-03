/* Corta por puntos de código para no partir emojis ni caracteres compuestos */
export const truncate = (value = '', maxChars) => {
    const chars = Array.from(value);
    return chars.length <= maxChars ? value : chars.slice(0, maxChars).join('');
};
