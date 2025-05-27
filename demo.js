// Demo for rxjs-to-mermaid-chatgpt
const { from, map, filter } = require('rxjs');
const { pipeWithInstrumentation, getDynamicDiagram } = require('./src/runtime');

const result$ = pipeWithInstrumentation(
  from([2,7,3,8,5,1,4]),
  [map(x => x + 1), 'map x => x + 1'],
  [filter(x => x > 2), 'filter x > 2']
);

result$.subscribe({
  complete: () => {
    console.log(getDynamicDiagram());
  }
});
