import { exit } from "process";
import { parseArgs } from "util";

export const parseCommandLineArguments = () => {
  try {
    const { values } = parseArgs({
      options: {
        help: {
          type: "boolean",
        },
        login: {
          type: "boolean",
        },
        email: {
          type: "string",
        },
        github: {
          type: "boolean",
        },
        clientId: {
          type: "string",
        },
        clientSecret: {
          type: "string",
        },
        setWebhook: {
          type: "boolean",
        },
      },
    });

    return values;
  } catch (error) {
    console.log("unknown command");
    exit(1);
  }
};
