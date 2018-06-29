# Running TypeScript compiler in the Browser

# See it in action

 * [Demo](https://cancerberosgx.github.io/folder-drop-manager/)

# Install

```sh
npm install --save folder-drop-manager
```

Or you can grab the browser AMD / UMD version from dist/umd/src/index.js and load it using a script tag in your html. 

# Examples

 * Using Normal (commonsjs) bundle [Demo](https://cancerberosgx.github.io/folder-drop-manager/)
 * Using UMD bundle  TODO
 * Using MJS (ES modules) bundle  TODO


```typescript 
import {FolderDDManager} from 'folder-drop-manager'

let files: ProgramFile[] = [] // we collect the files and build a new Example (TODO do it better)
let folderDDManager: FolderDropManager
const folderDDListener = function (event: FolderDropManagerEvent) {
  if(event.type==='finish'){
    console.log('finish files : '+files.map(f=>f.fileName));
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
  else if (event.file.isFile) {
    files.push({fileName: event.file.fullPath, content: event.file.content})
  }
}
const folderDDManager = createFolderDropManager()
folderDDManager.install(document.getElementById('tsProjectFolderDropArea'), folderDDListener)
```

# Development

```
npm run build
npm run all 
That last one will generate a production ready distribution in ./docs
```
