// Test utils

const testBlock = (name: string): void => {
    console.groupEnd();
    console.group(`# ${name}\n`);
};

const areEqual = (a: unknown, b: unknown) => {
    // Compare arrays of primitives
    // Remember: [] !== []
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) {
            return false;
        }

        if (a.length === 0) {
            return false;
        }

        return JSON.stringify(a) === JSON.stringify(b);
    }

    return a === b;
};

const test = (whatWeTest: string, actualResult: unknown, expectedResult: unknown) => {
    if (areEqual(actualResult, expectedResult)) {
        console.log(`[OK] ${whatWeTest}\n`);
    } else {
        console.error(`[FAIL] ${whatWeTest}`);
        console.debug('Expected:');
        console.debug(expectedResult);
        console.debug('Actual:');
        console.debug(actualResult);
        console.log('');
    }
};

// Functions

const getType = (value: unknown): string => {
    // Return string with a native JS type of value
    return typeof value;
};

const getTypesOfItems = (arr: unknown[]): string[] => {
    // Return array with types of items of given array
    return arr.map(getType);
};

const allItemsHaveTheSameType = (arr: unknown[]): boolean => {
    // Return true if all items of array have the same type
    return new Set(getTypesOfItems(arr)).size === 1;
};

const getRealType = (value: unknown): string => {
    // Return string with a “real” type of value.
    // For example:
    //     typeof new Date()       // 'object'
    //     getRealType(new Date()) // 'date'
    //     typeof NaN              // 'number'
    //     getRealType(NaN)        // 'NaN'
    // Use typeof, instanceof and some magic. It's enough to have
    // 12-13 unique types but you can find out in JS even more :)
    if (Number.isNaN(value)) {
        return 'NaN';
    }

    if (value === Infinity) {
        return 'Infinity';
    }

    return Object.prototype.toString
        .call(value)
        .match(/\s([a-zA-Z]+)/)[1]
        .toLowerCase();
};

const getRealTypesOfItems = (arr: unknown[]): string[] => {
    // Return array with real types of items of given array
    return arr.map(getRealType);
};

const everyItemHasAUniqueRealType = (arr: unknown[]): boolean => {
    // Return true if there are no items in array
    // with the same real type
    return new Set(getRealTypesOfItems(arr)).size === arr.length;
};

const countRealTypes = (arr: unknown[]): [string, number][] => {
    // Return an array of arrays with a type and count of items
    // with this type in the input array, sorted by type.
    // Like an Object.entries() result: [['boolean', 3], ['string', 5]]
    interface resultObject {
        [key: string]: number
    }

    const result: resultObject = {};

    getRealTypesOfItems(arr)
        .sort()
        .forEach((type) => {
            result[type] = (result[type] || 0) + 1;
        });

    return Object.entries(result);
};

// Tests

testBlock('getType');

test('Boolean', getType(true), 'boolean');
test('Number', getType(123), 'number');
test('String', getType('whoo'), 'string');
test('Array', getType([]), 'object');
test('Object', getType({}), 'object');
test(
    'Function',
    getType(() => {}),
    'function'
);
test('Undefined', getType(undefined), 'undefined');
test('Null', getType(null), 'object');

testBlock('allItemsHaveTheSameType');

test('All values are numbers', allItemsHaveTheSameType([11, 12, 13]), true);

test('All values are strings', allItemsHaveTheSameType(['11', '12', '13']), true);

test(
    'All values are strings but wait',
    allItemsHaveTheSameType(['11', new String('12'), '13']),
    // What the result?
    false
);

test(
    'Values like a number',
    // @ts-expect-error
    allItemsHaveTheSameType([123, 123 / 'a', 1 / 0]),
    // What the result?
    true
);

test('Values like an object', allItemsHaveTheSameType([{}]), true);

testBlock('getTypesOfItems VS getRealTypesOfItems');

const knownTypes = [
    // Add values of different types like boolean, object, date, NaN and so on
    true,
    1,
    '',
    [],
    {},
    () => {},
    undefined,
    null,
    NaN,
    Infinity,
    new Date(),
    /\s/,
    new Set(),
    async () => {},
    Promise.resolve(),
    // eslint-disable-next-line
    function* () {},
    new Error(),
    // eslint-disable-next-line
    new WeakMap(),
];

test('Check basic types', getTypesOfItems(knownTypes), [
    // What the types?
    'boolean',
    'number',
    'string',
    'object',
    'object',
    'function',
    'undefined',
    'object',
    'number',
    'number',
    'object',
    'object',
    'object',
    'function',
    'object',
    'function',
    'object',
    'object',
]);

test('Check real types', getRealTypesOfItems(knownTypes), [
    'boolean',
    'number',
    'string',
    'array',
    'object',
    'function',
    'undefined',
    'null',
    'NaN',
    'Infinity',
    'date',
    'regexp',
    'set',
    // What else?
    'asyncfunction',
    'promise',
    'generatorfunction',
    'error',
    'weakmap',
]);

testBlock('everyItemHasAUniqueRealType');

test('All value types in the array are unique', everyItemHasAUniqueRealType([true, 123, '123']), true);
// @ts-expect-error
test('Two values have the same type', everyItemHasAUniqueRealType([true, 123, '123' === 123]), false);

test('There are no repeated types in knownTypes', everyItemHasAUniqueRealType(knownTypes), true);

testBlock('countRealTypes');

test('Count unique types of array items', countRealTypes([true, null, !null, !!null, {}]), [
    ['boolean', 3],
    ['null', 1],
    ['object', 1],
]);

test('Counted unique types are sorted', countRealTypes([{}, null, true, !null, !!null]), [
    ['boolean', 3],
    ['null', 1],
    ['object', 1],
]);

// Add several positive and negative tests
test('Counted unique types are sorted', countRealTypes([[], 1, true, false, true, 2]), [
    ['array', 1],
    ['boolean', 3],
    ['number', 2],
]);

test('Are not equal [] and []', areEqual([], []), false);
