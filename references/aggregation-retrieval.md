# Aggregation and Retrieval

## Produce Conditional Findings

Fix the goal, compatibility scope, method version, counting unit, and observation window before selecting cases. Group contexts using pre-action information. Use outcomes and feedback only for evaluation, not to retroactively construct groups that manufacture favorable results.

- Exclude duplicate republications, duplicate submissions, and repeated counts of the same outcome within a task. Use common-source identifiers; ten republications are not ten independent validations.
- Calculate sample counts, feedback coverage, positive/negative feedback, and objective outcomes programmatically; use AI to explain and cite evidence. When tools are unavailable, limit manual work to small, verifiable counts and leave complex statistics uncalculated.
- For helpfulness distributions, use cases where the method was adopted and the question was answered as the denominator. Separately report total adoptions and feedback coverage. List partial adoption, unknown outcomes, and missing feedback separately; do not silently discard them.
- Preserve stratified findings when performance differs across versions, goals, cost constraints, or user groups. No preset minimum sample count guarantees validity; report actual counts and uncertainty.
- AI may propose hypotheses about differentiating conditions or failure causes. Inspect the corresponding cases first, then validate with subsequent/held-out cases. Do not call patterns repeatedly mined from the same small sample stable rules.
- When samples are sparse, offer clearly labeled broader references and list differences from the current context. Do not relax hard incompatibility constraints.
- Correlation does not automatically establish causation. Observational data includes selection bias, feedback bias, and differences in task difficulty. Design a separate controlled experiment when evidence that recommendations cause improvement is required.
- Append new feedback/corrections, then refresh aggregates. Old summaries may be marked stale or invalid. Distinguish "the source reports a fix" from "retested on this version"; do not propagate fix conclusions across platforms.

## Query Workflow

1. Establish the goal, current context, hard constraints, and known versions. If missing key fields would change the recommendation, ask only the most important questions; otherwise provide conditional alternatives.
2. Filter by access permissions, domain, explicit compatibility scope, and validity. Do not treat an unknown version as a wildcard.
3. Retrieve conditional findings and their candidate methods. Combine exact fields/keywords with semantic retrieval where supported, emphasizing goals and pre-action conditions in retrieval keys.
4. Reuse an appropriate aggregate for the current conditions when available. Otherwise, reaggregate matching cases within practical limits and report actual coverage. Do not claim to have analyzed the entire library after inspecting only the first few records.
5. Compare applicability, benefits, costs, evidence strength, sample coverage, recency, and counterexamples. Avoid ranking solely by total positive feedback, vector similarity, or a single opaque score.
6. Return a small set of decision summaries, expanding representative successes, failures, and boundary cases as needed. A few raw excerpts support explanation and verification; large case sets should participate through actual aggregation. Top-k retrieval is not a whole-library statistic.

## Output Format

| Candidate method | Why it matches | Matching uses / feedback count | User feedback and objective outcomes | Costs / failure conditions | Versions and evidence |
|---|---|---|---|---|---|

End with the preferred next attempt, the basis for the decision, and key unknowns. State plainly when no usable cases exist, and distinguish new knowledge-based proposals from historically validated methods.

## Speed and Correctness

Generate structured fields, short summaries, and retrieval indexes at write time. Read original videos, chats, and logs on demand. Cache keys include permission scope, domain/environment version, method version, contextual conditions, and data version. New corrections and invalidated records must invalidate relevant caches.

Choose storage/indexes that the existing project can maintain; do not default to deploying a search cluster, vector database, or knowledge graph. First compare against a filtering-plus-full-text-search baseline, then assess the benefits and latency of semantic retrieval or reranking.

Report query metrics separately: recall of applicable cases, top-k relevance, wrong-version/wrong-platform rate, counterexample detection, abstention when evidence is insufficient, P50/P95 latency, and input text volume. Include data size, query set, concurrency, cold/warm cache conditions, and whether model generation is included. Do not present targets as measured results.

## Research Basis and Limits

- Aamodt & Plaza, 1994: The retrieve, reuse, revise, and retain cycle of case-based reasoning. https://www.iiia.csic.es/~enric/papers/Aamodt_1994_Case.pdf
- HEART: Derive metrics from user goals and measure perceptions separately from task performance. https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/
- LongMemEval: Addresses cross-session information, time, knowledge updates, and abstention when information is insufficient; it does not directly establish this system's recommendation effectiveness. https://arxiv.org/abs/2410.10813

These studies support the design direction. Specific fields, aggregation methods, and retrieval approaches still require validation on data from the target domain.
