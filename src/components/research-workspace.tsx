"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { MAX_MATERIAL_CHARS, type ReportRequest } from "@/domain/report";
import { messages, type UiLocale } from "@/i18n/messages";
import { FileReadError, readTextFile } from "@/lib/read-text-file";
import { MarkdownReport } from "./markdown-report";

const sample = `Quarterly product research notes

Customer interviews: 18 of 24 participants completed setup without assistance. Six participants could not find the export action.
Performance: median report generation time was 42 seconds across 30 trials. Three trials exceeded 90 seconds.
Commercial signal: pilot teams reported saving an estimated 2.5 hours per research brief, but the sample only covers one quarter.`;

type Status = "idle" | "generating" | "stopped" | "error";

export function ResearchWorkspace() {
  const [locale, setLocale] = useState<UiLocale>("en");
  const [material, setMaterial] = useState("");
  const [fileName, setFileName] = useState("");
  const [reportType, setReportType] = useState<ReportRequest["reportType"]>("general");
  const [reportLanguage, setReportLanguage] = useState<ReportRequest["language"]>("en");
  const [depth, setDepth] = useState<ReportRequest["depth"]>("standard");
  const [report, setReport] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const t = messages[locale];

  function fileMessage(error: unknown) {
    if (!(error instanceof FileReadError)) return t.requestFailed;
    if (error.code === "UNSUPPORTED_FILE") return t.unsupportedFile;
    if (error.code === "INVALID_UTF8") return t.invalidUtf8;
    return t.tooLarge;
  }

  async function acceptFile(file?: File) {
    if (!file) return;
    try {
      const text = await readTextFile(file);
      setMaterial(text);
      setFileName(file.name);
      setError("");
    } catch (nextError) {
      setError(fileMessage(nextError));
    }
  }

  async function generate() {
    if (!material.trim()) {
      setError(t.blankError);
      return;
    }
    if (material.length > MAX_MATERIAL_CHARS) {
      setError(t.tooLarge);
      return;
    }
    const controller = new AbortController();
    const preservedReport = report;
    controllerRef.current = controller;
    setReport("");
    setError("");
    setStatus("generating");
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ material, reportType, language: reportLanguage, depth }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message || t.requestFailed);
      }
      if (!response.body) throw new Error(t.requestFailed);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let output = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        output += decoder.decode(value, { stream: true });
        setReport(output);
      }
      output += decoder.decode();
      setReport(output);
      setStatus("idle");
    } catch (nextError) {
      if (controller.signal.aborted) {
        setStatus("stopped");
      } else {
        setReport((current) => current || preservedReport);
        setError(nextError instanceof Error ? nextError.message : t.requestFailed);
        setStatus("error");
      }
    } finally {
      controllerRef.current = null;
    }
  }

  function stop() {
    controllerRef.current?.abort();
  }

  async function copyReport() {
    await navigator.clipboard.writeText(report);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function downloadReport() {
    const url = URL.createObjectURL(new Blob([report], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `hy3-research-report-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const selectFile = (event: ChangeEvent<HTMLInputElement>) => acceptFile(event.target.files?.[0]);
  const dropFile = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files.length > 1) return setError(t.unsupportedFile);
    void acceptFile(event.dataTransfer.files[0]);
  };

  return (
    <main className="workspace-shell">
      <header className="hero">
        <div><span className="eyebrow">{t.eyebrow}</span><h1>Hy3 {t.title}</h1><p>{t.subtitle}</p></div>
        <button className="language-toggle" aria-label={t.switchLabel} onClick={() => setLocale(locale === "en" ? "zh-CN" : "en")}>{t.switchText}</button>
      </header>

      <div className="workspace-grid">
        <section className="panel input-panel">
          <div className="section-title"><div><h2>{t.materialHeading}</h2><p>{t.materialHelp}</p></div><button className="text-button" onClick={() => { setMaterial(sample); setFileName(""); setError(""); }}>{t.useSample}</button></div>
          <div className="drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={dropFile}>
            <label className="upload-button">{t.upload}<input type="file" accept=".txt,.md,text/plain,text/markdown" onChange={selectFile} /></label>
            <span>{fileName || t.drop}</span>
          </div>
          <label className="textarea-label" htmlFor="material">{t.materialLabel}</label>
          <textarea id="material" value={material} onChange={(event) => setMaterial(event.target.value)} placeholder={t.materialPlaceholder} maxLength={MAX_MATERIAL_CHARS + 1} />
          <div className="counter">{material.length.toLocaleString()} / {MAX_MATERIAL_CHARS.toLocaleString()} {t.characters}</div>
          <div className="settings-grid">
            <label>{t.reportType}<select value={reportType} onChange={(event) => setReportType(event.target.value as ReportRequest["reportType"])}><option value="general">{t.typeGeneral}</option><option value="market">{t.typeMarket}</option><option value="technical">{t.typeTechnical}</option></select></label>
            <label>{t.reportLanguage}<select value={reportLanguage} onChange={(event) => setReportLanguage(event.target.value as ReportRequest["language"])}><option value="en">{t.languageEnglish}</option><option value="zh-CN">{t.languageChinese}</option></select></label>
            <label>{t.depth}<select value={depth} onChange={(event) => setDepth(event.target.value as ReportRequest["depth"])}><option value="brief">{t.depthBrief}</option><option value="standard">{t.depthStandard}</option><option value="deep">{t.depthDeep}</option></select></label>
          </div>
          {error && <div className="error-banner" role="alert">{error}</div>}
          {status === "generating" ? <button className="primary-button stop" onClick={stop}>{t.stop}</button> : <button className="primary-button" onClick={generate}>{t.generate}</button>}
        </section>

        <section className="panel report-panel">
          <div className="report-toolbar"><div><span className="eyebrow">HY3</span><h2>{t.reportHeading}</h2></div>{report && <div className="report-actions"><button onClick={copyReport}>{copied ? t.copied : t.copy}</button><button onClick={downloadReport}>{t.download}</button></div>}</div>
          <div className="status-line" aria-live="polite">{status === "generating" ? t.generating : status === "stopped" ? t.stopped : ""}</div>
          {report ? <MarkdownReport content={report} /> : <div className="empty-state"><div className="empty-mark">H3</div><h3>{t.emptyTitle}</h3><p>{t.emptyBody}</p></div>}
        </section>
      </div>
    </main>
  );
}
