export interface FolderDropManager {
    install(el: HTMLElement, listener: (e: FolderDropManagerEvent) => void): any;
    uninstall(el: HTMLElement, listener: (e: FolderDropManagerEvent) => void): any;
}
export interface FolderDropManagerEvent {
    type: 'read' | 'error' | 'finish';
    file?: FolderDropManagerFile;
    error?: Error;
}
export interface FolderDropManagerFile {
    fullPath: string;
    isDirectory: boolean;
    isFile: boolean;
    entries?: FolderDropManagerFileEntry[];
    isBinary?: boolean;
    content?: string;
    item: FolderDropManagerFileEntry;
    file?: FolderDropManagerFileFile;
}
export interface FolderDropManagerFileFile {
    lastModified: number;
    lastModifiedDate: Date;
    name: string;
    size: number;
    type: string;
}
export interface FolderDropManagerFileEntry {
    fullPath: string;
    isDirectory: boolean;
    isFile: boolean;
    name: string;
}
export declare function createFolderDropManager(): FolderDropManager;
