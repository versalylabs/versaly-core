"use client";

import { useState, useMemo } from "react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  FileText,
  Copy,
  Check,
  Search,
  Eye,
  FileCheck,
  Sparkles,
} from "lucide-react";
import {
  SEED_DOCUMENTS,
  SEED_TEMPLATES,
  SeedDocument,
  SeedTemplate,
} from "@/data/documents-seed";
import { renderTemplate } from "@/lib/templates";

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<"library" | "templates">("library");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [productFilter, setProductFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Selected template & variable state for live generation
  const [selectedTemplate, setSelectedTemplate] = useState<SeedTemplate>(SEED_TEMPLATES[0]);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const v of SEED_TEMPLATES[0].variables) {
      initial[v.key] = v.defaultValue;
    }
    return initial;
  });

  const [copied, setCopied] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<SeedDocument | null>(null);

  // When user selects a different template, reset variables
  function handleSelectTemplate(tpl: SeedTemplate) {
    setSelectedTemplate(tpl);
    const newVars: Record<string, string> = {};
    for (const v of tpl.variables) {
      newVars[v.key] = v.defaultValue;
    }
    setTemplateVariables(newVars);
  }

  // Update a single variable
  function handleVariableChange(key: string, value: string) {
    setTemplateVariables((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  // Live rendered content
  const renderedContent = useMemo(() => {
    return renderTemplate(selectedTemplate.content, templateVariables);
  }, [selectedTemplate, templateVariables]);

  function handleCopy() {
    navigator.clipboard.writeText(renderedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return SEED_DOCUMENTS.filter((doc) => {
      const matchesCat = categoryFilter === "ALL" || doc.category === categoryFilter;
      const matchesProd = productFilter === "ALL" || doc.productSlug === productFilter;
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesProd && matchesSearch;
    });
  }, [categoryFilter, productFilter, searchQuery]);

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Phase 3 Document & Storage Engine
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400">Reusable Template Engine</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Document Management & Sales Templates
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Single repository for product sales sheets, KRA/eTIMS references, signed MSAs, and interactive template generation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("library")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "library"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              Document Hub ({SEED_DOCUMENTS.length})
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "templates"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              Template Generator ({SEED_TEMPLATES.length})
            </button>
          </div>
        </div>

        {activeTab === "library" ? (
          /* Document Library View */
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  {["ALL", "SALES_SHEET", "CONTRACT", "TECHNICAL_SPEC"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategoryFilter(c)}
                      className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                        categoryFilter === c
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      {c === "ALL" ? "All Categories" : c.replace("_", " ")}
                    </button>
                  ))}
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search files or tags..."
                    className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Product Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] text-slate-500 font-medium">Product Filter:</span>
                {[
                  { slug: "ALL", label: "All Products" },
                  { slug: "adversoft", label: "Adversoft" },
                  { slug: "vehisoft", label: "Vehisoft" },
                  { slug: "versandry", label: "Versandry" },
                  { slug: "lipatim", label: "LipaTim" },
                  { slug: "melio-rms", label: "Melio RMS" },
                ].map((p) => (
                  <button
                    key={p.slug}
                    onClick={() => setProductFilter(p.slug)}
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition ${
                      productFilter === p.slug
                        ? "bg-slate-800 text-white border border-slate-700"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded">
                        v{doc.version}.0
                      </span>
                    </div>

                    <h3 className="font-bold text-xs text-slate-100 mt-3 group-hover:text-indigo-200 transition-colors">
                      {doc.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono mt-1">{doc.fileName}</p>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {doc.productName}
                      </span>
                      <span className="text-[10px] text-slate-500">{doc.fileSizeFormatted}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {doc.tags.map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800/50 text-slate-400 border border-slate-800">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500">{doc.updatedAt}</span>
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Document Preview Modal */}
            {previewDoc && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-emerald-400" />
                      <h3 className="text-sm font-bold text-white">{previewDoc.title}</h3>
                    </div>
                    <button
                      onClick={() => setPreviewDoc(null)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Close
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed max-h-80 overflow-y-auto">
                    <p className="text-indigo-400 font-bold mb-2">Document Metadata Record</p>
                    <p>File Name: {previewDoc.fileName}</p>
                    <p>File Size: {previewDoc.fileSizeFormatted}</p>
                    <p>MIME Type: {previewDoc.mimeType}</p>
                    <p>Associated Product: {previewDoc.productName}</p>
                    <p>Revision Version: {previewDoc.version}.0</p>
                    <p>Tags: {previewDoc.tags.join(", ")}</p>
                    <p className="mt-4 text-slate-500">
                      [Document binary storage link is verified on cloud object bucket / AWS S3 / Cloudflare R2]
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setPreviewDoc(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Interactive Template Generator View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Template Selector & Variable Inputs */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Select Business Template
                </div>

                <div className="space-y-2">
                  {SEED_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition ${
                        selectedTemplate.id === tpl.id
                          ? "bg-indigo-950/40 border-indigo-500/40 text-indigo-200"
                          : "bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="font-semibold text-slate-100">{tpl.title}</div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{tpl.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Variables Form */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Customize Variables ({selectedTemplate.variables.length})</span>
                </div>

                <div className="space-y-3 text-xs">
                  {selectedTemplate.variables.map((v) => (
                    <div key={v.key}>
                      <label className="text-slate-400 font-medium">{v.label}</label>
                      <input
                        type="text"
                        value={templateVariables[v.key] ?? ""}
                        onChange={(e) => handleVariableChange(v.key, e.target.value)}
                        className="mt-1 w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Real-Time Rendered Document Preview */}
            <div className="lg:col-span-2 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedTemplate.title}</h3>
                    <p className="text-[11px] text-slate-400">Live rendered output with dynamic variable substitution</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? "Copied!" : "Copy Text"}</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto selection:bg-indigo-600">
                  {renderedContent}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>Versaly Template Engine v1.0</span>
                <span className="text-emerald-400 font-medium">Variables Replaced: 100%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
