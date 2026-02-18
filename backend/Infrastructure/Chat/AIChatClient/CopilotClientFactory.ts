import type { CopilotClient } from '@github/copilot-sdk';

export default interface CopilotClientFactory {
  create(): CopilotClient;
}
