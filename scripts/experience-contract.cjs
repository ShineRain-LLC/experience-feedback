// Generated from backend/src/lib/experience-contract.ts; do not edit.
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXPERIENCE_SCHEMA = exports.RESULT_STATUS = exports.ACTIVITIES = exports.HELPFULNESS = exports.BASIS = exports.ADOPTION = exports.MAX_EXPERIENCE_BYTES = void 0;
exports.canonicalJSON = canonicalJSON;
exports.validateExperience = validateExperience;
exports.blankExperience = blankExperience;
/** Canonical portable contract. tools/experience/sync-contract.mjs generates the CLI copy. */
exports.MAX_EXPERIENCE_BYTES = 64 * 1024;
exports.ADOPTION = ["not_used", "partial", "full", "unknown"];
exports.BASIS = ["system_observation", "user_report", "unavailable"];
exports.HELPFULNESS = ["helpful", "partly_helpful", "not_helpful", "harmful", "uncertain"];
exports.ACTIVITIES = ["capture", "evaluate", "aggregate", "retrieve", "design"];
exports.RESULT_STATUS = ["completed", "partial", "failed", "blocked", "pending"];
const text = (maxLength = 4000) => ({ type: "string", minLength: 1, maxLength });
const nullableText = (maxLength = 4000) => ({ type: ["string", "null"], minLength: 1, maxLength });
const choice = (values) => ({ type: "string", enum: values });
const obj = (properties, nullable = false) => ({ type: nullable ? ["object", "null"] : "object", properties, required: Object.keys(properties), additionalProperties: false });
const list = (items, nullable = true) => ({ type: nullable ? ["array", "null"] : "array", items, maxItems: 100 });
const details = { type: ["object", "array", "string", "null"] };
const timestamp = { ...nullableText(40), pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$" };
const method = obj({ methodId: text(200), methodRevision: nullableText(100), claimIds: list(text(200)) });
const feedback = obj({
    helpfulness: { type: ["string", "null"], enum: [...exports.HELPFULNESS, null] },
    reasons: list(choice(["solved_problem", "saved_time", "reduced_cost", "avoided_mistakes", "easier_decision", "other"])),
    comment: nullableText(), wouldReuse: { type: ["boolean", "null"] }, evaluatorId: nullableText(200), submittedAt: timestamp,
    scope: choice(["usage_effect", "expected_applicability", "clarity"]),
}, true);
const episode = obj({
    identity: obj({ id: text(160), revision: { type: "integer", minimum: 1, maximum: 100000 }, domain: text(100), domainConfigVersion: nullableText(100), parentEpisodeId: nullableText(160), tenantId: nullableText(160), accessScope: { const: "private" }, createdAt: timestamp, updatedAt: timestamp }),
    goal: obj({ description: text(), successCriteria: details }),
    context: obj({ preActionState: details, platform: nullableText(200), environmentVersion: nullableText(200), resources: details, constraints: details, prerequisites: details }),
    recommendation: obj({ methods: list(method), content: nullableText(), candidateMethods: list(method), selectionReason: nullableText(), recommendedAt: timestamp, shownAt: timestamp }),
    execution: obj({ adoption: choice(exports.ADOPTION), methods: list(method), steps: details, parameters: details, modifications: details, startedAt: timestamp, endedAt: timestamp }),
    outcome: obj({ status: choice(["pending", "observed", "unknown", "conflicting"]), basis: choice(exports.BASIS), summary: nullableText(), goalAchieved: { type: ["boolean", "null"] }, metrics: list(obj({ name: text(200), beforeValue: { type: ["number", "null"] }, afterValue: { type: ["number", "null"] }, unit: text(100), beforeObservedAt: timestamp, afterObservedAt: timestamp, evidenceIds: list(text(200)) })), observationWindow: obj({ startedAt: timestamp, endedAt: timestamp, elapsedValue: { type: ["number", "null"], minimum: 0 }, elapsedUnit: nullableText(50) }), observedAt: timestamp, costs: details, sideEffects: details, concurrentChanges: details }),
    feedback,
    evidence: obj({ items: details, missingFields: details, causalEvidence: details }),
}, true);
exports.EXPERIENCE_SCHEMA = {
    $schema: "https://json-schema.org/draft/2020-12/schema", title: "SkillRouter experience registration v1",
    ...obj({
        schemaVersion: { const: 1 }, invocationId: { ...text(160), pattern: "^[a-zA-Z0-9][a-zA-Z0-9_-]{0,159}$" },
        revision: { type: "integer", minimum: 1, maximum: 100000 }, skillName: { const: "experience-feedback" },
        skillVersion: nullableText(100), activityType: choice(exports.ACTIVITIES), goal: text(), context: { type: ["object", "null"] },
        actions: list(text(2000), false), result: obj({ status: choice(exports.RESULT_STATUS), summary: text(8000), basis: choice(exports.BASIS) }),
        adoption: choice(exports.ADOPTION), feedback, episode, recordedAt: { ...timestamp, type: "string" }, accessScope: { const: "private" },
    }),
};
function isObject(v) { return v !== null && typeof v === "object" && !Array.isArray(v); }
function canonicalJSON(value) {
    if (Array.isArray(value))
        return `[${value.map(canonicalJSON).join(",")}]`;
    if (isObject(value))
        return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonicalJSON(value[k])}`).join(",")}}`;
    return JSON.stringify(value);
}
function validateExperience(value) {
    const errors = [];
    const add = (path, message) => { if (errors.length < 60)
        errors.push({ path, message }); };
    const walk = (v, s, path, depth) => {
        if (depth > 20) {
            add(path, "nesting is too deep");
            return;
        }
        if (s.const !== undefined && v !== s.const)
            add(path, `must equal ${JSON.stringify(s.const)}`);
        if (s.enum && !s.enum.includes(v))
            add(path, `must be one of ${s.enum.map(x => JSON.stringify(x)).join(", ")}`);
        const type = v === null ? "null" : Array.isArray(v) ? "array" : typeof v;
        const types = s.type ? (Array.isArray(s.type) ? s.type : [s.type]) : [];
        if (types.length && !types.some(t => t === type || (t === "integer" && Number.isSafeInteger(v)))) {
            add(path, `must be ${types.join(" or ")}`);
            return;
        }
        if (typeof v === "string") {
            if (s.minLength && v.trim().length < s.minLength)
                add(path, "must not be empty");
            if (s.maxLength && v.length > s.maxLength)
                add(path, `must contain at most ${s.maxLength} characters`);
            if (s.pattern && !new RegExp(s.pattern).test(v))
                add(path, "invalid format");
            if (s === timestamp && !Number.isFinite(Date.parse(v)))
                add(path, "invalid timestamp");
        }
        if (typeof v === "number" && (!Number.isFinite(v) || (s.minimum !== undefined && v < s.minimum) || (s.maximum !== undefined && v > s.maximum)))
            add(path, "number is outside the allowed range");
        if (Array.isArray(v)) {
            if (s.maxItems !== undefined && v.length > s.maxItems)
                add(path, `at most ${s.maxItems} items are allowed`);
            if (s.minItems !== undefined && v.length < s.minItems)
                add(path, `at least ${s.minItems} items are required`);
            v.forEach((entry, i) => walk(entry, s.items ?? {}, `${path}[${i}]`, depth + 1));
        }
        else if (isObject(v)) {
            for (const key of s.required ?? [])
                if (!Object.prototype.hasOwnProperty.call(v, key))
                    add(`${path}.${key}`, "required; use null only when the field permits unknown values");
            for (const [key, entry] of Object.entries(v)) {
                if (["__proto__", "constructor", "prototype"].includes(key)) {
                    add(`${path}.${key}`, "reserved key");
                    continue;
                }
                if (s.additionalProperties === false && !s.properties?.[key])
                    add(`${path}.${key}`, "unknown field");
                walk(entry, s.properties?.[key] ?? {}, `${path}.${key}`, depth + 1);
            }
        }
    };
    let encoded;
    try {
        encoded = JSON.stringify(value);
    }
    catch {
        return { ok: false, errors: [{ path: "$", message: "must be JSON serializable" }] };
    }
    if (!encoded || new TextEncoder().encode(encoded).length > exports.MAX_EXPERIENCE_BYTES)
        return { ok: false, errors: [{ path: "$", message: "payload must be JSON no larger than 64 KiB" }] };
    walk(value, exports.EXPERIENCE_SCHEMA, "$", 0);
    if (errors.length === 0) {
        const p = value;
        if (!Number.isFinite(Date.parse(p.recordedAt)))
            add("$.recordedAt", "invalid timestamp");
        if (p.feedback?.scope === "usage_effect" && !["partial", "full"].includes(p.adoption))
            add("$.feedback.scope", "usage_effect requires actual partial or full adoption");
        if (p.activityType === "design" && p.episode !== null)
            add("$.episode", "design work cannot create a real usage episode");
        if (p.episode) {
            const e = p.episode;
            if (e.execution.adoption !== p.adoption)
                add("$.episode.execution.adoption", "must match the invocation adoption");
            if (canonicalJSON(e.feedback) !== canonicalJSON(p.feedback))
                add("$.episode.feedback", "must match the invocation feedback");
            if (e.identity.tenantId !== null)
                add("$.episode.identity.tenantId", "private records use the authenticated account; tenantId must be null");
            if (e.outcome.status !== "observed" && e.outcome.goalAchieved !== null)
                add("$.episode.outcome.goalAchieved", "must be null until a non-conflicting outcome is observed");
            if (e.outcome.status === "observed" && (e.outcome.basis === "unavailable" || e.outcome.summary === null))
                add("$.episode.outcome", "observed outcomes need a summary and a system observation or user report");
            if (["full", "partial"].includes(e.execution.adoption) && e.execution.steps === null && !e.execution.methods?.length)
                add("$.episode.execution", "describe the actual steps or method used; user reports are sufficient");
            if (e.execution.startedAt && e.execution.endedAt && Date.parse(e.execution.endedAt) < Date.parse(e.execution.startedAt))
                add("$.episode.execution.endedAt", "cannot precede startedAt");
        }
        else if (["full", "partial"].includes(p.adoption))
            add("$.episode", "actual method use requires an episode; non-usage work should use unknown or not_used");
    }
    return { ok: errors.length === 0, errors };
}
function blankExperience(invocationId, now = new Date().toISOString()) {
    return { schemaVersion: 1, invocationId, revision: 1, skillName: "experience-feedback", skillVersion: null, activityType: "evaluate", goal: "", context: null, actions: [], result: { status: "pending", summary: "", basis: "unavailable" }, adoption: "unknown", feedback: null, episode: null, recordedAt: now, accessScope: "private" };
}
