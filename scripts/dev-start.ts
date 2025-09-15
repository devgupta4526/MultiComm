import execa from "execa";

type Service = {
  name: string;
  command: string;
};

const services: Service[] = [
  { name: "auth-service", command: "serve" },
  { name: "@./product-service", command: "serve" },
  { name: "@./order-service", command: "serve" },
  { name: "@./chatting-service", command: "serve" },
  { name: "@./api-gateway", command: "serve" },
  { name: "@./user-ui", command: "dev" },
  { name: "@./seller-ui", command: "dev" },
  { name: "@./admin-ui", command: "dev" },
];

const portMap: Record<string, string> = {
  "@./user-ui": "3000",
  "@./seller-ui": "3001",
  "@./admin-ui": "3002",
};

async function ensureKafkaRunning(): Promise<void> {
  console.log("🔧 Verify Kafka broker is running before continuing...");
  // Implement your Kafka Docker check or startup here if needed
}

async function resetNxCache(): Promise<void> {
  console.log("🧹 Resetting Nx cache...");
  await execa("npx", ["nx", "reset"], { stdio: "inherit" });
  console.log("✅ Nx cache reset complete.");
}

async function runNxTarget(
  project: string,
  target: string,
  envVars: Record<string, string> = {}
): Promise<void> {
  console.log(`🔧 Starting ${project} with target ${target}...`);
  await execa("npx", ["nx", "run", `${project}:${target}`], {
    stdio: "inherit",
    env: { ...process.env, ...envVars },
  });
  console.log(`✅ ${project} started.`);
}

async function main() {
  try {
    await ensureKafkaRunning();
    await resetNxCache();

    for (const service of services) {
      const port = portMap[service.name];
      const env: Record<string, string> = {};
      if (port) {
        env.PORT = port;
      }
      await runNxTarget(service.name, service.command, env);
      // Delay 1 second before starting next for stability
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Optionally start kafka-service last
    console.log("🐘 Starting kafka-service (last)...");
    await runNxTarget("@./kafka-service", "serve");

  } catch (err) {
    console.error("❌ Error during startup:", err);
    process.exit(1);
  }
}

main();
