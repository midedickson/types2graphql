// Import typescript to work with AST (Abstract Syntax Tree)
import ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import { IValidSchemaInterface } from "./IValidSchemaInterface";
import { typing } from "./typing-enum";

const printer = ts.createPrinter();

// Use PropertySignature to collect property information for every node within an interface
function transformProperty(
  node: ts.PropertySignature,
  printer: ts.Printer
): string {
  const propertyName = printer.printNode(
    ts.EmitHint.Unspecified,
    node.name,
    node.getSourceFile()
  );
  const propertyType = node.type
    ? printer.printNode(
        ts.EmitHint.Unspecified,
        node.type,
        node.getSourceFile()
      )
    : "unknown";
  return `${propertyName}: ${propertyType}`;
}

// Use the `transformProperty` function to get all the types of an interface's properties
// Converts to GraphQL Type Schema
function transformInterface(node: ts.InterfaceDeclaration): string {
  const interfaceName = printer.printNode(
    ts.EmitHint.Unspecified,
    node.name,
    node.getSourceFile()
  );
  const properties = node.members
    .filter(ts.isPropertySignature)
    .map((property) =>
      transformProperty(property as ts.PropertySignature, printer)
    )
    .join("\n ");
  return `type ${interfaceName}Type {
  ${properties}
}`;
}

// Use the `transformProperty` function to get all the types of an interface's properties
// Converts to GraphQL Input Schema
function transformInterfaceToInput(node: ts.InterfaceDeclaration): string {
  const interfaceName = printer.printNode(
    ts.EmitHint.Unspecified,
    node.name,
    node.getSourceFile()
  );
  const properties = node.members
    .filter(ts.isPropertySignature)
    .map((property) =>
      transformProperty(property as ts.PropertySignature, printer)
    )
    .join("\n  ");

  return `input ${interfaceName}Input {
  ${properties}
}`;
}

function generateGraphQLSchema(sourceCode: string): string {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    sourceCode,
    ts.ScriptTarget.Latest
  );

  const types = sourceFile.statements
    .filter(ts.isInterfaceDeclaration)
    .map((node: ts.InterfaceDeclaration) => {
      if (node.heritageClauses) {
        return ""; // Skip interfaces with extends/implements
      }

      const interfaceName = printer.printNode(
        ts.EmitHint.Unspecified,
        node.name,
        node.getSourceFile()
      );
      const nodeText = printer.printNode(
        ts.EmitHint.Unspecified,
        node,
        sourceFile
      );
      console.log(nodeText);
      return nodeText.includes("__kind: typing.TYPE")
        ? transformInterface(node)
        : nodeText.includes("__kind: typing.INPUT")
        ? transformInterfaceToInput(node)
        : "";
    })
    .filter(Boolean);

  return types.join("\n\n");
}

export { typing, generateGraphQLSchema };
