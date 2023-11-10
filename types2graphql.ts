// Import typescript to work with AST (Abstract Syntax Tree)
import ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import { IValidSchemaInterface } from "./IValidSchemaInterface";
import { typing } from "./typing-enum";

const printer = ts.createPrinter();

function getText(target: ts.Node, sourceFile: ts.SourceFile): string {
  return target
    ? printer.printNode(ts.EmitHint.Unspecified, target, sourceFile)
    : "unknown";
}

function selectValidSchemaInterfaces(
  interfaceDeclarations: ts.InterfaceDeclaration[],
  sourceFile: ts.SourceFile
) {
  var validSchemaInterfaces: IValidSchemaInterface[] = [];

  for (var i = 0; i < interfaceDeclarations.length; i++) {
    const validInterfaceCheck = convertInterfaceDeclarationToInterfaceSchema(
      interfaceDeclarations[i],
      sourceFile
    );
    validInterfaceCheck && validSchemaInterfaces.push(validInterfaceCheck);
  }
}

function convertInterfaceDeclarationToInterfaceSchema(
  interfaceDeclaration: ts.InterfaceDeclaration,
  sourceFile: ts.SourceFile
): IValidSchemaInterface | null {
  // use the string representation of the interface declaration to get the intended schema information
  const interfaceDeclarationText = getText(interfaceDeclaration, sourceFile);
  const intendedSchemaTyping = getIntendedSchemaTyping(
    interfaceDeclarationText
  );
  // skip interface if it's not a schema type we want
  if (intendedSchemaTyping === typing.NONE) {
    return null;
  }

  const interfaceName = getText(interfaceDeclaration.name, sourceFile);
  return {
    interfaceName,
    intendedSchemaTyping,
    interfaceDeclarationText,
    interfaceDeclaration,
  };
}

function getIntendedSchemaTyping(
  interfaceDeclarationText: string
): typing.TYPE | typing.INPUT | typing.NONE {
  if (interfaceDeclarationText.includes("__kind: typing.TYPE")) {
    return typing.TYPE;
  } else if (interfaceDeclarationText.includes("__kind: typing.INPUT")) {
    return typing.INPUT;
  } else {
    return typing.NONE;
  }
}

function findAllSchemaInterfacesInSourceFile(
  sourceFile: ts.SourceFile
): ts.InterfaceDeclaration[] {
  // Ensure to filter only interface declarations
  const interfaceDeclarations = sourceFile.statements.filter(
    ts.isInterfaceDeclaration
  );

  // Print the generated Abstract Interface Declaration
  console.log(interfaceDeclarations);
  return interfaceDeclarations;
}

function generateSourceFileFromSourceCode(sourceCode: string): ts.SourceFile {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    sourceCode,
    ts.ScriptTarget.Latest
  );

  return sourceFile;
}

function parseFileToSourceCode(filePath: string): string {
  // Read TypeScript code from a file
  const fullFilePath = path.join(__dirname, filePath);
  const sourceCode = fs.readFileSync(fullFilePath, "utf-8");

  // Print the parsed source code
  console.log(sourceCode);
  return sourceCode;
}
