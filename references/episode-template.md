# Episode Template and Field Rules

This template makes the agreed goal, context, method, execution, outcome, user feedback, and evidence groups explicit. The prose template is an explanatory guide; the machine contract and helper-generated template govern submitted records. Adapt them to an existing schema while retaining their meaning.

## Blank Episode

This is an unpopulated template, not a real case. Assign a stable ID, revision, domain, and authorized access scope when creating a record. Populate only supported facts. Keep incomplete records as drafts in the existing storage workflow; do not count this template as usage.

```json
{
  "identity": {
    "id": null,
    "revision": null,
    "domain": null,
    "domainConfigVersion": null,
    "parentEpisodeId": null,
    "tenantId": null,
    "accessScope": "private",
    "createdAt": null,
    "updatedAt": null
  },
  "goal": {
    "description": null,
    "successCriteria": null
  },
  "context": {
    "preActionState": null,
    "platform": null,
    "environmentVersion": null,
    "resources": null,
    "constraints": null,
    "prerequisites": null
  },
  "recommendation": {
    "methods": null,
    "content": null,
    "candidateMethods": null,
    "selectionReason": null,
    "recommendedAt": null,
    "shownAt": null
  },
  "execution": {
    "adoption": "unknown",
    "methods": null,
    "steps": null,
    "parameters": null,
    "modifications": null,
    "startedAt": null,
    "endedAt": null
  },
  "outcome": {
    "status": "unknown",
    "basis": "unavailable",
    "summary": null,
    "goalAchieved": null,
    "metrics": null,
    "observationWindow": {
      "startedAt": null,
      "endedAt": null,
      "elapsedValue": null,
      "elapsedUnit": null
    },
    "observedAt": null,
    "costs": null,
    "sideEffects": null,
    "concurrentChanges": null
  },
  "feedback": null,
  "evidence": {
    "items": null,
    "missingFields": null,
    "causalEvidence": null
  }
}
```

## Minimum Authenticity Fields

Only adoption, result basis, and explicit user evaluation are needed for the lightweight authenticity check. `outcome.basis` is system_observation / user_report / unavailable. A user report is sufficient; do not require raw quotations, screenshots, logs, feedback-event IDs, or per-field evidence links. Keep detailed evidence fields null when unavailable. The detailed structures below are optional enrichment, not a mandatory form or a prerequisite for website registration.

## Nested Values

All nested keys below are relative to their named object. Use null for unknown values, including unknown lists; use an empty list only when the collection is known to have no entries. A measured zero is 0, not null. Timestamps include a time zone.

| Field | Value structure and meaning |
|---|---|
| `goal.successCriteria` | List of `{description, metricName, operator, targetValue, unit}`. A qualitative criterion may use only description; do not invent numerical targets. |
| `context.preActionState` | Domain-specific object containing the known state before action, such as symptoms or game stage. |
| `context.resources`, `constraints`, `prerequisites` | Domain-specific objects or lists, using the domain configuration's field names and units. Unknown prerequisite satisfaction remains null. |
| `recommendation.methods`, `candidateMethods`, `execution.methods` | Lists of `{methodId, methodRevision, claimIds}`. Keep recommended, considered, and actually used methods separate. A method absent from the recommendation can still be recorded as executed. |
| `execution.steps` | Ordered list of `{action, performedAt, evidenceIds}`. Include only supported actions; inference must be labeled in evidence. |
| `execution.parameters` | Object containing actual parameter values and units where relevant. |
| `execution.modifications` | List of `{description, reason, evidenceIds}` describing deviations from the proposed method. |
| `outcome.goalAchieved` | true / false / null, evaluated against the recorded success criteria. Unknown or unresolved contradictory evidence means null. |
| `outcome.metrics` | List of `{name, beforeValue, afterValue, unit, beforeObservedAt, afterObservedAt, evidenceIds}`. Do not infer a measured change from subjective praise. |
| `outcome.observationWindow` | Start/end timestamps and elapsed duration with a unit. Capture when the outcome was observed relative to execution; do not conflate execution duration with follow-up duration. |
| `outcome.costs` | List of `{type, value, unit, description, evidenceIds}` for time, money, resource use, or other domain-specific costs. Unmeasured costs may have a description with a null value. |
| `outcome.sideEffects`, `concurrentChanges` | Lists of `{description, evidenceIds}`. Keep adverse effects and other simultaneous changes separate. |
| `evidence.items` | List of `{id, fieldPaths, kind, sourceRef, sourceAnchor, collectionMethod, collectedAt, originalText}`. `fieldPaths` links evidence to the fields it supports. |
| `evidence.items[].kind` | system_observation / user_statement / model_inference. Screenshots and logs can support observations; an interpretation that goes beyond them remains an inference. |
| `evidence.items[].sourceRef`, `sourceAnchor` | Internal source ID or actual file/URL, plus a paragraph, timestamp, or log locator where available. Never invent evidence locations. |
| `evidence.missingFields` | List of `{fieldPath, reason}` for relevant unavailable information. |
| `evidence.causalEvidence` | Description and evidence references for any causal assessment, or null. A before/after change alone does not establish causation. |

Execution adoption: `not_used` / `partial` / `full` / `unknown`.
Outcome status: `pending` / `observed` / `unknown` / `conflicting`. Use pending when awaiting an expected observation; use unknown when the outcome is unavailable. Observed is not synonymous with goal achieved.

## Explicit User Feedback

Keep the whole feedback field null until a user provides feedback. Then use this shape, leaving unanswered optional fields null:

```json
{
  "helpfulness": null,
  "reasons": null,
  "comment": null,
  "wouldReuse": null,
  "evaluatorId": null,
  "submittedAt": null,
  "scope": null
}
```

- `helpfulness`: helpful / partly_helpful / not_helpful / harmful / uncertain. Use uncertain only when the user actually expresses uncertainty; never as a substitute for no response.
- `reasons`: A list using solved_problem / saved_time / reduced_cost / avoided_mistakes / easier_decision / other, based on the user's response.
- `comment`: The user's optional explanation, actual differences, or suggested adjustments. Preserving original wording in evidence is optional.
- `wouldReuse`: true / false / null. Do not infer willingness to reuse from positive helpfulness.
- `evaluatorId`, `submittedAt`: Existing authorized evaluator identifier and actual feedback time; do not fabricate either when importing feedback.
- `scope`: usage_effect / expected_applicability / clarity. Feedback from non-users must not be counted as usage effectiveness. If adoption is unknown, establish it before including the feedback in usage-effect statistics.

Ask "Was this advice helpful to you?" with the helpfulness choices. Reasons and adjustments are optional. Ask about adoption only when it cannot be established and affects the judgment. Do not turn every stored field into a required question.

## Capture and Reuse

1. Before action, obtain the available goal, context, and recommendation from the current task and accessible evidence. Do not retrospectively infer pre-action facts from success.
2. During execution, associate available actual steps, parameters, deviations, and timestamps with the episode. Record only events the agent or connected environment can observe or that the user reports.
3. After execution, attach available outcomes, costs, and evidence; preserve pending or unknown results. Collect lightweight user feedback when useful.
4. On later feedback or corrections, retain revision history and update affected findings. Multiple methods or child decisions in one task do not create independent task outcomes.

Skill instructions alone do not provide automatic observation. A collector, agent, or host must supply the events it can access. Do not claim that an MCP connection observes all conversations or other tools automatically.

Aggregate these episodes into the conditional findings defined in [Record Structures](records.md#conditional-finding), following [Aggregation and Retrieval](aggregation-retrieval.md). Preserve cohort definitions, actual counts, missing feedback, supporting cases, and counterexamples; the episode template itself is not an aggregate finding.

After each invocation, prepare and submit its result following [SkillRouter Registration](skillrouter-registration.md). When the configured service is unavailable, retain a pending_submission record rather than claiming website delivery.
