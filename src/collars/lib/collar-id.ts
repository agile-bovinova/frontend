// The real device id (physical ESP32) is never shown in the assignment UI.
// We encode a positional collar number N inside a globally-unique deviceId so
// the UI can render a friendly "Collar N" label without exposing the raw id.
// Format: collar-{N}-u{ownerId}. It is DETERMINISTIC: "Collar N" of an owner
// always gets the same id, so the ESP32 is flashed once and survives
// remove/re-assign/change. The owner id keeps it globally unique (the backend
// enforces a UNIQUE constraint on device_id across all users).

const DEVICE_ID_RE = /^collar-(\d+)-/;

/** Builds the fixed, globally-unique deviceId of collar N for an owner. */
export function makeCollarDeviceId(n: number, ownerId: number): string {
    return `collar-${n}-u${ownerId}`;
}

/** Extracts the positional collar number from a deviceId, or null if it does
 *  not follow our convention (e.g. legacy raw ESP32 ids). */
export function parseCollarNumber(deviceId: string): number | null {
    const match = DEVICE_ID_RE.exec(deviceId);
    return match ? Number(match[1]) : null;
}

/** Friendly label shown in place of the real device id. */
export function collarLabel(deviceId: string): string {
    const n = parseCollarNumber(deviceId);
    return n !== null ? `Collar ${n}` : "Collar";
}
