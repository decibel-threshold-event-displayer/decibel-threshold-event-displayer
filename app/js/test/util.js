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
        throw new Error(`Expected value to not equal ${JSON.stringify(expected)}`);
    }
}