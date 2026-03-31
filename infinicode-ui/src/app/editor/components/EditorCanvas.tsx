"use client";
import React from "react";
import Editor from "@monaco-editor/react";
import { ShieldAlert } from "lucide-react";

interface EditorCanvasProps {
    userRole: string | null;
    editorTheme: string;
    activeFile: any;
    codeContent: string;
    onCodeChange: (value: string) => void;
}

export function EditorCanvas({
    userRole,
    editorTheme,
    activeFile,
    codeContent,
    onCodeChange
}: EditorCanvasProps) {
    const getLanguage = () => {
        const ext = (activeFile?.name || 'scratch.ts').split('.').pop()?.toLowerCase();
        const langMap: { [k: string]: string } = {
            ts: 'typescript', tsx: 'typescript',
            js: 'javascript', jsx: 'javascript',
            py: 'python', java: 'java',
            cpp: 'cpp', c: 'c',
            html: 'html', css: 'css',
            json: 'json', md: 'markdown',
            go: 'go', rs: 'rust', php: 'php', rb: 'ruby'
        };
        return langMap[ext || ''] || 'plaintext';
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden relative bg-[#0d0d0d]">
            {userRole === 'viewer' && (
                <div className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-lg text-xs font-medium flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5" /> Read-only Mode
                </div>
            )}
            <div className="flex-1 w-full h-full pt-2">
                <Editor
                    height="100%"
                    theme={editorTheme}
                    path={activeFile?.path || 'scratch.ts'}
                    language={getLanguage()}
                    value={codeContent}
                    onChange={(val) => onCodeChange(val || "")}
                    beforeMount={(monaco) => {
                        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                            noSemanticValidation: true,
                            noSyntaxValidation: false,
                        });
                        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                            noSemanticValidation: true,
                            noSyntaxValidation: false,
                        });
                        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                            allowNonTsExtensions: true,
                            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                            target: monaco.languages.typescript.ScriptTarget.ES2020,
                            jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
                            allowJs: true,
                            checkJs: false,
                        });
                    }}
                    options={{
                        minimap: { enabled: true },
                        fontSize: 14,
                        fontFamily: 'JetBrains Mono, monospace',
                        lineNumbers: 'on',
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        readOnly: userRole === 'viewer',
                        automaticLayout: true,
                        padding: { top: 16 },
                        quickSuggestions: true,
                        suggestOnTriggerCharacters: true,
                    }}
                />
            </div>
        </div>
    );
}
