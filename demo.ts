import { from, map, filter } from 'rxjs';
import { pipeWithInstrumentation, getDynamicDiagram } from './src/runtime';

const result$ = pipeWithInstrumentation(
  from([2,7,3,8,5,1,4]),
  [map((x: number) => x + 1), 'map x => x + 1'],
  [filter((x: number) => x > 2), 'filter x > 2']
);

result$.subscribe({
  complete: () => {
    console.log(getDynamicDiagram());
  }
});
