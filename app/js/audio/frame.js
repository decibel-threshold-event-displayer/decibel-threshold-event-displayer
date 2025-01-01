"use strict";

import {dbToDba, rms, rmsToDb} from "./utils.js";

/**
 * Represents a frame (window) of samples
 */
export class Frame {
    /**
     * Contains the samples of the frame
     *
     * @type {number[]}
     */
    #samples = [];

    /**
     * Frame constructor
     *
     * @param samples{number[]}
     */
    constructor(samples) {
        this.#samples = samples;
    }

    /**
     * Returns the samples of the frame
     *
     * @returns {number[]}
     */
    getSamples() {
        return this.#samples;
    }

    /**
     * Calculates the root-mean-square of the frame
     *
     * @returns {number}
     */
    getRMS() {
        return rms(this.#samples);
    }

    /**
     * Calculates the Decibel of the frame
     *
     * @returns {number}
     */
    getDb() {
        return rmsToDb(this.getRMS());
    }
}

/**
 * The FrameCollection class groups samples into frames based on the given parameters
 * -
 */
export class FrameCollection {
    #frames = [];
    #sampleCount;
    #samplesPerSecond;
    #frameDuration;

    /**
     * FrameCollection constructor
     *
     * @param samples{number[]|number[][]} can be a simple list or a nested list (channels) of sample values
     * @param samplesPerSecond{number}
     * @param frameDuration{number} in seconds, e.g.: 0.3 = 300ms
     */
    constructor(samples, samplesPerSecond, nbrOfChannels, frameDuration = 0.3) {
        // Validate arguments
        if (!Number.isFinite(frameDuration) || frameDuration <= 0) {
            throw new Error("Invalid argument, frameDuration must be an float greater than 0!");
        }

        // Check that we have at least some samples
        if (!samples || samples.length === 0) {
            throw new Error("No samples available to calculate RMS");
        }

        this.#sampleCount = samples.length;
        this.#samplesPerSecond = samplesPerSecond;
        this.#frameDuration = frameDuration;
        this.#frames = this.#samplesToFrames(samples, nbrOfChannels);
    }

    /**
     * Returns a list of frames
     *
     * @returns {Frame[]}
     */
    getFrames() {
        return this.#frames;
    }

    /**
     * Calculates the Decibel A-weighting
     *
     * @param dbaMin{number}
     * @param dbaMax{number}
     * @returns {number[]}
     */
    getMappedDbaValues(dbaMin, dbaMax) {
        const dbValues = this.#frames.map(frame => frame.getDb());

        // ignore negative infinite values
        // they result from frames containing only samples with value 0
        const dbMin = Math.min(...dbValues.filter(value => value !== -Infinity));
        const dbMax = Math.max(...dbValues);

        return dbValues.map(dbValue => dbToDba(dbValue, dbMin, dbMax, dbaMin, dbaMax));
    }

    /**
     * Gets the Decibel A-weighting and filters them by a threshold
     *
     * @param threshold{number}
     * @param dbaMin{number}
     * @param dbaMax{number}
     * @returns {number[]}
     */
    getFilteredDbaValues(threshold, dbaMin, dbaMax) {
        return this.getMappedDbaValues(dbaMin, dbaMax).map(dbaValue => dbaValue >= threshold ? dbaValue : 0);
    }

    /**
     * Returns the samples per seconds
     *
     * @returns {number}
     */
    getSamplesPerSecond() {
        return this.#samplesPerSecond;
    }

    /**
     * Returns the frame duration
     *
     * @returns {number}
     */
    getFrameDuration() {
        return this.#frameDuration;
    }

    /**
     * Groups the sample in frames (windows), the group size is determined by the frameDuration
     *
     * @returns {Frame[]}
     */
    #samplesToFrames(samples, nbrOfChannels) {
        // Check that we have at least some samples
        if (!samples || samples.length === 0) {
            throw new Error("No samples available to calculate RMS");
        }

        const frameSize = Math.floor(this.#frameDuration * this.#samplesPerSecond);
        const frames = [];

        // We round up, otherwise some samples might get cut off or no samples get processed at all,
        // if the frameSize is larger than the number of samples
        const totalFrames = Math.ceil(samples.length / frameSize);

        for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
            const startSample = frameIndex * frameSize;
            // This handles the edge case for the last frame, where we might have fewer samples as the full frame
            const endSample = Math.min(startSample + frameSize, samples.length);
            const frameSamples = [];

            for (let i = startSample; i < endSample; i++) {
                // We merge all channels and just take the mean
                const sum = samples[i].reduce((a, b) => a + b);
                const mean = sum / nbrOfChannels;
                frameSamples.push(mean);
            }

            frames.push(new Frame(frameSamples));
        }

        return frames;
    }
}