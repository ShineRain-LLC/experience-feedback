# Experience Feedback and Reuse

An agent skill for recording real usage, recovering relevant context from earlier sessions, and reusing experience with explicit evidence boundaries.

面向 AI 助手的经验反馈技能：先查历史、确认对象，再记录实际使用、结果与用户评价。支持后续修订和按适用条件检索，避免把推荐当作使用、把满意当作性能证明。

## Install / 安装

Clone this repository into your agent’s skill directory. For Codex, using the default skill directory:

```sh
git clone https://github.com/ShineRain-LLC/experience-feedback.git ~/.codex/skills/experience-feedback
```

If that directory already exists, keep your existing version and compare changes before replacing it. Other agents can load [SKILL.md](SKILL.md) using their own skill installation mechanism.

The bundled helper requires **Node.js 18 or newer** and uses only built-in Node modules. No npm install is required. Historical session retrieval depends on tools and permissions provided by the host; this repository does not provide access to other sessions by itself.

## Use / 使用

Ask your agent, for example:

> 使用 experience-feedback，记录我对之前购买的主机的反馈：现在用着挺满意。先查可访问的历史记录确认是哪台；找不到的信息留空，不要推断性能或我对选购建议的评价。

The agent should retrieve relevant accessible context before asking you to repeat it, link only a reliably identified event, and preserve the scope of your evaluation. Explicit instructions not to search take precedence. Missing attachments do not invalidate a user report.

For a local draft:

```sh
node scripts/experience.mjs init --file /tmp/my-experience.json --goal "Record feedback on a prior purchase" --episode
# Fill the draft with known facts; keep permitted unknown values null.
node scripts/experience.mjs validate --file /tmp/my-experience.json
node scripts/experience.mjs schema
```

`init` creates an incomplete draft; validation may report fields that still need filling. These commands run locally and do not submit the record.

## Registration and privacy / 网站登记与隐私

The skill's full workflow includes authenticated SkillRouter registration. `submit`, `check`, `list`, and `show` contact the official SkillRouter service; `run` executes a command and attempts submission afterward. The endpoint is fixed to `https://skillrouter.org/api/sr/skillrouter/experiences`. `SKILLROUTER_BASE` is ignored; custom hosts and staging overrides are not supported. Requests reject redirects. Authentication uses `SKILLROUTER_API_KEY` or credentials previously saved by `sr connect`.

```sh
node scripts/experience.mjs submit --file /tmp/my-experience.json
node scripts/experience.mjs check --file /tmp/my-experience.json
```

Registration requires an account and a compatible deployed endpoint. This repository does not include the backend or guarantee hosted endpoint availability. Without either, local drafting and validation still work; report registration as pending/failed, never completed. A verified server receipt is required to claim registration.

Records use **private account scope**. Publishing this skill does not publish anyone's experience records. Do not put credentials, complete session logs, private orders, addresses, or unrelated personal information in records or this repository. Upload only necessary structured summaries within the user's authorization. See [registration details](references/skillrouter-registration.md).

## Contents

- [SKILL.md](SKILL.md): agent workflow and history/evidence rules.
- [Record structures](references/records.md) and [episode template](references/episode-template.md).
- [Aggregation and retrieval](references/aggregation-retrieval.md): applicability, versions, sample counts, counterexamples.
- [Validation scenarios](references/validation.md): behavioral checks and failure boundaries.
- `assets/experience.schema.json`: portable registration contract.
- `scripts/experience.mjs`: local validation and authenticated submission helper.

The bundled `experience-contract.cjs` and schema are generated snapshots of the SkillRouter contract and run without the parent repository. Contract changes must keep both snapshots consistent. This release does not include their upstream generator.

## Contributing

Propose focused changes through an issue or pull request. Use synthetic examples, preserve the distinction between observations and user reports, and never contribute private feedback or credentials. Changes to scripts should include reproducible checks; changes to instructions should describe the scenario they improve.

## License

[MIT](LICENSE) — Copyright (c) 2026 Shinerain LLC.
