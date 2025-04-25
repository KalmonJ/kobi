import { executeCommandLineActions } from "./actions";
import { parseCommandLineArguments } from "./parse";

export function createCommandLine() {
  executeCommandLineActions(parseCommandLineArguments());
}
