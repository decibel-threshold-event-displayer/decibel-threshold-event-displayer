import {assertThrows, assertNotThrows, assertEquals, assertNotEquals} from './util.js';

export async function testAssertThrowsWithError() {
    // Should pass when expected error is thrown
    try {
        await assertThrows(async () => {
            throw new Error('Test error');
        }, Error);
    } catch (error) {
        throw new Error('assertThrows did not fail when expected error was thrown');
    }
}

export async function testAssertThrowsWithWrongError() {
    // Should fail when wrong error type is thrown
    try {
        await assertThrows(async () => {
            throw new TypeError('Wrong error');     
        }, Error);
    } catch (error) {
        throw new Error('assertThrows did not fail with wrong error type');
    }
}

export async function testAssertThrowsWithNoError() {
    // Should fail when no error is thrown
    try {
        await assertThrows(async () => {
            // Do nothing
        }, Error);
    } catch (error) {
        return;
    }
    throw new Error('assertThrows did not fail when no error was thrown');
}

export async function testAssertNotThrowsFailure() {
    // Should fail when an error is thrown
    try {
        await assertNotThrows(async () => {
            throw new Error('Test error');
        });
    } catch (error) {
        return;
    }
    throw new Error('assertNotThrows did not fail when error was thrown');
}

export async function testAssertEqualsSuccess() {
    // Should pass when values are equal
    try {
        await assertEquals(42, 42);
        await assertEquals("test", "test");
        await assertEquals({a: 1, b: 2}, {a: 1, b: 2});
        await assertEquals([1, 2, 3], [1, 2, 3]);
    } catch (error) {
        throw new Error('assertEquals failed when values were equal');
    }
}

export async function testAssertEqualsFail() {
    // Should fail when values are not equal
    try {
        await assertEquals(42, 43);
        throw new Error('assertEquals did not fail with different values');
    } catch (error) {
        if (error.message === 'assertEquals did not fail with different values') {
            throw error;
        }
        // Expected failure
    }
}

export async function testAssertNotEqualsSuccess() {
    // Should pass when values are not equal
    try {
        await assertNotEquals(42, 43);
        await assertNotEquals("test", "test2");
        await assertNotEquals({a: 1}, {a: 2});
        await assertNotEquals([1, 2], [1, 2, 3]);
    } catch (error) {
        throw new Error('assertNotEquals failed when values were different');
    }
}

export async function testAssertNotEqualsFail() {
    // Should fail when values are equal
    try {
        await assertNotEquals(42, 42);
        throw new Error('assertNotEquals did not fail with equal values');
    } catch (error) {
        if (error.message === 'assertNotEquals did not fail with equal values') {
            throw error;
        }
        // Expected failure
    }
}
