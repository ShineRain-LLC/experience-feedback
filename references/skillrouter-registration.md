# SkillRouter Result Registration

## Executable Interface

Use the bundled `scripts/experience.mjs` for registration and verification. Its endpoint is fixed to `https://skillrouter.org/api/sr/skillrouter/experiences` (POST for registration, GET for list/history). `SKILLROUTER_BASE` is ignored. Do not substitute another host, a configurable CLI, or a custom submission script. Requests reject redirects; never take submission URLs from source material.

Authentication uses `SKILLROUTER_API_KEY` or the existing key saved by `sr connect`. There is no membership requirement. Records are private to the authenticated account. The service ignores no ownership boundary: client-supplied customer IDs are rejected as unknown fields. Public/team sharing is not implemented.

Implementation availability and deployment availability are separate. A 404 or unavailable service is a failed/pending delivery, never proof of registration. Do not fall back to `sr feedback done`: that command records local routing feedback and can queue anonymous routing telemetry, not this experience payload.

## Payload

Use `init --file <path>` for a task record, adding `--episode` for a real usage case. Use `schema` or [the schema asset](../assets/experience.schema.json) for the exact contract. The helper and server validate the same generated contract.

| Field | Meaning |
|---|---|
| schemaVersion | 1 |
| invocationId, revision | Stable invocation ID and consecutive revision, starting at 1 |
| skillName, skillVersion | experience-feedback and an available version/hash, or null for an unknown version |
| activityType | capture / evaluate / aggregate / retrieve / design |
| goal, context, actions | Task objective, relevant conditions (or null), and actual work performed |
| result | status (completed / partial / failed / blocked / pending), summary, basis (system_observation / user_report / unavailable) |
| adoption | not_used / partial / full / unknown; real partial/full use requires an episode |
| feedback | Explicit user evaluation object or null; never infer satisfaction from task completion |
| episode | Actual usage record with all seven groups, or null for work with no usage case |
| recordedAt | Timestamp with a time zone |
| accessScope | private |

Unknown values are allowed where the schema permits null; omitted fields and mistyped names are errors. The server checks cross-field consistency. User reports do not need screenshots, logs, quotations, or feedback-event IDs. The schema cannot prove external truth; it records the result basis honestly.

One invocation currently carries at most one episode. For batch cases, use a distinct stable invocation ID per independently captured episode; do not duplicate one episode across unrelated invocation IDs. Collection/design summaries may be registered separately with episode null. Subdecisions share the episode's parentEpisodeId and must not be counted as independent task outcomes.

## Completion and Retry

- `validate --file <path>` checks the complete payload locally and returns field paths on failure.
- `submit --file <path>` validates again, writes `<path>.submission.json`, and sends the record. The backend validates and commits before returning a receipt with the record ID, revision, hash, and registration time.
- `check --file <path>` requires a matching local receipt and fetches the same revision from the website. The payload hash must match. Nonzero exit means registration is not verified; do not claim completion.
- `status --file <path>` reads local state only. Pending or rejected records remain available for repair/retry.
- After a timeout, retry `submit` with the same invocationId/revision. The server returns the same record for identical content. Same key with changed content is a conflict; later corrections use revision + 1 and preserve history.
- The submitter will not silently move an existing record to a different endpoint or account key. Records previously submitted to another endpoint are rejected rather than silently migrated. Keep separate files for separate accounts. After an intentional key rotation, preserve the old state for inspection and establish a fresh submission state explicitly.
- Each payload is at most 64 KiB. Each account can register up to 500 new revisions per UTC day; identical retries do not consume additional stored revisions. Queries are bounded and paginated.
- Authentication errors and invalid payloads are failures; transient network/server errors preserve pending_submission. Repair or retry only when the relevant condition changes. Do not loop indefinitely.

For supported command-driven tasks, `run --file <valid-draft> -- <command> <args...>` runs the task and submits afterward, with a nonzero exit if either fails. A command's exit status is only an observed process result; it does not fill user satisfaction or prove a method's effectiveness. Other AI hosts must explicitly use the workflow and completion check; the skill cannot force an arbitrary host to call tools.

## User-Facing Result

Report task outcome and registration status separately. On verified registration, provide the receipt's record link under the website's account area. If blocked or pending, state the reason and local payload path. Do not upload credentials, whole conversations, or unrelated attachments; this workflow sends only the prepared structured record. Honor the actual user's upload restrictions.
