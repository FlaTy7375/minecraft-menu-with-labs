// Модуль с бизнес-логикой

/**
 * Создает массив из 100 элементов со случайными значениями от 1 до 17.
 * @returns {Array<number>}
 */
export function generateRandomArray() {
    const arr = [];
    for (let i = 0; i < 100; i++) {
        // Рандом от 1 до 17 включительно
        arr.push(Math.floor(Math.random() * 17) + 1);
    }
    return arr;
}

/**
 * Сортирует массив по возрастанию. Не мутирует оригинал.
 * @param {Array<number>} arr 
 * @returns {Array<number>}
 */
export function getSortedArray(arr) {
    return [...arr].sort((a, b) => a - b);
}

/**
 * Возвращает максимальный элемент из массива и индекс его первого вхождения.
 * @param {Array<number>} arr 
 * @returns {Object} { maxVal, index }
 */
export function getMaxElementInfo(arr) {
    if (!arr || arr.length === 0) return { maxVal: null, index: -1 };
    
    let maxVal = arr[0];
    let index = 0;
    
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > maxVal) {
            maxVal = arr[i];
            index = i;
        }
    }
    
    return { maxVal, index };
}
