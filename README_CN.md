<p align="left">
  <a href="README.md">English</a>&nbsp; | &nbsp;中文
</p>

<br>

<div align="center">

# Hy3 Research Canvas

使用 Hy3 将原始材料转化为重视证据、可以行动的研究报告。

</div>

---

## 目录

- [项目介绍](#项目介绍)
- [功能](#功能)
- [Hy3 核心能力](#hy3-核心能力)
- [快速开始](#快速开始)
- [配置](#配置)
- [使用方法](#使用方法)
- [测试](#测试)
- [架构](#架构)
- [安全](#安全)
- [限制](#限制)
- [演示](#演示)

---

## 项目介绍

**Hy3 Research Canvas** 是基于 [Hy3](https://github.com/Tencent-Hunyuan/Hy3) 的浏览器小作品。用户可以粘贴研究材料或上传一个 UTF-8 `.txt` / `.md` 文件，再通过腾讯 MaaS 的 OpenAI 兼容 API 生成结构化 Markdown 报告。

界面默认为英文，可完整切换为中文。界面语言与报告输出语言相互独立。

## 功能

- 重视证据的七章节研究报告
- 支持粘贴文本及单个 `.txt` / `.md` 文件
- 中英文界面一键切换
- 报告可输出英文或简体中文
- 简洁、标准和深入三种分析深度
- 流式 Markdown 预览、停止、复制和下载
- API 凭证仅存在服务端，不持久化用户文档

## Hy3 核心能力

Hy3 面向真实推理与 Agent 工作负载设计，核心能力包括：

- **推理：**兼顾快速响应和深入推理，适用于分析、规划与复杂决策。
- **Agent 工作流：**能够遵循多步骤指令，并在较长任务链中保持上下文。
- **工具调用：**可在兼容的 Agent 运行时和开发工具中选择并调用结构化工具。
- **长上下文理解与长文生成：**支持最高 256K 上下文，可处理长文档、仓库上下文和持续内容生成。
- **代码与指令遵循：**适用于仓库分析、跨文件开发、结构化输出和面向生产的任务。

Research Canvas 聚焦其中一个具体场景：长文档理解、重视证据的推理以及流式长篇报告生成。当前版本不提供自主 Agent 循环或浏览器端工具执行。

## 快速开始

环境要求：Node.js 20+、pnpm 10+。

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Windows 命令提示符请将复制命令替换为：

```bat
copy .env.example .env.local
```

访问 `http://localhost:3000`。

## 配置

```dotenv
HY3_API_KEY=your-rotated-api-key
HY3_BASE_URL=https://tokenhub.tencentmaas.com/v1
HY3_MODEL=your-authorized-model-id
```

请从腾讯 MaaS 授权信息或控制台获取准确的模型标识，不要猜测，也不要提交 `.env.local`。如果 Key 曾经出现在聊天、源码、截图或 Git 历史中，必须先撤销并轮换。

## 使用方法

1. 粘贴材料、上传受支持的文本文件，或点击“使用示例”。
2. 选择报告类型、报告语言和分析深度。
3. 点击“生成研究报告”，查看流式 Markdown。
4. 必要时停止生成，然后复制或下载结果。

报告包含执行摘要、材料概览、关键发现、证据与依据、不确定性及信息缺口、风险与机会、可执行建议。

## 测试

```bash
pnpm test
pnpm test:e2e
pnpm build
```

自动化测试使用确定性的模拟上游，不消耗 MaaS 调用额度。

## 架构

```text
浏览器工作台 → Next.js /api/report → 腾讯 MaaS / Hy3
             ← 流式 Markdown ←
```

输入校验、提示词构造、上游错误映射和文件读取分别位于独立的可测试模块中。浏览器永远不会收到 API Key。

## 安全

- 凭证仅由服务端从环境变量读取。
- 不记录或持久化用户材料与完整模型输出。
- 禁用 Markdown 原始 HTML，并移除不安全的 URL 协议。
- 提示词将上传内容视为不受信任的证据，而不是指令。

## 限制

- 单个 UTF-8 `.txt` 或 `.md` 文件，上限 120,000 字符
- 不支持联网搜索、PDF/Word/图片解析、账号或历史记录
- 报告质量取决于用户材料的质量和完整性
- 真实调用需要轮换后的 MaaS Key 和已授权的 Hy3 模型

## 演示

▶ [观看 8 秒真实 API 演示](public/hy3-research-canvas-demo.webm)

该视频依次载入内置示例、选择分析设置、通过真实 MaaS 端点流式生成报告，并将界面切换为中文。
