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
export const checkTypeNodeInSelectedSchemaInterfaces = (
  node: ts.TypeNode,
  sourceFile: ts.SourceFile
): IValidSchemaInterface | undefined => {
  return validSchemaInterfaces.find((v) =>
    compareTypeReferencedNameWithInterface(
      getText(node, sourceFile),
      v.interfaceName
    )
  );
};

// variation of the `checkTypeNodeInSelectedSchemaInterfaces` function
// but checking with the interface name directly instead.
export const checkTypeNodeStringInSelectedSchemaInterfaces = (
  nodeName: string
): IValidSchemaInterface | undefined => {
  return validSchemaInterfaces.find((v) =>
    compareTypeReferencedNameWithInterface(nodeName, v.interfaceName)
  );
};

export const getValidSchemaInterfaces = (): IValidSchemaInterface[] =>
  validSchemaInterfaces;

export const clearSelectedSchemaInterfaces = (): void => {
  // Set the length of the validSchemaInterfaces to 0
  validSchemaInterfaces.length = 0;
};

export const selectValidSchemaInterfaces = (
  interfaceDeclarations: ts.InterfaceDeclaration[],
  sourceFile: ts.SourceFile
): void => {
  for (let i = 0; i < interfaceDeclarations.length; i++) {
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
};

export const checkInterfaceExistsInSelectedSchemas = (
  node: ts.InterfaceDeclaration
): IValidSchemaInterface | undefined =>
  validSchemaInterfaces.find((v) => v.interfaceDeclaration === node);

const convertInterfaceDeclarationToInterfaceSchema = (
  interfaceDeclaration: ts.InterfaceDeclaration,
  sourceFile: ts.SourceFile
): IValidSchemaInterface | undefined => {
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
};

const isTextPresent = (pattern: string, text: string) => {
  // Create a regex pattern with case-insensitive flag and whitespace handling
  const regexPattern = new RegExp(pattern.replace(/\s/g, "\\s*"), "i");

  // Test if the pattern is found in the text
  return regexPattern.test(text);
};

const getIntendedSchemaTyping = (
  interfaceDeclarationText: string
): typing.TYPE | typing.INPUT | typing.NONE => {
  const typePattern = "__kind:\\s*typing.TYPE";
  const inputPattern = "__kind:\\s*typing.INPUT";

  if (isTextPresent(typePattern, interfaceDeclarationText)) {
    return typing.TYPE;
  } else if (isTextPresent(inputPattern, interfaceDeclarationText)) {
    return typing.INPUT;
  } else {
    return typing.NONE;
  }
};

export const findAllInterfaceDeclarationsFromSourceFile = (
  sourceFile: ts.SourceFile
): ts.InterfaceDeclaration[] => {
  const interfaceDeclarations: ts.InterfaceDeclaration[] = [];
  const interfaces = sourceFile.statements.filter(ts.isInterfaceDeclaration);
  interfaces.forEach((node: ts.InterfaceDeclaration) => {
    if (!node.heritageClauses) {
      interfaceDeclarations.push(node);
    }
  });
  return interfaceDeclarations;
};
