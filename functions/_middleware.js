///////////////////////////////////////////////
// Copyright (C) t.me/nkka404
// Channel: https://t.me/premium_channel_404
// Description: Entry point with Webhook Auto-Configuration
///////////////////////////////////////////////

import { handleUpdate } from './handlers';
import { TELEGRAM_BOT_TOKEN_ENV } from './config.js';

/**
 * Function to configure the Telegram Webhook.
 * It ensures 'chat_member' updates are included in allowed_updates.
 * @param {Request} request The incoming HTTP request.
 * @param {Object} env Environment variables containing the bot token.
 */
async function configureWebhook(request, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const url = new URL(request.url);
    
    // Construct the Webhook URL dynamically based on the current domain
    const webhookUrl = `${url.protocol}//${url.hostname}/`;

    const apiTarget = `https://api.telegram.org/bot${token}/setWebhook`;
    
    // Request Telegram to send specific update types to this worker
    const response = await fetch(apiTarget, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            url: webhookUrl,
            allowed_updates: ["message", "callback_query", "chat_member", "my_chat_member"],
            drop_pending_updates: true
        })
    });

    const result = await response.json();
    
    // Return the result as a JSON response for debugging in browser
    return new Response(JSON.stringify({
        success: result.ok,
        status: result.description,
        webhook_endpoint: webhookUrl,
        active_updates: ["message", "callback_query", "chat_member", "my_chat_member"]
    }), { headers: { 'Content-Type': 'application/json' } });
}

// Main Cloudflare Worker entry point.
 // Intercepts all incoming traffic to the bot's URL.
export async function onRequest(context) {
    const { request, env, waitUntil } = context;
    const url = new URL(request.url);

    // 1. Endpoint to manually trigger Webhook setup (Visit /set-webhook in browser)
    if (url.pathname === '/set-webhook') {
        return await configureWebhook(request, env);
    }

    // 2. Filter requests: Only process POST requests from Telegram
    if (request.method !== 'POST') {
        return new Response('Bot is active. Use POST for updates or visit /set-webhook to configure.', { status: 200 });
    }

    try {
        // Parse the incoming JSON update from Telegram
        const update = await request.json();
        
        // Use waitUntil to process the update asynchronously.
        // This allows the Worker to return 'OK' immediately to Telegram while still running the bot logic.
        waitUntil(handleUpdate(update, env));

        return new Response('OK', { status: 200 });
    } catch (e) {
        console.error('Update Processing Error:', e);
        // Always respond with 200 OK to Telegram to prevent retry loops on faulty updates
        return new Response('Internal Server Error', { status: 200 });
    }
}
