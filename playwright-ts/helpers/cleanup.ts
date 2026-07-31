const API = 'http://localhost:3001/api';

interface Assignment {
  id: number;
  status: string;
}

/**
 * Cancels every pending/active assignment before a test runs so each test
 * starts from a known-clean state regardless of what previous runs left behind.
 */
export async function resetAssignments(): Promise<void> {
  const res = await fetch(`${API}/assignments`);
  if (!res.ok) throw new Error(`Cleanup fetch failed: ${res.status}`);

  const assignments: Assignment[] = await res.json();
  await Promise.all(
    assignments.map(a =>
      fetch(`${API}/assignments/${a.id}/cancel`, { method: 'PATCH' })
    )
  );
}
