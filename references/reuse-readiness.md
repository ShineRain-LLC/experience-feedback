# From Saved Feedback to Reusable Experience

Read this when recording or enriching an actual usage episode, and when deciding whether a retrieved episode can support advice. Saving a sincere evaluation is useful, but a successful receipt does not establish that another person can act on the record.

## Review the Decision, Not Just the Form

Review all five areas below. Fill existing episode fields from supporting sources; a nonempty string or a generic "satisfied" does not establish completeness.

| Area | What another user needs | Existing fields |
|---|---|---|
| Need and conditions | Original goal and the conditions that would change the decision: budget/resources, environment/version, prerequisites or constraints as relevant | `goal`, `context` |
| Selection | What was selected or attempted and the original reason; alternatives only if actually considered | `recommendation`, `execution.parameters` |
| Actual use | What the user actually did with it, in which relevant setup, and any deviations from the plan | `execution` |
| Concrete result | What happened on that task; specific benefits, failures or user-reported experience, with an observation window appropriate to the claim | `outcome`, `feedback` |
| Boundaries and costs | Which conditions the observation covers, known costs/tradeoffs, and what remains untested | `context`, `outcome.costs`, `outcome.sideEffects`, `evidence` |

Use the minimum detail needed for a specific decision. Numerical measurements are not mandatory: "my two-hour call finished without the previously reported disconnect" is a concrete user-reported outcome. Purchase date is not use duration, listed specifications are not measured performance, and an intended workload is not an executed workload. Preserve failures and negative cases as useful evidence too.

## Resolve Every Area

Create a small local companion `<record>.readiness.json` for each episode revision reviewed. Use this structure for the agent's assessment; it is not part of the API contract:

```json
{
  "invocationId": "same-as-record",
  "revision": 1,
  "assessment": "needs_detail",
  "decisionScope": "The specific decision this case might inform",
  "areas": {
    "need_and_conditions": {"status": "not_checked", "summary": null, "evidenceIds": [], "gap": "Relevant history has not been checked"},
    "selection": {"status": "not_checked", "summary": null, "evidenceIds": [], "gap": "Selection history has not been checked"},
    "actual_use": {"status": "not_checked", "summary": null, "evidenceIds": [], "gap": "Actual tasks have not been established"},
    "concrete_result": {"status": "not_checked", "summary": null, "evidenceIds": [], "gap": "Specific result has not been established"},
    "boundaries_and_costs": {"status": "not_checked", "summary": null, "evidenceIds": [], "gap": "Applicability boundaries have not been reviewed"}
  },
  "nextQuestions": []
}
```

Replace the initial states as you work:

- `found`: sufficient supported facts for this area and decision scope; record concise facts and evidence IDs. Partial knowledge with a decision-critical gap does not qualify.
- `needs_user`: relevant accessible records have been checked but a material fact needs the user's answer. Record what was checked and one focused question, without exposing private history metadata.
- `not_observed`: an outcome or duration has not yet been observed. State what is pending; do not request the user to invent an answer.
- `unavailable`: needed sources cannot be accessed. Distinguish this from searching and finding no match; explain the limitation.
- `not_applicable`: explain why the area is irrelevant to this narrowly stated decision. Missing information is not a reason for this status.
- `not_checked`: work remains. Do not silently relabel this as unknown or claim enrichment is finished; if the user stops the task, report it as unfinished.

Keep the companion free of credentials and unrelated personal data. References must point to concise, permitted evidence summaries. Put facts in the episode's existing fields and preserve decision-relevant unresolved items in `episode.evidence.missingFields` (for example, an array of `{area, status, gap}` entries). Preserve pre-existing gaps and evidence. Do not upload the companion as a new top-level payload property or invent API enums. The record must retain the useful facts and limitations even when this local companion is absent.

## Recover, Ask, and Stop

1. Recover original needs, constraints, alternatives and rationale from accessible history. Do not stop at identifying the product. Keep original rationale separate from later explanations of satisfaction.
2. Recover actual use and outcomes from execution records and explicit user statements. Do not rewrite the original goal to match the eventual result.
3. Ask one concise question or at most a small pair about remaining decision-critical gaps. For a product: "What have you actually used it for, and what specifically worked well or poorly?" Use questions suited to the case, not a compulsory long questionnaire. Do not ask the user to repeat facts already found.
4. If the user declines, cannot remember, or does not answer, preserve the known feedback as `needs_detail` and stop asking. An absent answer is not evidence or consent. "Only record this; no questions" still permits saving, with gaps stated.
5. New answers enrich the same episode through a new revision. Do not count another independent usage sample or silently rewrite an already submitted/pending version.

## Decide Readiness

- `needs_detail`: identity or relevance is unresolved; a material area is unsearched, unavailable, unanswered or unobserved; or the record offers only a general evaluation such as "satisfied". Save it as feedback, not as a recommendation-ready case.
- `usable_with_limits`: the record supports an explicit, narrow decision with traceable need/conditions, identified method or product, actual use, and a concrete result. Selection rationale and costs must be covered when material to that decision. Remaining unknowns are named and do not undermine that scope. Explain what the case supports and what it cannot establish.

Do not compute readiness from the percentage of filled fields. Do not invent comparisons, benchmarks, drawbacks, or a universal minimum use duration. A short observation may support a short-term claim while leaving long-term reliability unknown. An unknown material platform/version prevents compatibility advice. A detailed failure can be usable; an untested proposal remains a claim rather than an episode.

These are agent judgments, not server certification or existing website status labels. `validate`, `submit`, and `check` currently enforce structure, consistency, and persistence only. Do not change `result.status` or claim a new server gate to represent readiness. State whether the requested work was merely saving feedback or enriching it; enrichment that leaves essential work undone is partial even if registration succeeded.

## Retrieval and User-Facing Output

Reassess the stored facts for the new user's decision; do not trust a companion label without reading the case. A `needs_detail` record can supply a lead, or a clearly labeled subjective-feedback count with an honest denominator, but cannot substantiate effectiveness or a purchase recommendation. Do not silently discard these records from counts or treat missing detail as failure.

For `usable_with_limits`, summarize the conditions, actual action, concrete result, basis, costs and unknowns. Reusability never makes private records public; apply existing account permissions first.

For the bare purchase-feedback example, the correct report is: "Feedback saved; needs detail. The product and current satisfaction are known. Actual workloads and the reasons for satisfaction are not established, so this does not yet support a recommendation for another buyer." Ask only the missing material questions after searching history.
