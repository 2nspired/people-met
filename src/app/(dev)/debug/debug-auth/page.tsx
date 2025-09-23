"use client";

import { useState } from "react";

import { createClient } from "~/utilities/supabase/client";

export default function DebugAuthPage() {
  const [status, setStatus] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const checkEnvironment = () => {
    addLog("🔍 Checking environment variables...");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    addLog(
      `NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "✅ Set" : "❌ Missing"}`,
    );
    addLog(
      `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? "✅ Set" : "❌ Missing"}`,
    );

    if (!supabaseUrl || !supabaseKey) {
      addLog("❌ Missing required environment variables!");
      setStatus("Environment variables missing");
      return;
    }

    addLog("✅ Environment variables are set");
    setStatus("Environment OK");
  };

  const testConnection = async () => {
    addLog("🔌 Testing Supabase connection...");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        addLog(`❌ Connection error: ${error.message}`);
        setStatus("Connection failed");
      } else {
        addLog("✅ Supabase connection successful");
        addLog(`Session: ${data.session ? "Active" : "No active session"}`);
        setStatus("Connection OK");
      }
    } catch (err) {
      addLog(`❌ Unexpected error: ${String(err)}`);
      setStatus("Connection failed");
    }
  };

  const clearSession = async () => {
    addLog("🚪 Clearing current session...");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        addLog(`❌ Signout error: ${error.message}`);
      } else {
        addLog("✅ Session cleared successfully");
        setStatus("Session cleared");
      }
    } catch (err) {
      addLog(`❌ Unexpected error: ${String(err)}`);
    }
  };

  const testSignup = async () => {
    addLog("📝 Testing signup with test email...");

    try {
      const supabase = createClient();
      const testEmail = `thomastrudzinski@me.com`;
      const testPassword = "testpassword123";

      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      addLog(`Raw response data: ${JSON.stringify(data, null, 2)}`);
      addLog(`Raw error: ${JSON.stringify(error, null, 2)}`);

      if (error) {
        addLog(`❌ Signup error: ${error.message}`);
        addLog(`Error code: ${error.status ?? "No status"}`);
        addLog(`Error name: ${error.name ?? "No name"}`);
        addLog(`Full error: ${JSON.stringify(error, null, 2)}`);
        setStatus("Signup failed");
      } else {
        addLog("✅ Signup successful (check email for confirmation)");
        addLog(`User ID: ${data.user?.id}`);
        addLog(
          `Email confirmed: ${data.user?.email_confirmed_at ? "Yes" : "No"}`,
        );
        setStatus("Signup OK");
      }
    } catch (err) {
      addLog(`❌ Unexpected error: ${String(err)}`);
      setStatus("Signup failed");
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Supabase Auth Debug</h1>

      <div className="mb-6">
        <h2 className="mb-4 text-xl font-semibold">Status: {status}</h2>

        <div className="mb-4 space-x-4">
          <button
            onClick={checkEnvironment}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Check Environment
          </button>

          <button
            onClick={testConnection}
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            Test Connection
          </button>

          <button
            onClick={clearSession}
            className="rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
          >
            Clear Session
          </button>

          <button
            onClick={testSignup}
            className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
          >
            Test Signup
          </button>
        </div>
      </div>

      <div className="rounded bg-gray-100 p-4">
        <h3 className="mb-2 font-semibold">Debug Logs:</h3>
        <div className="space-y-1 font-mono text-sm">
          {logs.map((log, index) => (
            <div key={index} className="text-gray-700">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
