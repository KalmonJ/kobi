import {
  githubCommand,
  helpCommand,
  loginCommand,
  webhookCommand,
} from "./commands";
import type { parseCommandLineArguments } from "./parse";

const commands = {
  login: ["login", "email"],
  github: ["github", "clientId", "clientSecret"],
  webhook: ["setWebhook"],
};

function validateCommandSequence(
  base: string[],
  args: ReturnType<typeof parseCommandLineArguments>
) {
  const entries = Object.entries(args).map((arg) =>
    Boolean(arg[1]) ? arg[0] : ""
  );
  return base.every((option) => entries.indexOf(option) >= 0);
}

export const executeCommandLineActions = (
  args: ReturnType<typeof parseCommandLineArguments>
) => {
  const matchLoginCommand = validateCommandSequence(commands.login, args);
  const matchGithubCommand = validateCommandSequence(commands.github, args);
  const matchWebhookCommand = validateCommandSequence(commands.webhook, args);

  if (matchLoginCommand) {
    loginCommand(args.email!);
    return;
  }

  if (matchGithubCommand) {
    githubCommand({
      clientId: args.clientId!,
      clientSecret: args.clientSecret!,
    });
    return;
  }

  if (matchWebhookCommand) {
    webhookCommand();
    return;
  }

  helpCommand();
};
