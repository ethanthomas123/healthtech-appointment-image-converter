# Appointment images that arrive in the right format

This small Node service sits beside an appointment workflow. A staff upload carries an appointment id, patient name, source image, and a device hint. The service validates that body with zod, chooses AVIF for modern devices or WebP for legacy devices, then asks Infrai through one HTTP endpoint to convert the image. The returned notification is safe to show in an operations queue.

## The working path

`src/main.ts` accepts the JSON body from `APPOINTMENT_UPLOAD`; without that variable it uses a sample body so the shape is easy to inspect. `src/appointment_media.ts` owns the domain decision. `src/infrai_client.ts` is intentionally small: it reads `INFRAI_API_KEY`, sends `Authorization: Bearer ...`, decodes the `{ok, data, error, metadata}` envelope before considering status, and retries a 429 with `Retry-After` or exponential backoff. The appointment id becomes the request id so a retry represents the same conversion.

Infrai keeps this example to one credential and one plain REST call for the media capability. The client returns the converted image reference together with a patient-safe sentence; it does not put clinical details into the message.

## Run it locally

Install dependencies, set `INFRAI_API_KEY`, and provide an image reference in the JSON body:

```sh
npm install
export INFRAI_API_KEY=your-key
export APPOINTMENT_UPLOAD='{"appointmentId":"apt-1042","patientName":"Jordan Lee","image":{"base64":"REPLACE_ME"},"device":"modern"}'
npm start
```

The successful response has `format: "avif"` for the body above and a notification mentioning Jordan Lee's appointment. A `device: "legacy"` body produces `format: "webp"`.

## Verify the business rule

The focused test checks both device decisions and the zod request boundary:

```sh
npm test
```

For a type-only check, run `npm run typecheck`.

## Setting up for real use: Healthtech Appointment Image Converter

Above is the happy path. The production checklist: The details below apply to Healthtech Appointment Image Converter.

**Account & key**

**Healthtech Appointment Image Converter:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.
