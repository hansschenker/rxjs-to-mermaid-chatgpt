import * as ts from 'typescript';

export interface PipelineStage {
  operator: string;
  args: string;
  inputType: string;
  outputType: string;
}

export function extractPipelineStagesWithTypes(code: string): PipelineStage[] {
  const host = ts.createCompilerHost({}, true);
  const fileName = 'pipeline.ts';
  host.getSourceFile = (filePath) =>
    filePath === fileName
      ? ts.createSourceFile(fileName, code, ts.ScriptTarget.ESNext, true)
      : undefined;
  const program = ts.createProgram([fileName], { strict: true, target: ts.ScriptTarget.ESNext, lib: ['esnext'] }, host);
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(fileName)!;
  const stages: PipelineStage[] = [];

  function visit(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'pipe'
    ) {
      for (const arg of node.arguments) {
        if (ts.isCallExpression(arg) && ts.isIdentifier(arg.expression)) {
          const opName = arg.expression.text;
          const argsText = arg.arguments.map(a => a.getText(sourceFile)).join(', ');
          const sig = checker.getResolvedSignature(arg)!;
          const [paramSym] = sig.getParameters();
          const input = checker.getTypeOfSymbolAtLocation(paramSym, arg);
          const output = sig.getReturnType();
          stages.push({
            operator: opName,
            args: argsText,
            inputType: checker.typeToString(input),
            outputType: checker.typeToString(output)
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return stages;
}

export function generateTypedMermaid(code: string, sourceLabel = 'Source', sinkLabel = 'Output'): string {
  const stages = extractPipelineStagesWithTypes(code);
  const lines = ['flowchart TD', `  A0[${sourceLabel} : any]`];

  stages.forEach((s, i) => {
    const inId = i === 0 ? 'A0' : `A${i}`;
    const outId = `A${i + 1}`;
    lines.push(`  ${outId}[${s.operator}(${s.args}) : ${s.inputType} → ${s.outputType}]`);
    lines.push(`  ${inId} --> ${outId}`);
  });

  const last = `A${stages.length}`;
  lines.push(`  ${last} --> A${stages.length + 1}[${sinkLabel} : any]`);
  return lines.join('\n');
}
