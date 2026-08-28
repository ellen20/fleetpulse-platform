// helpers/dialogs.ts
import type { Page, Dialog } from '@playwright/test';

export function captureDialogs(page: Page) {
  const messages = { confirm: '', alert: '' };
  const handler = async (dialog: Dialog) => {
    if (dialog.type() === 'confirm') messages.confirm = dialog.message();
    else messages.alert = dialog.message();
    await dialog.accept();
  };
  page.on('dialog', handler);
  return { messages, stop: () => page.off('dialog', handler) };
}