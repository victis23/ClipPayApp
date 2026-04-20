import { onSchedule } from 'firebase-functions/v2/scheduler'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../utils/admin'
import { logger } from '../utils/logger'
import {
  extractTikTokVideoId,
  extractInstagramMediaId,
  extractYouTubeVideoId,
  extractXTweetId,
} from '../utils/urlParsers'

// TODO: TikTok — https://open.tiktokapis.com/v2/video/query/
// Fields needed: id, view_count | Auth: Bearer {access_token}
async function fetchTikTokViews(_videoId: string, _accessToken: string): Promise<number> {
  // STUB: replace with real TikTok API call
  return Math.floor(Math.random() * 50000) + 1000
}

// TODO: Instagram — https://graph.instagram.com/{media_id}?fields=video_view_count
// Auth: access_token query param
async function fetchInstagramViews(_mediaId: string, _accessToken: string): Promise<number> {
  // STUB
  return Math.floor(Math.random() * 50000) + 1000
}

// TODO: YouTube — https://www.googleapis.com/youtube/v3/videos?part=statistics&id={videoId}
// Auth: Bearer {access_token}
async function fetchYouTubeViews(_videoId: string, _accessToken: string): Promise<number> {
  // STUB
  return Math.floor(Math.random() * 50000) + 1000
}

// TODO: X (Twitter) — https://api.twitter.com/2/tweets/{id}?tweet.fields=public_metrics
// Auth: Bearer {access_token}
async function fetchXViews(_tweetId: string, _accessToken: string): Promise<number> {
  // STUB
  return Math.floor(Math.random() * 50000) + 1000
}

export const pollViews = onSchedule('every 6 hours', async () => {
  const clipsSnap = await db
    .collection('clips')
    .where('status', 'in', ['pending', 'verified'])
    .get()

  logger.info(`pollViews: processing ${clipsSnap.size} clips`)

  const promises = clipsSnap.docs.map(async (clipDoc) => {
    const clip        = clipDoc.data()
    const clipId      = clipDoc.id
    const clipperId   = clip['clipperId'] as string
    const platform    = clip['platform']  as string
    const clipUrl     = clip['clipUrl']   as string
    const prevViews   = clip['views']     as number ?? 0

    let newViews = prevViews
    let success  = true
    let errorMsg: string | undefined

    try {
      // Look up social account for access token
      const accountId  = `${clipperId}_${platform}`
      const accountSnap = await db.collection('socialAccounts').doc(accountId).get()
      const account    = accountSnap.data()

      let accessToken: string | undefined = account?.['accessToken'] as string | undefined

      // Refresh if expiring within 1 hour
      if (account?.['expiresAt']) {
        const expiresAt = account['expiresAt'].toDate() as Date
        const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000)
        if (expiresAt < oneHourFromNow) {
          // TODO: implement token refresh per platform
          logger.warn('Token expiring soon, refresh not yet implemented', { clipperId, platform })
        }
      }

      if (platform === 'tiktok') {
        const videoId = extractTikTokVideoId(clipUrl)
        newViews = videoId ? await fetchTikTokViews(videoId, accessToken ?? '') : prevViews + Math.floor(Math.random() * 5000)
      } else if (platform === 'instagram') {
        const mediaId = extractInstagramMediaId(clipUrl)
        newViews = mediaId ? await fetchInstagramViews(mediaId, accessToken ?? '') : prevViews + Math.floor(Math.random() * 5000)
      } else if (platform === 'youtube') {
        const videoId = extractYouTubeVideoId(clipUrl)
        newViews = videoId ? await fetchYouTubeViews(videoId, accessToken ?? '') : prevViews + Math.floor(Math.random() * 5000)
      } else if (platform === 'x') {
        const tweetId = extractXTweetId(clipUrl)
        newViews = tweetId ? await fetchXViews(tweetId, accessToken ?? '') : prevViews + Math.floor(Math.random() * 5000)
      }
    } catch (err) {
      success  = false
      errorMsg = err instanceof Error ? err.message : String(err)
      logger.error('Failed to fetch views', { clipId, platform, error: errorMsg })
    }

    if (newViews > prevViews) {
      await db.collection('clips').doc(clipId).update({
        views:     newViews,
        updatedAt: FieldValue.serverTimestamp(),
      })
    }

    // Write poll log
    await db.collection('viewPollLogs').add({
      clipId,
      platform,
      previousViews: prevViews,
      newViews,
      delta:     newViews - prevViews,
      polledAt:  FieldValue.serverTimestamp(),
      success,
      ...(errorMsg ? { error: errorMsg } : {}),
    })
  })

  await Promise.allSettled(promises)
  logger.info('pollViews: complete')
})
