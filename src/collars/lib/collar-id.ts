// Format: COL-{N} or collar-{N}-u{ownerId}. It is DETERMINISTIC: "Collar N"
// always gets the same clean device ID format (e.g. COL-001, COL-002, etc.)
// which matches the MQTT simulator and hardware ESP32 convention.

const DEVICE_ID_RE = /^(?:collar|col)-?(\d+)/i;

/** Builds the fixed, standardized deviceId of collar N. */
export function makeCollarDeviceId(n: number, _ownerId?: number): string {
    return `COL-${String(n).padStart(3, '0')}`;
}

/** Extracts the positional collar number from a deviceId, or null if it does
 *  not follow our convention. */
export function parseCollarNumber(deviceId: string): number | null {
    const match = DEVICE_ID_RE.exec(deviceId);
    return match ? Number(match[1]) : null;
}

/** Friendly label shown in place of the real device id. */
export function collarLabel(deviceId: string): string {
    const n = parseCollarNumber(deviceId);
    return n !== null ? `Collar ${n} (${deviceId})` : `Collar (${deviceId})`;
}
