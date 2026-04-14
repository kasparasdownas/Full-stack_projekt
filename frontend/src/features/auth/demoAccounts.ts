export interface DemoAccount {
  label: string;
  email: string;
  password: string;
}

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    label: 'Alice (User)',
    email: 'alice@example.com',
    password: 'Password123!',
  },
  {
    label: 'Bob (User)',
    email: 'bob@example.com',
    password: 'Password123!',
  },
  {
    label: 'Admin',
    email: 'admin@example.com',
    password: 'Admin123!',
  },
];
