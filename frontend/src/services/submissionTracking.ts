import { POST_API_URL } from './postService';

const STORAGE_KEY = 'climateStories.mySubmissions.v1';
export const SUBMISSIONS_CHANGED_EVENT = 'climate-stories:submissions-changed';
const PENDING_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const DECIDED_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

export interface TrackedSubmission {
  postId: string;
  accessToken: string;
  submittedAt: string;
  status?: SubmissionStatus;
  title?: string;
  description?: string;
  imageUrl?: string;
  tag?: string;
  optionalTags?: string[];
  storyPrompt?: string;
  location?: {
    coordinates: [number, number];
  };
  decidedAt?: string;
  trackingExpired?: boolean;
}

export interface SubmissionStatusResponse {
  postId: string;
  title: string;
  description: string;
  imageUrl?: string;
  tag?: string;
  optionalTags: string[];
  storyPrompt?: string;
  location?: {
    coordinates: [number, number];
  };
  status: SubmissionStatus;
  createdAt: string | null;
}

const isTrackedSubmission = (value: unknown): value is TrackedSubmission => {
  if (!value || typeof value !== 'object') return false;

  const submission = value as Partial<TrackedSubmission>;
  return typeof submission.postId === 'string' &&
    typeof submission.accessToken === 'string' &&
    typeof submission.submittedAt === 'string' &&
    (submission.status === undefined ||
      submission.status === 'pending' ||
      submission.status === 'approved' ||
      submission.status === 'rejected' ||
      submission.status === 'withdrawn') &&
    (submission.trackingExpired === undefined || typeof submission.trackingExpired === 'boolean');
};

const removeExpiredSubmissions = (submissions: TrackedSubmission[]) => {
  const now = Date.now();
  return submissions.filter((submission) => {
    const retentionStart = submission.decidedAt ?? submission.submittedAt;
    const retention = submission.decidedAt ? DECIDED_RETENTION_MS : PENDING_RETENTION_MS;
    const timestamp = Date.parse(retentionStart);
    return Number.isFinite(timestamp) && now - timestamp < retention;
  });
};

export const loadTrackedSubmissions = (): TrackedSubmission[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(stored);
  } catch {
    throw new Error('Saved submission tracking data is unreadable. Clear browser site data to reset it.');
  }

  if (!Array.isArray(parsed) || !parsed.every(isTrackedSubmission)) {
    throw new Error('Saved submission tracking data is invalid. Clear browser site data to reset it.');
  }

  const retained = removeExpiredSubmissions(parsed);
  if (retained.length !== parsed.length) {
    saveTrackedSubmissions(retained);
  }
  return retained;
};

export const saveTrackedSubmissions = (submissions: TrackedSubmission[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(removeExpiredSubmissions(submissions)));
  window.dispatchEvent(new Event(SUBMISSIONS_CHANGED_EVENT));
};

export const trackSubmission = (postId: string, accessToken: string) => {
  const submissions = loadTrackedSubmissions().filter((submission) => submission.postId !== postId);
  submissions.unshift({
    postId,
    accessToken,
    submittedAt: new Date().toISOString(),
    status: 'pending',
  });
  saveTrackedSubmissions(submissions);
};

export const fetchSubmissionStatus = async (
  submission: TrackedSubmission
): Promise<SubmissionStatusResponse> => {
  const response = await fetch(`${POST_API_URL}/${encodeURIComponent(submission.postId)}/submission`, {
    headers: {
      Authorization: `Bearer ${submission.accessToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(`${payload?.error || 'Could not refresh submission status'} (${response.status}).`);
  }

  const payload = await response.json() as Partial<SubmissionStatusResponse>;
  if (
    payload.postId !== submission.postId ||
    typeof payload.title !== 'string' ||
    typeof payload.description !== 'string' ||
    (payload.status !== 'pending' &&
      payload.status !== 'approved' &&
      payload.status !== 'rejected' &&
      payload.status !== 'withdrawn')
  ) {
    throw new Error('The server returned an invalid submission status.');
  }

  if (payload.createdAt !== null && typeof payload.createdAt !== 'string') {
    throw new Error('The server returned an invalid submission date.');
  }

  return {
    postId: payload.postId,
    title: payload.title,
    description: payload.description,
    imageUrl: payload.imageUrl,
    tag: payload.tag,
    optionalTags: Array.isArray(payload.optionalTags) ? payload.optionalTags : [],
    storyPrompt: payload.storyPrompt,
    location: payload.location,
    status: payload.status,
    createdAt: payload.createdAt,
  };
};

export const revokeSubmissionTracking = async (submission: TrackedSubmission) => {
  const response = await fetch(`${POST_API_URL}/${encodeURIComponent(submission.postId)}/submission`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${submission.accessToken}`,
    },
  });

  if (!response.ok && response.status !== 404 && response.status !== 410) {
    throw new Error(`Could not revoke submission tracking (${response.status}).`);
  }
};

export const withdrawSubmission = async (submission: TrackedSubmission) => {
  const response = await fetch(`${POST_API_URL}/${encodeURIComponent(submission.postId)}/submission`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${submission.accessToken}`,
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error || `Could not cancel submission (${response.status}).`);
  }
};

export const loadMapSubmissions = async (): Promise<import('../components/posts/types').Post[]> => {
  const submissions = loadTrackedSubmissions();
  const results = await Promise.all(submissions.map(async (submission) => {
    try {
      const status = await fetchSubmissionStatus(submission);
      if (
        (status.status !== 'pending' && status.status !== 'approved') ||
        !status.location ||
        !Array.isArray(status.location.coordinates) ||
        status.location.coordinates.length !== 2 ||
        !status.location.coordinates.every(Number.isFinite)
      ) {
        return null;
      }

      return {
        _id: status.postId,
        title: status.title,
        content: {
          description: status.description,
          image: status.imageUrl,
        },
        location: {
          type: 'Point' as const,
          coordinates: status.location.coordinates,
        },
        tag: status.tag ?? '',
        optionalTags: status.optionalTags,
        storyPrompt: status.storyPrompt,
        createdAt: status.createdAt ?? submission.submittedAt,
        status: status.status,
      };
    } catch (error) {
      console.error(`Could not load saved story ${submission.postId} on the map:`, error);
      return null;
    }
  }));

  return results.filter((post): post is NonNullable<typeof post> => post !== null);
};
