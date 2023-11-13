// Import typescript to work with AST (Abstract Syntax Tree)
import ts from "typescript";

const printer = ts.createPrinter();

export const getText = (target: ts.Node, sourceFile: ts.SourceFile): string =>
  target
    ? printer.printNode(ts.EmitHint.Unspecified, target, sourceFile)
    : "unknown";
