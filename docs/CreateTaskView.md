# Component: CreateTaskView (Initiate New Operation)

# Prototype Reference: NewOp.html

## Objective

A complex data-entry form for commanders to draft and deploy new missions.

## Layout & Styling

- Header: Contains "SECURITY_STATUS: ENCRYPTED" badge and "INITIATE_NEW_OPERATION" title.
- Sections: Broken into distinct tactical cards (`bg-surface-container-low`):
  1. Operation Identity (Inputs: Name, Codename)
  2. Priority Matrix (Selectable custom buttons for CRITICAL, HIGH, MEDIUM, LOW)
  3. Deployment Data (Coordinates, Assigned Operators dropdown)
  4. Tactical Briefing (Textarea with a custom terminal cursor CSS)
  5. Execution Steps (Dynamic list of subtasks).

## Functional Requirements

- Form Management: Use `react-hook-form` with `useFieldArray` for the Execution Steps so the user can dynamically add or remove objectives.
- Validation: Zod schema ensuring all critical mission parameters are filled before deployment.
- Submission: Use `useMutation` to send data to the backend, then redirect to Dashboard.
