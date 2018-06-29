function FolderDDManager(){};export function createFolderDropManager(){return new FolderDDManager}window.createFolderDropManager=createFolderDropManager;const proto=FolderDDManager.prototype;const w=window;w.requestFileSystem=w.requestFileSystem||w.webkitRequestFileSystem;w.resolveLocalFileSystemURL=w.webkitResolveLocalFileSystemURL||w.webkitResolveLocalFileSystemURL;proto.error=function(e){console.log('error',e);this.notifyListener({type:'error',error:e});throw e};proto.error_from_readentries=function(e){console.log('error_from_readentries',e);this.notifyListener({type:'error',error:e});throw e};proto.traverseFileTree=function(item,path){path=path||'';var self=this;if(item.isFile){item.file(function(file){self.readFileText(file,item,path)},self.error.bind(self))}else if(item.isDirectory){var dirReader=item.createReader();dirReader.readEntries(function(entries){const fileInfo={item,isFile:false,isDirectory:true,fullPath:item.fullPath,entries};self.notifyListener({type:'read',file:fileInfo});if(entries)for(var i=0;i<entries.length;i++){self.traverseFileTree(entries[i],path+item.name+'/')}},self.error_from_readentries.bind(self))}};proto.isBinary=function(str){if(str.length<3){return false}for(var i=2;i<Math.min(str.length-1,100);i++){if(str.charCodeAt(i)>=65533){return true}}return false};proto.readFileText=function(file,item,path){var reader=new FileReader;var self=this;reader.readAsText(file);reader.addEventListener('loadend',function(e){var isBinary=self.isBinary(reader.result);const fileInfo={file,fullPath:item.fullPath,item,isDirectory:item.isDirectory,isBinary,isFile:item.isFile,content:undefined};if(isBinary){}else{fileInfo.content=reader.result.toString()}self.notifyListener({type:'read',file:fileInfo})})};proto.emitFileEventFinish=function(fn){this.lastFileEventTime=performance.now();this.emitFileEventFinishTimer=setInterval(()=>{if(performance.now()-this.emitFileEventFinishTimer>1e3){clearInterval(this.emitFileEventFinishTimer);this.notifyListener({type:'finish'})}},1e3)};proto.notifyListener=function(e){this.emitFileEventFinish=performance.now();this.listener(e)};proto.handleDrop=function(evt){evt.stopPropagation();evt.preventDefault();this.emitFileEventFinish(()=>{this.listener({type:'finish'})});var items=evt.dataTransfer.items||evt.dataTransfer.files;for(var i=0;i<items.length;i++){var item=items[i].getAsEntry?items[i].getAsEntry():items[i].webkitGetAsEntry?items[i].webkitGetAsEntry():undefined;if(item){this.traverseFileTree(item)}}};proto.handleDragOver=function(evt){evt.stopPropagation();evt.preventDefault();evt.dataTransfer.dropEffect='copy'};proto.install=function(el,listener){this.listener=listener;this.handleDropListenerFn=this.handleDrop.bind(this);this.handleDragOverListenerFn=this.handleDragOver.bind(this);el.addEventListener('drop',this.handleDropListenerFn,false);el.addEventListener('dragover',this.handleDragOverListenerFn,false)};proto.uninstall=function(el,listener){delete this.listener;el.removeEventListener('drop',this.handleDropListenerFn,false);el.addEventListener('dragover',this.handleDragOverListenerFn,false)}