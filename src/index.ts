// TODO: this is old js - adapt to typescript or get a better lib
// working in chrome and firefox - put it in its own project!

// interface FolderDropManagerConstructor { new () : FolderDropManager }
export interface FolderDropManager {
  install(el: HTMLElement, listener: (e: FolderDropManagerEvent) => void)
  uninstall(el: HTMLElement, listener: (e: FolderDropManagerEvent) => void)
}
export interface FolderDropManagerEvent {
  type: 'read' | 'error' | 'finish'
  file?: FolderDropManagerFile
  error?: Error
}
export interface FolderDropManagerFile {
  fullPath: string
  isDirectory: boolean
  isFile: boolean
  entries?: FolderDropManagerFileEntry[]
  isBinary?: boolean
  content?: string | ArrayBuffer
  item: FolderDropManagerFileEntry
  file?: FolderDropManagerFileFile
}

export interface FolderDropManagerFileFile {
  lastModified: number
  lastModifiedDate: Date
  name: string
  size: number
  type: string
}
export interface FolderDropManagerFileEntry {
  fullPath: string
  isDirectory: boolean
  isFile: boolean
  name: string
}

export interface FolderDropManagerConfig {
  /** if true will read files as array buffer - see property FolderDropManagerFile.content */
  readAs?: 'string' | 'ByteArray' | 'DataURL'
}
/**
 * a FolderDDManager instance can be installed on a DOm Element and mange all the files 
 * (recursively) contained in a dropped folder by the user. Then it will work for collecting 
 * all the file contents and returns (async) a structure of all the files. It will detect and 
 * not extract content of binary files. 
 * @class FolderDDManager
 */
function FolderDDManager(config: FolderDropManagerConfig = { readAs: 'DataURL' }) {
  this.config = config
};
export function createFolderDropManager(config: FolderDropManagerConfig = { readAs: 'DataURL' }): FolderDropManager {
  return new FolderDDManager(config)
}
(window as any).createFolderDropManager = createFolderDropManager;

const proto = FolderDDManager.prototype;

const w = (window as any)
w.requestFileSystem = w.requestFileSystem || w.webkitRequestFileSystem;
w.resolveLocalFileSystemURL = w.webkitResolveLocalFileSystemURL ||
  w.webkitResolveLocalFileSystemURL;

proto.error = function (e) {
  console.log('error', e);
  this.notifyListener({ type: 'error', error: e })
  throw e
};
proto.error_from_readentries = function (e) {
  console.log('error_from_readentries', e);
  this.notifyListener({ type: 'error', error: e })
  throw e
};
proto.traverseFileTree = function (item: any/*{file: File}*/, path) {
  path = path || "";
  if (item.isFile) {
    // Get file
    (item).file(file =>
      this.readFileContents(file, item, path)

      , this.error.bind(this)
    )
  } else if (item.isDirectory) {

    // Get folder contents
    var dirReader = item.createReader();
    dirReader.readEntries(entries => {

      const fileInfo = { item, isFile: false, isDirectory: true, fullPath: item.fullPath, entries }
      this.notifyListener({ type: 'read', file: fileInfo })

      if (entries)
        for (var i = 0; i < entries.length; i++) {
          this.traverseFileTree(entries[i], path + item.name + "/");
        }
    }
      , this.error_from_readentries.bind(this)
    );
  }
};
/**
@method readFileContents
*/
proto.readFileContents = function (file, item: any/* WebKitFileEntry*/, path) {
  var reader = new FileReader();
  const handler = (reader) => {
    const fileInfo = { file, fullPath: item.fullPath, item, isDirectory: item.isDirectory,  isFile: item.isFile, content: reader.result }
    this.notifyListener({ type: 'read', file: fileInfo })
  }
  if (this.config.readAs === 'DataURL') {
  reader.addEventListener('loadend', (e) => handler(reader))
    reader.readAsDataURL(file);
  }
  else if (this.config.readAs === 'ByteArray') {

    reader.readAsArrayBuffer(file)
  }
  else {
    reader.readAsText(file);
  }
};

// TODO. a very very heuristic method to realize if the data transfer has finished (just a timeout). TODO: research and do this better.
proto.emitFileEventFinish = function (fn) {
  this.emitFileEventFinishTimer = setInterval(() => {
    if (performance.now() - this.emitFileEventFinishTimer > 1000) {
      clearInterval(this.emitFileEventFinishTimer)
      this.notifyListener({ type: 'finish' })
    }
  }, 1000)
}
proto.notifyListener = function (e) {
  this.listener(e)
}

proto.handleDrop = function (evt: DragEvent) {
  evt.stopPropagation();
  evt.preventDefault();
  this.emitFileEventFinish(() => {
    this.listener({ type: 'finish' })
  })
  var items = evt.dataTransfer.items || evt.dataTransfer.files;
  for (var i = 0; i < items.length; i++) {
    var item = (items[i] as any).getAsEntry ? (items[i] as any).getAsEntry() : (items[i] as DataTransferItem).webkitGetAsEntry ? (items[i] as DataTransferItem).webkitGetAsEntry() : undefined;
    if (item) {
      this.traverseFileTree(item);
    }
  }
};

proto.handleDragOver = function (evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy';
};
/**
@method install 
@param el HTMLElement
@param listener Function
*/
proto.install = function (el: HTMLElement, listener) {
  this.listener = listener;
  this.handleDropListenerFn = this.handleDrop.bind(this)
  this.handleDragOverListenerFn = this.handleDragOver.bind(this)
  el.addEventListener("drop", this.handleDropListenerFn, false);
  el.addEventListener("dragover", this.handleDragOverListenerFn, false);
};


proto.uninstall = function (el: HTMLElement, listener) {
  delete this.listener
  el.removeEventListener("drop", this.handleDropListenerFn, false);
  el.addEventListener("dragover", this.handleDragOverListenerFn, false);
};