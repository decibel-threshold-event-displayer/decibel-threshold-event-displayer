import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Generator

import numpy as np
from scipy.io import wavfile

resources_path = Path("./resources")
dba_min = 35.3
dba_max = 96.2

@dataclass
class ReferenceValueEntry:
    file_name: str
    values: list[float] = field(default_factory=list)

@dataclass
class ReferenceValues:
    sample: ReferenceValueEntry
    mean: ReferenceValueEntry
    square_mean: ReferenceValueEntry
    rms: ReferenceValueEntry
    db: ReferenceValueEntry
    dba: ReferenceValueEntry

    def entries(self) -> Generator[ReferenceValueEntry, None, None]:
        yield from [self.sample, self.mean, self.square_mean, self.rms, self.db, self.dba]

def db_to_dba(db, db_min, db_max, dba_min, dba_max):
    return (db - db_min) * (dba_max - dba_min) / (db_max - db_min) + dba_min

# Load WAV file
fs, data = wavfile.read(resources_path.joinpath("_valid.wav"))

# Convert samples to floating-point values
# data_float = (data - 128) / 128

# Calculate RMS for a given window size (e.g., 200 samples)
window_size = 8820
dtype=np.float128
reference_values: ReferenceValues = ReferenceValues(
    sample=ReferenceValueEntry("valid_sample_values", [float(sample) for sample in data]),
    mean=ReferenceValueEntry("valid_mean_values"),
    square_mean=ReferenceValueEntry("valid_square_mean_values"),
    rms=ReferenceValueEntry("valid_rms_values"),
    db=ReferenceValueEntry("valid_db_values"),
    dba=ReferenceValueEntry("valid_dba_values"),
)

for i in range(0, len(data), window_size):
    window = data[i:i+window_size]
    reference_values.mean.values.append(float(np.mean(window, dtype=dtype)))
    square_mean = np.mean(np.square(window, dtype=dtype), dtype=dtype)
    reference_values.square_mean.values.append(float(square_mean))
    rms = np.sqrt(square_mean)
    reference_values.rms.values.append(rms)
    db = 20 * np.log10(rms)
    reference_values.db.values.append(db)

db_min = np.min(reference_values.db.values)
db_max = np.max(reference_values.db.values)

for db in reference_values.db.values:
    reference_values.dba.values.append(db_to_dba(db, db_min, db_max, dba_min, dba_max))

for entry in reference_values.entries():
    with open(resources_path.joinpath(f"{entry.file_name}.json"), "w+", encoding="utf-8") as file:
        data = [float(v) for v in entry.values]
        json.dump(data, file, ensure_ascii=False, indent=4)
