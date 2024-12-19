"use strict";

/**
 * Calculates the root-mean-square over a list of numbers
 *
 * @param values{number[]}
 * @returns {number}
 */
export function rms(values){
    const squared = values.map(sample => Math.pow(sample, 2));
    const sum = squared.reduce((a, b) => a + b);
    const mean = sum / values.length;
    return Math.sqrt(mean);
}

/**
 * Takes a rms value and returns it as decibel
 *
 * @param rms{number}
 * @returns {number}
 */
export function rmsToDb(rms) {
    // Validate arguments
    if (rms < 0) {
        throw new Error("Invalid argument, sample must be an integer equal or greater than 0!");
    }

    return 20 * Math.log10(rms);
}

/**
 * Takes a Db value and returns it as Dba
 *
 * @param db{number}
 * @param dbMin{number}
 * @param dbMax{number}
 * @param dbaMin{number}
 * @param dbaMax{number}
 * @returns {number}
 */
export function dbToDba(db, dbMin, dbMax, dbaMin, dbaMax) {
    return (db - dbMin) * (dbaMax - dbaMin) / (dbMax - dbMin) + dbaMin;
}

/**
 * Takes a long integer and converts it to a byte array
 *
 * @param long{number}
 * @returns {number[]}
 */
export function longToByteArray(/*long*/long) {
    // we want to represent the input as a 8-bytes array
    const byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

    for (let index = 0; index < byteArray.length; index++) {
        let byte = long & 0xff;
        byteArray [index] = byte;
        long = (long - byte) / 256;
    }

    return byteArray;
}