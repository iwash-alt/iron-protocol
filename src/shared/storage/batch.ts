interface BatchOperation {
  key: string;
  value: unknown;
}

export function batchSave(operations: BatchOperation[]): void {
  const serialized = operations.map(op => ({
    key: op.key,
    json: JSON.stringify(op.value),
  }));

  localStorage.setItem('_tx_pending', JSON.stringify({
    keys: serialized.map(s => s.key),
    timestamp: Date.now(),
  }));

  for (const { key, json } of serialized) {
    localStorage.setItem(key, json);
  }

  localStorage.removeItem('_tx_pending');
}

export function recoverPendingTransaction(): { recovered: true; keys: string[] } | null {
  const tx = localStorage.getItem('_tx_pending');
  if (!tx) return null;

  try {
    const parsed = JSON.parse(tx) as { keys?: string[]; timestamp?: number };
    const keys = Array.isArray(parsed.keys) ? parsed.keys : [];
    const timestamp = typeof parsed.timestamp === 'number' ? parsed.timestamp : 0;
    const age = Date.now() - timestamp;

    if (age > 5000) {
      console.warn('Recovering from interrupted save. Keys:', keys);
      localStorage.removeItem('_tx_pending');
      return { recovered: true, keys };
    }
  } catch (err) {
    console.warn('Failed to parse pending transaction metadata:', err);
    localStorage.removeItem('_tx_pending');
  }

  return null;
}
