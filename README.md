<p align="left">
  English&nbsp; | &nbsp;<a href="README_CN.md">中文</a>
</p>

<br>

<div align="center">

# Hy3 Research Canvas

Turn source material into an evidence-aware, actionable research report with Hy3.

</div>

---

## Contents

- [Introduction](#introduction)
- [Features](#features)
- [Hy3 Capabilities](#hy3-capabilities)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage](#usage)
- [Testing](#testing)
- [Architecture](#architecture)
- [Security](#security)
- [Limitations](#limitations)
- [Demo](#demo)

---

## Introduction

**Hy3 Research Canvas** is a small browser showcase for [Hy3](https://github.com/Tencent-Hunyuan/Hy3). Paste research material or upload one UTF-8 `.txt` / `.md` file, then generate a structured Markdown report through Tencent MaaS' OpenAI-compatible API.

The interface defaults to English and can switch completely to Chinese. Interface language and report output language are independent.

## Features

- Evidence-aware seven-section research reports
- Pasted text and single `.txt` / `.md` file input
- English and Chinese interface with one-click switching
- English or Simplified Chinese report output
- Brief, standard, and deep analysis modes
- Streaming Markdown preview, Stop, Copy, and Download
- Server-only API credentials and no document persistence

## Hy3 Capabilities

Hy3 is designed for practical reasoning and agentic workloads. Its core capabilities include:

- **Reasoning:** balances fast responses with deeper reasoning for analysis, planning, and complex decision-making.
- **Agent workflows:** follows multi-step instructions and maintains context across longer task sequences.
- **Tool calling:** can select and invoke structured tools in compatible agent runtimes and developer products.
- **Long-context understanding and generation:** supports up to a 256K context window for long documents, repository context, and sustained content generation.
- **Coding and instruction following:** handles repository analysis, cross-file development, structured outputs, and production-oriented tasks.

Research Canvas focuses on one concrete slice of these capabilities: long-document understanding, evidence-aware reasoning, and streamed long-form report generation. It does not currently expose autonomous agent loops or browser-side tool execution.

## Quick Start

Requirements: Node.js 20+ and pnpm 10+.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

On Windows Command Prompt, replace the copy command with:

```bat
copy .env.example .env.local
```

Open `http://localhost:3000`.

## Configuration

```dotenv
HY3_API_KEY=your-rotated-api-key
HY3_BASE_URL=https://tokenhub.tencentmaas.com/v1
HY3_MODEL=your-authorized-model-id
```

Find the exact model identifier in your Tencent MaaS authorization or console. Do not guess it and never commit `.env.local`. If a key has appeared in chat, source code, screenshots, or Git history, revoke and rotate it before use.

## Usage

1. Paste material, upload a supported text file, or select **Use sample**.
2. Choose report type, report language, and analysis depth.
3. Select **Generate report** and watch the streamed Markdown.
4. Stop generation when needed, then copy or download the result.

The report contains Executive Summary, Material Overview, Key Findings, Evidence and Rationale, Uncertainties and Information Gaps, Risks and Opportunities, and Actionable Recommendations.

## Testing

```bash
pnpm test
pnpm test:e2e
pnpm build
```

Automated tests use a deterministic fake upstream and do not consume MaaS quota.

## Architecture

```text
Browser workspace → Next.js /api/report → Tencent MaaS / Hy3
                  ← streamed Markdown ←
```

Validation, prompt construction, upstream error mapping, and file reading are separate, testable modules. The browser never receives the API key.

## Security

- Credentials are read only by the server from environment variables.
- User material and complete model output are not logged or persisted.
- Markdown raw HTML is disabled and unsafe URL protocols are removed.
- The prompt treats uploaded content as untrusted evidence, not instructions.

## Limitations

- One UTF-8 `.txt` or `.md` file, up to 120,000 characters
- No web search, PDF/Word/image parsing, accounts, or history
- Reports depend on the quality and completeness of supplied material
- A newly rotated MaaS key and an authorized Hy3 model are required for a real request

## Demo

▶ [Watch the 8-second real API demo](public/hy3-research-canvas-demo.webm)

The recording loads the bundled sample, chooses analysis settings, generates a streamed report through the real MaaS endpoint, and switches the interface to Chinese.
