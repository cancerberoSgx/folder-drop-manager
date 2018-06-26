# Running TypeScript compiler in the Browser

# See it in action

[Demo](https://cancerberosgx.github.io/folder-drop-manager/)

## Install

```sh
npm install --save folder-drop-manager
```


```typescrcipt
let files: ProgramFile[] = [] // we collect the files and build a new Example (TODO do it better)
let folderDDManager: FolderDropManager
const folderDDListener = function (event: FolderDropManagerEvent) {
  if(event.type==='finish'){
    console.log('finish files : '+files.map(f=>f.fileName));
    debugger;
    const newExample: Example = {
      id: 'dropped_'+performance.now(),
      name: 'A folder just dropped',
      description: 'user\'s local TS project dropped from FS',
      files, 
      exampleSource: files[0],
      execute(){}
    }
    executeExample(newExample)
  }
  //TODO event.type==='error
  else if (event.file.isFile) {
    files.push({fileName: event.file.fullPath, content: event.file.content})
  }
}
getRenderEmitter().on('afterRender', () => {
  folderDDManager = createFolderDropManager().install(document.getElementById('tsProjectFolderDropArea'), folderDDListener)
})
getRenderEmitter().on('beforeRender', () => {
  if (folderDDManager) {
    folderDDManager.uninstall(document.getElementById('tsProjectFolderDropArea'), folderDDListener)
  }
})

```




That last one will generate a production ready distribution in ./docs

# Independent examples

