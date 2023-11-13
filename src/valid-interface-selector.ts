// Import typescript to work with AST (Abstract Syntax Tree)
import ts from "typescript";
import { IValidSchemaInterface } from "./IValidSchemaInterface";
import { typing } from "./typing-enum";
import { getText } from "./text-printer";
import { compareTypeReferencedNameWithInterface } from "./interface-scanner";

var validSchemaInterfaces: IValidSchemaInterface[] = [];

// When we encounter a TypeNode that is not the basic data types:
// (string, number, boolean), we want to check if that Node has an interface
// that exists in the previously selected valid schema interfaces
export function checkTypeNodeInSelectedSchemaInterfaces(
  node: ts.TypeNode,
  sourceFile: ts.SourceFile
): IValidSchemaInterface | undefined {
  return validSchemaInterfaces.find((v) =>
    compareTypeReferencedNameWithInterface(
      getText(node, sourceFile),
      v.interfaceName
    )
  );
}

// variation of the `checkTypeNodeInSelectedSchemaInterfaces` function
// but checking with the interface name directly instead.
export function checkTypeNodeStringInSelectedSchemaInterfaces(
  nodeName: string
): IValidSchemaInterface | undefined {
  return validSchemaInterfaces.find((v) =>
    compareTypeReferencedNameWithInterface(nodeName, v.interfaceName)
  );
}

export function getValidSchemaInterfaces(): IValidSchemaInterface[] {
  return validSchemaInterfaces;
}

export function clearSelectedSchemaInterfaces(): void {
  // Set the length of the validSchemaInterfaces to 0
  validSchemaInterfaces.length = 0;
}

export function selectValidSchemaInterfaces(
  interfaceDeclarations: ts.InterfaceDeclaration[],
  sourceFile: ts.SourceFile
) {
  for (var i = 0; i < interfaceDeclarations.length; i++) {
    const interfaceExists = checkInterfaceExistsInSelectedSchemas(
      interfaceDeclarations[i]
    );
    if (!interfaceExists) {
      const validInterfaceCheck = convertInterfaceDeclarationToInterfaceSchema(
        interfaceDeclarations[i],
        sourceFile
      );
      validInterfaceCheck && validSchemaInterfaces.push(validInterfaceCheck);
    }
  }
}

export function checkInterfaceExistsInSelectedSchemas(
  node: ts.InterfaceDeclaration
): IValidSchemaInterface | undefined {
  return validSchemaInterfaces.find((v) => v.interfaceDeclaration == node);
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
    sourceFile,
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
