"use client";
import React from "react";
import { Code, Files, ChevronRight, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileNode {
    id: string;
    name: string;
    type: 'file' | 'folder';
    path: string;
    content?: string;
    children?: FileNode[];
    isOpen?: boolean;
}

const FileTreeItem = ({
    node,
    activeFileId,
    onFileClick,
    onFolderToggle,
    level = 0
}: {
    node: FileNode,
    activeFileId: string | null,
    onFileClick: (id: string) => void,
    onFolderToggle: (path: string) => void,
    level?: number
}) => {
    const isFile = node.type === 'file';
    const isActive = activeFileId === node.id;

    return (
        <div className="flex flex-col">
            <div
                onClick={() => isFile ? onFileClick(node.id) : onFolderToggle(node.path)}
                data-node-id={node.id}
                data-node-path={node.path}
                data-node-type={node.type}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs transition-colors group",
                    isActive ? "bg-blue-500/20 text-blue-400" : "hover:bg-white/5 text-gray-400 hover:text-gray-200"
                )}
                style={{ paddingLeft: `${level * 12 + 12}px` }}
            >
                {!isFile && (
                    <ChevronRight
                        size={14}
                        className={cn("transition-transform", node.isOpen && "rotate-90")}
                    />
                )}
                {isFile ? (
                    <Code size={14} className={isActive ? "text-blue-400" : "text-gray-500"} />
                ) : (
                    <Files size={14} className="text-gray-500" />
                )}
                <span className="truncate">{node.name}</span>
            </div>
            {!isFile && node.isOpen && node.children?.map(child => (
                <FileTreeItem
                    key={child.id}
                    node={child}
                    activeFileId={activeFileId}
                    onFileClick={onFileClick}
                    onFolderToggle={onFolderToggle}
                    level={level + 1}
                />
            ))}
        </div>
    );
};

interface FileExplorerProps {
    fileTree: FileNode[];
    activeFileId: string | null;
    onFileClick: (id: string) => void;
    onFolderToggle: (path: string) => void;
    onCreateFile: () => void;
    onCreateFolder: () => void;
}

export function FileExplorer({
    fileTree,
    activeFileId,
    onFileClick,
    onFolderToggle,
    onCreateFile,
    onCreateFolder
}: FileExplorerProps) {
    return (
        <div className="flex flex-col h-full bg-[#0d0d0d] border-r border-white/5 w-64 select-none">
            <div className="p-4 flex items-center justify-between border-b border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Explorer</span>
                <div className="flex items-center gap-1">
                    <button onClick={onCreateFile} className="p-1 hover:bg-white/10 rounded-md text-gray-400 transition-colors" title="New File">
                        <Plus size={14} />
                    </button>
                    <button onClick={onCreateFolder} className="p-1 hover:bg-white/10 rounded-md text-gray-400 transition-colors" title="New Folder">
                        <Files size={14} className="scale-75" />
                    </button>
                    <button className="p-1 hover:bg-white/10 rounded-md text-gray-400 transition-colors" title="Refresh">
                        <Search size={14} className="scale-90" />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto pt-2">
                {fileTree.map(node => (
                    <FileTreeItem
                        key={node.id}
                        node={node}
                        activeFileId={activeFileId}
                        onFileClick={onFileClick}
                        onFolderToggle={onFolderToggle}
                    />
                ))}
            </div>
        </div>
    );
}
