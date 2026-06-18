import admin from "firebase-admin"
import { getMessaging } from "firebase-admin/messaging"
import serviceAccount from "../../natureslap-service-account.json" with {type: "json"}

const app = admin.initializeApp({
    credential : admin.cert(serviceAccount)
})

const FCM_BATCH_SIZE = 500; // hard limit per sendEachForMulticast call

function chunk(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export const sendPushNotifications = async (token, title, body, data = {}) => {
  // accepts a single token string OR an array of tokens — same code path either way
  const tokens = [...new Set(Array.isArray(token) ? token : [token])].filter(Boolean);

  if (tokens.length === 0) {
    return { successCount: 0, failureCount: 0, invalidTokens: [] };
  }

  // FCM requires every data value to be a string
  const stringData = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, String(value)])
  );

  const messagePayload = {
    notification: { title, body },
    data: stringData,
    android: { priority: 'high', notification: { sound: 'default' } },
    apns: { payload: { aps: { sound: 'default' } } },
  };

  const messaging = getMessaging(app);
  const batches = chunk(tokens, FCM_BATCH_SIZE);

  const batchResults = await Promise.allSettled(
    batches.map((batchTokens) =>
      messaging.sendEachForMulticast({ tokens: batchTokens, ...messagePayload })
    )
  );

  let successCount = 0;
  let failureCount = 0;
  const invalidTokens = [];

  batchResults.forEach((result, batchIndex) => {
    if (result.status === 'rejected') {
      console.error('Batch failed entirely:', result.reason);
      failureCount += batches[batchIndex].length;
      return;
    }

    const response = result.value;
    successCount += response.successCount;
    failureCount += response.failureCount;

    response.responses.forEach((r, i) => {
      if (!r.success) {
        const failedToken = batches[batchIndex][i];
        const code = r.error?.code;
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          invalidTokens.push(failedToken);
        } else {
          console.error('Push failed for', failedToken, code);
        }
      }
    });
  });

  return { successCount, failureCount, invalidTokens };
};