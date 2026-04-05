import { spawn } from 'child_process';
import { SYSTEM_PROMPT } from './system-prompt';

const TIMEOUT_MS = 60_000; // 60s max per request

/**
 * Sends a message to Claude Code CLI and returns the response.
 * Uses the user's existing Claude subscription – no API key needed.
 */
export function askClaude(userMessage: string, conversationContext: string = ''): Promise<string> {
  return new Promise((resolve, reject) => {
    // Kontext + aktuelle Nachricht kombinieren
    const fullPrompt = conversationContext
      ? `${conversationContext}\nNils: ${userMessage}\n\nBitte antworte auf die aktuelle Nachricht von Nils. Beziehe dich auf den bisherigen Gesprächsverlauf wenn relevant.`
      : userMessage;

    const args = [
      '-p', fullPrompt,
      '--system-prompt', SYSTEM_PROMPT,
      '--allowedTools', 'bash',
      '--max-turns', '5',
      '--dangerously-skip-permissions',
    ];

    const claudePath = process.env.CLAUDE_PATH || '/opt/homebrew/bin/claude';
    const proc = spawn(claudePath, args, {
      cwd: process.env.PROJECT_DIR || '/Users/nils/MeinKalender',
      timeout: TIMEOUT_MS,
      env: { ...process.env, FORCE_COLOR: '0', PATH: process.env.PATH + ':/opt/homebrew/bin:/usr/local/bin' },
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0 && stdout.trim()) {
        resolve(cleanResponse(stdout.trim()));
      } else if (stdout.trim()) {
        // Sometimes exits non-zero but still has useful output
        resolve(cleanResponse(stdout.trim()));
      } else {
        reject(new Error(`Claude exited with code ${code}: ${stderr}`));
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to start Claude: ${err.message}`));
    });

    // Timeout safety
    setTimeout(() => {
      proc.kill('SIGTERM');
      reject(new Error('Claude timed out after 60s'));
    }, TIMEOUT_MS);
  });
}

/**
 * Remove ANSI codes and excessive whitespace from Claude's output.
 */
function cleanResponse(text: string): string {
  return text
    .replace(/\x1b\[[0-9;]*m/g, '') // ANSI color codes
    .replace(/\x1b\[[0-9;]*[A-Za-z]/g, '') // Other ANSI sequences
    .replace(/\n{3,}/g, '\n\n') // Collapse multiple newlines
    .trim();
}
