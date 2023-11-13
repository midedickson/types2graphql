// This is where the major conversion happens;
// we use values we have selected as valid schema types
// and map them to the right GraphQL type

import ts from "typescript";
import { checkTypeNodeStringInSelectedSchemaInterfaces } from "./valid-interface-selector";
import { generateGraphQLSchemaName } from "./schema-generator";
import { getText } from "./text-printer";
import {
  describeArray,
  getGraphQLArrayFromArrayDescription,
} from "./array-converter";

interface TypeMapping {
  [key: string]: string;
}

export const typeMapping: TypeMapping = {
  string: "String",
  boolean: "Boolean",
  number: "Int",
};

export function detectNumberType(value: number): "Float" | "Int" {
  return Number.isInteger(value) ? "Int" : "Float";
}

export function compareTypeReferencedNameWithInterface(
  typeReferencedName: string,
  targetInterfaceName: string
): boolean {
  return targetInterfaceName === typeReferencedName;
}
export function scanInterfaceProperties(node: ts.InterfaceDeclaration) {
  const properties = node.members.filter(ts.isPropertySignature);
  return properties;
}

function isBooleanType(
  typeNode: ts.TypeNode,
  sourceFile: ts.SourceFile
): boolean {
  return (
    typeNode.kind === ts.SyntaxKind.BooleanKeyword ||
    (typeNode.kind === ts.SyntaxKind.TypeReference &&
      getText(typeNode, sourceFile) === "boolean")
  );
}

function isNumberType(
  typeNode: ts.TypeNode,
  sourceFile: ts.SourceFile
): boolean {
  return (
    typeNode.kind === ts.SyntaxKind.NumberKeyword ||
    typeNode.kind === ts.SyntaxKind.BigIntKeyword ||
    (typeNode.kind === ts.SyntaxKind.TypeReference &&
      getText(typeNode, sourceFile) === "number")
  );
}

function isStringType(
  typeNode: ts.TypeNode,
  sourceFile: ts.SourceFile
): boolean {
  return (
    typeNode.kind === ts.SyntaxKind.StringKeyword ||
    (typeNode.kind === ts.SyntaxKind.TypeReference &&
      getText(typeNode, sourceFile) === "string")
  );
}

function isInterfaceType(typeNode: ts.TypeNode): boolean {
  return typeNode.kind === ts.SyntaxKind.InterfaceKeyword;
}

function isArrayType(
  typeNode: ts.TypeNode,
  sourceFile: ts.SourceFile
): boolean {
  return (
    typeNode.kind === ts.SyntaxKind.ArrayType ||
    (typeNode.kind === ts.SyntaxKind.TypeReference &&
      getText(typeNode, sourceFile).includes("[]"))
  );
}

function getPropertyType(node: ts.PropertySignature) {
  return node.type!;
}

export function convertNodeTypeGraphQLType(
  typeNode: ts.TypeNode,
  sourceFile: ts.SourceFile
): string | undefined {
  if (
    isNumberType(typeNode, sourceFile) ||
    isBooleanType(typeNode, sourceFile) ||
    isStringType(typeNode, sourceFile)
  ) {
    return typeMapping[getText(typeNode, sourceFile)];
  }
  // handle array type
  if (isArrayType(typeNode, sourceFile)) {
    // todo: run algo to return correct array type
    const arrayDescription = describeArray(typeNode, sourceFile);
    if (arrayDescription.elementGraphQLType) {
      return getGraphQLArrayFromArrayDescription(arrayDescription);
    } else {
      // if the base array typeNode is none of the  basic data types, we then check if it is a valid schema else return undefined
      const typeNodeSchemaInterface =
        checkTypeNodeStringInSelectedSchemaInterfaces(arrayDescription.element);
      if (typeNodeSchemaInterface) {
        arrayDescription.elementGraphQLType = generateGraphQLSchemaName(
          typeNodeSchemaInterface.interfaceName,
          typeNodeSchemaInterface.intendedSchemaTyping
        );
        return getGraphQLArrayFromArrayDescription(arrayDescription);
      } else {
        return undefined;
      }
    }
  }
  // todo: handle union type

  // if the typeNode is none of the types above, we then check if it is a valid schema else return undefined
  const typeNodeSchemaInterface = checkTypeNodeStringInSelectedSchemaInterfaces(
    getText(typeNode, sourceFile)
  );

  return (
    typeNodeSchemaInterface &&
    generateGraphQLSchemaName(
      typeNodeSchemaInterface.interfaceName,
      typeNodeSchemaInterface.intendedSchemaTyping
    )
  );
}
