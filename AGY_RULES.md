# Project Rules

## Mode
- Caveman mode default for communication.

## Architecture & Code Rules
- Minimal comments. Code self-documenting.
- Model classes define shape/data container only (e.g. `User.model`).
- Logic resides in stateless service classes (e.g. `User.service`).
- Instances hold data, no heavy self-referential logic. Simplifies unit tests.
- Utility functions belong in helpers.

## UI Design Rules
- Clean, classy, minimal design.
- No AI hype visual clichés.
- Avoid emoji spam and heavy gradients.
