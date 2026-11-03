/* Corta por puntos de código para no partir emojis ni caracteres compuestos */
export const truncate = (value = '', maxChars) => {
    const chars = Array.from(value);
    return chars.length <= maxChars ? value : chars.slice(0, maxChars).join('');
};

/* Igual, pero corta en el último espacio y agrega «…» (el resultado nunca supera maxChars) */
export const truncateAtWord = (value = '', maxChars) => {
    if (Array.from(value).length <= maxChars) return value;

    const head = truncate(value, maxChars - 1);
    const lastSpace = head.search(/\s\S*$/);
    const cut = lastSpace > head.length * 0.6 ? head.slice(0, lastSpace) : head;
    return `${cut.trimEnd()}…`;
};
