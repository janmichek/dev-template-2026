# Strict Feature-Sliced Design

The UI is layered `app → pages → widgets → features → entities → shared`. Steiger's recommended rules all stay on, including `insignificant-slice`. A slice that only one other slice uses gets merged into that slice.

There is no `processes` layer. Slices are imported through `index.ts`. Imports between slices are relative so the pull-request diagram can see the edges. `fsd/import-locality` stays off for that reason.

Stories live in `stories/`, outside `src/`, so they are not modules on the diagram.
