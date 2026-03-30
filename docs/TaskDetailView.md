# Component: TaskDetailView (Mission Briefing)

# Prototype Reference: missionBrief.html

## Objective

A deep-dive view into a specific mission, featuring a bento-box grid layout, interactive checklist, and a comms log.

## Layout & Styling

- Header: Mission ID, Timestamp, large Operation Title, and Status Controller (Pending, In Progress, Completed).
- Main Grid:
  - Left (col-span-8): Tactical Map visual, Mission Briefing text block, Execution Checklist.
  - Right (col-span-4): Tactical Comms Log and Signal Integrity widget.

## Functional Requirements

- Checklist: Render the subtasks. Clickable states should toggle between pending (empty box), processing (pulsing green), and completed (checked and struck through).
- Comms Log: A scrollable chat interface with alternating message styles for "OPERATOR_ALPHA", "SYSTEM_AUTO", and "COMMAND_LEAD". Include a text input at the bottom to submit new logs.
