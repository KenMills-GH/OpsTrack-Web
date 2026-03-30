# Component: LoginView

# Prototype Reference: Login.html

## Objective

Build the secure authentication perimeter for OpsTrack. This is a centered glassmorphic card over a tactical grid background.

## Layout & Styling

- Background: Base `#0b1326` with a custom CSS grid overlay and CRT scanline effect.
- Card: `max-w-md`, centered, `bg-surface-container-low/80` with `backdrop-blur-xl`.
- Typography: Heavy use of monospace fonts for labels and tracking-widest.

## Functional Requirements

- Implement `react-hook-form` with `zod` validation.
- Schema:
  - `operatorId`: string, min 5 chars (Placeholder: CMD-XXXX-77).
  - `accessKey`: string, min 8 chars (Password field).
- Visual Feedback: Include a fake biometric scanning visual that pulses.
- State: On submit, mock an authentication payload and navigate to the Dashboard.
