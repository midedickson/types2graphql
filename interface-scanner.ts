// This is where the major conversion happens;
// we use values we have selected as valid schema types
// and map them to the right GraphQL type

import ts from "typescript";
import { checkTypeNodeInSelectedSchemaInterfaces } from "./valid-interface-selector";
import { generateGraphQLSchemaName } from "./schema-generator";
import { getText } from "./text-printer";

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

export function compareTypeReferencedNodeWithInterface(
  typeReferencedNode: ts.TypeNode,
  targetInterface: ts.InterfaceDeclaration,
  sourceFile: ts.SourceFile
): boolean {
  return (
    getText(typeReferencedNode, sourceFile) ===
    getText(targetInterface.name, sourceFile)
  );
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
  // todo: handle array type
  // todo: handle union type

  const typeNodeSchemaInterface = checkTypeNodeInSelectedSchemaInterfaces(
    typeNode,
    sourceFile
  );

  return (
    typeNodeSchemaInterface &&
    generateGraphQLSchemaName(
      typeNodeSchemaInterface.interfaceName,
      typeNodeSchemaInterface.intendedSchemaTyping
    )
  );
}
