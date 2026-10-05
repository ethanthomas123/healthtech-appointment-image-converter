import { z } from "zod";
import { convertImage } from "./infrai_client.js";

export const appointmentUpload = z.object({
  appointmentId: z.string().min(1),
  patientName: z.string().min(1),
  image: z.union([z.object({ base64: z.string().min(1) }), z.object({ url: z.string().url() }), z.object({ image_id: z.string().min(1) })]),
  device: z.enum(["modern", "legacy"])
});

export type AppointmentUpload = z.infer<typeof appointmentUpload>;

export function preferredFormat(device: AppointmentUpload["device"]): "webp" | "avif" {
  return device === "modern" ? "avif" : "webp";
}

export async function prepareAppointmentMedia(raw: unknown) {
  const input = appointmentUpload.parse(raw);
  const format = preferredFormat(input.device);
  const result = await convertImage({ image: input.image, format, requestId: `appointment-${input.appointmentId}` });
  return {
    appointmentId: input.appointmentId,
    notification: `Media for ${input.patientName}'s appointment is ready as ${format.toUpperCase()}.`,
    format,
    image: result.image
  };
}
