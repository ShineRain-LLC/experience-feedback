# Record Structures

These are logical structures to adapt to an existing database; they do not require a new system for every task. Use stable IDs plus revision numbers, timestamps with time zones, and null for unknown values. Zero means a measured zero only. Keep a draft when necessary information is missing; do not invent facts to complete it.

## Domain Configuration

Declare the domain, goal types, key context fields, environment/method compatibility conditions, outcome metrics and units, observation period, and important costs or adverse effects for the current task. Maintain a configuration version for each domain.

Record relationships are shared; success criteria must not be forced into a single cross-domain standard. For example, games record stage, health, and patch, while troubleshooting records system, version, and symptoms; their outcomes are placement and issue resolution, respectively. Cross-domain similarities can only produce analogies awaiting validation.

## Claim

- id, revision, domain, methodId / methodRevision (if known).
- statement: One debatable claim; goal, conditions, suggestedAction, expectedBenefit, exclusions.
- provenance: Source ID, author (nullable), link or local evidence, paragraph anchor/video timestamp, collection time, original publication date (nullable).
- scope: Platform, environment version, and validity period, each with its supporting evidence and degree of certainty. When a source provides only a relative date, retain the original value; do not invent a publication date.
- origin: external_claim / user_proposal / mechanism_inference.
- state: draft / disputed / superseded / withdrawn; record revision reasons and related IDs.

When only a video title, tags, or comments are available, record a lead. Do not claim to have reviewed the full test before checking the transcript/visual content. Record an author's "tested and effective" statement as an author report; without case details, do not convert it into N successes verified by us.

## Episode

The seven core field groups are listed in [SKILL.md](../SKILL.md#core-episode-fields). Use the [complete episode template](episode-template.md) for concrete field names, value types, collection sources, and missing-value rules. Adapt these names to an existing schema with an explicit mapping.

| Field | Contents |
|---|---|
| identity | id, revision, domain configuration version, access scope, related claim/method versions |
| goal | Intended outcome and success criteria agreed before action |
| context | Pre-action state, environment/version, resources, constraints, key prerequisites |
| recommendation | Recommendation, candidate methods, time; selection rationale only if originally recorded |
| execution | Actual actions/steps/parameters, modifications, start/end times, degree of adoption |
| outcome | Outcome status, basis (system_observation / user_report / unavailable), before/after metrics and units, observation window, costs, side effects, other concurrent changes |
| feedback | Explicit user evaluation and reasons, willingness to reuse if available, evaluator and feedback time |
| evidence | Optional raw record references and collection details, distinction between facts/self-reports/inferences, missing information |

Execution status: not_used / partial / full / unknown.
Outcome status: pending / observed / unknown / conflicting; observed does not automatically mean successful.
Helpfulness: helpful / partly_helpful / not_helpful / harmful / uncertain. Set feedback to null when no feedback was given; do not automatically convert it to uncertain.

One match/task is one parent episode. Multiple decisions within it may have child records sharing a parentEpisodeId. State whether aggregation counts tasks, decisions, or users; do not count multiple recommendations within one task as independent successes.

Use existing system identifiers and access controls for evaluator/tenant fields. Do not aggregate across tenants by default. Cross-user aggregation requires an allowed usage scope; present results without identities.

## Lightweight Authenticity

Record actual adoption, `outcome.basis` (system_observation / user_report / unavailable), and the user's explicit helpfulness response. Accept user-reported execution and results without attachments. Original quotes, logs, screenshots, and feedback-event IDs are optional; missing attachments do not invalidate a user report. Do not infer adoption from a recommendation or fabricate helpfulness. Record both sources in optional detail when system observations and user reports conflict; do not silently resolve the conflict.

## Historical Context and Evidence

Apply the history workflow in [SKILL.md](../SKILL.md#recover-context-before-asking) before requesting details about a prior event. Use existing `evidence.items` and `evidence.missingFields` for permitted source references, the facts each source supports, unresolved identity, and missing context; do not invent new payload fields. Keep host-private history identifiers internal. Clearly separate a retrieved user statement, an observed tool result, an assistant suggestion, and a model inference.

For example, "the desktop I bought earlier is quite satisfying so far" supports user-reported use and current product satisfaction. Locate the earlier purchase when accessible and match the specific machine before linking. An order confirmation can corroborate purchase; a shopping recommendation cannot. Neither establishes measured performance, long-term reliability, or that the buying advice was helpful. Preserve the comment and its product scope; leave `feedback.helpfulness` null where allowed unless helpfulness was actually expressed. Unknown use duration, reasons, and willingness to buy again remain unknown. If the object cannot be identified, save the known report without a guessed association.

Later feedback about the same use updates the existing episode with a new revision and observation time, retaining the earlier evaluation. A changed evaluation over time is not automatically a contradiction or a second independent case.

## User Feedback Entry

Main question: "Was this advice helpful to you?" Use the helpfulness options.
Optional reasons: "Solved the problem, saved time, reduced cost, avoided mistakes, made the decision easier, other."
Optional detail: "What was different in practice, and which conditions need adjusting?"
Automatically link environment, version, execution, and outcome information wherever possible, and allow user corrections. When adoption cannot be established, ask whether the method was used. Label non-users' opinions as feedback on expected applicability/clarity, not evidence of usage effectiveness.

## Conditional Finding

- id, revision, domain, goal, applicability conditions, exclusions, method and environment versions.
- conclusion, expected benefits, costs, uncertainty, and counterexamples.
- cohortDefinition, cutoffTime, counting unit, explicit member episode IDs or a reproducible query with a data snapshot.
- totalUses, feedbackCount, counts for each feedback category, measured-outcome count, unknown/missing counts, independent user count when available.
- Metric distributions and calculation rules; evidenceIds, supportingEpisodes, opposingEpisodes.
- validFrom/validTo (nullable), lastEvaluatedAt, supersedes/disputedBy, version of the finding-generation method.

A finding may be "Current evidence is insufficient to recommend this method." Do not automatically generate uncalibrated confidence percentages.

## Facts and Inferences: Fictional Format Example

User: "Connections on this version were always slow. I enabled connection reuse and it feels faster, but I didn't time it."
Record: goal = reduce waiting; execution = user reports adoption; subjective evaluation = helpful; objective latency improvement = null; evidence = the user's exact words; causal evidence = none.
Do not write "latency dropped by 80%" or "testing proved the fix worked."

## Website Registration

Register every invocation outcome according to [SkillRouter Registration](skillrouter-registration.md). Keep invocation records distinct from real-world episodes; design or collection work does not create usage samples.
