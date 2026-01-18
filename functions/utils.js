import { MESSAGES, BOT_USERNAME, MMT_OFFSET_SECONDS, TELEGRAM_BOT_TOKEN_ENV } from './config.js';

// Telegram API base URL (Token will be dynamically provided)
const TELEGRAM_BASE_URL = 'https://api.telegram.org/bot';

// =========================================================================
// LOCALIZATION & TEXT UTILITIES
// =========================================================================

/**
 * Get localized text for a key.
 */
export function get_text(key, lang) {
    const DEFAULT_LANG = 'en'; // Hardcoded fallback
    return MESSAGES[key]?.[lang] ?? MESSAGES[key]?.[DEFAULT_LANG] ?? `[${key}]`;
}

/**
 * Custom sprintf-like function for localization.
 */
export function formatText(template, ...args) {
    let i = 0;
    return template.replace(/%s|%d|%(\.\d+)f/g, (match) => {
        const arg = args[i++];
        if (match === '%d') return parseInt(arg).toLocaleString();
        if (match.endsWith('f')) {
            const precision = match.match(/\.(\d+)/)?.[1] ?? 1;
            return parseFloat(arg).toFixed(parseInt(precision));
        }
        return arg;
    });
}

/**
 * Formats a Unix timestamp into 'YYYY-MM-DD hh:mm:ss A' in MMT (UTC + 6 hours 30 minutes).
 */
export function formatTimeMMT(timestamp) {
    const date = new Date(timestamp * 1000);
    const mmtTime = new Date(date.getTime() + MMT_OFFSET_SECONDS * 1000);

    const year = mmtTime.getUTCFullYear();
    const month = String(mmtTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(mmtTime.getUTCDate()).padStart(2, '0');
    let hours = mmtTime.getUTCHours();
    const minutes = String(mmtTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(mmtTime.getUTCSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    // @ts-ignore
    hours = String(hours).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${ampm}`;
}

/**
 * Normalizes command text by checking for multiple valid prefixes.
 */
export function extractCommand(text) {
    text = text.trim();
    const prefixes = ['/', '#', '.', ','];
    for (const prefix of prefixes) {
        if (text.startsWith(prefix)) {
            const parts = text.substring(prefix.length).split(' ', 2);
            let command = parts[0];
            const baseCommand = command.toLowerCase().replace(new RegExp('@' + BOT_USERNAME + '?', 'i'), '');
            const paramString = text.substring(prefix.length + command.length).trim();
            return { base: baseCommand, full: command, params: paramString };
        }
    }
    return null;
}

/**
 * Utility to get a display name, escaping underscores for Telegram Markdown.
 */
export function getSafeDisplayName(user) {
    if (!user) return 'N/A';
    const fullName = (user.first_name + ' ' + (user.last_name ?? '')).trim();
    const rawDisplayName = fullName || (user.username ? `@${user.username}` : String(user.user_id));

    // Escape underscores in the display name (and username)
    return rawDisplayName.replace(/_/g, '\\_');
}

/**
 * Generate a random alphanumeric key (e.g., 12 chars).
 */
export function generateRandomKey(length = 12) {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomString;
}

// =========================================================================
// TELEGRAM API UTILITIES
// =========================================================================

/**
 * Send HTTP request (general purpose).
 * NOTE: This is used for BOTH Telegram API and V2Ray API calls.
 */
export async function sendRequest(url, data = null) {
    const options = {
        method: data ? 'POST' : 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : null,
    };

    try {
        const response = await fetch(url, options);
        const httpCode = response.status;
        const responseData = await response.json().catch(() => null);

        return {
            success: response.ok,
            data: responseData,
            http_code: httpCode
        };
    } catch (error) {
        console.error("Fetch Error:", error);
        return {
            success: false,
            data: null,
            http_code: 0
        };
    }
}

/**
 * Constructs the full Telegram API URL for a specific method.
 */
function getTelegramApiUrl(method, token) {
    return `${TELEGRAM_BASE_URL}${token}/${method}`;
}

/**
 * Send Telegram message with Markdown and disable web page preview.
 */
export async function sendMessage(chatId, text, replyMarkup = null, disablePreview = true, token = null) {
    if (!token) throw new Error("Telegram Bot Token is required for sendMessage.");
    
    const data = {
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
        disable_web_page_preview: disablePreview
    };

    if (replyMarkup) {
        data.reply_markup = replyMarkup;
    }

    return sendRequest(getTelegramApiUrl('sendMessage', token), data);
}

/**
 * Edit message text and reply markup.
 */
export async function editMessageText(chatId, messageId, text, replyMarkup = null, disablePreview = true, token = null) {
    if (!token) throw new Error("Telegram Bot Token is required for editMessageText.");

    const data = {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        parse_mode: 'Markdown',
        disable_web_page_preview: disablePreview
    };

    if (replyMarkup) {
        data.reply_markup = replyMarkup;
    }

    return sendRequest(getTelegramApiUrl('editMessageText', token), data);
}

/**
 * Helper function to send an initial message or edit an existing one.
 */
export async function sendOrEditMessage(chatId, text, messageId = null, replyMarkup = null, token = null) {
    if (!token) throw new Error("Telegram Bot Token is required for sendOrEditMessage.");

    if (messageId) {
        const result = await editMessageText(chatId, messageId, text, replyMarkup, true, token);
        if (result.success) return result;
    }
    // If edit failed or no messageId provided, send new message
    return sendMessage(chatId, text, replyMarkup, true, token);
}

export async function deleteMessage(chatId, messageId, token = null) {
    if (!token) throw new Error("Telegram Bot Token is required for deleteMessage.");

    return sendRequest(getTelegramApiUrl('deleteMessage', token), {
        chat_id: chatId,
        message_id: messageId
    });
}

export async function sendPhoto(chatId, fileId, caption = '', token = null) {
    if (!token) throw new Error("Telegram Bot Token is required for sendPhoto.");

    const data = {
        chat_id: chatId,
        photo: fileId,
        caption: caption,
        parse_mode: 'Markdown'
    };
    return sendRequest(getTelegramApiUrl('sendPhoto', token), data);
}

export async function sendDocument(chatId, fileId, caption = '', token = null) {
    if (!token) throw new Error("Telegram Bot Token is required for sendDocument.");

    const data = {
        chat_id: chatId,
        document: fileId,
        caption: caption,
        parse_mode: 'Markdown'
    };
    return sendRequest(getTelegramApiUrl('sendDocument', token), data);
}

export async function sendVideo(chatId, fileId, caption = '', token = null) {
    if (!token) throw new Error("Telegram Bot Token is required for sendVideo.");

    const data = {
       chat_id: chatId,
       video: fileId,
       caption: caption,
       parse_mode: 'Markdown'
    };
    return sendRequest(getTelegramApiUrl('sendVideo', token), data);
}

/**
 * Checks if a user is a member of the specified channel.
 */
export async function checkChannelMembership(userId, channelId, token = null) {
    if (!token) throw new Error("Telegram Bot Token is required for checkChannelMembership.");

    const url = getTelegramApiUrl('getChatMember', token);
    const data = {
        chat_id: channelId,
        user_id: userId
    };

    const response = await sendRequest(url, data);

    if (response.success && response.data?.ok) {
        const status = response.data.result.status;
        return ['member', 'administrator', 'creator'].includes(status);
    }

    return false;
}
