# Code Style Guide: Import Order

To ensure consistency and readability, follow this import order in all code files:

**Native Imports**

- 'import React from "react";' is always the first line in a jsx/tsx file.
- Start with native libraries (e.g., `react`, `react-dom`, `react-redux`, etc.)

**Third-Party Imports**

- Add imports from external packages (e.g., chart libraries, date libraries, etc.)

**Local Imports**

- Add imports from local files (components, hooks, utils, styles, etc.)

---

## Example

```js
import React from "react";
import { useSelector } from "react-redux";

import Chart from "chart.js";
import dayjs from "dayjs";

import MyComponent from "./components/MyComponent";
import useCustomHook from "./hooks/useCustomHook";
```

---

- Always use one line separator between each import group.
- Group imports as described above in every file.
- Keep import paths clean and relative.
- Remove unused imports.

> **This guide is enforced for all PRs and code reviews.**
