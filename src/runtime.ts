import { Observable, OperatorFunction } from 'rxjs';

let dynamicLines: string[] = [];
let dynamicCount = 0;

export function resetDynamicDiagram(sourceLabel = 'Source'): void {
  dynamicLines = ['flowchart TD', `  A0[${sourceLabel}]`];
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

export function pipeWithInstrumentation<T>(
  source$: Observable<T>,
  ...operators: OperatorFunction<any, any>[]
): Observable<any> {
  resetDynamicDiagram();
  const ops: OperatorFunction<any, any>[] = operators.map(op => instrument(op, op.name || op.toString()));
  //@ts-ignore
  return source$.pipe(...ops);
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
  dynamicLines.push(`  ${lastId} --> A${dynamicCount + 1}[${sinkLabel}]`);
  return dynamicLines.join('\n');
}
