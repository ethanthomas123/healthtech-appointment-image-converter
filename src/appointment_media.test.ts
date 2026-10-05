import assert from "node:assert/strict";
import { preferredFormat, appointmentUpload } from "./appointment_media.js";

assert.equal(preferredFormat("modern"), "avif");
assert.equal(preferredFormat("legacy"), "webp");
assert.equal(appointmentUpload.parse({ appointmentId: "a1", patientName: "Sam", image: { base64: "img" }, device: "modern" }).device, "modern");
console.log("appointment media decision tests passed");
