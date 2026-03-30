# Component: OperatorRosterView

# Prototype Reference: adminPersonnel.html

## Objective

An administrative dashboard for managing personnel, restricted to Commander/Admin roles.

## Layout & Styling

- Header: Features a "Security Clearance Level 5 Required" warning label.
- KPI Grid: 4 cards showing Total Personnel, Active Duty, Standby Status, and Admin Overhead. Use bold typography and progress bars.
- Table: High-density data table displaying Operator ID, Name/Avatar, Rank, Role (Badge), Status (Pulsing dot), and an actions menu.

## Functional Requirements

- Filtering: Include a search input for Operator ID and a dropdown filter for Roles (Admin vs Member).
- Audit Log: Include a scrolling terminal window at the bottom of the page that renders mock system events (e.g., "AUTH_SUCCESS", "RBAC_NOTICE") to enhance the tactical feel.
