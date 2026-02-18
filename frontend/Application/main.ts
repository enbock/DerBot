import Container from './Container';

/**
 * Main Entry Point (Frontend)
 */
async function main(): Promise<void> {
  const container = new Container();
  void container.startUp.initialize();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  void main();
}
