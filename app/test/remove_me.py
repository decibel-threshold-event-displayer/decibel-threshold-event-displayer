from locale import windows_locale

import numpy as np
from scipy.io import wavfile

# Load WAV file
fs, data = wavfile.read('./resources/_valid.wav')

# Convert samples to floating-point values
# data_float = (data - 128) / 128

# Calculate RMS for a given window size (e.g., 200 samples)
window_size = 13230
mean_values = []
square_mean_values = []
rms_values = []
db_values = []

for i in range(0, len(data), window_size):
    window = data[i:i+window_size]
    mean_values.append(np.mean(window))
    mean = np.mean(np.square(window))
    square_mean_values.append(float(mean))
    rms = np.sqrt(mean)
    rms_values.append(rms)
    db_values.append(20 * np.log10(rms))

# print([float(v) for v in mean_values])
# get mean values as json
# with open('resources/valid_mean_values.json', "w+") as file:
#     file.write("[")
#     file.write(",".join([str(v) for v in mean_values]))
#     file.write("]")

# get square mean values as json
# with open('resources/valid_square_mean_values.json', "w+") as file:
#     file.write("[")
#     file.write(",".join([str(v) for v in square_mean_values]))
#     file.write("]")

# get reference values as json
# with open('resources/valid_sample_values.json', "w+") as file:
#     file.write("[")
#     file.write(",".join([str(v) for v in data_float]))
#     file.write("]")