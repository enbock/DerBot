import Container from './Container';

/**
 * Main Entry Point
 * Initialisiert Container und startet Controller
 */
async function main(): Promise<void> {
  const container = new Container();
  await container.startUp.start();
}

main().catch((error) => {
  console.error('Application error:', error);
  process.exit(1);
});
