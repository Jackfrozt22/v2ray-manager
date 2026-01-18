import {
    get_text,
    formatText,
    extractCommand,
    getSafeDisplayName,
    sendOrEditMessage,
    sendMessage,
    editMessageText,
    deleteMessage,
    generateRandomKey,
    checkChannelMembership,
    sendPhoto,
    sendDocument,
    sendVideo,
} from './utils.js';

import {
    get_user_language,
    getUserById,
    getUserByCriteria,
    isUserBanned,
    setBanStatus,
    getUserState,
    setUserState,
    saveUser,
    setUserLanguage,
    getUserStats,
    getUserActivityStats,
    cleanReferrerId,
    awardReferralCreditOnVerify,
    setCredits,
    savePremiumKey,
    saveUserRedeemedKey,
    getUserRedeemedKeys,
    deleteUserRedeemedKey,
    isAdmin,
} from './db.js';

import {
    createTrialAccount,
    getTrialKey,
    createPremiumAccount,
    deletePremiumAccount,
    deleteTrialAccount,
    deleteExpiredAccounts,
    checkV2RayAccount,
    transferAccount,
    resetTrafficUsage,
    modifyAccountDetails,
    bulkCreateAccounts,
    runExpiryWarnings,
    getOptimalPanel,
    getPanelStats,
    getOnlineUsers,
} from './api.js';

import {
    BOT_USERNAME,
    CHANNEL_ID,
    CHANNEL_URL,
    OWNER_URL,
    ADMIN_IDS,
    PREMIUM_PLANS,
    PREMIUM_DEFAULT_DAYS,
    PREMIUM_PANEL_ID,
    PAYMENT_METHODS,
    DEFAULT_LANG,
    LANG_EN,
    LANG_MY,
    USERS_PER_PAGE,
    ONLINE_USERS_PER_PAGE,
    REDEEMED_KEYS_PER_PAGE,
    BROADCAST_BATCH_SIZE,
    BROADCAST_DELAY_MS,
    PREMIUM_CREDIT_PLANS,
    CREDIT_COST_PER_GB,
    REFERRAL_REWARD,
    SERVER_NAMES,
    TELEGRAM_BOT_TOKEN_ENV,
} from './config.js';

// =========================================================================
// TELEGRAM BOT FUNCTIONS (BROADCAST/MEDIA)
// =========================================================================

/**
 * @description Processes a broadcast message by sending it to all users in batches.
 * @param {Object} env Cloudflare environment object
 */
export async function processBroadcast(message, totalUsers, userList, loadingMessageId, chatId, lang, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    if (!token) {
        console.error("TELEGRAM_BOT_TOKEN is missing in env.");
        return { success: false, error: "Bot token not configured." };
    }

    let messageType = 'text';
    let content = '';
    let media = null;

    // Determine message type and content/media details
    if (message.text) {
        content = message.text;
        messageType = 'text';
    } else if (message.photo) {
        const photo = message.photo.slice(-1)[0];
        const fileId = photo.file_id;
        content = message.caption ?? '';
        messageType = 'photo';
        media = { url: fileId };
    } else if (message.document) {
        const fileId = message.document.file_id;
        content = message.caption ?? '';
        messageType = 'document';
        media = { url: fileId };
    } else if (message.video) {
      const fileId = message.video.file_id;
      content = message.caption ?? '';
      messageType = 'video';
      media = { url: fileId };
    }

    let successCount = 0;
    let failedCount = 0;
    // @ts-ignore
    const totalBatches = Math.ceil(totalUsers / BROADCAST_BATCH_SIZE);

    for (let i = 0; i < totalUsers; i += BROADCAST_BATCH_SIZE) {
        const batch = userList.slice(i, i + BROADCAST_BATCH_SIZE);

        // Update loading message with current progress
        const statusText = formatText(get_text('status_broadcasting', lang), totalUsers, Math.min(i + batch.length, totalUsers), totalUsers);
        await sendOrEditMessage(chatId, statusText, loadingMessageId, null, token);

        const batchPromises = batch.map(async (user) => {
            try {
                let result = { success: false, http_code: 0 };
                let maxRetries = 2; // Allow up to 2 retries on rate limit or other recoverable error
                let attempt = 0;

                while (attempt < maxRetries) {
                    attempt++;

                    // Telegram methods expect slightly different data structures
                    const dataToSend = {
                        chat_id: user.user_id,
                        parse_mode: 'Markdown',
                        disable_web_page_preview: true,
                        caption: content,
                        text: content,
                        // Use fileId/url determined earlier
                        photo: media?.url,
                        document: media?.url,
                        video: media?.url
                    };

                    switch (messageType) {
                        case 'photo':
                            result = await sendPhoto(user.user_id, dataToSend.photo, dataToSend.caption, token);
                            break;
                        case 'document':
                            result = await sendDocument(user.user_id, dataToSend.document, dataToSend.caption, token);
                            break;
                        case 'video':
                            result = await sendVideo(user.user_id, dataToSend.video, dataToSend.caption, token);
                            break;
                        case 'text':
                        default:
                            result = await sendMessage(user.user_id, dataToSend.text, null, true, token);
                            break;
                    }

                    if (result.success) {
                        return 'success';
                    }

                    // Handle Rate Limit (429) specifically
                    if (result.http_code === 429) {
                        const retryAfter = result.data?.parameters?.retry_after || 5; // Default 5 seconds
                        console.warn(`Rate limit (429) hit for user ${user.user_id}. Waiting for ${retryAfter}s...`);
                        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000 + 500)); // Wait and add buffer
                        // Continue to next iteration for retry
                    } else if (result.http_code === 403) {
                         // User blocked bot, don't retry.
                         return 'blocked';
                    } else {
                        // Other error, just log and fail for this user
                        console.error(`Broadcast API failed for user ${user.user_id} (${messageType}, HTTP ${result.http_code}):`, result.data);
                        break;
                    }
                }

                // If loop finishes without success (including being blocked or failing retries)
                return 'failed';

            } catch (e) {
                console.error(`Broadcast exception for user ${user.user_id}:`, e);
                return 'failed';
            }
        });

        // Wait for all promises in the current batch
        const results = await Promise.allSettled(batchPromises);

        for (const result of results) {
            if (result.status === 'fulfilled' && result.value === 'success') {
                successCount++;
            } else if (result.status === 'fulfilled' && (result.value === 'failed' || result.value === 'blocked')) {
                failedCount++;
            } else if (result.status === 'rejected') {
                failedCount++;
            }
        }

        // Delay between batches to prevent hitting global rate limits
        if (i + BROADCAST_BATCH_SIZE < totalUsers) {
            await new Promise(resolve => setTimeout(resolve, BROADCAST_DELAY_MS));
        }
    }

    return {
        success: true,
        success_count: successCount,
        failed_count: failedCount,
        total_users: totalUsers
    };
}


// =========================================================================
// COMMAND HANDLERS - All KV/API calls now pass 'env'
// =========================================================================

/**
 * Handle /trial command (Create a new trial account)
 * @param {Object} env Cloudflare environment object
 */
export async function handleTrial(chatId, userId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);

    // 1. Send initial loading message
    const initialMsg = await sendMessage(chatId, get_text('status_creating_trial', lang), null, true, token);
    const messageId = initialMsg.data?.result?.message_id;

    // 2. Clear user state
    await setUserState(userId, 'clear', {}, env);

    // 3. API call to create trial account
    const result = await createTrialAccount(userId);

    if (result.success) {
        const data = result.data;

        const message = get_text('trial_success_title', lang) + "\n━━━━━━━━━━━━━━━━━━━━━━\n\n" +
            get_text('field_email', lang) + ` \`${data.email}\`\n` +
            get_text('field_password', lang) + ` \`${data.password}\`\n` +
            get_text('field_data_limit', lang) + ` ${data.data_limit}\n` +
            get_text('field_expiry', lang) + ` ${data.expiry}\n` +
            get_text('field_panel', lang) + ` ${data.panel_name}\n\n` +
            get_text('field_link', lang) + `\`\`\`${data.link}\`\`\`\n\n` +
            get_text('field_qr', lang) + `\n${data.qr_code}\n\n` +
            get_text('tip_copy_link', lang);

        // 4. Edit the message to show the final result
        await sendOrEditMessage(chatId, message, messageId, null, token);
    } else {
        // FIX: Change 'const' to 'let' to allow reassignment via +=
        let errorMessage = get_text('error_creation_failed', lang) + "\n━━━━━━━━━━━━━━━━━━━━━━\n\n" +
            get_text('error_prefix', lang) + ` \`${result.error}\`\n`;

        // Check for specific error to show appropriate tip
        if (result.error.includes('already exists')) {
            // @ts-ignore
            errorMessage += "\n" + get_text('tip_create_new_trial', lang).replace('/trial', '/mytrial');
        }

        // 4. Edit the message to show the error
        await sendOrEditMessage(chatId, errorMessage, messageId, null, token);
    }
}

/**
 * Handle /mytrial command (Get existing trial account)
 * @param {Object} env Cloudflare environment object
 */
export async function handleMyTrial(chatId, userId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);

    // 1. Send initial loading message
    const initialMsg = await sendMessage(chatId, get_text('status_retrieving_trial', lang), null, true, token);
    const messageId = initialMsg.data?.result?.message_id;

    // 2. Clear user state
    await setUserState(userId, 'clear', {}, env);

    // 3. API call to get trial key
    const result = await getTrialKey(userId);

    if (result.success) {
        const data = result.data;

        // Determine expiry status for display
        let expiryStatusText = data.expiry.status;
        if (data.expiry.status === 'expired') {
            expiryStatusText = get_text('expiry_expired', lang);
        } else if (data.expiry.status === 'expiring_soon') {
            expiryStatusText = get_text('expiry_expiring_soon', lang);
        }

        const message = get_text('trial_account_info_title', lang) + "\n━━━━━━━━━━━━━━━━━━━━━━\n\n" +
            get_text('field_email', lang) + ` \`${data.email}\`\n` +
            get_text('field_password', lang) + ` \`${data.password}\`\n` +
            get_text('field_data_usage', lang) + ` ${data.traffic.used.text} / ${data.traffic.total.text}\n` +
            get_text('field_remaining', lang) + ` ${data.traffic.remaining.text}\n` +
            get_text('field_expiry', lang) + ` ${data.expiry.expiry_date} (${expiryStatusText})\n` +
            get_text('field_panel', lang) + ` ${data.panel_name}\n\n` +
            get_text('field_link', lang) + `\`\`\`${data.link}\`\`\`\n\n` +
            get_text('field_qr', lang) + `\n${data.qr_code}\n\n` +
            get_text('tip_copy_link', lang);

        // 4. Edit the message to show the final result
        await sendOrEditMessage(chatId, message, messageId, null, token);

    } else {
        const errorMessage = get_text('error_account_not_found', lang) + "\n━━━━━━━━━━━━━━━━━━━━━━\n\n" +
            get_text('error_prefix', lang) + ` \`${result.error}\`\n\n` +
            get_text('tip_create_new_trial', lang);

        // 4. Edit the message to show the error
        await sendOrEditMessage(chatId, errorMessage, messageId, null, token);
    }
}

/**
 * Handle /ban command (Admin only)
 * @param {Object} env Cloudflare environment object
 */
export async function handleBan(chatId, criteria, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    if (!isAdmin(chatId)) {
        await sendMessage(chatId, get_text('admin_access_denied', lang), null, true, token);
        return;
    }

    const targetUser = await getUserByCriteria(criteria, env);
    if (!targetUser) {
        await sendMessage(chatId, formatText(get_text('error_user_not_found', lang), criteria), null, true, token);
        return;
    }

    const targetUserId = targetUser.user_id;
    const targetName = getSafeDisplayName(targetUser); // Use safe display name

    if (isAdmin(targetUserId)) {
        await sendMessage(chatId, get_text('error_cannot_ban_admin', lang), null, true, token);
        return;
    }

    if (targetUser.is_banned ?? false) {
        await sendMessage(chatId, get_text('error_user_already_banned', lang), null, true, token);
        return;
    }

    if (await setBanStatus(targetUserId, true, env)) {
        await sendMessage(chatId, formatText(get_text('ban_success_admin', lang), targetName), null, true, token);

        const userLang = targetUser.lang ?? DEFAULT_LANG;
        const keyboard = {
            inline_keyboard: [
                [
                    { text: get_text('button_contact_admin', userLang), url: OWNER_URL }
                ]
            ]
        };
        await sendMessage(targetUserId, get_text('user_banned_notification', userLang), keyboard, true, token);
    } else {
        await sendMessage(chatId, get_text('error_admin_approval_failed', lang), null, true, token);
    }
}

/**
 * Handle /unban command (Admin only)
 * @param {Object} env Cloudflare environment object
 */
export async function handleUnban(chatId, criteria, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    if (!isAdmin(chatId)) {
        await sendMessage(chatId, get_text('admin_access_denied', lang), null, true, token);
        return;
    }

    const targetUser = await getUserByCriteria(criteria, env);
    if (!targetUser) {
        await sendMessage(chatId, formatText(get_text('error_user_not_found', lang), criteria), null, true, token);
        return;
    }

    const targetUserId = targetUser.user_id;
    const targetName = getSafeDisplayName(targetUser); // Use safe display name

    if (!(targetUser.is_banned ?? false)) {
        await sendMessage(chatId, get_text('error_user_not_banned', lang), null, true, token);
        return;
    }

    if (await setBanStatus(targetUserId, false, env)) {
        await sendMessage(chatId, formatText(get_text('unban_success_admin', lang), targetName), null, true, token);

        const userLang = targetUser.lang ?? DEFAULT_LANG;
        await sendMessage(targetUserId, get_text('user_unbanned_notification', userLang), null, true, token);
    } else {
        await sendMessage(chatId, get_text('error_admin_approval_failed', lang), null, true, token);
    }
}

/**
 * Send the Access Denied message for banned users.
 * @param {Object} env Cloudflare environment object
 */
export async function handleAccessDeniedBanned(chatId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    const message = get_text('access_denied_banned', lang);

    const keyboard = {
        inline_keyboard: [
            [
                { text: get_text('button_contact_admin', lang), url: OWNER_URL }
            ]
        ]
    };
    await sendMessage(chatId, message, keyboard, true, token);
}

/**
 * Helper function to generate the invited by line for the welcome message.
 * @param {Object} env Cloudflare environment object
 */
export async function getInvitedByLine(referrerId, lang, env) {
    if (!referrerId) return '';

    // Ensure referrerId is a clean integer
    const finalReferrerId = cleanReferrerId(referrerId);
    if (!finalReferrerId) return '';

    const referrer = await getUserById(finalReferrerId, env);
    if (!referrer) return '';

    // Use the safe display name for the link text to prevent markdown issues (e.g., underscores)
    const referrerNameDisplay = getSafeDisplayName(referrer);
    const referrerLink = `[${referrerNameDisplay}](tg://user?id=${finalReferrerId})`;

    // The welcome_invited_by text starts with \n, ensuring a line break.
    return formatText(get_text('welcome_invited_by', lang), referrerLink);
}

/**
 * Handle /start command (Main Entry Point)
 * @param {Object} env Cloudflare environment object
 */
export async function handleStart(chatId, username, firstName, lastName, messageId, isCallback = false, deepLink = null, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    let referrerId = null;

    // 1. Check for deep link parameter (r_123456)
    if (deepLink && deepLink.startsWith('r_')) {
        const potentialIdString = deepLink.substring(2);
        const potentialId = parseInt(potentialIdString);

        // Ensure it is a valid number AND not the user's own ID
        if (!isNaN(potentialId) && potentialId !== chatId) {
            referrerId = potentialId; // Store as clean integer ID
        }
    }

    // 2. Ensure user data is up-to-date and registered (saves referrerId permanently ONLY if first time)
    await saveUser(chatId, username, firstName, lastName, null, referrerId, env);

    const user = await getUserById(chatId, env);
    const lang = user?.lang ?? DEFAULT_LANG;

    // 3. Clear user state upon /start
    await setUserState(chatId, 'clear', {}, env);

    const fullName = (firstName + ' ' + (lastName ?? '')).trim();

    let animMessageId = null;

    if (!isCallback) {
        // --- RESTORED ANIMATION LOGIC ---
        const animText1 = "*Starting V2Ray Manager...*";
        const animText2 = "*Generating Session Keys Please Wait...*";

        // Use sendMessage initially to send the animation
        const animMsgResult = await sendMessage(chatId, animText1, null, true, token);
        animMessageId = animMsgResult.data?.result?.message_id;

        if (animMessageId) {
            await new Promise(r => setTimeout(r, 400));
            await editMessageText(chatId, animMessageId, animText2, null, true, token);
            await new Promise(r => setTimeout(r, 400));
        }
        // --- END RESTORED ANIMATION LOGIC ---
    }

    // 4. Generate Invited By Line
    const invitedByLine = await getInvitedByLine(referrerId, lang, env);

    // 5. Construct the Welcome Text
    const welcomeText = formatText(get_text('welcome_start_line1', lang), fullName) +
        invitedByLine +
        "\n" +
        get_text('welcome_separator', lang) + "\n" +
        get_text('welcome_bot_desc', lang) + "\n" +
        get_text('welcome_separator', lang) + "\n" +
        get_text('welcome_join_prompt', lang) + "\n\n" +
        get_text('quick_check_tip', lang);

    const keyboardButtons = [
        [
            { text: get_text('button_main_menu', lang), callback_data: 'menu_main' },
        ],
        [
            { text: get_text('button_about_me', lang), callback_data: 'menu_about' },
            { text: get_text('button_policy_terms', lang), callback_data: 'menu_policy' },
        ]
    ];

    const keyboard = { inline_keyboard: keyboardButtons };


    if (isCallback) {
        await sendOrEditMessage(chatId, welcomeText, messageId, keyboard, token);
    } else {
        if (animMessageId) {
            await deleteMessage(chatId, animMessageId, token); // Delete the temp animation
        }
        await sendMessage(chatId, welcomeText, keyboard, true, token); // Send the final message
    }
}

/**
 * Helper function to format and send user info.
 * @param {Object} env Cloudflare environment object
 */
export async function displayUserInfo(chatId, user, lang, header = "👨‍🦰 User Information", env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    if (!user) {
        await sendMessage(chatId, get_text('error_account_not_found', lang), null, true, token);
        return;
    }

    const fullName = (user.first_name + ' ' + (user.last_name ?? '')).trim();
    // Escape underscore in username for Markdown display
    const usernameDisplay = user.username ? `@${user.username.replace(/_/g, '\\_')}` : get_text('stats_no_username', lang);

    const finalReferrerId = cleanReferrerId(user.referrer_id);
    const referrerDisplay = finalReferrerId ? `\`${finalReferrerId}\`` : 'N/A';

    const creditsDisplay = (user.credits ?? 0.0).toFixed(1);
    const referredCount = user.referred_count ?? 0;

    const message = `${header}\n━━━━━━━━━━━━━━━━\n` +
        `๏ Full Name: ${fullName || 'N/A'}\n` +
        `๏ Username: ${usernameDisplay}\n` +
        `๏ User ID: \`${user.user_id}\`\n` +
        `๏ Language: ${user.lang.toUpperCase()}\n` +
        `๏ Banned: ${user.is_banned ? 'Yes ❌' : 'No ✅'}\n` +
        `๏ Credits: ${creditsDisplay} 💰\n` +
        `๏ Referred Users: ${referredCount} 👥\n` +
        `๏ Channel Verified: ${user.channel_verified ? 'Yes ✅' : 'No ❌'}\n` +
        `๏ Referred By: ${referrerDisplay}\n` +
        `๏ Joined At: ${user.joined_at}`;

    await sendMessage(chatId, message, null, true, token);
}

/**
 * Handle /id <ID or USERNAME> command.
 * @param {Object} env Cloudflare environment object
 */
export async function handleId(chatId, params, env) {
    const lang = await get_user_language(chatId, env);
    const token = env[TELEGRAM_BOT_TOKEN_ENV];

    const criteria = params[0];

    if (!criteria || String(criteria) === String(chatId)) {
        const user = await getUserById(chatId, env);
        await displayUserInfo(chatId, user, lang, "👨‍🦰 User Information", env);
        return;
    }

    if (!isAdmin(chatId)) {
        const errorMsg = "❌ *Access Denied*\n\nThis command can only look up your own information. Use `/id` without parameters.";
        await sendMessage(chatId, errorMsg, null, true, token);
        return;
    }

    const targetUser = await getUserByCriteria(criteria, env);

    if (!targetUser) {
        await sendMessage(chatId, formatText(get_text('error_user_not_found', lang), criteria), null, true, token);
        return;
    }

    await displayUserInfo(chatId, targetUser, lang, "👨‍🦰 User Information (Admin Lookup)", env);
}


/**
 * Handle Premium Menu (List of Plans)
 * @param {Object} env Cloudflare environment object
 */
export async function handlePremium(chatId, messageId = null, isCallback = false, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    await setUserState(chatId, 'clear', {}, env);

    const message = get_text('menu_premium_title', lang) + "\n" +
        get_text('welcome_separator', lang) + "\n" +
        get_text('premium_select_plan', lang);

    const keyboard = { inline_keyboard: [] };

    let row = [];
    for (const gb in PREMIUM_PLANS) {
        const plan = PREMIUM_PLANS[gb];
        const buttonText = formatText(get_text('button_plan', lang), plan.gb, plan.price);
        row.push({ text: buttonText, callback_data: 'premium_select_' + gb });

        if (row.length === 1) {
            keyboard.inline_keyboard.push(row);
            row = [];
        }
    }

    if (row.length > 0) {
        keyboard.inline_keyboard.push(row);
    }

    keyboard.inline_keyboard.push([
        { text: get_text('button_view_plans', lang), callback_data: 'menu_premium_desc' }
    ]);

    if (isCallback) {
        await sendOrEditMessage(chatId, message, messageId, keyboard, token);
    } else {
        await sendMessage(chatId, message, keyboard, true, token);
    }
}

/**
 * Handle Premium Plan Description Page
 * @param {Object} env Cloudflare environment object
 */
export async function handlePremiumDescription(chatId, messageId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    const message = get_text('menu_premium_desc_title', lang) + "\n" +
        get_text('welcome_separator', lang) + "\n" +
        get_text('menu_premium_desc_content', lang);

    const keyboard = { inline_keyboard: [[
        { text: get_text('button_back', lang), callback_data: 'menu_premium' }
    ]]};

    await sendOrEditMessage(chatId, message, messageId, keyboard, token);
}

/**
 * Handle Plan Selection and prompt for Payment Method
 * @param {Object} env Cloudflare environment object
 */
export async function handlePremiumSelect(chatId, userId, messageId, gbLimit, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);

    const plan = PREMIUM_PLANS[gbLimit];

    if (!plan) {
        await sendOrEditMessage(chatId, get_text('error_plan_not_found', lang), messageId, { inline_keyboard: [[{ text: get_text('button_back', lang), callback_data: 'menu_premium' }]] }, token);
        return;
    }

    // Check if user is already waiting for TxID for ANY plan
    const currentState = await getUserState(userId, env);
    if (currentState?.state === 'waiting_for_txid') {
        await sendOrEditMessage(chatId, formatText(get_text('error_already_waiting', lang), currentState.data.gb), messageId, { inline_keyboard: [[{ text: get_text('button_back', lang), callback_data: 'menu_premium' }]] }, token);
        return;
    }


    await setUserState(userId, 'waiting_for_method', { gb: gbLimit, price: plan.price }, env);

    const message = formatText(get_text('prompt_select_method', lang), plan.gb, plan.price);

    const keyboard = {
        inline_keyboard: [
            [
                { text: get_text('button_wavepay', lang), callback_data: `method_select_${gbLimit}_wavepay` },
            ],
            [
                { text: get_text('button_kbzpay', lang), callback_data: `method_select_${gbLimit}_kbzpay` },
            ],
            [
                { text: get_text('button_ayapay', lang), callback_data: `method_select_${gbLimit}_ayapay` },
            ],
            [{ text: get_text('button_back', lang), callback_data: 'menu_premium' }]
        ]
    };

    await sendOrEditMessage(chatId, message, messageId, keyboard, token);
}

/**
 * Handle Payment Method Selection and show Payment Instructions
 * @param {Object} env Cloudflare environment object
 */
export async function handlePaymentMethodSelect(chatId, userId, messageId, gbLimit, methodKey, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);

    const plan = PREMIUM_PLANS[gbLimit];
    const method = PAYMENT_METHODS[methodKey];

    if (!plan || !method) {
        await sendOrEditMessage(chatId, get_text('error_plan_not_found', lang), messageId, { inline_keyboard: [[{ text: get_text('button_back', lang), callback_data: 'menu_premium' }]] }, token);
        return;
    }

    await setUserState(userId, 'waiting_for_txid', {
        gb: gbLimit,
        price: plan.price,
        method: methodKey,
        method_name_en: method.name_en,
        account_name: method.account_name,
        account_number: method.number
    }, env);

    const methodName = method[`name_${lang}`];
    const accountName = method.account_name;
    const accountNumber = method.number;

    const paymentDetails = formatText(
        get_text('payment_instructions_detail', lang),
        methodName,
        accountName,
        accountNumber
    );

    const message = formatText(get_text('plan_details_title', lang), plan.gb, plan.price) + "\n\n" +
        get_text('payment_instructions_title', lang) + "\n" +
        get_text('welcome_separator', lang) + "\n" +
        paymentDetails + "\n\n" +
        get_text('prompt_txid', lang);

    const keyboard = { inline_keyboard: [[
        { text: get_text('button_back', lang), callback_data: 'menu_premium' }
    ]]};

    await sendOrEditMessage(chatId, message, messageId, keyboard, token);
}

/**
 * Handle the user's text input when they are in 'waiting_for_txid' state.
 * @param {Object} env Cloudflare environment object
 */
export async function handleTxidSubmission(chatId, userId, txId, state, username, firstName, lastName, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    const planData = state.data;
    const gbLimit = planData.gb;
    const price = planData.price;
    const methodName = planData.method_name_en ?? 'Unknown Method';

    txId = txId.trim();
    txId = txId.replace(/[^\w\d]/g, '');

    if (txId.length < 1) {
        await sendMessage(chatId, get_text('error_no_txid', lang), null, true, token);
        return;
    }

    const userMessage = formatText(get_text('txid_submitted_user', lang), txId);
    await sendMessage(chatId, userMessage, null, true, token); // Send final confirmation to user

    await setUserState(userId, 'clear', {}, env);

    const fullName = (firstName + ' ' + (lastName ?? '')).trim();
    // Escape underscore in username for Admin message display
    const usernameDisplay = username ? `@${username.replace(/_/g, '\\_')}` : "N/A";
    const adminTime = formatText(get_text('admin_field_time', DEFAULT_LANG), Date.now() / 1000);

    const adminMessage = get_text('admin_new_purchase', DEFAULT_LANG) + "\n\n" +
        get_text('admin_field_method', DEFAULT_LANG) + ` ${methodName}\n` +
        get_text('admin_field_txid', DEFAULT_LANG) + ` \`${txId}\`\n` +
        get_text('admin_field_userid', DEFAULT_LANG) + ` \`${userId}\`\n` +
        get_text('admin_field_time', DEFAULT_LANG) + ` ${adminTime}\n` +
        get_text('welcome_separator', DEFAULT_LANG) + "\n\n" +
        `👤 *User:* [${fullName}](tg://user?id=${userId})\n` +
        `📧 *UserName:* ${usernameDisplay}\n` +
        `💰 *Plan:* ${gbLimit}GB (${price})\n\n` +
        `Use \`/approve ${userId} ${gbLimit}\` or \`/reject ${userId}\` to proceed.`;

    const keyboard = {
        inline_keyboard: [
            [
                { text: formatText(get_text('admin_approve_btn', DEFAULT_LANG), gbLimit), callback_data: `admin_approve_${userId}_${gbLimit}` },
            ],
            [
                { text: get_text('admin_reject_btn', DEFAULT_LANG), callback_data: `admin_reject_${userId}` }
            ]
        ]
    };

    for (const adminId of ADMIN_IDS) {
        await sendMessage(adminId, adminMessage, keyboard, true, token);
    }
}

/**
 * Handle Admin Approval and Account Creation
 * @param {Object} env Cloudflare environment object
 */
export async function handleAdminApprove(chatId, targetUserId, gbLimit, messageId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const adminLang = await get_user_language(chatId, env);

    if (!isAdmin(chatId)) {
        await sendMessage(chatId, get_text('admin_access_denied', adminLang), null, true, token);
        return;
    }

    const user = await getUserById(targetUserId, env);
    const plan = PREMIUM_PLANS[gbLimit];

    if (!user || (!plan && gbLimit !== PREMIUM_CREDIT_PLANS[5]?.gb && gbLimit !== PREMIUM_CREDIT_PLANS[10]?.gb && gbLimit < 100)) {
        await sendMessage(chatId, get_text('error_admin_approval_failed', adminLang) + "\nInvalid User ID or Plan.", null, true, token);
        if (messageId) { await editMessageText(chatId, messageId, "*✅ Approved (Error: User/Plan not found)*", { inline_keyboard: [] }, true, token); }
        return;
    }

    const premiumAccountName = generateRandomKey(12);

    const startingMessage = `🔄 *Creating Premium Account:* \`${premiumAccountName}\` for user \`${targetUserId}\`...`;
    // If command is inline, edit the inline message; otherwise, send a new one.
    const initialMsg = await sendMessage(chatId, startingMessage, null, true, token);
    const loadingMessageId = messageId ?? initialMsg.data?.result?.message_id;
    if (messageId && loadingMessageId !== messageId) {
        // If inline command, edit the original callback message, then send new final messages.
        await editMessageText(chatId, messageId, startingMessage, { inline_keyboard: [] }, true, token);
    }


    const result = await createPremiumAccount(gbLimit, premiumAccountName, PREMIUM_DEFAULT_DAYS, PREMIUM_PANEL_ID);

    if (result.success) {
        await savePremiumKey(targetUserId, premiumAccountName, env);

        const data = result.data;
        const userLang = user.lang ?? DEFAULT_LANG;

        const panelNameDisplay = SERVER_NAMES[PREMIUM_PANEL_ID] ?? `Panel ${PREMIUM_PANEL_ID}`;

        const messageToUser = formatText(get_text('approval_success_user', userLang), gbLimit) + "\n\n" +
            get_text('field_account_name', userLang) + ` \`${premiumAccountName}\`\n` +
            get_text('field_email', userLang) + ` \`${data.email}\`\n` +
            get_text('field_password', userLang) + ` \`${data.password}\`\n` +
            get_text('field_data_limit', userLang) + ` ${gbLimit} GB\n` +
            get_text('field_expiry_days', userLang) + ` ${PREMIUM_DEFAULT_DAYS} days\n` +
            get_text('field_panel_id', userLang) + ` ${panelNameDisplay}\n\n` +
            get_text('field_link', userLang) + `\`\`\`${data.link}\`\`\`\n\n` +
            get_text('field_qr', userLang) + `\n${data.qr_code}`;

        await sendMessage(targetUserId, messageToUser, null, true, token);

        const adminConfirm = get_text('create_success_title', adminLang) + "\n\n" +
            get_text('field_account_name', adminLang) + ` \`${premiumAccountName}\`\n` +
            get_text('field_telegram_id', adminLang) + ` \`${targetUserId}\`\n` +
            get_text('field_data_limit', adminLang) + ` ${gbLimit} GB\n` +
            get_text('field_panel_id', adminLang) + ` ${panelNameDisplay}`;

        // Final message to admin, editing the loading message
        await sendOrEditMessage(chatId, adminConfirm, loadingMessageId, null, token);

    } else {
        const errorMessage = get_text('error_admin_create_failed', adminLang) + "\n\n" +
            get_text('error_prefix', adminLang) + ` \`${result.error}\` (User: ${targetUserId})`;
        // Final message to admin, editing the loading message
        await sendOrEditMessage(chatId, errorMessage, loadingMessageId, null, token);
    }
}

/**
 * Handle Admin Rejection
 * @param {Object} env Cloudflare environment object
 */
export async function handleAdminReject(chatId, targetUserId, messageId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const adminLang = await get_user_language(chatId, env);

    if (!isAdmin(chatId)) {
        await sendMessage(chatId, get_text('admin_access_denied', adminLang), null, true, token);
        return;
    }

    const user = await getUserById(targetUserId, env);

    if (!user) {
        await sendMessage(chatId, formatText(get_text('error_user_not_found', adminLang), targetUserId), null, true, token);
        if (messageId) { await editMessageText(chatId, messageId, "*❌ Rejected (Error: User not found)*", { inline_keyboard: [] }, true, token); }
        return;
    }

    if (messageId) { await editMessageText(chatId, messageId, `*❌ Rejected: User ${targetUserId}*`, { inline_keyboard: [] }, true, token); }

    const userLang = user.lang ?? DEFAULT_LANG;
    const txId = 'N/A';
    const messageToUser = formatText(get_text('approval_rejected_user', userLang), txId);

    await sendMessage(targetUserId, messageToUser, null, true, token);

    const adminConfirm = formatText(get_text('admin_rejection_done', adminLang), targetUserId);
    await sendMessage(chatId, adminConfirm, null, true, token);
}

/**
 * Handle Main Menu (List of User Commands)
 * @param {Object} env Cloudflare environment object
 */
export async function handleMainMenu(chatId, messageId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);

    const message = get_text('menu_main_title', lang) + "\n\n" +
        get_text('cmd_premium', lang) + "\n" +
        get_text('cmd_referral', lang) + "\n" +
        get_text('cmd_trial', lang) + "\n" +
        get_text('cmd_mytrial', lang) + "\n" +
        get_text('cmd_apps', lang) + "\n" +
        get_text('cmd_id', lang) + "\n" +
        get_text('cmd_language', lang) + "\n" +
        get_text('cmd_help', lang);

    const keyboard = {
        inline_keyboard: [
            [
                { text: get_text('button_back_to_start', lang), callback_data: 'menu_start' }
            ]
        ]
    };

    await sendOrEditMessage(chatId, message, messageId, keyboard, token);
}

/**
 * Handle About Me Menu.
 * @param {Object} env Cloudflare environment object
 */
export async function handleAboutMe(chatId, messageId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);

    const message = get_text('about_name', lang) + "\n" +
        get_text('about_version', lang) + "\n\n" +
        get_text('about_dev_team', lang) + "\n" +
        get_text('about_creator', lang) + "\n\n" +
        get_text('about_tech_stack', lang) + "\n" +
        get_text('about_language', lang) + "\n" +
        get_text('about_database', lang) + "\n" +
        get_text('about_hosting', lang) + "\n\n" +
        get_text('about_main_desc', lang);

    const keyboard = {
        inline_keyboard: [
            [
                { text: get_text('button_stats_about', lang), callback_data: 'menu_stats_btn' },
                { text: get_text('button_server_info', lang), callback_data: 'menu_server_btn' }
            ],
            [
                { text: get_text('button_back_to_start', lang), callback_data: 'menu_start' }
            ]
        ]
    };

    await sendOrEditMessage(chatId, message, messageId, keyboard, token);
}

/**
 * Handle Server Info Menu (Updated to fetch real-time stats).
 * @param {Object} env Cloudflare environment object
 */
export async function handleServerInfo(chatId, messageId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);

    // 1. Initial message (Loading)
    const initialMsg = await sendOrEditMessage(chatId, get_text('server_info_title', lang) + "\n━━━━━━━━━━━━━━━━━━━━━━\n\n*🔄 Fetching real-time panel stats...*", messageId, null, token);
    const loadingMessageId = initialMsg.data?.result?.message_id ?? messageId;

    // 2. Fetch Stats
    const statsResult = await getPanelStats();
    let onlineCount = 0;
    let totalCount = 0;
    let panelStatusMessage = "";
    let statusMessage = get_text('server_info_content', lang);

    if (statsResult.success) {
        const stats = statsResult.data;
        const panelStatus = stats.panel_status ?? {};
        totalCount = stats.total_panels ?? 0;

        // @ts-ignore
        const panelNames = Object.keys(panelStatus).sort();

        // Count online panels and format status message for Admin context (optional detail)
        for (const status of Object.values(panelStatus)) {
            if (status === 'online') {
                onlineCount++;
            }
        }

        const onlineCountLine = formatText(get_text('server_info_online_panels', lang), onlineCount, totalCount);

        // Replace the placeholder line in the main content
        statusMessage = get_text('server_info_content', lang)
            .replace(/• \*Online Panels:\* (\d+)(.+?)/, onlineCountLine);

    } else {
        const errorMsg = statsResult.error ?? 'API connection failed';
        panelStatusMessage = "\n\n" + formatText(get_text('server_info_api_error', lang), errorMsg);
        statusMessage = get_text('server_info_content', lang);

        // Add a placeholder for online count on error
        statusMessage = statusMessage.replace(/• \*Online Panels:\* (\d+)(.+?)/, '• *Online Panels:* N/A / N/A');
    }

    // 3. Construct final message
    const finalMessage = get_text('server_info_title', lang) + "\n━━━━━━━━━━━━━━━━━━━━━━\n\n" +
        statusMessage +
        panelStatusMessage;

    const keyboard = {
        inline_keyboard: [
            [
                { text: get_text('button_back', lang), callback_data: 'menu_about' }
            ]
        ]
    };

    await sendOrEditMessage(chatId, finalMessage, loadingMessageId, keyboard, token);
}

/**
 * Handle Policy & Terms Menu.
 * @param {Object} env Cloudflare environment object
 */
export async function handlePolicyTerms(chatId, messageId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    const message = get_text('menu_policy_content', lang);

    const keyboard = {
        inline_keyboard: [
            [
                { text: get_text('button_back_to_start', lang), callback_data: 'menu_start' }
            ]
        ]
    };

    await sendOrEditMessage(chatId, message, messageId, keyboard, token);
}

/**
 * Handle /language command.
 * @param {Object} env Cloudflare environment object
 */
export async function handleLanguage(chatId, messageId = null, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    const message = get_text('lang_select_title', lang);

    const keyboard = {
        inline_keyboard: [
            [
                { text: get_text('lang_button_en', LANG_EN), callback_data: 'set_lang_' + LANG_EN },
                { text: get_text('lang_button_my', LANG_MY), callback_data: 'set_lang_' + LANG_MY }
            ]
        ]
    };

    await sendOrEditMessage(chatId, message, messageId, keyboard, token);
}

/**
 * Handle setting the new language.
 * @param {Object} env Cloudflare environment object
 */
export async function handleSetLanguage(chatId, userId, langCode, messageId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    if (langCode !== LANG_EN && langCode !== LANG_MY) {
        return;
    }

    await setUserLanguage(userId, langCode, env);

    const langNameKey = 'lang_name_' + langCode;
    const langName = get_text(langNameKey, langCode);

    const confirmation = formatText(get_text('lang_confirmed', langCode), langName);

    await sendOrEditMessage(chatId, confirmation, messageId, null, token);
}

// --- App Handlers ---

/**
 * Handle iOS apps
 * @param {Object} env Cloudflare environment object
 */
export async function handleAppsIos(chatId, messageId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    let message = get_text('apps_ios_msg', lang) + "\n\n";
    message += "https://apps.apple.com/app/outline-app/id1356177741";

    const keyboard = { inline_keyboard: [[
        { text: get_text('button_back', lang), callback_data: 'apps_back' }
    ]]};

    await sendOrEditMessage(chatId, message, messageId, keyboard, token);
}

/**
 * Handle Android apps
 * @param {Object} env Cloudflare environment object
 */
export async function handleAppsAndroid(chatId, messageId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    let message = get_text('apps_android_msg', lang) + "\n\n";
    message += "https://play.google.com/store/apps/details?id=org.outline.android.client";

    const keyboard = { inline_keyboard: [[
        { text: get_text('button_back', lang), callback_data: 'apps_back' }
    ]]};

    await sendOrEditMessage(chatId, message, messageId, keyboard, token);
}

/**
 * Handle macOS apps
 * @param {Object} env Cloudflare environment object
 */
export async function handleAppsMacos(chatId, messageId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    let message = get_text('apps_macos_msg', lang) + "\n\n";
    message += "https://apps.apple.com/us/app/outline-secure-internet-access/id1356178125";

    const keyboard = { inline_keyboard: [[
        { text: get_text('button_back', lang), callback_data: 'apps_back' }
    ]]};

    await sendOrEditMessage(chatId, message, messageId, keyboard, token);
}

/**
 * Handle Windows apps
 * @param {Object} env Cloudflare environment object
 */
export async function handleAppsWindows(chatId, messageId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    let message = get_text('apps_windows_msg', lang) + "\n\n";
    message += get_text('apps_windows_link_body', lang) + "\n\n";
    message += "https://t.me/Channel404Community/2";

    const keyboard = { inline_keyboard: [[
        { text: get_text('button_back', lang), callback_data: 'apps_back' }
    ]]};

    await sendOrEditMessage(chatId, message, messageId, keyboard, token);
}

/**
 * Handle /apps command
 * @param {Object} env Cloudflare environment object
 */
export async function handleApps(chatId, messageId = null, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    const message = get_text('apps_select_device', lang);

    const keyboard = {
        inline_keyboard: [
            [
                { text: '📱 iOS', callback_data: 'apps_ios' },
                { text: '🤖 Android', callback_data: 'apps_android' }
            ],
            [
                { text: '🖥️ Windows', callback_data: 'apps_windows' },
                { text: '🍎 macOS', callback_data: 'apps_macos' }
            ]
        ]
    };

    await sendOrEditMessage(chatId, message, messageId, keyboard, token);
}

/**
 * Handle /referral command and menu (UPDATED)
 * @param {Object} env Cloudflare environment object
 */
export async function handleReferral(chatId, userId, messageId = null, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    const user = await getUserById(userId, env);
    const credits = (user?.credits ?? 0.0).toFixed(1);
    const referredCount = user?.referred_count ?? 0;

    const referralLink = `https://t.me/${BOT_USERNAME}?start=r_${userId}`;
    const referralLinkForDisplay = `\`${referralLink}\``;

    const description = formatText(get_text('referral_desc', lang), REFERRAL_REWARD);

    const message = get_text('menu_referral_title', lang) + "\n" +
        get_text('welcome_separator', lang) + "\n\n" +
        description + "\n\n" +
        get_text('field_your_credits', lang) + ` ${credits}\n` +
        get_text('field_referred_count', lang) + ` ${referredCount}\n\n` +
        get_text('field_your_link', lang) + referralLinkForDisplay;

    // Fix: Change redemption buttons to be in separate rows (vertical layout)
    const keyboard = {
        inline_keyboard: [
            [ // Separate row for 5GB
                {
                    text: formatText(get_text('button_redeem_5gb', lang), PREMIUM_CREDIT_PLANS[5].cost),
                    callback_data: 'redeem_5gb'
                }
            ],
            [ // Separate row for 10GB
                {
                    text: formatText(get_text('button_redeem_10gb', lang), PREMIUM_CREDIT_PLANS[10].cost),
                    callback_data: 'redeem_10gb'
                }
            ],
            [ // NEW: Custom Redemption
                { text: get_text('button_redeem_custom', lang), callback_data: 'redeem_custom_prompt' }
            ],
            [ // NEW: Key Management and History
                { text: get_text('button_view_my_keys', lang), callback_data: 'view_my_keys_page_1' },
            ],
            [
                { text: get_text('button_credit_history', lang), callback_data: 'show_credit_history' },
                { text: get_text('button_verify_join', lang), callback_data: 'verify_channel_join' }
            ]
        ]
    };

    await sendOrEditMessage(chatId, message, messageId, keyboard, token);
}

/**
 * Handle Credit History display.
 * @param {Object} env Cloudflare environment object
 */
export async function handleCreditHistory(chatId, messageId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    const user = await getUserById(chatId, env);
    const history = user?.credit_history ?? [];

    let message = get_text('menu_credit_history_title', lang) + "\n" +
        get_text('welcome_separator', lang) + "\n\n";

    if (history.length === 0) {
        message += get_text('credit_history_empty', lang);
    } else {
        // Display last 10 transactions, reversed (newest first)
        const displayHistory = history.slice(-10).reverse();

        for (const entry of displayHistory) {
            const operationKey = entry.operation === 'add' ? 'credit_history_entry_add' : 'credit_history_entry_deduct';

            // Format source for display
            let sourceText = entry.source;
            if (typeof entry.source === 'string' && entry.source.startsWith('Redeem')) {
                // If the source is 'Redeem 5GB', extract 5
                const gbMatch = entry.source.match(/Redeem (\d+)GB/);
                const gb = gbMatch ? parseInt(gbMatch[1]) : 0;
                sourceText = formatText(get_text('credit_source_redeem', lang), gb);
            } else if (entry.source === 'Admin Add') {
                sourceText = get_text('credit_source_admin_add', lang);
            } else if (entry.source === 'Admin Deduct') {
                sourceText = get_text('credit_source_admin_deduct', lang);
            }
            // For referral source, the string already contains the user link, so use it directly.

            message += formatText(get_text(operationKey, lang), entry.amount, sourceText, entry.timestamp) + "\n";
        }
        message += "\n_Showing last " + Math.min(10, history.length) + " transactions._";
    }

    const keyboard = { inline_keyboard: [[
        { text: get_text('button_back', lang), callback_data: 'referral_back' }
    ]]};

    await sendOrEditMessage(chatId, message, messageId, keyboard, token);
}

/**
 * Handle Channel Join verification and credit reward (UPDATED)
 * @param {Object} env Cloudflare environment object
 */
export async function handleVerifyJoin(chatId, userId, messageId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    const user = await getUserById(userId, env);

    const isMember = await checkChannelMembership(userId, CHANNEL_ID, token);
    const alreadyVerified = user?.channel_verified ?? false;

    if (isMember) {
        if (!alreadyVerified) {
            // Set verified status and log 'no change' transaction, just to log verification.
            const source = "Channel Verification";
            // @ts-ignore
            const { success } = await setCredits(userId, 0, 'add', true, source, env);

            // Award referral credit to referrer if applicable
            const awardResult = await awardReferralCreditOnVerify(userId, env);

            if (awardResult.success) {
                // Since db.js now returns the message, send it here.
                await sendMessage(awardResult.referrerId, awardResult.message, null, true, token);
            }
        }

        const confirmationMessage = get_text('status_already_joined', lang);
        await sendOrEditMessage(chatId, confirmationMessage, messageId, { inline_keyboard: [[{ text: get_text('button_back', lang), callback_data: 'referral_back' }]] }, token);
    } else {
        const message = get_text('join_channel_prompt', lang);
        const keyboard = {
            inline_keyboard: [
                [
                    { text: get_text('button_channel_link', lang), url: CHANNEL_URL }
                ],
                [
                    { text: get_text('button_verify_join', lang), callback_data: 'verify_channel_join' }
                ],
                [
                    { text: get_text('button_back', lang), callback_data: 'referral_back' }
                ]
            ]
        };
        await sendOrEditMessage(chatId, get_text('status_not_joined', lang) + "\n\n" + message, messageId, keyboard, token);
    }
}

/**
 * NEW: Handle selection of a panel for credit redemption
 * @param {Object} env Cloudflare environment object
 */
export async function handleRedeemSelectPanel(chatId, userId, messageId, gbLimit, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    const user = await getUserById(userId, env);

    const requiredCost = parseFloat((gbLimit * CREDIT_COST_PER_GB).toFixed(1));

    // 1. Pre-checks (needed if coming from /redeem command directly without checks)
    if ((user?.credits ?? 0) < requiredCost) {
        const errorMsg = formatText(get_text('error_insufficient_credits', lang), requiredCost);
        await sendOrEditMessage(chatId, errorMsg, messageId, { inline_keyboard: [[{ text: get_text('button_back', lang), callback_data: 'referral_back' }]] }, token);
        return;
    }

    if (!user?.channel_verified) {
        await sendOrEditMessage(chatId, get_text('error_unverified_redeem', lang), messageId, { inline_keyboard: [[{ text: get_text('button_back', lang), callback_data: 'referral_back' }]] }, token);
        return;
    }

    // 2. Set state for panel selection
    await setUserState(userId, 'waiting_for_redeem_panel', { gb: gbLimit, cost: requiredCost }, env);

    const message = formatText(get_text('prompt_select_panel', lang), gbLimit);

    // 3. Generate dynamic keyboard based on SERVER_NAMES
    const keyboardButtons = [];
    for (const panelId in SERVER_NAMES) {
        const panelName = SERVER_NAMES[panelId];
        keyboardButtons.push([{
            text: formatText(get_text('panel_button_name', lang), panelName),
            callback_data: `redeem_panel_final_${gbLimit}_${requiredCost}_${panelId}`
        }]);
    }

    keyboardButtons.push([{ text: get_text('button_back', lang), callback_data: 'referral_back' }]);

    const keyboard = { inline_keyboard: keyboardButtons };

    await sendOrEditMessage(chatId, message, messageId, keyboard, token);
}

/**
 * NEW: Handle Credit Redemption Final Step after Panel Selection.
 * @param {Object} env Cloudflare environment object
 */
export async function handleRedeemPanelSelect(chatId, userId, messageId, gbLimit, cost, panel, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);

    // Clear state
    await setUserState(userId, 'clear', {}, env);

    // 1. Show loading state by editing the button message
    await editMessageText(chatId, messageId, formatText(get_text('status_redeeming', lang), gbLimit), null, true, token);

    const premiumAccountName = generateRandomKey(12);

    // 2. Call API to create account
    const result = await createPremiumAccount(gbLimit, premiumAccountName, PREMIUM_DEFAULT_DAYS, panel);
    const panelNameDisplay = SERVER_NAMES[panel] ?? `Panel ${panel}`;

    if (result.success) {
        const source = `Redeem ${gbLimit}GB`;
        // @ts-ignore
        const { success: creditSuccess } = await setCredits(userId, cost, 'deduct', false, source, env);
        await saveUserRedeemedKey(userId, premiumAccountName, gbLimit, panel, env); // NEW: Save the redeemed key

        const data = result.data;

        const message = formatText(get_text('redeem_success_user', lang), gbLimit, panelNameDisplay, cost) + "\n\n" +
            get_text('field_redeemed_account', lang) + "\n" +
            get_text('field_account_name', lang) + ` \`${premiumAccountName}\`\n` +
            get_text('field_data_limit', lang) + ` ${gbLimit} GB\n` +
            get_text('field_expiry_days', lang) + ` ${PREMIUM_DEFAULT_DAYS} days\n` +
            get_text('field_panel_name', lang) + ` ${panelNameDisplay}\n\n` +
            get_text('field_link', lang) + `\`\`\`${data.link}\`\`\`\n\n` +
            get_text('field_qr', lang) + `\n${data.qr_code}`;

        const keyboard = { inline_keyboard: [[{ text: get_text('button_back', lang), callback_data: 'referral_back' }]] };
        await sendOrEditMessage(chatId, message, messageId, keyboard, token);

    } else {
        const errorMessage = get_text('error_creation_failed', lang) + "\n\n" +
            get_text('error_prefix', lang) + ` \`${result.error}\`\n\n` +
            "_No credits were deducted due to API failure._";
        await sendOrEditMessage(chatId, errorMessage, messageId, { inline_keyboard: [[{ text: get_text('button_back', lang), callback_data: 'referral_back' }]] }, token);
    }
}

/**
 * Handle custom GB redemption prompt (set state).
 * @param {Object} env Cloudflare environment object
 */
export async function handleCustomRedeemPrompt(chatId, userId, messageId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);

    // Set state to await custom GB amount
    await setUserState(userId, 'waiting_for_custom_gb', { messageId: messageId }, env);

    const message = formatText(get_text('prompt_redeem_custom_gb', lang), CREDIT_COST_PER_GB);

    const keyboard = { inline_keyboard: [[
        { text: get_text('button_back', lang), callback_data: 'referral_back' }
    ]]};

    await sendOrEditMessage(chatId, message, messageId, keyboard, token);
}

/**
 * Handle user's text input when in 'waiting_for_custom_gb' state (Pre-Panel Select)
 * @param {Object} env Cloudflare environment object
 */
export async function handleCustomGbRedemptionInput(chatId, userId, gbAmountText, messageId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);

    // 1. Validate input
    const gbAmount = parseInt(gbAmountText.trim());

    if (isNaN(gbAmount) || gbAmount < 1) {
        await sendMessage(chatId, get_text('error_invalid_gb_amount', lang), null, true, token);
        await handleCustomRedeemPrompt(chatId, userId, null, env); // Re-prompt
        return;
    }

    const user = await getUserById(userId, env);
    const requiredCost = parseFloat((gbAmount * CREDIT_COST_PER_GB).toFixed(1));

    // 2. Check credits and verification
    if ((user?.credits ?? 0) < requiredCost) {
        const errorMsg = formatText(get_text('error_insufficient_credits_custom', lang), gbAmount, requiredCost);
        await sendMessage(chatId, errorMsg, null, true, token);
        await handleCustomRedeemPrompt(chatId, userId, null, env); // Re-prompt
        return;
    }

    if (!user?.channel_verified) {
        await sendMessage(chatId, get_text('error_unverified_redeem', lang), null, true, token);
        await setUserState(userId, 'clear', {}, env);
        return;
    }

    // 3. Proceed to Panel Selection (Clearing state is handled in the next step to allow back button)
    // NOTE: Send a new message to prompt for panel selection, the input message remains untouched.
    await handleRedeemSelectPanel(chatId, userId, null, gbAmount, env);
}

/**
 * NEW: Handle Paginated Display of Redeemed Keys
 * @param {Object} env Cloudflare environment object
 */
export async function handleMyRedeemedKeys(chatId, userId, messageId, page, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    const allKeys = await getUserRedeemedKeys(userId, env);

    if (allKeys.length === 0) {
        const message = get_text('menu_my_keys_title', lang) + "\n" + get_text('welcome_separator', lang) + "\n\n" + get_text('no_redeemed_keys', lang);
        const keyboard = { inline_keyboard: [[{ text: get_text('button_back', lang), callback_data: 'referral_back' }]] };
        await sendOrEditMessage(chatId, message, messageId, keyboard, token);
        return;
    }

    const totalKeys = allKeys.length;
    const totalPages = Math.ceil(totalKeys / REDEEMED_KEYS_PER_PAGE);
    page = Math.max(1, Math.min(page, totalPages));
    const offset = (page - 1) * REDEEMED_KEYS_PER_PAGE;

    // Sort newest key first
    const sortedKeys = allKeys.sort((a, b) => new Date(b.redeemed_at).getTime() - new Date(a.redeemed_at).getTime());
    const currentPageKeys = sortedKeys.slice(offset, offset + REDEEMED_KEYS_PER_PAGE);

    let message = get_text('menu_my_keys_title', lang) + "\n" +
        get_text('welcome_separator', lang) + "\n\n" +
        `*Page ${page}/${totalPages}*\n\n`;

    const keyboardButtons = [];

    currentPageKeys.forEach((keyData, index) => {
        const globalIndex = offset + index + 1;
        const panel = keyData.panel;
        const panelName = SERVER_NAMES[panel] ?? `Panel ${panel}`;

        message += `*${globalIndex}.* ${keyData.gb}GB on ${panelName}\n`;
        message += get_text('field_account_key', lang) + ` \`${keyData.key}\`\n`;
        message += get_text('field_key_date', lang) + ` ${keyData.redeemed_at}\n\n`;

        // Create delete button text with key snippet
        const keySnippet = keyData.key.length > 10 ? keyData.key.substring(0, 6) + '...' + keyData.key.slice(-4) : keyData.key;
        const deleteButtonText = formatText(get_text('button_delete_key', lang), keySnippet);

        keyboardButtons.push([{
            text: deleteButtonText, // This will be "🗑️ ကီး ဖျက်ရန်: keyName..."
            callback_data: `key_delete_confirm_${keyData.key}_${panel}`
        }]);
    });

    const navRow = [];
    if (page > 1) {
        navRow.push({ text: get_text('nav_key_prev', lang), callback_data: `view_my_keys_page_${page - 1}` });
    }
    if (page < totalPages) {
        navRow.push({ text: get_text('nav_key_next', lang), callback_data: `view_my_keys_page_${page + 1}` });
    }
    if (navRow.length > 0) {
        keyboardButtons.push(navRow);
    }

    keyboardButtons.push([{ text: get_text('button_back', lang), callback_data: 'referral_back' }]);

    const keyboard = { inline_keyboard: keyboardButtons };

    await sendOrEditMessage(chatId, message, messageId, keyboard, token);
}

/**
 * NEW: Handle Key Deletion Confirmation
 * @param {Object} env Cloudflare environment object
 */
export async function handleKeyDeleteConfirm(chatId, userId, messageId, key, panel, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    const keys = await getUserRedeemedKeys(userId, env);
    // Key is a string, panel might be stored as string or number, so use flexible comparison
    const keyData = keys.find(k => k.key === key && String(k.panel) === String(panel));

    if (!keyData) {
        await sendOrEditMessage(chatId, get_text('error_key_not_found', lang), messageId, { inline_keyboard: [[{ text: get_text('button_back', lang), callback_data: 'view_my_keys_page_1' }]] }, token);
        return;
    }

    const panelName = SERVER_NAMES[panel] ?? `Panel ${panel}`;

    const message = formatText(get_text('confirm_delete_key', lang), key, panelName);

    const keyboard = {
        inline_keyboard: [
            [
                { text: `✅ Yes, Delete`, callback_data: `key_delete_final_${key}_${panel}` },
                { text: `❌ Cancel`, callback_data: 'view_my_keys_page_1' }
            ]
        ]
    };

    await sendOrEditMessage(chatId, message, messageId, keyboard, token);
}

/**
 * NEW: Handle Key Deletion Finalization
 * @param {Object} env Cloudflare environment object
 */
export async function handleKeyDeleteFinal(chatId, userId, messageId, key, panel, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    await editMessageText(chatId, messageId, `🔄 *Deleting key* \`${key}\` *from Panel ${panel}...*`, null, true, token);

    // 1. Attempt to delete from V2Ray API
    const deleteResult = await deletePremiumAccount(key, panel);

    if (deleteResult.success) {
        // 2. If API success, delete from local KV storage
        await deleteUserRedeemedKey(userId, key, env);

        const panelName = SERVER_NAMES[panel] ?? `Panel ${panel}`;
        const message = formatText(get_text('key_deleted_success', lang), key, panelName);
        await sendOrEditMessage(chatId, message, messageId, { inline_keyboard: [[{ text: get_text('button_back', lang), callback_data: 'view_my_keys_page_1' }]] }, token);
    } else {
        // 3. If API fails, notify user but do NOT delete from local KV 
        const errorMessage = formatText(get_text('key_delete_fail', lang), key, deleteResult.error);
        await sendOrEditMessage(chatId, errorMessage, messageId, { inline_keyboard: [[{ text: get_text('button_back', lang), callback_data: 'view_my_keys_page_1' }]] }, token);
    }
}


// --- /create (Admin) Flow Handlers ---

/**
 * Handle /create command (Admin only) - Pre-step: Panel Select Prompt
 * @param {Object} env Cloudflare environment object
 */
export async function handleCreate(chatId, params, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    if (!isAdmin(chatId)) {
        await sendMessage(chatId, get_text('admin_access_denied', lang), null, true, token);
        return;
    }

    if (params.length < 3 || isNaN(parseFloat(params[0])) || !params[1] || isNaN(parseInt(params[2]))) {
        await sendMessage(chatId, get_text('admin_usage', lang) + " " + get_text('cmd_create', lang), null, true, token);
        return;
    }

    const gbLimit = parseFloat(params[0]);
    const userName = params[1];
    const daysLimit = parseInt(params[2]);
    const panel = parseInt(params[3]); // Optional

    // If panel is provided and valid, run the creation directly (backward compatibility)
    if (panel && !isNaN(panel) && panel > 0) {
        await finalizeAdminCreate(chatId, gbLimit, userName, daysLimit, panel, null, env);
        return;
    }

    // If panel is NOT provided or invalid, prompt for panel selection
    const message = formatText(get_text('prompt_select_panel_create', lang), userName, gbLimit);

    // Set state to await panel selection
    await setUserState(chatId, 'waiting_for_create_panel', { gb: gbLimit, name: userName, days: daysLimit }, env);

    const keyboardButtons = [];
    for (const panelId in SERVER_NAMES) {
        const panelName = SERVER_NAMES[panelId];
        keyboardButtons.push([{
            text: formatText(get_text('panel_button_name', lang), panelName),
            callback_data: `admin_create_panel_${panelId}_${gbLimit}_${daysLimit}_${userName}`
        }]);
    }

    keyboardButtons.push([{ text: get_text('button_back', lang), callback_data: 'menu_admin' }]);
    const keyboard = { inline_keyboard: keyboardButtons };


    await sendMessage(chatId, message, keyboard, true, token);
}

/**
 * Handle Admin Panel Selection and Account Creation (Final Step for /create)
 * @param {Object} env Cloudflare environment object
 */
export async function handleAdminPanelSelect(chatId, messageId, panel, gbLimit, daysLimit, userName, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const adminLang = await get_user_language(chatId, env);

    // Clear the state
    await setUserState(chatId, 'clear', {}, env);

    // Re-check panel validity
    if (panel <= 0 || !SERVER_NAMES[panel]) {
        await sendOrEditMessage(chatId, get_text('error_invalid_panel_range', adminLang), messageId, null, token);
        return;
    }

    await finalizeAdminCreate(chatId, gbLimit, userName, daysLimit, panel, messageId, env);
}

/**
 * Final execution of Admin Create
 * @param {Object} env Cloudflare environment object
 */
async function finalizeAdminCreate(chatId, gbLimit, userName, daysLimit, panel, messageId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const adminLang = await get_user_language(chatId, env);

    // 1. Send or edit initial loading message
    let loadingMessageId = messageId;
    if (!loadingMessageId) {
        const initialMsg = await sendMessage(chatId, get_text('status_creating_premium', adminLang), null, true, token);
        loadingMessageId = initialMsg.data?.result?.message_id;
    } else {
        // If messageId is provided (from callback), edit it to show loading status
        await editMessageText(chatId, loadingMessageId, get_text('status_creating_premium', adminLang), null, true, token);
    }

    // --- API CALL ---
    const result = await createPremiumAccount(gbLimit, userName, daysLimit, panel);
    // --- END API CALL ---

    const panelNameDisplay = SERVER_NAMES[panel] ?? `Panel ${panel}`;
    let finalMessage;

    if (result.success) {
        const data = result.data;
        const expiryText = daysLimit > 0 ? `${daysLimit} days` : "Unlimited";

        finalMessage = get_text('create_success_title', adminLang) + "\n\n" +
            get_text('field_email', adminLang) + ` \`${data.email}\`\n` +
            get_text('field_password', adminLang) + ` \`${data.password}\`\n` +
            get_text('field_data_limit', adminLang) + ` ${gbLimit} GB\n` +
            get_text('field_expiry_days', adminLang) + ` ${expiryText}\n` +
            get_text('field_panel_id', adminLang) + ` ${panelNameDisplay}\n\n` +
            get_text('field_link', adminLang) + `\n\`${data.link}\`\n\n` +
            get_text('field_qr', adminLang) + `\n${data.qr_code}`;
    } else {
        finalMessage = get_text('error_admin_create_failed', adminLang) + "\n\n" +
            get_text('error_prefix', adminLang) + ` \`${result.error}\``;
    }

    // 2. Final message handling: Attempt to edit the loading message
    if (loadingMessageId) {
        const editResult = await editMessageText(chatId, loadingMessageId, finalMessage, null, true, token);

        if (!editResult.success) {
            // If edit failed, send a new message
            await sendMessage(chatId, finalMessage, null, true, token);
        }
    } else {
        // Fallback: Send new message if loadingMessageId was somehow not set
        await sendMessage(chatId, finalMessage, null, true, token);
    }
}


/**
 * Handle /addcredit and /removecredit commands (Admin only)
 * @param {Object} env Cloudflare environment object
 */
export async function handleCreditControl(chatId, params, operation, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    if (!isAdmin(chatId)) {
        await sendMessage(chatId, get_text('admin_access_denied', lang), null, true, token);
        return;
    }

    if (params.length < 2) {
        const usageKey = operation === 'add' ? 'admin_credit_usage_add' : 'admin_credit_usage_remove';
        await sendMessage(chatId, get_text('admin_usage', lang) + " " + get_text(usageKey, lang), null, true, token);
        return;
    }

    const criteria = params[0];
    const amount = parseFloat(params[1]);

    if (isNaN(amount) || amount <= 0) {
        await sendMessage(chatId, get_text('admin_credit_value_error', lang), null, true, token);
        return;
    }

    const targetUser = await getUserByCriteria(criteria, env);
    if (!targetUser) {
        await sendMessage(chatId, formatText(get_text('error_user_not_found', lang), criteria), null, true, token);
        return;
    }

    // Send initial loading message
    const loadingText = `🔄 *${operation === 'add' ? 'Adding' : 'Removing'} ${amount.toFixed(1)} Credits* for user \`${targetUser.user_id}\`...`;
    const initialMsg = await sendMessage(chatId, loadingText, null, true, token);
    const messageId = initialMsg.data?.result?.message_id;

    const targetUserId = targetUser.user_id;
    const targetName = targetUser.username ? `@${targetUser.username.replace(/_/g, '\\_')}` : String(targetUserId); // Escape username

    const source = operation === 'add' ? get_text('credit_source_admin_add', lang) : get_text('credit_source_admin_deduct', lang);
    const { success, newCredit } = await setCredits(targetUserId, amount, operation, false, source, env);

    if (success) {
        const successKey = operation === 'add' ? 'admin_add_credit_success' : 'admin_remove_credit_success';
        const finalMessage = formatText(get_text(successKey, lang), amount, targetName, newCredit);
        await sendOrEditMessage(chatId, finalMessage, messageId, null, token);
    } else {
        const errorMessage = get_text('error_admin_approval_failed', lang);
        await sendOrEditMessage(chatId, errorMessage, messageId, null, token);
    }
}

/**
 * Handle /getkv command (Admin only)
 * @param {Object} env Cloudflare environment object
 */
export async function handleGetKV(chatId, key, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    if (!isAdmin(chatId)) {
        await sendMessage(chatId, get_text('admin_access_denied', lang), null, true, token);
        return;
    }

    if (!key) {
        await sendMessage(chatId, get_text('admin_kv_usage_get', lang), null, true, token);
        return;
    }

    try {
        // @ts-ignore
        const value = await env.BOT_KV.get(key);
        let content = value ?? 'null';

        // Attempt to pretty print JSON if it looks like JSON
        try {
            if (content && typeof content === 'string' && (content.startsWith('{') || content.startsWith('['))) {
                content = JSON.stringify(JSON.parse(content), null, 2);
            }
        } catch (e) {
            // Ignore JSON parsing error, use original content
        }

        const message = formatText(get_text('admin_kv_get_success', lang), key) + `\n\n\`\`\`json\n${content}\n\`\`\``;
        await sendMessage(chatId, message, null, true, token);
    } catch (e) {
        const errorMsg = formatText(get_text('admin_kv_error', lang), e.message);
        await sendMessage(chatId, errorMsg, null, true, token);
    }
}

/**
 * Handle /setkv command (Admin only)
 * @param {Object} env Cloudflare environment object
 */
export async function handleSetKV(chatId, key, jsonValue, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    if (!isAdmin(chatId)) {
        await sendMessage(chatId, get_text('admin_access_denied', lang), null, true, token);
        return;
    }

    if (!key || !jsonValue) {
        await sendMessage(chatId, get_text('admin_kv_usage_set', lang), null, true, token);
        return;
    }

    try {
        let parsedValue = jsonValue.trim();
        let valueToStore = parsedValue;

        // Try to parse as JSON if it's an object/array, otherwise store as string
        if (parsedValue.startsWith('{') || parsedValue.startsWith('[')) {
            try {
                valueToStore = JSON.stringify(JSON.parse(parsedValue));
            } catch (e) {
                // If JSON parsing fails, use the raw string, but note the error
                await sendMessage(chatId, `⚠️ Warning: Input for key \`${key}\` was sent as a raw string because JSON parsing failed: ${e.message}`, null, true, token);
                valueToStore = parsedValue;
            }
        }

        // @ts-ignore
        await env.BOT_KV.put(key, valueToStore);

        // --- Added Confirmation of Stored Value ---
        let confirmationValue = valueToStore;
        try {
            confirmationValue = JSON.stringify(JSON.parse(valueToStore), null, 2);
        } catch (e) {
            // Keep original value if not JSON
        }

        const message = formatText(get_text('admin_kv_set_success', lang), key) +
            `\n\n*Set Value:* \n\`\`\`json\n${confirmationValue}\n\`\`\``;
        // --- End Added Confirmation ---

        await sendMessage(chatId, message, null, true, token);
    } catch (e) {
        const errorMsg = formatText(get_text('admin_kv_error', lang), e.message);
        await sendMessage(chatId, errorMsg, null, true, token);
    }
}

/**
 * Handle /delprem command (Admin only)
 * @param {Object} env Cloudflare environment object
 */
export async function handleDelPrem(chatId, params, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    if (!isAdmin(chatId)) {
        await sendMessage(chatId, get_text('admin_access_denied', lang), null, true, token);
        return;
    }

    if (params.length < 2 || isNaN(parseInt(params[1]))) {
        await sendMessage(chatId, get_text('admin_usage', lang) + " " + get_text('cmd_delprem', lang), null, true, token);
        return;
    }

    const userName = params[0];
    const panel = parseInt(params[1]);

    const initialMsg = await sendMessage(chatId, get_text('status_deleting_premium', lang), null, true, token);
    const messageId = initialMsg.data?.result?.message_id;

    const result = await deletePremiumAccount(userName, panel);

    if (result.success) {
        const data = result.data;

        const message = get_text('delete_prem_success', lang) + "\n\n" +
            get_text('field_email', lang) + ` \`${userName}\`\n` +
            get_text('field_panel_id', lang) + ` ${data.panel_name}\n` +
            get_text('field_status_result', lang) + ` ${data.status}`;

        await sendOrEditMessage(chatId, message, messageId, null, token);
    } else {
        const errorMessage = get_text('error_admin_delete_failed', lang) + "\n\n" +
            get_text('error_prefix', lang) + ` \`${result.error}\``;
        await sendOrEditMessage(chatId, errorMessage, messageId, null, token);
    }
}

/**
 * Handle /deltrial command (Admin only)
 * @param {Object} env Cloudflare environment object
 */
export async function handleDelTrial(chatId, telegramId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    if (!isAdmin(chatId)) {
        await sendMessage(chatId, get_text('admin_access_denied', lang), null, true, token);
        return;
    }

    const initialMsg = await sendMessage(chatId, get_text('status_deleting_trial', lang), null, true, token);
    const messageId = initialMsg.data?.result?.message_id;

    const result = await deleteTrialAccount(telegramId);

    if (result.success) {
        const data = result.data;

        const message = get_text('delete_trial_success', lang) + "\n\n" +
            get_text('field_telegram_id', lang) + ` \`${telegramId}\`\n` +
            get_text('field_panel_id', lang) + ` ${data.panel_name}\n` +
            get_text('field_status_result', lang) + ` ${data.status}`;

        await sendOrEditMessage(chatId, message, messageId, null, token);
    } else {
        const errorMessage = get_text('error_admin_deltrial_failed', lang) + "\n\n" +
            get_text('error_prefix', lang) + ` \`${result.error}\``;
        await sendOrEditMessage(chatId, errorMessage, messageId, null, token);
    }
}

/**
 * Handle /delexp command (Admin only)
 * @param {Object} env Cloudflare environment object
 */
export async function handleDelExp(chatId, panelParam, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    if (!isAdmin(chatId)) {
        await sendMessage(chatId, get_text('admin_access_denied', lang), null, true, token);
        return;
    }

    const panel = panelParam ? parseInt(panelParam) : null;
    const type_key = panel ? 'delete_exp_premium_type' : 'delete_exp_trial_type';
    const type_name = panel ? formatText(get_text(type_key, lang), panel) : get_text(type_key, lang);

    const initialMsg = await sendMessage(chatId, formatText(get_text('status_deleting_expired', lang), type_name), null, true, token);
    const messageId = initialMsg.data?.result?.message_id;

    const result = await deleteExpiredAccounts(panel);

    if (result.success) {
        const data = result.data;

        let message = get_text('delete_exp_complete', lang) + "\n\n" +
            get_text('field_deleted_type', lang) + ` ${type_name}\n` +
            get_text('field_panel_id', lang) + ` ${data.panel_name}\n` +
            get_text('field_deleted_count', lang) + ` ${data.deleted_count} accounts\n` +
            get_text('field_total_expired', lang) + ` ${data.total_expired_found} expired\n` +
            get_text('field_status_result', lang) + ` ${data.status}`;

        if (data.failed_deletions && data.failed_deletions.length > 0) {
            message += "\n\n" + get_text('field_failed_deletions', lang) + ` ${data.failed_deletions.length}`;
        }

        await sendOrEditMessage(chatId, message, messageId, null, token);
    } else {
        const errorMessage = get_text('error_admin_delexp_failed', lang) + "\n\n" +
            get_text('error_prefix', lang) + ` \`${result.error}\``;
        await sendOrEditMessage(chatId, errorMessage, messageId, null, token);
    }
}

/**
 * Handle /transfer command (Admin only)
 * @param {Object} env Cloudflare environment object
 */
export async function handleTransfer(chatId, params, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    if (!isAdmin(chatId)) {
        await sendMessage(chatId, get_text('admin_access_denied', lang), null, true, token);
        return;
    }

    if (params.length < 3 || isNaN(parseInt(params[1])) || isNaN(parseInt(params[2]))) {
        await sendMessage(chatId, get_text('usage_transfer', lang), null, true, token);
        return;
    }

    const userName = params[0];
    const fromPanel = parseInt(params[1]);
    const toPanel = parseInt(params[2]);

    if (fromPanel <= 0 || toPanel <= 0) {
        await sendMessage(chatId, get_text('error_invalid_panel_range', lang), null, true, token);
        return;
    }

    const initialMsg = await sendMessage(chatId, formatText(get_text('status_transferring', lang), userName, fromPanel, toPanel), null, true, token);
    const messageId = initialMsg.data?.result?.message_id;

    const result = await transferAccount(userName, fromPanel, toPanel);

    if (result.success) {
        const data = result.data;
        const message = formatText(get_text('transfer_success', lang), data.from_panel, data.to_panel, data.email) + "\n\n" +
            get_text('field_link', lang) + `\`\`\`${data.link}\`\`\`\n\n` +
            get_text('field_qr', lang) + `\n${data.qr_code}`;
        await sendOrEditMessage(chatId, message, messageId, null, token);
    } else {
        const errorMessage = get_text('error_prefix', lang) + ` \`${result.error}\`\n\n` +
            (result.data?.status ?? '');
        await sendOrEditMessage(chatId, errorMessage, messageId, null, token);
    }
}

/**
 * Handle /resettraffic command (Admin only)
 * @param {Object} env Cloudflare environment object
 */
export async function handleResetTraffic(chatId, params, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    if (!isAdmin(chatId)) {
        await sendMessage(chatId, get_text('admin_access_denied', lang), null, true, token);
        return;
    }

    if (params.length < 2 || isNaN(parseInt(params[1]))) {
        await sendMessage(chatId, get_text('usage_resettraffic', lang), null, true, token);
        return;
    }

    const userName = params[0];
    const panel = parseInt(params[1]);

    if (panel <= 0) {
        await sendMessage(chatId, get_text('error_invalid_panel_range', lang), null, true, token);
        return;
    }

    const initialMsg = await sendMessage(chatId, formatText(get_text('status_resetting', lang), userName, panel), null, true, token);
    const messageId = initialMsg.data?.result?.message_id;

    const result = await resetTrafficUsage(userName, panel);

    if (result.success) {
        const data = result.data;
        const message = formatText(get_text('reset_success', lang), data.email, data.panel_name, data.status);
        await sendOrEditMessage(chatId, message, messageId, null, token);
    } else {
        const errorMessage = get_text('error_prefix', lang) + ` \`${result.error}\``;
        await sendOrEditMessage(chatId, errorMessage, messageId, null, token);
    }
}

/**
 * Handle /modify command (Admin only)
 * @param {Object} env Cloudflare environment object
 */
export async function handleModifyAccount(chatId, params, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    if (!isAdmin(chatId)) {
        await sendMessage(chatId, get_text('admin_access_denied', lang), null, true, token);
        return;
    }

    if (params.length < 4 || isNaN(parseInt(params[1])) || isNaN(parseFloat(params[2])) || isNaN(parseInt(params[3]))) {
        await sendMessage(chatId, get_text('usage_modify', lang), null, true, token);
        return;
    }

    const userName = params[0];
    const panel = parseInt(params[1]);
    const gbLimit = parseFloat(params[2]);
    const daysLimit = parseInt(params[3]);
    const newPassword = params[4] ?? ''; // Optional

    if (panel <= 0) {
        await sendMessage(chatId, get_text('error_invalid_panel_range', lang), null, true, token);
        return;
    }

    // Quick validation check
    if (gbLimit < 0 || daysLimit < 0) {
        await sendMessage(chatId, "❌ *GB Limit and Days Limit must be non-negative numbers.*", null, true, token);
        return;
    }

    const initialMsg = await sendMessage(chatId, formatText(get_text('status_modifying', lang), userName, panel), null, true, token);
    const messageId = initialMsg.data?.result?.message_id;

    const result = await modifyAccountDetails(userName, panel, gbLimit, daysLimit, newPassword);

    if (result.success) {
        const data = result.data;
        const passwordStatus = newPassword ? 'Updated' : 'Not Changed';
        const message = formatText(get_text('modify_success', lang), data.email, data.panel_name, data.status) +
            `\nChanges:\n- GB Limit: ${gbLimit} GB\n- Days: ${daysLimit} days\n- Password: ${passwordStatus}`;
        await sendOrEditMessage(chatId, message, messageId, null, token);
    } else {
        const errorMessage = get_text('error_prefix', lang) + ` \`${result.error}\`\n\nDetails: ${result.data?.details ?? 'N/A'}`;
        await sendOrEditMessage(chatId, errorMessage, messageId, null, token);
    }
}

/**
 * Handle /bulkcreate command (Admin only)
 * @param {Object} env Cloudflare environment object
 */
export async function handleBulkCreate(chatId, params, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    if (!isAdmin(chatId)) {
        await sendMessage(chatId, get_text('admin_access_denied', lang), null, true, token);
        return;
    }

    if (params.length < 4 || isNaN(parseFloat(params[1])) || isNaN(parseInt(params[2])) || isNaN(parseInt(params[3]))) {
        await sendMessage(chatId, get_text('usage_bulkcreate', lang), null, true, token);
        return;
    }

    const namesString = params[0];
    const gbLimit = parseFloat(params[1]);
    const daysLimit = parseInt(params[2]);
    const panel = parseInt(params[3]);
    const names = namesString.split(',').map(name => name.trim()).filter(name => name.length > 0);

    if (panel <= 0) {
        await sendMessage(chatId, get_text('error_invalid_panel_range', lang), null, true, token);
        return;
    }
    if (names.length === 0) {
        await sendMessage(chatId, "❌ No user names provided for bulk creation.", null, true, token);
        return;
    }

    const initialMsg = await sendMessage(chatId, formatText(get_text('status_bulk_create', lang), names.length), null, true, token);
    const messageId = initialMsg.data?.result?.message_id;

    const result = await bulkCreateAccounts(names, gbLimit, daysLimit, panel);

    if (result.success) {
        const message = get_text('bulk_success', lang) + `\n\n*Count:* ${names.length}\n*GB:* ${gbLimit}\n*Panel:* ${panel}\n\n_Note: Individual results are logged on the PHP server side, as the API does not return a full batch response here._`;
        await sendOrEditMessage(chatId, message, messageId, null, token);
    } else {
        const errorMessage = get_text('error_prefix', lang) + ` \`${result.error}\``;
        await sendOrEditMessage(chatId, errorMessage, messageId, null, token);
    }
}

/**
 * Handle /runwarnings command (Admin only)
 * @param {Object} env Cloudflare environment object
 */
export async function handleRunWarnings(chatId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    if (!isAdmin(chatId)) {
        await sendMessage(chatId, get_text('admin_access_denied', lang), null, true, token);
        return;
    }

    const initialMsg = await sendMessage(chatId, get_text('status_running_warnings', lang), null, true, token);
    const messageId = initialMsg.data?.result?.message_id;

    const result = await runExpiryWarnings();

    if (result.success) {
        const message = get_text('warnings_success', lang) + `\n\nStatus: ${result.data?.status ?? 'Completed successfully.'}`;
        await sendOrEditMessage(chatId, message, messageId, null, token);
    } else {
        const errorMessage = get_text('error_prefix', lang) + ` \`${result.error}\``;
        await sendOrEditMessage(chatId, errorMessage, messageId, null, token);
    }
}

/**
 * Handle /optimal command (Admin only)
 * @param {Object} env Cloudflare environment object
 */
export async function handleOptimalPanel(chatId, params, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    if (!isAdmin(chatId)) {
        await sendMessage(chatId, get_text('admin_access_denied', lang), null, true, token);
        return;
    }

    const type = params[0] === 'trial' ? 'trial' : 'premium';

    const initialMsg = await sendMessage(chatId, formatText(get_text('status_optimal_panel', lang), type), null, true, token);
    const messageId = initialMsg.data?.result?.message_id;

    const result = await getOptimalPanel(type);

    if (result.success) {
        const data = result.data;
        const message = formatText(get_text('optimal_success', lang), data.optimal_panel, data.panel_name, data.account_type.toUpperCase());
        await sendOrEditMessage(chatId, message, messageId, null, token);
    } else {
        const errorMessage = get_text('error_prefix', lang) + ` \`${result.error}\``;
        await sendOrEditMessage(chatId, errorMessage, messageId, null, token);
    }
}

// =========================================================================
// NEW: ONLINE USER HANDLERS
// =========================================================================

/**
 * Helper to prepare online user data for pagination.
 */
function prepareOnlineUsersForPagination(apiData) {
    const flattenedList = [];
    const onlineByPanel = apiData.online_users_by_panel || {};

    for (const panelName in onlineByPanel) {
        const users = onlineByPanel[panelName];
        for (let i = 0; i < users.length; i++) {
            flattenedList.push({
                email: users[i],
                panel: panelName,
                index: flattenedList.length + 1
            });
        }
    }
    return flattenedList;
}

/**
 * Main handler for /online command and online_page callbacks.
 * @param {Object} env Cloudflare environment object
 */
export async function handleOnlineUsers(chatId, messageId = null, page = 1, isCallback = false, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);

    if (!isAdmin(chatId)) {
        if (!isCallback) {
             await sendMessage(chatId, get_text('admin_access_denied', lang), null, true, token);
        }
        return;
    }

    // 1. Initial/Loading message
    let loadingMessageId = messageId;
    let initialMessage = null;

    if (!isCallback) {
        initialMessage = await sendMessage(chatId, get_text('status_fetching_online', lang), null, true, token);
        loadingMessageId = initialMessage.data?.result?.message_id;
    }

    // 2. Check cache or Fetch fresh Stats
    const onlineDataKey = `online_users_data_${chatId}`;
    // @ts-ignore
    let cachedData = JSON.parse(await env.BOT_KV.get(onlineDataKey)) || {}; // Direct KV read
    let flattenedList = cachedData.list;
    let totalOnlineUsers = 0;
    let errorOccurred = false;
    let errorMessageText = '';
    let fetchedFresh = false;

    // Check if data is expired (1 min cache) or missing
    if (!flattenedList || cachedData.timestamp < (Date.now() - 60000)) {
        fetchedFresh = true;

        // If it's a pagination request and cache expired, show brief waiting state on the existing message
        if (isCallback && loadingMessageId) {
             await editMessageText(chatId, loadingMessageId, get_text('status_fetching_online', lang), { inline_keyboard: [] }, true, token);
        }

        const result = await getOnlineUsers();

        if (!result.success || result.data.total_online_users === 0) {
            errorOccurred = true;
            errorMessageText = result.success ? get_text('no_online_users_found', lang) : get_text('error_prefix', lang) + ` \`${result.error}\``;
        } else {
            totalOnlineUsers = result.data.total_online_users;
            flattenedList = prepareOnlineUsersForPagination(result.data);

            // Store the fresh data in KV for pagination
            // @ts-ignore
            await env.BOT_KV.put(onlineDataKey, JSON.stringify({
                list: flattenedList,
                total: totalOnlineUsers,
                timestamp: Date.now()
            }), { expirationTtl: 120 }); // Cache for 2 minutes
        }
    } else {
        totalOnlineUsers = cachedData.total;
    }

    // 3. Format Message and Keyboard

    if (errorOccurred && (fetchedFresh || !flattenedList)) {
        const finalMessage = get_text('menu_online_users_title', lang) + "\n" +
            get_text('welcome_separator', lang) + "\n\n" +
            errorMessageText;
        // Send final message (or edit loading message) without any navigation buttons
        await sendOrEditMessage(chatId, finalMessage, loadingMessageId, { inline_keyboard: [] }, token);
        return;
    }


    // Pagination Logic
    const totalUsers = flattenedList.length;
    const totalPages = totalUsers > 0 ? Math.ceil(totalUsers / ONLINE_USERS_PER_PAGE) : 1;
    page = Math.max(1, Math.min(page, totalPages));
    const offset = (page - 1) * ONLINE_USERS_PER_PAGE;

    const currentPageUsers = flattenedList.slice(offset, offset + ONLINE_USERS_PER_PAGE);

    let message = get_text('menu_online_users_title', lang) + "\n" +
        get_text('welcome_separator', lang) + "\n\n" +
        formatText(get_text('field_total_online', lang), totalOnlineUsers) + "\n" +
        formatText(get_text('stats_top_title', lang), page, totalPages) + "\n" +
        get_text('welcome_separator', lang) + "\n\n";

    // Group by panel for display (optional, but nice detail)
    const usersByPanel = {};
    currentPageUsers.forEach(user => {
        if (!usersByPanel[user.panel]) usersByPanel[user.panel] = [];
        usersByPanel[user.panel].push(user);
    });

    // Sort panels alphabetically for stable output
    const sortedPanelNames = Object.keys(usersByPanel).sort();

    for (const panelName of sortedPanelNames) {
        const panelUsers = usersByPanel[panelName];
        message += formatText(get_text('field_online_on_panel', lang), panelName, panelUsers.length) + "\n";

        for (const user of panelUsers) {
            message += `\`${user.email}\`\n`;
        }
        message += "\n";
    }

    message = message.trim();

    // Create Keyboard (Only Navigation, NO BACK BUTTON)
    const keyboardButtons = [];
    const navRow = [];

    if (page > 1) {
        navRow.push({ text: get_text('nav_online_prev', lang), callback_data: `online_page_${page - 1}` });
    }

    if (page < totalPages) {
        navRow.push({ text: get_text('nav_online_next', lang), callback_data: `online_page_${page + 1}` });
    }

    if (navRow.length > 0) {
        keyboardButtons.push(navRow);
    }

    const keyboard = { inline_keyboard: keyboardButtons };

    // 4. Send/Edit Message
    await sendOrEditMessage(chatId, message, loadingMessageId, keyboard, token);
}


// =========================================================================
// MENU HANDLERS
// =========================================================================

/**
 * Handle V2Ray Manager Basic Statistics Menu (Publicly accessible)
 * @param {Object} env Cloudflare environment object
 */
export async function handleStatsMenu(chatId, messageId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);

    const message = get_text('menu_basic_stats_title', lang) + "\n" +
        get_text('welcome_separator', lang) + "\n" +
        get_text('menu_basic_stats_tip', lang) + "\n\n" +
        get_text('menu_basic_stats_content', lang);

    const keyboard = {
        inline_keyboard: [
            [
                { text: get_text('button_usage_report', lang), callback_data: 'stats_usage_report' },
                { text: get_text('button_top_users', lang), callback_data: 'stats_users_1_menu_basic_stats' },
            ],
            [
                { text: get_text('button_back', lang), callback_data: 'menu_about' }
            ]
        ]
    };

    await sendOrEditMessage(chatId, message, messageId, keyboard, token);
}

/**
 * Handle /stats command and stats_usage_report callback
 * @param {Object} env Cloudflare environment object
 */
export async function handleStats(chatId, messageId, isCallback = false, backTarget = 'menu_start', env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);

    // /stats command remains admin-only
    if (!isCallback && !isAdmin(chatId)) {
             await sendMessage(chatId, get_text('admin_access_denied', lang), null, true, token);
             return;
    }

    let loadingMessageId = messageId;

    // Direct /stats command (admin only) shows loading, but callbacks from menu edit directly to result.
    if (!isCallback) {
        const initialMsg = await sendMessage(chatId, get_text('status_retrieving_stats', lang), null, true, token);
        loadingMessageId = initialMsg.data?.result?.message_id;
    }

    const stats = await getUserStats(env);
    const activityStats = getUserActivityStats(stats.users);

    let message = get_text('stats_report_title', lang) + "\n" +
        get_text('welcome_separator', lang) + "\n";

    message += formatText(get_text('stats_active_day', lang), activityStats.day) + "\n";
    message += formatText(get_text('stats_active_week', lang), activityStats.week) + "\n";
    message += formatText(get_text('stats_active_month', lang), activityStats.month) + "\n";
    message += formatText(get_text('stats_active_year', lang), activityStats.year) + "\n";

    message += get_text('welcome_separator', lang) + "\n";

    message += formatText(get_text('stats_total_users_line', lang), activityStats.total);

    const keyboardButtons = [];

    if (backTarget === 'menu_basic_stats') {
        keyboardButtons.push([{ text: get_text('button_back', lang), callback_data: 'menu_basic_stats' }]);
    } else if (backTarget === 'menu_admin') {
        keyboardButtons.push([{ text: get_text('button_back', lang), callback_data: 'menu_admin' }]);
    }

    const keyboard = { inline_keyboard: keyboardButtons };

    await sendOrEditMessage(chatId, message, loadingMessageId, keyboard, token);
}

/**
 * Handle paginated list of recent users (now publicly accessible via menu)
 * @param {Object} env Cloudflare environment object
 */
export async function handleRecentUsers(chatId, messageId, page, backCallback, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);

    const stats = await getUserStats(env);
    const allUsers = stats.users;
    const totalUsers = stats.total_users;
    const totalPages = totalUsers > 0 ? Math.ceil(totalUsers / USERS_PER_PAGE) : 1;

    page = Math.max(1, Math.min(page, totalPages));
    const offset = (page - 1) * USERS_PER_PAGE;

    const currentPageUsers = allUsers.slice(offset, offset + USERS_PER_PAGE);

    let message = formatText(get_text('stats_top_title', lang), page, totalPages) + "\n" +
        get_text('welcome_separator', lang) + "\n";

    if (totalUsers === 0) {
        message += get_text('stats_no_users', lang);
    } else {
        let rank = offset + 1;
        for (const user of currentPageUsers) {
            let rank_marker = '🔸';
            if (rank === 1) rank_marker = '🥇';
            if (rank === 2) rank_marker = '🥈';
            if (rank === 3) rank_marker = '🥉';

            // Use getSafeDisplayName for display name and link text
            const displayName = getSafeDisplayName(user);
            const userLink = `[${displayName}](tg://user?id=${user.user_id})`;

            message += `${rank_marker} *${rank}.* ${userLink}\n` +
                get_text('user_id_label', lang) + ` \`${user.user_id}\`\n\n`;

            rank++;
        }
        message = message.trim();
    }

    const keyboardButtons = [];
    const navRow = [];

    if (page > 1) {
        navRow.push({ text: get_text('nav_prev', lang), callback_data: `stats_users_${page - 1}_${backCallback}` });
    }

    if (page < totalPages) {
        navRow.push({ text: get_text('nav_next', lang), callback_data: `stats_users_${page + 1}_${backCallback}` });
    }

    if (navRow.length > 0) {
        keyboardButtons.push(navRow);
    }

    keyboardButtons.push([{ text: get_text('nav_close', lang), callback_data: `stats_summary_${backCallback}` }]);

    const keyboard = { inline_keyboard: keyboardButtons };

    // Edit the message directly with the result
    await editMessageText(chatId, messageId, message, keyboard, true, token);
}

/**
 * Handle /broadcast command (Admin only)
 * @param {Object} env Cloudflare environment object
 */
export async function handleBroadcast(chatId, update, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    if (!isAdmin(chatId)) {
        await sendMessage(chatId, get_text('admin_access_denied', lang), null, true, token);
        return;
    }

    const replyToMessage = update.message.reply_to_message;

    if (!replyToMessage) {
        const helpText = get_text('broadcast_usage', lang);
        await sendMessage(chatId, helpText, null, true, token);
        return;
    }

    const stats = await getUserStats(env);
    const totalUsers = stats.total_users;
    const userList = stats.users;

    // Send initial loading message
    const initialText = formatText(get_text('status_broadcasting', lang), totalUsers, 0, totalUsers);
    const initialMsg = await sendMessage(chatId, initialText, null, true, token);
    const messageId = initialMsg.data?.result?.message_id;

    // Execute the broadcast logic
    const broadcastResult = await processBroadcast(replyToMessage, totalUsers, userList, messageId, chatId, lang, env);

    if (broadcastResult.success) {
        let message = get_text('broadcast_complete', lang) + "\n\n";
        message += get_text('broadcast_success', lang) + ` ${broadcastResult.success_count}\n`;
        message += get_text('broadcast_failed', lang) + ` ${broadcastResult.failed_count}\n`;
        message += get_text('broadcast_total', lang) + ` ${broadcastResult.total_users}`;

        // Edit the final message
        await sendOrEditMessage(chatId, message, messageId, null, token);
    } else {
        const message = get_text('broadcast_failed_error', lang) + "\n\n" + get_text('error_prefix', lang) + " [Unknown Error during processing]";
        await sendOrEditMessage(chatId, message, messageId, null, token);
    }
}

/**
 * Handle /request command
 * @param {Object} env Cloudflare environment object
 */
export async function handleRequestCommand(chatId, messageText, username, userId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);

    const command_prefix = '/request';
    const messageContent = messageText.substring(messageText.indexOf(command_prefix) + command_prefix.length).trim();

    if (messageContent.length === 0) {
        await sendMessage(chatId, get_text('request_usage', lang), null, true, token);
        return;
    }

    // FIX: Change const to let to allow concatenation via +=
    let adminMessage = "🚨 *NEW USER REQUEST* 🚨\n\n";
    // Fix: Escape underscore in username for Markdown display
    const safeUsername = username ? `@${username.replace(/_/g, '\\_')}` : "No Username";
    // @ts-ignore
    adminMessage += `👤 *User:* ${safeUsername} (\`${userId}\`)\n`;
    // @ts-ignore
    adminMessage += `📝 *Message:* ${messageContent}\n`;
    // @ts-ignore
    adminMessage += `🕒 *Time:* ${formatText(get_text('admin_field_time', DEFAULT_LANG), Date.now() / 1000)}`;

    for (const adminId of ADMIN_IDS) {
        await sendMessage(adminId, adminMessage, null, true, token);
    }

    await sendMessage(chatId, get_text('request_admin_sent', lang), null, true, token);
}

/**
 * Handle /reply command (Admin only)
 * @param {Object} env Cloudflare environment object
 */
export async function handleReply(chatId, params, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);
    if (!isAdmin(chatId)) {
        await sendMessage(chatId, get_text('admin_access_denied', lang), null, true, token);
        return;
    }

    if (params.length < 2 || isNaN(parseInt(params[0]))) {
        await sendMessage(chatId, get_text('admin_usage', lang) + " " + get_text('cmd_reply', lang), null, true, token);
        return;
    }

    const targetUserId = parseInt(params[0]);
    const replyMessage = params.slice(1).join(' ');

    const user = await getUserById(targetUserId, env);
    if (!user) {
        await sendMessage(chatId, formatText(get_text('error_user_not_found', lang), targetUserId), null, true, token);
        return;
    }

    const targetLang = user.lang ?? DEFAULT_LANG;
    const messageToUser = get_text('reply_from_admin', targetLang) + `\n\n${replyMessage}\n\n` + get_text('reply_tip', targetLang);
    const sendResult = await sendMessage(targetUserId, messageToUser, null, true, token);

    if (sendResult.success) {
        let confirmMessage = get_text('reply_success_admin', lang) + "\n\n";
        confirmMessage += get_text('admin_to', lang) + ` ${user.first_name}`;
        // Escape underscore in username for Markdown display
        if (user.username) {
            confirmMessage += ` (@${user.username.replace(/_/g, '\\_')})`;
        }
        confirmMessage += ` (\`${targetUserId}\`)\n`;
        confirmMessage += get_text('admin_message_content', lang) + ` ${replyMessage}`;

        await sendMessage(chatId, confirmMessage, null, true, token);
    } else {
        await sendMessage(chatId, get_text('reply_fail_admin', lang), null, true, token);
    }
}

/**
 * Handle /help command
 * @param {Object} env Cloudflare environment object
 */
export async function handleHelp(chatId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);

    // Define Admin commands separately, only show if user is admin
    let adminCommands = "";
    if (isAdmin(chatId)) {
        adminCommands = "\n\n" +
            get_text('admin_commands', lang) + "\n" +
            get_text('cmd_admin', lang) + "\n" +
            get_text('cmd_online', lang) + "\n" +
            get_text('cmd_stats', lang) + "\n" +
            get_text('cmd_broadcast', lang) + "\n" +
            get_text('cmd_reply', lang) + "\n" +
            get_text('cmd_approve', lang) + "\n" +
            get_text('cmd_reject', lang) + "\n" +
            get_text('cmd_ban_full', lang) + "\n" +
            get_text('cmd_unban_full', lang) + "\n" +
            get_text('cmd_create', lang) + "\n" +
            get_text('cmd_delprem', lang) + "\n" +
            get_text('cmd_deltrial', lang) + "\n" +
            get_text('cmd_delexp', lang) + "\n" +
            get_text('cmd_transfer', lang) + "\n" +
            get_text('cmd_resettraffic', lang) + "\n" +
            get_text('cmd_modify', lang) + "\n" +
            get_text('cmd_bulkcreate', lang) + "\n" +
            get_text('cmd_runwarnings', lang) + "\n" +
            get_text('cmd_optimal', lang) + "\n" +
            get_text('admin_credit_usage_add', lang) + "\n" +
            get_text('admin_credit_usage_remove', lang) + "\n" +
            get_text('cmd_getkv', lang) + "\n" +
            get_text('cmd_setkv', lang);
    }

    const helpText = get_text('cmd_help', lang) + "\n\n" +
        get_text('available_commands', lang) + "\n" +
        get_text('cmd_premium', lang) + "\n" +
        get_text('cmd_referral', lang) + "\n" +
        get_text('cmd_trial', lang) + "\n" +
        get_text('cmd_mytrial', lang) + "\n" +
        get_text('cmd_apps', lang) + "\n" +
        get_text('cmd_id', lang) + "\n" +
        get_text('cmd_language', lang) + "\n" +
        get_text('cmd_help', lang) + "\n" +
        adminCommands + "\n\n" + // Insert Admin commands if applicable
        get_text('quick_check_tip', lang) + "\n\n" +
        "🔧 *Support:*\nFor technical issues, contact @nkka404";

    await sendMessage(chatId, helpText, null, true, token);
}

/**
 * Handle Admin Control Panel Menu
 * @param {Object} env Cloudflare environment object
 */
export async function handleAdminMenu(chatId, messageId, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);

    // Enforce admin access
    if (!isAdmin(chatId)) {
        await sendMessage(chatId, get_text('admin_access_denied', lang), null, true, token);
        return;
    }

    const message = get_text('menu_admin_title', lang) + "\n" +
        get_text('welcome_separator', lang) + "\n\n" +
        "👑 *Admin commands are now accessible only via text commands (e.g., /stats, /broadcast, /online, /create, /ban).*";

    // Simplified Admin Menu buttons
    const keyboard = {
        inline_keyboard: [
            // Row 1: Back to start
            [
                { text: get_text('button_back_to_start', lang), callback_data: 'menu_start' }
            ]
        ]
    };

    await sendOrEditMessage(chatId, message, messageId, keyboard, token);
}

/**
 * Handle V2Ray Config Check
 * @param {Object} env Cloudflare environment object
 */
export async function handleV2RayConfig(chatId, config, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = await get_user_language(chatId, env);

    const initialMsg = await sendMessage(chatId, get_text('status_checking_config', lang), null, true, token);
    const messageId = initialMsg.data?.result?.message_id;

    const result = await checkV2RayAccount(config);

    if (result.success) {
        const data = result.data;

        const status = data.enable ? get_text('status_active', lang) : get_text('status_disabled', lang);

        let expiryStatus = get_text('status_active', lang);
        if (data.expiry.status === 'expired') {
            expiryStatus = get_text('expiry_expired', lang);
        } else if (data.expiry.status === 'expiring_soon') {
            expiryStatus = get_text('expiry_expiring_soon', lang);
        }

        const message = get_text('account_status_title', lang) + "\n━━━━━━━━━━━━━━━━━━━━━━\n" +
            get_text('field_email', lang) + ` \`${data.email}\`\n` +
            get_text('field_protocol', lang) + ` ${data.protocol.charAt(0).toUpperCase() + data.protocol.slice(1)}\n` +
            get_text('field_panel', lang) + ` ${data.panel_name}\n` +
            get_text('field_status', lang) + ` ${status}\n` +
            get_text('field_expiry_status', lang) + ` ${expiryStatus}\n\n` +
            get_text('traffic_usage_title', lang) + "\n━━━━━━━━━━━\n" +
            get_text('field_upload', lang) + ` ${data.traffic.upload.text}\n` +
            get_text('field_download', lang) + ` ${data.traffic.download.text}\n` +
            get_text('field_total', lang) + ` ${data.traffic.total.text}\n` +
            get_text('field_used', lang) + ` ${data.traffic.used.text}\n` +
            get_text('field_remaining_traffic', lang) + ` ${data.traffic.remaining.text}\n` +
            get_text('field_usage_percent', lang) + ` ${data.traffic.usage_percentage}\n\n` +
            get_text('expiry_details_title', lang) + "\n━━━━━━━━━━━\n" +
            get_text('field_remaining_time', lang) + ` ${data.expiry.remaining_time}\n` +
            get_text('field_expiry_date', lang) + ` ${data.expiry.expiry_date}\n` +
            get_text('field_days_left', lang) + ` ${data.expiry.days_remaining} days`;

        await sendOrEditMessage(chatId, message, messageId, null, token);
    } else {
        const errorMessage = get_text('error_check_failed', lang) + "\n\n" +
            get_text('error_prefix', lang) + ` \`${result.error}\`\n\n` +
            get_text('tip_check_config', lang);
        await sendOrEditMessage(chatId, errorMessage, messageId, null, token);
    }
}


// =========================================================================
// MAIN UPDATE HANDLERS
// =========================================================================

/**
 * Main update processing function.
 * @param {Object} env Cloudflare environment object
 */
export async function handleUpdate(update, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    if (!token) {
        console.error("Configuration Error: TELEGRAM_BOT_TOKEN is missing in env.");
        // We still return OK to Telegram to avoid retries, but we cannot process.
        return;
    }

    if (!update.message && !update.callback_query) {
        return;
    }

    const source = update.message ?? update.callback_query?.message;
    const from = update.message?.from ?? update.callback_query?.from;

    if (!source || !from) {
        return;
    }

    const chatId = source.chat.id;
    const userId = from.id;
    const username = from.username ?? '';
    const firstName = from.first_name ?? '';
    const lastName = from.last_name ?? '';
    const text = source.text ? source.text.trim() : '';
    const messageId = source.message_id ?? update.callback_query?.message?.message_id ?? null;
    let deepLink = null;

    if (update.message?.text?.startsWith('/start ')) {
        deepLink = update.message.text.split(' ')[1];
    }

    // ---------------------------------------------------------------------
    // GLOBAL BAN CHECK
    // ---------------------------------------------------------------------
    if (await isUserBanned(userId, env)) {
        if (update.message && text.length > 0) {
            await handleAccessDeniedBanned(chatId, env);
        }
        return;
    }
    // ---------------------------------------------------------------------

    // Handle callback queries
    if (update.callback_query) {
        await handleCallbackQuery(update.callback_query, env);
        return;
    }

    // Check for user state (waiting for TxID, Custom GB amount, or Admin create)
    const currentState = await getUserState(userId, env);

    if (update.message) {
        // 1. Handle TxID Submission
        if (currentState?.state === 'waiting_for_txid' && text.length > 0 && !text.startsWith('/')) {
            await handleTxidSubmission(chatId, userId, text, currentState, username, firstName, lastName, env);
            return;
        }

        // 2. Handle Custom GB Redemption Input
        if (currentState?.state === 'waiting_for_custom_gb' && text.length > 0 && !text.startsWith('/')) {
            await handleCustomGbRedemptionInput(chatId, userId, text, messageId, env);
            return;
        }

          // 3. Clear state if user sends non-command text while waiting for panel selection
        if (currentState?.state === 'waiting_for_redeem_panel' || currentState?.state === 'waiting_for_create_panel') {
            // If user sends anything other than a command or callback, cancel the flow
            if (!text.startsWith('/')) {
                await setUserState(userId, 'clear', {}, env);
                const lang = await get_user_language(chatId, env);
                await sendMessage(chatId, get_text('error_redemption_state_fail', lang), null, true, token);
                return;
            }
        }
    }

    // ---------------------------------------------------------------------
    // Handle V2Ray config directly (quick check)
    // ---------------------------------------------------------------------
    if (text.length > 0 && !text.startsWith('/')) {
        let isV2RayConfig = false;

        if (text.startsWith('vmess://') ||
            text.startsWith('vless://') ||
            text.startsWith('trojan://') ||
            text.startsWith('ss://')) {
            isV2RayConfig = true;
        }

        if (/\S+@\S+\.\S+/.test(text)) {
            isV2RayConfig = true;
        }

        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(text)) {
            isV2RayConfig = true;
        }

        if (isV2RayConfig) {
            // Need to save user before calling handleV2RayConfig to ensure language preference is available
            await saveUser(userId, username, firstName, lastName, null, null, env);
            await handleV2RayConfig(chatId, text, env);
            return;
        }

        // If it's not a recognized command or config/txid/gb amount, just acknowledge and proceed silently.
        return;
    }

    // ---------------------------------------------------------------------
    // Handle commands (checking multiple prefixes)
    // ---------------------------------------------------------------------
    const commandInfo = extractCommand(text);

    if (commandInfo) {
        const baseCommand = commandInfo.base;
        const paramString = commandInfo.params;
        const params = paramString.split(/\s+/).filter(p => p.length > 0);

        // Save user for command processing (e.g., getting language)
        await saveUser(userId, username, firstName, lastName, null, null, env);

        // Clear state only if it's not an explicit flow command like /approve
        const stateSensitiveCommands = ['approve', 'reject'];
        if (baseCommand !== 'start' && !stateSensitiveCommands.includes(baseCommand)) {
            // Clear state unless it's a dedicated state-handling input
            if (currentState?.state !== 'waiting_for_txid' && currentState?.state !== 'waiting_for_custom_gb' && currentState?.state !== 'waiting_for_create_panel' && currentState?.state !== 'waiting_for_redeem_panel') {
                await setUserState(userId, 'clear', {}, env);
            }
        } else if (baseCommand === 'start') {
            await setUserState(userId, 'clear', {}, env); // Always clear on /start
        }


        switch (baseCommand) {
            case 'start':
                await handleStart(chatId, username, firstName, lastName, messageId, false, deepLink, env);
                break;

            case 'premium':
                await handlePremium(chatId, null, false, env);
                break;

            case 'referral':
                await handleReferral(chatId, userId, null, env);
                break;

            case 'apps':
                await handleApps(chatId, null, env);
                break;

            case 'language':
                await handleLanguage(chatId, null, env);
                break;

            case 'trial':
                await handleTrial(chatId, userId, env);
                break;

            case 'mytrial':
                await handleMyTrial(chatId, userId, env);
                break;

            case 'id':
                await handleId(chatId, params, env);
                break;

            case 'check':
                const config = paramString;
                if (config) {
                    await handleV2RayConfig(chatId, config, env);
                } else {
                    const lang = await get_user_language(chatId, env);
                    await sendMessage(chatId, get_text('check_usage', lang), null, true, token);
                }
                break;

            case 'create':
                await handleCreate(chatId, params, env);
                break;

            case 'delprem':
                await handleDelPrem(chatId, params, env);
                break;

            case 'deltrial':
                const trialId = params[0];
                if (trialId) {
                    await handleDelTrial(chatId, trialId, env);
                } else {
                    const lang = await get_user_language(chatId, env);
                    await sendMessage(chatId, get_text('admin_usage', lang) + " " + get_text('cmd_deltrial', lang), null, true, token);
                }
                break;

            case 'delexp':
                const panel = params[0];
                await handleDelExp(chatId, panel, env);
                break;

            case 'request':
                await handleRequestCommand(chatId, text, username, userId, env);
                break;

            case 'reply':
                await handleReply(chatId, params, env);
                break;

            case 'stats': // Admin Only Command (Publicly accessible via menu but /stats is admin-only)
                await handleStats(chatId, messageId, false, 'menu_start', env);
                break;

            case 'online': // NEW
                await handleOnlineUsers(chatId, messageId, 1, false, env);
                break;

            case 'broadcast':
                await handleBroadcast(chatId, update, env);
                break;

            // NEW ADMIN COMMANDS
            case 'admin':
                await handleAdminMenu(chatId, messageId, env);
                break;

            case 'transfer':
                await handleTransfer(chatId, params, env);
                break;

            case 'reset':
                await handleResetTraffic(chatId, params, env);
                break;

            case 'mod':
                await handleModifyAccount(chatId, params, env);
                break;

            case 'bulk':
                await handleBulkCreate(chatId, params, env);
                break;

            case 'runwarnings':
                await handleRunWarnings(chatId, env);
                break;

            case 'optimal':
                await handleOptimalPanel(chatId, params, env);
                break;
            // END NEW ADMIN COMMANDS

            case 'approve':
                if (params.length >= 2 && !isNaN(parseInt(params[0])) && !isNaN(parseInt(params[1]))) {
                    await handleAdminApprove(chatId, parseInt(params[0]), parseInt(params[1]), null, env);
                } else {
                    const lang = await get_user_language(chatId, env);
                    await sendMessage(chatId, get_text('admin_usage_approve', lang) + "\n\nExample: `/approve 123456789 150`", null, true, token);
                }
                break;

            case 'reject':
                if (params.length >= 1 && !isNaN(parseInt(params[0]))) {
                    await handleAdminReject(chatId, parseInt(params[0]), null, env);
                } else {
                    const lang = await get_user_language(chatId, env);
                    await sendMessage(chatId, get_text('admin_usage_reject', lang) + "\n\nExample: `/reject 123456789`", null, true, token);
                }
                break;

            case 'ban':
                if (paramString) {
                    await handleBan(chatId, paramString, env);
                } else {
                    const lang = await get_user_language(chatId, env);
                    await sendMessage(chatId, get_text('admin_usage', lang) + " " + get_text('cmd_ban', lang), null, true, token);
                }
                break;

            case 'unban':
                if (paramString) {
                    await handleUnban(chatId, paramString, env);
                } else {
                    const lang = await get_user_language(chatId, env);
                    await sendMessage(chatId, get_text('admin_usage', lang) + " " + get_text('cmd_unban', lang), null, true, token);
                }
                break;

            case 'addcredit':
                await handleCreditControl(chatId, params, 'add', env);
                break;

            case 'removecredit':
                await handleCreditControl(chatId, params, 'deduct', env);
                break;

            case 'getkv':
                await handleGetKV(chatId, params[0], env);
                break;

            case 'setkv':
                const kvKey = params[0];
                // Get the rest of the string after /setkv and the key
                const kvValue = paramString.substring(kvKey.length).trim();
                await handleSetKV(chatId, kvKey, kvValue, env);
                break;

            case 'help':
                await handleHelp(chatId, env);
                break;
        }
    }
    return;
}

/**
 * Handle callback queries from inline keyboards (async).
 * @param {Object} env Cloudflare environment object
 */
export async function handleCallbackQuery(callbackQuery, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const data = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const userId = callbackQuery.from.id;
    const username = callbackQuery.from.username ?? '';
    const firstName = callbackQuery.from.first_name ?? '';
    const lastName = callbackQuery.from.last_name ?? '';

    // Save user for command processing (e.g., getting language)
    await saveUser(userId, username, firstName, lastName, null, null, env);

    await sendMessage(callbackQuery.from.id, "", null, true, token); // Dismiss loading state

    // Clear user state on callback that changes menu flow
    if (!data.startsWith('stats_') && !data.startsWith('method_select_') && !data.startsWith('premium_select_') && data !== 'redeem_custom_prompt' && !data.startsWith('online_page_') && !data.startsWith('view_my_keys_') && !data.startsWith('key_delete_') && !data.startsWith('admin_create_panel_') && !data.startsWith('redeem_panel_final_')) {
        await setUserState(userId, 'clear', {}, env);
    }

    let match;
    if (match = data.match(/^stats_users_(\d+)_(.*)$/)) {
        const page = parseInt(match[1]);
        const backCallback = match[2];
        // Publicly accessible via the menu (NO INTERMEDIATE LOADING)
        await handleRecentUsers(chatId, messageId, page, backCallback, env);
        return;
    }

    // NEW: Online User Pagination
    if (match = data.match(/^online_page_(\d+)$/)) {
        const page = parseInt(match[1]);
        // Note: isCallback is true here to prevent displaying the loading message.
        await handleOnlineUsers(chatId, messageId, page, true, env);
        return;
    }

    // NEW: User Key Pagination
    if (match = data.match(/^view_my_keys_page_(\d+)$/)) {
        const page = parseInt(match[1]);
        await handleMyRedeemedKeys(chatId, userId, messageId, page, env);
        return;
    }

    // NEW: User Key Delete Confirmation
    if (match = data.match(/^key_delete_confirm_([a-zA-Z0-9]+)_(\d+)$/)) {
        const key = match[1];
        const panel = parseInt(match[2]);
        await handleKeyDeleteConfirm(chatId, userId, messageId, key, panel, env);
        return;
    }

    // NEW: User Key Delete Finalization
    if (match = data.match(/^key_delete_final_([a-zA-Z0-9]+)_(\d+)$/)) {
        const key = match[1];
        const panel = parseInt(match[2]);
        await handleKeyDeleteFinal(chatId, userId, messageId, key, panel, env);
        return;
    }

    if (match = data.match(/^stats_summary_(.*)$/)) {
        const backCallback = match[1];

        if (backCallback === 'menu_start') {
            await handleStart(chatId, username, firstName, lastName, messageId, true, null, env);
        } else if (backCallback === 'menu_about') {
            await handleAboutMe(chatId, messageId, env);
        } else if (backCallback === 'menu_basic_stats') {
            await handleStatsMenu(chatId, messageId, env);
        } else if (backCallback === 'menu_admin') { // NEW
            if (!isAdmin(userId)) return;
            await handleAdminMenu(chatId, messageId, env);
        }
        return;
    }

    if (match = data.match(/^premium_select_(\d+)$/)) {
        const gbLimit = parseInt(match[1]);
        await handlePremiumSelect(chatId, userId, messageId, gbLimit, env);
        return;
    }

    if (match = data.match(/^method_select_(\d+)_([a-z]+)$/)) {
        const gbLimit = parseInt(match[1]);
        const methodKey = match[2];
        await handlePaymentMethodSelect(chatId, userId, messageId, gbLimit, methodKey, env);
        return;
    }

    // NEW: Admin Create Panel Select
    if (match = data.match(/^admin_create_panel_(\d+)_(\d+)_(\d+)_([a-zA-Z0-9@.-]+)$/)) {
        const panel = parseInt(match[1]);
        const gbLimit = parseInt(match[2]);
        const daysLimit = parseInt(match[3]);
        const userName = match[4];
        await handleAdminPanelSelect(chatId, messageId, panel, gbLimit, daysLimit, userName, env);
        return;
    }

    // NEW: Redeem Panel Selection Final
    if (match = data.match(/^redeem_panel_final_(\d+)_([\d\.]+)_(\d+)$/)) {
        const gbLimit = parseInt(match[1]);
        const cost = parseFloat(match[2]);
        const panel = parseInt(match[3]);
        await handleRedeemPanelSelect(chatId, userId, messageId, gbLimit, cost, panel, env);
        return;
    }


    if (match = data.match(/^admin_approve_(\d+)_(\d+)$/)) {
        const targetUserId = parseInt(match[1]);
        const gbLimit = parseInt(match[2]);
        await handleAdminApprove(chatId, targetUserId, gbLimit, messageId, env);
        return;
    }

    if (match = data.match(/^admin_reject_(\d+)$/)) {
        const targetUserId = parseInt(match[1]);
        await handleAdminReject(chatId, targetUserId, messageId, env);
        return;
    }

    switch (data) {
        case 'menu_start':
            await handleStart(chatId, username, firstName, lastName, messageId, true, null, env);
            break;
        case 'menu_main':
            await handleMainMenu(chatId, messageId, env);
            break;
        case 'menu_premium':
            await setUserState(userId, 'clear', {}, env);
            await handlePremium(chatId, messageId, true, env);
            break;
        case 'menu_premium_desc':
            await handlePremiumDescription(chatId, messageId, env);
            break;
        case 'menu_about':
            await handleAboutMe(chatId, messageId, env);
            break;
        case 'menu_policy':
            await handlePolicyTerms(chatId, messageId, env);
            break;
        case 'referral_back':
            await handleReferral(chatId, userId, messageId, env);
            break;
        case 'redeem_5gb':
            // Redirect to panel selection
            await handleRedeemSelectPanel(chatId, userId, messageId, 5, env);
            break;
        case 'redeem_10gb':
            // Redirect to panel selection
            await handleRedeemSelectPanel(chatId, userId, messageId, 10, env);
            break;
        case 'redeem_custom_prompt':
            await handleCustomRedeemPrompt(chatId, userId, messageId, env);
            break;
        case 'show_credit_history':
            await handleCreditHistory(chatId, messageId, env);
            break;
        case 'view_my_keys_page_1':
            await handleMyRedeemedKeys(chatId, userId, messageId, 1, env);
            break;
        case 'verify_channel_join':
            await handleVerifyJoin(chatId, userId, messageId, env);
            break;

        case 'menu_admin':
            if (!isAdmin(userId)) return;
            await handleAdminMenu(chatId, messageId, env);
            break;

        case 'admin_online_users':
            if (!isAdmin(userId)) return;
            await handleOnlineUsers(chatId, messageId, 1, true, env);
            break;

        case 'admin_run_warnings':
            if (!isAdmin(userId)) return;
            await handleRunWarnings(chatId, env);
            break;

        case 'admin_stats_full':
            if (!isAdmin(userId)) return;
            await handleStats(chatId, messageId, true, 'menu_admin', env);
            break;

        case 'admin_broadcast_prompt':
            if (!isAdmin(userId)) return;
            const lang = await get_user_language(chatId, env);
            await sendMessage(chatId, get_text('broadcast_usage', lang), null, true, token);
            break;

        case 'menu_stats_btn':
            await handleStatsMenu(chatId, messageId, env);
            break;
        case 'menu_server_btn':
            await handleServerInfo(chatId, messageId, env);
            break;

        case 'stats_usage_report':
            // Publicly accessible via the menu (NO INTERMEDIATE LOADING)
            await handleStats(chatId, messageId, true, 'menu_basic_stats', env);
            break;

        case 'menu_basic_stats':
            await handleStatsMenu(chatId, messageId, env);
            break;

        case 'ignore':
            break;

        case 'set_lang_' + LANG_EN:
            await handleSetLanguage(chatId, userId, LANG_EN, messageId, env);
            break;
        case 'set_lang_' + LANG_MY:
            await handleSetLanguage(chatId, userId, LANG_MY, messageId, env);
            break;

        case 'apps_ios':
            await handleAppsIos(chatId, messageId, env);
            break;
        case 'apps_android':
            await handleAppsAndroid(chatId, messageId, env);
            break;
        case 'apps_windows':
            await handleAppsWindows(chatId, messageId, env);
            break;
        case 'apps_macos':
            await handleAppsMacos(chatId, messageId, env);
            break;
        case 'apps_back':
            await handleApps(chatId, messageId, env);
            break;
    }
}
