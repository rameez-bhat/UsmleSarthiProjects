import { configure } from "@testing-library/react";
// Lazy route imports can take longer than one second on shared CI workers.
configure({ asyncUtilTimeout: 5000 });
