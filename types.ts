
export type Marks = 1 | 2 | 3 | 5;

export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  isError?: boolean;
}

// Manually define the subset of the Google Identity Services API we use
// to avoid external dependency issues and improve robustness.
interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleAccountsId {
  initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void; }) => void;
  renderButton: (parent: HTMLElement, options: { [key: string]: any }) => void;
  disableAutoSelect: () => void;
  revoke: (email: string, done: () => void) => void;
}

declare global {
    interface Window {
        google?: {
            accounts: {
                id: GoogleAccountsId;
            }
        };
        process: {
            env: {
                GOOGLE_CLIENT_ID: string;
            }
        }
    }
}