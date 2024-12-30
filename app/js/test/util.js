/**
 * Asserts the given function throws an exception
 *
 * @param fun{function()}
 * @throws Throws an exception when the given function runs without
 *         throwing an exception.
 */
export async function assertThrows(fun, expectedErrorClass) {
    try {
        await fun();
    } catch (error) {
        if (error instanceof expectedErrorClass) {
            // Pass the test if the expected error is thrown
            return;
        } else {
            throw new Error(`Expected error of type "${expectedErrorClass.name}", but got "${error.constructor.name}": ${error.message}`);
        }
    }
    ;
    throw new Error(`Expected error of type "${expectedErrorClass.name}", but no error was thrown`);
}

/**
 * Asserts the given function throws an exception
 *
 * @param fun{function()}
 * @throws Throws an exception when the given function throws exception.
 */
export async function assertNotThrows(fun) {
    try {
        await fun();
        // Pass the test if the expected error is not thrown
    } catch (error) {
        throw new Error(`Expected no error to be thrown, but got ${error.name}: ${error.message}`);
    }
}

/**
 * Asserts that the expected and actual value are the same.
 *
 * @param actual{any}
 * @param expected{any}
 * @throws Throws an exception when the actual value differs from the expected.
 */
export async function assertEquals(actual, expected) {
    // Use JSON.stringify to handle comparison of objects and arrays
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
    }
}

/**
 * Asserts that the expected and actual value are not the same.
 *
 * @param actual{any}
 * @param expected{any}
 * @throws Throws an exception when the actual value is equal to the expected value.
 */
export async function assertNotEquals(actual, expected) {
    // Use JSON.stringify to handle comparison of objects and arrays
    if (JSON.stringify(actual) === JSON.stringify(expected)) {
        throw new Error(`Expected value to not be equal to ${JSON.stringify(expected)}, but it was`);
    }
}

/**
 * Asserts that a given value is greater then an another.
 *
 * @param lower{any}
 * @param greater{any}
 * @throws Throws an exception when the actual value is equal to the expected value.
 */
export async function assertGreaterThen(lower, greater) {
    if(lower > greater)
        throw new Error(`Value ${lower} was greater then ${greater}`);
}

export async function fetchLocalFile(filePath) {
    try {
        const response = await fetch(filePath);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        return arrayBuffer;
    } catch (error) {
        throw new Error(`Error while fetching ${filePath}: ${error.message}`);
    }
}

export async function fetchLocalJson(filePath) {
    const arrayBuffer = await fetchLocalFile(filePath);
    const jsonString = (new TextDecoder()).decode(arrayBuffer);
    return JSON.parse(jsonString);
}