import { prepareAppointmentMedia } from "./appointment_media.js";

const raw = process.env.APPOINTMENT_UPLOAD ?? JSON.stringify({ appointmentId: "apt-1042", patientName: "Jordan Lee", image: { base64: "REPLACE_ME" }, device: "modern" });

try {
  const prepared = await prepareAppointmentMedia(JSON.parse(raw));
  console.log(JSON.stringify(prepared, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
