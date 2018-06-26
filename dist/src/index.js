"use strict";
// TODO: this is old js - adapt to typescript or get a better lib
// working in chrome and firefox - put it in its own project!
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * a FolderDDManager instance can be installed on a DOm Element and mange all the files
 * (recursively) contained in a dropped folder by the user. Then it will work for collecting
 * all the file contents and returns (async) a structure of all the files. It will detect and
 * not extract content of binary files.
 * @class FolderDDManager
 */
function FolderDDManager() { }
;
function createFolderDropManager() {
    return new FolderDDManager();
}
exports.createFolderDropManager = createFolderDropManager;
window.createFolderDropManager = createFolderDropManager;
var proto = FolderDDManager.prototype;
var w = window;
w.requestFileSystem = w.requestFileSystem || w.webkitRequestFileSystem;
w.resolveLocalFileSystemURL = w.webkitResolveLocalFileSystemURL ||
    w.webkitResolveLocalFileSystemURL;
proto.error = function (e) {
    console.log('error', e);
    this.notifyListener({ type: 'error', error: e });
    throw e;
};
proto.error_from_readentries = function (e) {
    console.log('error_from_readentries', e);
    this.notifyListener({ type: 'error', error: e });
    throw e;
};
proto.traverseFileTree = function (item, path) {
    path = path || "";
    var self = this;
    if (item.isFile) {
        // Get file
        item.file(function (file) {
            self.readFileText(file, item, path);
        }, self.error.bind(self));
    }
    else if (item.isDirectory) {
        // Get folder contents
        var dirReader = item.createReader();
        dirReader.readEntries(function (entries) {
            var fileInfo = { item: item, isFile: false, isDirectory: true, fullPath: item.fullPath, entries: entries };
            self.notifyListener({ type: 'read', file: fileInfo });
            if (entries)
                for (var i = 0; i < entries.length; i++) {
                    self.traverseFileTree(entries[i], path + item.name + "/");
                }
        }, self.error_from_readentries.bind(self));
    }
};
/**
@method isBinary
*/
proto.isBinary = function (str) {
    //we guess by comparing form 3rd char to 100 for if charcode>=65533
    if (str.length < 3) {
        return false; //the problem are big binary files. 
    }
    for (var i = 2; i < Math.min(str.length - 1, 100); i++) {
        if (str.charCodeAt(i) >= 65533) {
            return true;
        }
    }
    return false;
};
/**
@method readFileText
*/
proto.readFileText = function (file, item, path) {
    var reader = new FileReader();
    var self = this;
    reader.readAsText(file);
    reader.addEventListener('loadend', function (e) {
        var isBinary = self.isBinary(reader.result);
        var fileInfo = { file: file, fullPath: item.fullPath, item: item, isDirectory: item.isDirectory, isBinary: isBinary, isFile: item.isFile, content: undefined };
        if (isBinary) {
            // console.log('BINARYFILE');
            // TODO: read binary
        }
        else {
            fileInfo.content = reader.result.toString();
        }
        self.notifyListener({ type: 'read', file: fileInfo });
    });
};
// TODO. a very very heuristic method to realize if the data transfer has finished (just a timeout). TODO: research and do this better.
proto.emitFileEventFinish = function (fn) {
    var _this = this;
    this.lastFileEventTime = performance.now();
    this.emitFileEventFinishTimer = setInterval(function () {
        if (performance.now() - _this.emitFileEventFinishTimer > 1000) {
            clearInterval(_this.emitFileEventFinishTimer);
            _this.notifyListener({ type: 'finish' });
        }
    }, 1000);
};
proto.notifyListener = function (e) {
    this.emitFileEventFinish = performance.now();
    this.listener(e);
};
proto.handleDrop = function (evt) {
    var _this = this;
    evt.stopPropagation();
    evt.preventDefault();
    this.emitFileEventFinish(function () {
        _this.listener({ type: 'finish' });
    });
    var items = evt.dataTransfer.items || evt.dataTransfer.files;
    for (var i = 0; i < items.length; i++) {
        var item = items[i].getAsEntry ? items[i].getAsEntry() : items[i].webkitGetAsEntry ? items[i].webkitGetAsEntry() : undefined;
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
proto.install = function (el, listener) {
    this.listener = listener;
    this.handleDropListenerFn = this.handleDrop.bind(this);
    this.handleDragOverListenerFn = this.handleDragOver.bind(this);
    el.addEventListener("drop", this.handleDropListenerFn, false);
    el.addEventListener("dragover", this.handleDragOverListenerFn, false);
};
proto.uninstall = function (el, listener) {
    delete this.listener;
    el.removeEventListener("drop", this.handleDropListenerFn, false);
    el.addEventListener("dragover", this.handleDragOverListenerFn, false);
};
