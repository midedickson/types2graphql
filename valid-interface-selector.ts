// Import typescript to work with AST (Abstract Syntax Tree)
import ts from "typescript";
import { IValidSchemaInterface } from "./IValidSchemaInterface";
import { typing } from "./typing-enum";
import { getText } from "./text-printer";
import { compareTypeReferencedNodeWithInterface } from "./interface-scanner";

var validSchemaInterfaces: IValidSchemaInterface[] = [];

// when we encounter a TypeNode that is not the basec data types:
// (string, number, boolean), we want to check if that Node has an interface
// that exists in the previously selected valid schema interfaces
export function checkTypeNodeInSelectedSchemaInterfaces(
  node: ts.TypeNode
): IValidSchemaInterface | undefined {
  return validSchemaInterfaces.find((v) =>
    compareTypeReferencedNodeWithInterface(node, v.interfaceDeclaration)
  );
}

export function getValidSchemaInterfaces(): IValidSchemaInterface[] {
  return validSchemaInterfaces;
}

export function selectValidSchemaInterfaces(
  interfaceDeclarations: ts.InterfaceDeclaration[],
  sourceFile: ts.SourceFile
) {
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
): IValidSchemaInterface | undefined {
  // use the string representation of the interface declaration to get the intended schema information
  const interfaceDeclarationText = getText(interfaceDeclaration, sourceFile);
  const intendedSchemaTyping = getIntendedSchemaTyping(
    interfaceDeclarationText
  );
  // skip interface if it's not a schema type we want
  if (intendedSchemaTyping === typing.NONE) {
    return undefined;
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

export function findAllInterfaceDeclarationsFromSourceFile(
  sourceFile: ts.SourceFile
): ts.InterfaceDeclaration[] {
  var interfaceDeclarations: ts.InterfaceDeclaration[] = [];
  const interfaces = sourceFile.statements.filter(ts.isInterfaceDeclaration);
  interfaces.forEach((node: ts.InterfaceDeclaration) => {
    if (!node.heritageClauses) {
      interfaceDeclarations.push(node);
    }
  });
  return interfaceDeclarations;
}
