'use client';

import { useState, useEffect } from 'react';

interface TimeStatus {
  devModeEnabled: boolean;
  virtualDate: string;
  realDate: string;
  offsetDays: number;
  offsetMs: number;
}

export default function DevToolsPage() {
  const [timeStatus, setTimeStatus] = useState<TimeStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch time status on load and refresh periodically
  useEffect(() => {
    fetchTimeStatus();
    const interval = setInterval(fetchTimeStatus, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  async function fetchTimeStatus() {
    try {
      const res = await fetch('/api/dev/time/status');
      const data = await res.json();

      if (res.ok) {
        setTimeStatus(data);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch status');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    }
  }

  async function advanceTime(days: number) {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/dev/time/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setTimeStatus(data.status);
      } else {
        setError(data.error || 'Failed to advance time');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  async function resetTime() {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/dev/time/reset', {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setTimeStatus(data.status);
      } else {
        setError(data.error || 'Failed to reset time');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  if (!timeStatus) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading dev tools...</div>
      </div>
    );
  }

  if (!timeStatus.devModeEnabled) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-8 max-w-2xl">
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            ⚠️ Dev Mode Not Enabled
          </h1>
          <p className="text-gray-300 mb-4">
            To use dev tools, add the following to your <code className="bg-gray-800 px-2 py-1 rounded">.env.local</code>:
          </p>
          <pre className="bg-gray-800 p-4 rounded text-sm text-green-400">
            {`DEV_MODE=true
NODE_ENV=development`}
          </pre>
          <p className="text-gray-400 mt-4 text-sm">
            Restart your dev server after making changes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Warning Banner */}
      <div className="bg-orange-600 text-white px-6 py-3 rounded-lg mb-6 font-semibold text-center">
        ⚠️ DEVELOPMENT MODE - DO NOT USE IN PRODUCTION
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Status Card */}
        <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🕐</span>
            System Time
          </h2>

          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-400">Real Time</div>
              <div className="text-lg font-mono">{formatDate(timeStatus.realDate)}</div>
            </div>

            <div>
              <div className="text-sm text-gray-400">Virtual Time</div>
              <div className="text-lg font-mono text-blue-400">{formatDate(timeStatus.virtualDate)}</div>
            </div>

            <div>
              <div className="text-sm text-gray-400">Time Offset</div>
              <div className="text-lg font-semibold">
                {timeStatus.offsetDays > 0 ? '+' : ''}{timeStatus.offsetDays.toFixed(2)} days
              </div>
              {timeStatus.offsetDays > 0 && (
                <div className="text-xs text-gray-500">
                  ({timeStatus.offsetMs.toLocaleString()} ms)
                </div>
              )}
            </div>
          </div>

          {/* Time Controls */}
          <div className="mt-6 pt-6 border-t-2 border-gray-700">
            <h3 className="text-sm font-semibold mb-3 text-gray-300">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => advanceTime(1)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                +1 Day
              </button>
              <button
                onClick={() => advanceTime(7)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                +1 Week
              </button>
              <button
                onClick={() => advanceTime(0.5)}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                +12 Hours
              </button>
              <button
                onClick={() => advanceTime(14)}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                +2 Weeks
              </button>
            </div>

            <button
              onClick={resetTime}
              disabled={loading}
              className="w-full mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🔄 Reset to Real Time
            </button>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>⚡</span>
            Quick Actions
          </h2>

          <div className="space-y-3">
            <div className="bg-gray-700/50 rounded p-4">
              <h3 className="font-semibold mb-2">Coming Soon</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Skip to Next Battle</li>
                <li>• Complete Current Prep</li>
                <li>• Generate Battle Offers</li>
                <li>• Trigger Due Battles</li>
                <li>• Simulate Week</li>
                <li>• Simulate Season</li>
              </ul>
            </div>

            <div className="bg-blue-900/30 border-2 border-blue-700 rounded p-4">
              <h3 className="font-semibold text-blue-400 mb-2">🚧 Phase 1 Complete</h3>
              <p className="text-sm text-gray-300">
                Time manipulation system is ready! More dev tools coming in Phase 2-4.
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="lg:col-span-2 bg-green-900/50 border-2 border-green-500 rounded-lg p-4">
            <p className="text-green-400">✓ {message}</p>
          </div>
        )}

        {error && (
          <div className="lg:col-span-2 bg-red-900/50 border-2 border-red-500 rounded-lg p-4">
            <p className="text-red-400">✗ {error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="lg:col-span-2 bg-gray-800/50 border-2 border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-3">📖 How to Use</h2>
          <div className="text-sm text-gray-300 space-y-2">
            <p>
              <strong>1. Advance Time:</strong> Click the time advance buttons to skip forward.
              All scheduled battles, prep deadlines, and offers will respect the virtual time.
            </p>
            <p>
              <strong>2. Reset Time:</strong> Returns virtual time to real time (zero offset).
              Useful when you want to stop time manipulation.
            </p>
            <p>
              <strong>3. More Tools Coming:</strong> Phase 2-4 will add battle controls, season simulation, and config editing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
