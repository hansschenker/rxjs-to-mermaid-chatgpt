# rxjs-to-mermaid

A TypeScript library to generate **static** and **dynamic** Mermaid diagrams from RxJS pipelines.

- **StaticMermaid**: Document operator behavior via TypeScript AST introspection.
- **DynamicMermaid**: Debug runtime flow by instrumenting your pipeline.

Local Development & Installation

To install and test the library locally before publishing, you have two main options:
cd /path/to/rxjs-to-mermaid      # navigate to library root
npm install                      # install dependencies
npm run build                    # build the library
npm link                         # create a global symlink

cd /path/to/your-project         # navigate to your consuming project
npm link rxjs-to-mermaid         # link the local library

cd /path/to/your-project
npm install /path/to/rxjs-to-mermaid

## Installation

```bash
npm install rxjs-to-mermaid

import {
  generateTypedMermaid,
  resetDynamicDiagram,
  pipeWithInstrumentation,
  getDynamicDiagram
} from 'rxjs-to-mermaid';

// Static documentation
const code = `source$.pipe(map(x => x * 2), filter(x => x > 0))`;
console.log(generateTypedMermaid(code));

// Dynamic debugging
import { of, map, filter, scan } from 'rxjs';

pipeWithInstrumentation(
  of(1,2,3),
  map(x => x * 2),
  filter(x => x > 0),
  scan((acc, x) => acc + x, 0)
).subscribe({ complete() {
  console.log('```mermaid');
  console.log(getDynamicDiagram());
  console.log('```');
}});


### 2. Mermaid CLI

```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i diagram.mmd -o diagram.svg

4. Online Editor

Use: https://mermaid.live/

5. VS Code Preview

Install Markdown Preview Mermaid Support or vscode-markdown-mermaid, then preview with Ctrl+Shift+V.

Main contributor: ChatGPT
