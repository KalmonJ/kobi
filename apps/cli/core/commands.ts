import { OAuthApp, Octokit, RequestError } from "octokit";
import { join } from "node:path";
import { homedir } from "node:os";
import inquirer from "inquirer";
import { exit } from "node:process";

export function helpCommand() {
  console.log("Options:");
  console.log("\n");
  console.log("--login:          configure login credentials");
  console.log("--github:         configure github credentials");
  console.log("--email:          configure email credentials");
  console.log("--clientId:       configure github client id credentials");
  console.log("--clientSecret:   configure github client secret credentials");
  console.log("\n");
  console.log("Usage:");
  console.log("\n");
  console.log("reviewer --login --email <EMAIL>");
  console.log(
    "reviewer --config --clientId <GITHUB_CLIENT_ID> --clientSecret <GITHUB_CLIENT_SECRET>"
  );
}

export async function loginCommand(email: string) {
  const res = await fetch("http://localhost:3000/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  console.log(data.message);
}

async function saveGithubCredentials({
  clientId,
  clientSecret,
  token,
  repo,
}: {
  token: string;
  clientId: string;
  clientSecret: string;
  repo: string;
}) {
  const octokit = new Octokit({ auth: token });
  const authenticated = await octokit.rest.users.getAuthenticated();

  const res = await fetch("http://localhost:3000/users", {
    method: "POST",
    body: JSON.stringify({
      email: authenticated.data.email,
      name: authenticated.data.name,
      avatar: authenticated.data.avatar_url,
      username: authenticated.data.login,
    }),
  });

  const json = await res.json();

  await fetch("http://localhost:3000/sessions", {
    method: "POST",
    body: JSON.stringify({
      token,
      clientId,
      clientSecret,
      userId: json.data.id,
      repo,
    }),
  });
}

async function getGithubToken(clientId: string, clientSecret: string) {
  const oauth = new OAuthApp({
    clientId,
    clientSecret,
    clientType: "oauth-app",
  });

  const { authentication } = await oauth.createToken({
    scopes: ["repo", "admin:repo_hook", "user", "user:email"],
    onVerification(verification) {
      console.log("\n");
      console.log("🔐 Autentication required!");
      console.log(`👉 Access: ${verification.verification_uri}`);
      console.log(`🔑 Code: ${verification.user_code}`);
    },
  });

  console.log("\n");
  console.log("Authentication success 🎉");

  return authentication.token;
}

export async function githubCommand({
  clientId,
  clientSecret,
}: {
  clientId: string;
  clientSecret: string;
}) {
  const token = await getGithubToken(clientId, clientSecret);
  const dirPath = join(homedir(), ".reviewer");
  const filePath = join(dirPath, "credentials.json");

  const credentials = {
    githubToken: token,
    clientId,
    clientSecret,
  };

  await Bun.write(filePath, JSON.stringify(credentials), {
    createPath: true,
  });
}

async function getGithubCredentialsFromReviewer() {
  const dirPath = join(homedir(), ".reviewer");
  const filePath = join(dirPath, "credentials.json");
  const file = Bun.file(filePath);
  const credentials = await file.json();
  return credentials;
}

export async function webhookCommand() {
  try {
    const credentials = await getGithubCredentialsFromReviewer();
    const octokit = new Octokit({ auth: credentials.githubToken });

    const repos = await octokit.paginate(
      octokit.rest.repos.listForAuthenticatedUser,
      {
        affiliation: "owner",
      }
    );
    const choices = repos.map((repo) => repo.name);

    const prompt = await inquirer.prompt([
      {
        name: "repo",
        message: "Please select a repo:",
        type: "list",
        choices: choices,
      },
      {
        name: "repoConfirmation",
        message: ({ repo }) => {
          return `Do you really want to add the webhook to this repository?(${repo})`;
        },
        type: "confirm",
      },
    ]);

    if (!prompt.repoConfirmation) return exit(0);

    const selectedRepository = repos.find((repo) => repo.name === prompt.repo);

    if (!selectedRepository) {
      console.log("Repository not found");
      exit(1);
    }

    await saveGithubCredentials({
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      token: credentials.githubToken,
      repo: selectedRepository.full_name,
    });

    await octokit.rest.repos.createWebhook({
      owner: selectedRepository.owner.login,
      repo: selectedRepository.name,
      active: true,
      config: {
        url: "https://smee.io/GhVExw3PJlxbEkoN",
        secret: "SEGREDO SEGURO",
        insecure_ssl: "0",
        content_type: "json",
      },
      events: ["pull_request"],
    });

    console.log("\n");
    console.log("Webhook successfully created 🎉");
    exit(0);
  } catch (error) {
    if (error instanceof RequestError) {
      if (error.response && error.response.data) {
        console.log(error.response);
        exit(1);
      }
      console.log(error.message);
      exit(1);
    }
    if (error instanceof Error) {
      console.log(error.message);
    }

    exit(1);
  }
}
