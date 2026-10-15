# Validation Scenarios

Select relevant checks for the actual request; running the full suite every time is not required. Skill-file validation establishes only that the structure can be loaded, not that product implementation or user outcomes have passed validation.

## Recording and Reasoning Boundaries

| Input | Expected behavior |
|---|---|
| A guide says "this mechanic is powerful," with no actual execution record | Save a claim; applicability may be inferred; keep the episode count at 0 |
| Characters or tools share a name but have different platforms/software versions | Keep environments separate; do not merge based on name similarity |
| A user says "it works well," with no timing or outcome logs | Record subjective helpfulness; objective improvement remains unknown; do not invent percentages |
| A user did not adopt the advice, but the task ultimately succeeded | Preserve non-adoption and the outcome; do not attribute success to the recommended method |
| An author claims 100 tests without providing details, and 9 other articles republish the claim | Preserve the source report and republication relationships; do not generate 100 or 1,000 episodes |
| Multiple recommendations within one task produce one final outcome | Keep multiple decision records; deduplicate task outcomes according to the declared counting unit |
| Across 10 uses, 2 people provide feedback and both report success | Report 2/2 positive feedback and 2/10 feedback coverage; do not claim 100% effectiveness for all users |
| A new record claims an old issue has been fixed, but the platform is unknown | Save the fix claim and a relationship pending verification; do not invalidate findings for other platforms |
| A user finds the method helpful, but objective results do not improve | Preserve both; do not rewrite either the user's perception or the objective result |

## Historical Feedback Linking

- "The desktop I bought earlier is satisfying": search accessible relevant sessions/records before asking for its model; preserve product satisfaction without inferring advice helpfulness or benchmarks.
- History contains only a recommendation: do not describe purchase as independently verified; current reported use remains a user report.
- Two similar purchases appear: compare date/configuration/identifiers; ask a distinguishing question if still ambiguous instead of choosing the first match.
- History is inaccessible or has no matching record: distinguish the two conditions, preserve known feedback, and do not require an order or screenshot to make it valid.
- The user explicitly says not to search: do not retrieve historical sessions; work with supplied information and state the remaining uncertainty.
- New feedback concerns an existing episode: add a revision without counting another independent use; preserve earlier observations and any unresolved conflict.
- Retrieved history includes addresses, credentials, or unrelated conversations: retain only necessary permitted facts, not the full source or host-private metadata.

## Retrieval and Aggregation

Build a query set covering similar successful cases, incompatible conditions, failed counterexamples, old-version revisions, and missing fields. Check whether retrieval filters hard incompatibilities, explains unknowns, returns counterexamples, and traces summaries to raw evidence.

Cover at least two distinct field sets: games and software troubleshooting. Verify shared record relationships without forcing a shared outcome scale. Mark all synthetic cases as synthetic and exclude them from real feedback or effectiveness statistics.

Evaluate actual effectiveness with temporal separation or held-out cases. Cases used to generate summaries must not also be the only test set. Report subjective helpfulness, task outcomes, costs, and adverse effects separately; keep long-term outcomes pending until their observation window is reached.

Describe each stage separately: design completed / files loadable / record checks passed / retrieval load tests completed / real user improvement. Do not infer one stage from another.

## Lightweight Reporting and Website Registration

- A user says "I used it and it worked" without attachments: retain user-reported adoption and outcome; do not require evidence uploads.
- No explicit user evaluation: feedback remains null even if a tool succeeded.
- A supported registration endpoint acknowledges a record: retain the server acknowledgment and mark registered.
- The endpoint is not configured, unavailable, or rejects the request: preserve the payload and pending/failed status; do not claim website registration.
- A local `sr feedback done` acknowledgment or anonymous routing event: do not treat it as an experience-registration acknowledgment.
- A design-only invocation: register the work result with no fabricated real-world episode.
- Repeated submission of the same invocation revision: the service must return the same record rather than count another usage sample.
