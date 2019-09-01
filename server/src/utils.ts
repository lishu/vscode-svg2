/**
 * 从数组删除一个成员
 * @param {Array<T>} array 要删除成员的数组。
 * @param {T} item 要删除的成员。
 * @returns {number} 如果删除成功，返回成员原来在数组中的索引，否则返回 -1。
 */
export function removeItem<T>(array: Array<T>, item: T): number {
    let idx = array.indexOf(item);
    if (idx > -1) {
        array.splice(idx, 1);
    }
    return idx;
}