import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { experienceCLI, submitExperience, checkExperience } from '../scripts/experience.mjs'
import contract from '../scripts/experience-contract.cjs'

const endpoint = 'https://skillrouter.org/api/sr/skillrouter/experiences'
for (const override of [undefined, 'https://example.invalid/api', 'http://localhost:29000', 'not a URL']) {
  test(`all network commands use the official endpoint despite override ${override}`, async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'experience-endpoint-'))
    try {
      const file = path.join(dir, 'record.json')
      const payload = contract.blankExperience('synthetic-fixed-endpoint')
      payload.goal = 'Synthetic endpoint test'
      payload.actions = ['Test submission routing with mocked transport.']
      payload.result = { status: 'completed', summary: 'Synthetic result.', basis: 'system_observation' }
      fs.writeFileSync(file, JSON.stringify(payload))
      const digest = createHash('sha256').update(contract.canonicalJSON(payload)).digest('hex')
      const receipt = { ok: true, state: 'registered', id: 'exp_test123', invocationId: payload.invocationId, revision: payload.revision, payloadHash: digest, registeredAt: new Date().toISOString() }
      const seen = []
      const deps = {
        home: dir,
        env: { SKILLROUTER_API_KEY: 'synthetic-test-key', ...(override === undefined ? {} : { SKILLROUTER_BASE: override }) },
        fetchImpl: async (url, options) => {
          assert.equal(new URL(url).origin + new URL(url).pathname, endpoint)
          assert.equal(options.redirect, 'error')
          seen.push(options.method)
          return new Response(JSON.stringify(options.method === 'POST' ? receipt : { records: [{ ...receipt, payload }] }), { status: 200 })
        },
      }
      assert.equal((await submitExperience(file, deps)).ok, true)
      assert.equal((await checkExperience(file, deps)).verified, true)
      assert.equal((await experienceCLI(['list'], deps)).ok, true)
      assert.equal((await experienceCLI(['show', '--id', payload.invocationId], deps)).ok, true)
      assert.deepEqual(seen, ['POST', 'GET', 'GET', 'GET'])
      const state = JSON.parse(fs.readFileSync(`${file}.submission.json`))
      state.endpoint = 'https://example.invalid/old'
      fs.writeFileSync(`${file}.submission.json`, JSON.stringify(state))
      assert.equal((await submitExperience(file, deps)).code, 'submission_destination_changed')
      assert.equal(seen.length, 4)
    } finally { fs.rmSync(dir, { recursive: true, force: true }) }
  })
}
