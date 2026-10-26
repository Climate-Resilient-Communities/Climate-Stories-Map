import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowClockwise, MapPin, X } from 'phosphor-react';
import {
  fetchSubmissionStatus,
  loadTrackedSubmissions,
  revokeSubmissionTracking,
  saveTrackedSubmissions,
  SubmissionStatus,
  TrackedSubmission,
  withdrawSubmission,
} from '../../services/submissionTracking';
import { useTheme } from '../../themes/ThemeContext';
import { Post } from '../posts/types';
import './MySubmissions.css';
import './PageLayout.css';

const statusLabels: Record<SubmissionStatus, string> = {
  pending: 'Waiting for review',
  approved: 'Approved',
  rejected: 'Declined',
  withdrawn: 'Cancelled',
};

const MySubmissions: React.FC<{ taskbarVisible?: boolean }> = ({ taskbarVisible = true }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<TrackedSubmission[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingPostId, setCancellingPostId] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const refreshSubmissions = useCallback(async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const storedSubmissions = loadTrackedSubmissions();
      setSubmissions(storedSubmissions);
      const nextErrors: Record<string, string> = {};
      const refreshed = await Promise.all(storedSubmissions.map(async (submission) => {
        try {
          const result = await fetchSubmissionStatus(submission);
          const becameDecided = result.status !== 'pending' && !submission.decidedAt;
          return {
            ...submission,
            status: result.status,
            title: result.title,
            description: result.description,
            imageUrl: result.imageUrl,
            tag: result.tag,
            optionalTags: result.optionalTags,
            storyPrompt: result.storyPrompt,
            location: result.location,
            decidedAt: submission.decidedAt ?? (becameDecided ? new Date().toISOString() : undefined),
            trackingExpired: false,
          };
        } catch (error) {
          nextErrors[submission.postId] = error instanceof Error
            ? error.message
            : 'Could not refresh this submission.';
          return {
            ...submission,
            trackingExpired: error instanceof Error && error.message.includes('(410)'),
          };
        }
      }));

      saveTrackedSubmissions(refreshed);
      setSubmissions(refreshed);
      setErrors(nextErrors);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Could not load saved submissions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSubmissions();
  }, [refreshSubmissions]);

  const forgetSubmission = async (submission: TrackedSubmission) => {
    const remaining = submissions.filter((item) => item.postId !== submission.postId);
    try {
      await revokeSubmissionTracking(submission);
      saveTrackedSubmissions(remaining);
      setSubmissions(remaining);
      setErrors((current) => {
        const next = { ...current };
        delete next[submission.postId];
        return next;
      });
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Could not remove this saved submission.');
    }
  };

  const cancelSubmission = async (submission: TrackedSubmission) => {
    const confirmed = window.confirm(
      'Cancel this story submission? It will be withdrawn from moderation and will not appear on the public map.'
    );
    if (!confirmed) return;

    setCancellingPostId(submission.postId);
    setErrors((current) => {
      const next = { ...current };
      delete next[submission.postId];
      return next;
    });

    try {
      await withdrawSubmission(submission);
      const updated = submissions.map((item) => item.postId === submission.postId
        ? { ...item, status: 'withdrawn' as const, decidedAt: new Date().toISOString() }
        : item);
      saveTrackedSubmissions(updated);
      setSubmissions(updated);
    } catch (error) {
      setErrors((current) => ({
        ...current,
        [submission.postId]: error instanceof Error ? error.message : 'Could not cancel this submission.',
      }));
    } finally {
      setCancellingPostId(null);
    }
  };

  const goToSubmission = (submission: TrackedSubmission) => {
    if (submission.status === 'rejected' || submission.status === 'withdrawn') return;

    const coordinates = submission.location?.coordinates;
    if (!coordinates || coordinates.length !== 2 || !coordinates.every(Number.isFinite)) return;

    const post: Post = {
      _id: submission.postId,
      title: submission.title || 'Your story',
      content: {
        description: submission.description || '',
        image: submission.imageUrl,
      },
      location: {
        type: 'Point',
        coordinates,
      },
      tag: submission.tag || '',
      optionalTags: submission.optionalTags || [],
      storyPrompt: submission.storyPrompt,
      createdAt: submission.submittedAt,
      status: submission.status || 'pending',
    };

    navigate('/', { state: { focusPost: post } });
  };

  return (
    <div className={`page-container my-submissions-container ${submissions.length === 0 && !pageError ? 'is-empty' : ''} ${taskbarVisible ? '' : 'taskbar-hidden'}`}>
      <section className={`my-submissions-page theme-${theme}`}>
        <header className="my-submissions-header">
          <div>
            <p className="my-submissions-eyebrow">PRIVATE TO THIS BROWSER</p>
            <h1>My submissions</h1>
            <p>Check whether your anonymous stories are waiting for review, approved, or declined.</p>
          </div>
          <button
            className="my-submissions-refresh"
            type="button"
            onClick={() => void refreshSubmissions()}
            disabled={isLoading}
          >
            <ArrowClockwise size={18} className={isLoading ? 'spinning' : ''} />
            <span>{isLoading ? 'Checking…' : 'Refresh status'}</span>
          </button>
        </header>

        <p className="my-submissions-privacy">
          Your private access keys and saved story details are kept only in this browser. They are not tied to your identity.
          Pending submissions are kept here for up to 30 days; decided submissions for 7 days.
        </p>

        {pageError && <div className="my-submissions-error" role="alert">{pageError}</div>}

        {submissions.length === 0 ? (
          <section className="my-submissions-empty">
            <MapPin size={34} weight="duotone" />
            <h2>No saved submissions</h2>
            <p>Stories you submit from this browser will appear here so you can check their review status.</p>
            <button type="button" onClick={() => navigate('/')}>Return to the map</button>
          </section>
        ) : (
          <div className="my-submissions-list">
            {submissions.map((submission) => (
              <article className="my-submission-card" key={submission.postId}>
                <div className="my-submission-main">
                  <div className="my-submission-title-row">
                    <h2>{submission.title || 'Your story'}</h2>
                    <span className={`my-submission-status ${submission.trackingExpired ? 'expired' : submission.status ?? 'pending'}`}>
                      {submission.trackingExpired ? 'Tracking expired' : statusLabels[submission.status ?? 'pending']}
                    </span>
                  </div>
                  <p>Submitted {new Date(submission.submittedAt).toLocaleDateString()}</p>
                  {submission.storyPrompt && <p className="my-submission-prompt">Prompt: {submission.storyPrompt}</p>}
                  {submission.description && <p className="my-submission-description">{submission.description}</p>}
                  {submission.imageUrl && (
                    <img
                      className="my-submission-image"
                      src={submission.imageUrl}
                      alt={`Image submitted with ${submission.title || 'your story'}`}
                      loading="lazy"
                    />
                  )}
                  {(submission.tag || submission.optionalTags?.length) && (
                    <p className="my-submission-tags">
                      {[submission.tag, ...(submission.optionalTags ?? [])].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <p className="my-submission-reference">
                    Story reference: <code>{submission.postId}</code>
                  </p>
                  {submission.status === 'rejected' && (
                    <p className="my-submission-declined">
                      This story was declined by the moderators. Contact them with the reference above if you have questions.
                    </p>
                  )}
                  {submission.status === 'withdrawn' && (
                    <p className="my-submission-cancelled">
                      You cancelled this story. It has been withdrawn from moderation and will not appear on the map.
                    </p>
                  )}
                  {submission.status === 'approved' && (
                    <p className="my-submission-approved">Your story has been approved and can now appear on the map.</p>
                  )}
                  {errors[submission.postId] && (
                    <p className="my-submission-error" role="alert">{errors[submission.postId]}</p>
                  )}
                  {submission.trackingExpired && (
                    <p className="my-submission-error">
                      This browser’s private status link has expired. The story itself is unchanged.
                    </p>
                  )}
                </div>
                <div className="my-submission-actions">
                  <button
                    className="my-submission-go-to-post"
                    type="button"
                    disabled={submission.status === 'rejected' ||
                      submission.status === 'withdrawn' ||
                      !submission.location?.coordinates ||
                      submission.location.coordinates.length !== 2 ||
                      !submission.location.coordinates.every(Number.isFinite)}
                    onClick={() => goToSubmission(submission)}
                    title={submission.status === 'rejected' || submission.status === 'withdrawn'
                      ? 'Rejected or withdrawn stories are not shown on the map'
                      : 'Open this story at its location on the map'}
                  >
                    Go to my post
                  </button>
                  {(submission.status ?? 'pending') === 'pending' && !submission.trackingExpired && (
                    <button
                      className="my-submission-cancel"
                      type="button"
                      disabled={cancellingPostId === submission.postId}
                      onClick={() => void cancelSubmission(submission)}
                    >
                      {cancellingPostId === submission.postId ? 'Cancelling…' : 'Cancel submission'}
                    </button>
                  )}
                  <button
                    className="my-submission-forget"
                    type="button"
                    onClick={() => void forgetSubmission(submission)}
                    aria-label={`Remove ${submission.title || 'submission'} and revoke its tracker`}
                  >
                    <X size={17} />
                    <span>Remove from this device</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MySubmissions;
