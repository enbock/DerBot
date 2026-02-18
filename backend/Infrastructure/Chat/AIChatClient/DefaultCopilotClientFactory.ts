import { CopilotClient } from '@github/copilot-sdk';
import type CopilotClientFactory from './CopilotClientFactory';

export default class DefaultCopilotClientFactory implements CopilotClientFactory {
  create(): CopilotClient {
    return new CopilotClient();
  }
}
