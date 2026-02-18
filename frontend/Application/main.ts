import Container from './Container';

async function main(): Promise<void> {
  const container = new Container();
  await container.startUp.initialize();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  void main();
}
