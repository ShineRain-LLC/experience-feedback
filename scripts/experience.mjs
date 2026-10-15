import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createHash, randomUUID } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import contract from './experience-contract.cjs'
const { validateExperience, canonicalJSON, blankExperience, EXPERIENCE_SCHEMA, MAX_EXPERIENCE_BYTES } = contract
export { validateExperience, EXPERIENCE_SCHEMA }
export const HELP = 'sr experience init|validate|submit|status|check|list|show|schema|run [--file record.json] [--id invocationId] [--revision N] [--goal text] [--activity evaluate] [--episode] [-- command args...]'
const hash = value => createHash('sha256').update(value).digest('hex')
const fail = (code, extra = {}) => ({ ok: false, code, ...extra })
function configuration(env, home) {
  let key = String(env.SKILLROUTER_API_KEY || '').trim()
  if (!key) {
    try { const c = JSON.parse(fs.readFileSync(path.join(home, '.skillrouter/credentials.json'), 'utf8')); key = typeof c.api_key === 'string' ? c.api_key.trim() : '' } catch {}
  }
  const endpoint = 'https://skillrouter.org/api/sr/skillrouter/experiences'
  return { ok: true, endpoint, key, keyFingerprint: key ? hash(key) : null }
}
function readJSON(file) {
  const stat = fs.statSync(file)
  if (!stat.isFile() || stat.size > MAX_EXPERIENCE_BYTES) throw new Error('invalid_or_oversized_file')
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}
function atomicJSON(file, value, exclusive = false) {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 })
  if (exclusive) { fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', { flag: 'wx', mode: 0o600 }); return }
  const temp = `${file}.${randomUUID()}.tmp`
  try { fs.writeFileSync(temp, JSON.stringify(value, null, 2) + '\n', { flag: 'wx', mode: 0o600 }); fs.renameSync(temp, file) }
  finally { try { fs.unlinkSync(temp) } catch {} }
}
function stateFile(file) { return `${file}.submission.json` }
function readState(file) { try { return readJSON(stateFile(file)) } catch { return null } }
function receiptMatches(receipt, payload, payloadHash) {
  return receipt?.state === 'registered' && receipt?.ok === true && /^exp_[a-zA-Z0-9]+$/.test(receipt.id ?? '') && receipt.invocationId === payload.invocationId && receipt.revision === payload.revision && receipt.payloadHash === payloadHash && Number.isFinite(Date.parse(receipt.registeredAt))
}
async function call(config, method, payload, query, fetchImpl) {
  if (!config.key) return fail('account_not_connected', { state: 'pending_submission', hint: 'Run sr connect, then retry this record.' })
  const url = new URL(config.endpoint)
  for (const [k, v] of Object.entries(query || {})) if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
  try {
    const res = await fetchImpl(url.toString(), { method, headers: { 'x-api-key': config.key, 'content-type': 'application/json' }, body: payload === undefined ? undefined : JSON.stringify(payload), redirect: 'error', signal: AbortSignal.timeout(15000) })
    // Bound responses as well as requests. Do not print arbitrary server bodies or credential-bearing errors.
    const reader = res.body?.getReader()
    let raw = '', bytes = 0
    if (reader) {
      const decoder = new TextDecoder()
      for (;;) { const { done, value } = await reader.read(); if (done) break; bytes += value.byteLength; if (bytes > 8 * 1024 * 1024) { await reader.cancel(); return fail('response_too_large', { state: 'pending_submission' }) }; raw += decoder.decode(value, { stream: true }) }
      raw += decoder.decode()
    } else raw = await res.text()
    let data
    try { data = JSON.parse(raw) } catch { return fail('invalid_server_response', { state: 'pending_submission', http: res.status }) }
    if (!res.ok) return fail('registration_rejected', { state: res.status >= 500 || [408, 429].includes(res.status) ? 'pending_submission' : 'failed', http: res.status, error: typeof data?.error === 'string' ? data.error.slice(0, 100) : 'request_failed', fields: Array.isArray(data?.fields) ? data.fields.slice(0, 60).map(f => ({ path: String(f.path ?? '').slice(0, 200), message: String(f.message ?? '').slice(0, 500) })) : [] })
    return { ok: true, data }
  } catch { return fail('registration_unreachable', { state: 'pending_submission' }) }
}
export async function submitExperience(file, { env = process.env, home = os.homedir(), fetchImpl = fetch } = {}) {
  let payload
  try { payload = readJSON(file) } catch { return fail('invalid_record_file') }
  const checked = validateExperience(payload)
  if (!checked.ok) return fail('invalid_experience', { state: 'failed', fields: checked.errors })
  const config = configuration(env, home)
  if (!config.ok) return config
  const payloadHash = hash(canonicalJSON(payload)), previous = readState(file)
  if (previous?.endpoint && previous.endpoint !== config.endpoint) return fail('submission_destination_changed', { hint: 'This record was previously submitted elsewhere. Keep its state for inspection; only the official SkillRouter endpoint is supported.' })
  if (previous?.keyFingerprint && config.keyFingerprint && previous.keyFingerprint !== config.keyFingerprint) return fail('submission_account_changed', { hint: 'Use the original account key or explicitly create a separate record file.' })
  const state = { invocationId: payload.invocationId, revision: payload.revision, payloadHash, endpoint: config.endpoint, keyFingerprint: config.keyFingerprint, updatedAt: new Date().toISOString(), state: 'pending_submission' }
  atomicJSON(stateFile(file), state)
  const response = await call(config, 'POST', payload, null, fetchImpl)
  if (!response.ok) { atomicJSON(stateFile(file), { ...state, ...response }); return { ...response, file, statusFile: stateFile(file) } }
  if (!receiptMatches(response.data, payload, payloadHash)) { const result = fail('invalid_registration_receipt', { state: 'pending_submission' }); atomicJSON(stateFile(file), { ...state, ...result }); return result }
  const receipt = response.data
  const registered = { ...state, state: 'registered', receipt }
  atomicJSON(stateFile(file), registered)
  return { ok: true, state: 'registered', receipt, file, statusFile: stateFile(file) }
}
export async function checkExperience(file, { env = process.env, home = os.homedir(), fetchImpl = fetch } = {}) {
  let payload
  try { payload = readJSON(file) } catch { return fail('invalid_record_file') }
  const checked = validateExperience(payload)
  if (!checked.ok) return fail('invalid_experience', { fields: checked.errors })
  const state = readState(file), digest = hash(canonicalJSON(payload)), config = configuration(env, home)
  if (!config.ok) return config
  if (state?.endpoint !== config.endpoint || state?.keyFingerprint !== config.keyFingerprint || state?.payloadHash !== digest || !receiptMatches(state?.receipt, payload, digest)) return fail('registration_required', { state: 'pending_submission' })
  const result = await call(config, 'GET', undefined, { invocationId: payload.invocationId, revision: payload.revision }, fetchImpl)
  if (!result.ok) return result
  const row = result.data?.records?.find(r => r.invocationId === payload.invocationId && r.revision === payload.revision)
  if (!row || row.id !== state.receipt.id || row.payloadHash !== digest || hash(canonicalJSON(row.payload)) !== digest) return fail('registration_verification_failed')
  return { ok: true, state: 'registered', receipt: state.receipt, verified: true }
}
function blankFromSchema(s) {
  if (s.const !== undefined) return s.const
  if (Array.isArray(s.type) && s.type.includes('null')) return null
  if (s.type === 'object') return Object.fromEntries(Object.entries(s.properties).map(([k,v]) => [k, blankFromSchema(v)]))
  if (s.type === 'array') return []
  if (s.enum) return s.enum.includes('unknown') ? 'unknown' : s.enum[0]
  if (s.type === 'integer') return s.minimum ?? 1
  return ''
}
export async function experienceCLI(argv, deps = {}) {
  const [command, ...rest] = argv
  const options = {}, child = []
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--') { child.push(...rest.slice(i + 1)); break }
    if (rest[i] === '--episode') { options.episode = true; continue }
    if (!['--file','--goal','--activity','--id','--revision','--limit','--offset','--status','--adoption','--domain'].includes(rest[i]) || rest[i + 1] === undefined || rest[i + 1].startsWith('--')) return fail('usage', { hint: HELP })
    const key = rest[i].slice(2)
    if (key in options) return fail('usage', { hint: HELP })
    options[key] = rest[++i]
  }
  if (command === 'schema') return { ok: true, schema: EXPERIENCE_SCHEMA }
  const file = options.file ? path.resolve(options.file) : null
  if (command === 'init') {
    if (!file) return fail('file_required')
    const draft = blankExperience(randomUUID())
    if (options.goal) draft.goal = options.goal
    if (options.activity) draft.activityType = options.activity
    if (options.episode) {
      draft.episode = blankFromSchema({ ...EXPERIENCE_SCHEMA.properties.episode, type: 'object' })
      draft.episode.identity.id = randomUUID(); draft.episode.identity.createdAt = draft.recordedAt; draft.episode.identity.updatedAt = draft.recordedAt
      draft.episode.outcome.basis = 'unavailable'; draft.episode.outcome.status = 'unknown'
    }
    try { atomicJSON(file, draft, true) } catch { return fail('record_file_exists_or_unwritable') }
    return { ok: true, state: 'draft', file, hint: 'Fill the goal, actual work and result. Unknown values and missing user feedback may remain null. Then validate and submit.' }
  }
  if (['validate','submit','status','check','run'].includes(command) && !file) return fail('file_required')
  if (command === 'validate') { try { const r = validateExperience(readJSON(file)); return { ...r, state: r.ok ? 'valid' : 'invalid' } } catch { return fail('invalid_record_file') } }
  if (command === 'status') { const state = readState(file); if (!state) return fail('not_submitted'); const { keyFingerprint: _key, ...visible } = state; return { ok: true, ...visible } }
  if (command === 'submit') return submitExperience(file, deps)
  if (command === 'check') return checkExperience(file, deps)
  if (command === 'run') {
    if (!child.length) return fail('command_required', { hint: HELP })
    if (fs.existsSync(`${file}.submission.json`)) return fail('command_already_attempted', { hint: 'Retry submit or check for this record. Use a new invocation file for a new command execution.' })
    let before
    try { before = readJSON(file) } catch { return fail('invalid_record_file') }
    const valid = validateExperience(before)
    if (!valid.ok) return fail('invalid_experience', { fields: valid.errors })
    atomicJSON(stateFile(file), { state: 'command_started', invocationId: before.invocationId, revision: before.revision, updatedAt: new Date().toISOString() }, true)
    let run
    try { run = (deps.spawnImpl || spawnSync)(child[0], child.slice(1), { stdio: 'inherit', shell: false }) } catch { run = { error: true, status: null } }
    let after
    try { after = readJSON(file) } catch { return fail('invalid_record_file') }
    if (after.invocationId !== before.invocationId || after.revision !== before.revision) return fail('invocation_changed_during_run')
    after.actions = [...after.actions, run.error ? 'Wrapped command could not start.' : `Wrapped command exited with status ${run.status ?? 'signal'}.`]
    if (after.result.status === 'pending') after.result = { status: run.status === 0 ? 'completed' : 'failed', summary: `Wrapped command ${run.status === 0 ? 'completed' : 'failed'}. Method outcomes and user feedback remain as separately recorded.`, basis: 'system_observation' }
    after.recordedAt = new Date().toISOString()
    atomicJSON(file, after)
    const submitted = await submitExperience(file, deps)
    if (!submitted.ok) return submitted
    return { ...submitted, ok: !run.error && run.status === 0, commandExitCode: run.status ?? null, ...(run.error ? { code: 'command_start_failed' } : {}) }
  }
  if (command === 'list' || command === 'show') {
    if (command === 'show' && !options.id) return fail('id_required')
    const config = configuration(deps.env || process.env, deps.home || os.homedir())
    if (!config.ok) return config
    const result = await call(config, 'GET', undefined, command === 'show' ? { invocationId: options.id, revision: options.revision } : { limit: options.limit, offset: options.offset, status: options.status, adoption: options.adoption, domain: options.domain }, deps.fetchImpl || fetch)
    return result.ok ? { ok: true, ...result.data } : result
  }
  return fail('usage', { hint: HELP })
}
export async function main(argv = process.argv.slice(2)) {
  let result
  try { result = await experienceCLI(argv) } catch { result = fail('local_io_error', { hint: 'Check file permissions and available disk space.' }) }
  console.log(JSON.stringify(result, null, 2))
  if (!result.ok) process.exitCode = 1
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main()
