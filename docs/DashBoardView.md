# Component: DashboardView

# Prototype Reference: dashboard.html

## Objective

The Global Command Board. A full-screen layout with a persistent sidebar, top navigation, and a main data grid displaying system health and active missions.

## Layout & Styling

- Sidebar: Fixed width (w-64), dark slate gradient.
- TopBar: Sticky, contains operator metadata and system status indicators.
- Main Grid: 12-column CSS Grid.
  - Left Column (col-span-3): System Health stats, Map preview widget, Intel feed.
  - Right Column (col-span-9): Mission Table and Priority filter tabs.

## Functional Requirements

- Data Fetching: Use `useQuery` to fetch the mission list.
- Mission Table:
  - Columns: ID, Operation Name, Priority (Badge), Operators (Avatars), Progress (Bar).
  - Hover states should highlight the row and reveal an "open_in_new" action icon.
- Split the Sidebar and TopBar into reusable components (`<Sidebar />`, `<TopNavBar />`) so they can wrap other pages via a Layout component.
