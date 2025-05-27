import { Observable, OperatorFunction } from 'rxjs';

let dynamicLines: string[] = [];
let dynamicCount = 0;
let dynamicSinkValues: any[] = [];
let dynamicDiagramFinalized = false;

export function resetDynamicDiagram(sourceLabel = 'Source', sourceValues?: any[]): void {
  dynamicSinkValues = [];
  dynamicDiagramFinalized = false;
  let label = sourceLabel;
  if (Array.isArray(sourceValues)) {
    label += `: ${JSON.stringify(sourceValues)}`;
  }
  dynamicLines = ['flowchart TD', `  A0[${label}]`];
  dynamicCount = 0;
}

export function instrument<T, R>(op: OperatorFunction<T, R>, label: string): OperatorFunction<T, R> {
  return (source: Observable<T>) =>
    new Observable<R>(subscriber => {
      const inId = `A${dynamicCount}`;
      const outId = `A${++dynamicCount}`;
      dynamicLines.push(`  ${outId}[${label}]`);
      dynamicLines.push(`  ${inId} --> ${outId}`);

      const sub = source.pipe(op).subscribe({
        next: v => subscriber.next(v),
        error: e => subscriber.error(e),
        complete: () => subscriber.complete()
      });
      return sub;
    });
}

// Accepts OperatorFunction or [OperatorFunction, label]
type OperatorOrLabeled = OperatorFunction<any, any> | [OperatorFunction<any, any>, string];

export function pipeWithInstrumentation<T>(
  source$: Observable<T>,
  ...operators: OperatorOrLabeled[]
): Observable<any> {
  // Try to extract source values if it's an 'of' observable (best effort)
  let sourceValues: any[] | undefined = undefined;
  if ((source$ as any).source && (source$ as any).source._subscribe && (source$ as any).source._subscribe.name === 'ofSubscribe') {
    // rxjs 'of' observable
    sourceValues = (source$ as any).source.array || undefined;
  }
  resetDynamicDiagram('Source', sourceValues);
  const ops: OperatorFunction<any, any>[] = operators.map(op => {
    if (Array.isArray(op)) {
      return instrument(op[0], op[1]);
    }
    return instrument(op, op.name || op.toString());
  });
  return new Observable<any>(subscriber => {
    const sinkVals: any[] = [];
    const piped$ = (source$ as any).pipe.apply(source$, ops);
    const sub = piped$.subscribe({
      next: (v: any) => {
        sinkVals.push(v);
        dynamicSinkValues.push(v);
        subscriber.next(v);
      },
      error: (e: any) => subscriber.error(e),
      complete: () => {
        dynamicDiagramFinalized = true;
        subscriber.complete();
      },
    });
    return sub;
  });
}


// export function pipeWithInstrumentation<T>(
//   source$: Observable<T>,
//   ...operators: [...OperatorFunction<any, any>[]]
// ): Observable<any> {
//   resetDynamicDiagram();
//   const ops: OperatorFunction<any, any>[] = operators.map(op => instrument(op, op.name || op.toString()));
    
//   return source$.pipe(...ops);
// }

export function getDynamicDiagram(sinkLabel = 'Output'): string {
  const lastId = `A${dynamicCount}`;
  let label = sinkLabel;
  if (Array.isArray(dynamicSinkValues) && dynamicSinkValues.length > 0) {
    label += `: ${JSON.stringify(dynamicSinkValues)}`;
  }
  // Prevent duplicate finalization
  if (!dynamicDiagramFinalized) {
    dynamicLines.push(`  ${lastId} --> A${dynamicCount + 1}[${label}]`);
    dynamicDiagramFinalized = true;
  }
  return dynamicLines.join('\n');
}

// --- SAMPLE USAGE: Run pipeline with from([2,7,3,8,5,1,4]) ---
const { from, map, filter } = require('rxjs');

if (require.main === module) {
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
}
