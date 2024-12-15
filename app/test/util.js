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

    throw new Error(`Expected error "${expectedErrorClass.name}" not thrown`);
}

export async function assertNotThrows(fun) {
    try {
        await fun();
        // Pass the test if the expected error is not thrown
    } catch (error) {
        throw new Error(`Expected no error to be thrown, but got ${error.name}: ${error.message}`);
    }
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

export async function fetchLocalJson(filePath){
    const arrayBuffer = await fetchLocalFile(filePath);
    const jsonString = new TextDecoder().decode(arrayBuffer);
    return JSON.parse(jsonString);
}