// This is where the major conversion happens;
// we use values we have selected as valid schema types
// and map them to the right GraphQL type

import ts from "typescript";
import { checkTypeNodeInSelectedSchemaInterfaces } from "./valid-interface-selector";
import { generateQraphQLSchemaName } from "./schema-generator";

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
  targetInterface: ts.InterfaceDeclaration
): boolean {
  return (
    ts.isTypeReferenceNode(typeReferencedNode) &&
    ts.isIdentifier(typeReferencedNode.typeName) &&
    typeReferencedNode.typeName.getText() === targetInterface.name.getText()
  );
}
export function scanInterfaceProperties(node: ts.InterfaceDeclaration) {
  const properties = node.members.filter(ts.isPropertySignature);
  return properties;
}

function isBooleanType(typeNode: ts.TypeNode): boolean {
  return (
    typeNode.kind === ts.SyntaxKind.BooleanKeyword ||
    (typeNode.kind === ts.SyntaxKind.TypeReference &&
      typeNode.getText() === "boolean")
  );
}

function isNumberType(typeNode: ts.TypeNode): boolean {
  return (
    typeNode.kind === ts.SyntaxKind.NumberKeyword ||
    typeNode.kind === ts.SyntaxKind.BigIntKeyword ||
    (typeNode.kind === ts.SyntaxKind.TypeReference &&
      typeNode.getText() === "number")
  );
}

function isStringType(typeNode: ts.TypeNode): boolean {
  return (
    typeNode.kind === ts.SyntaxKind.StringKeyword ||
    (typeNode.kind === ts.SyntaxKind.TypeReference &&
      typeNode.getText() === "string")
  );
}

function isInterfaceType(typeNode: ts.TypeNode): boolean {
  return typeNode.kind === ts.SyntaxKind.InterfaceDeclaration;
}

function getPropertyType(node: ts.PropertySignature) {
  return node.type!;
}

export function convertNodeTypeGraphQLType(
  typeNode: ts.TypeNode
): string | undefined {
  if (
    isNumberType(typeNode) ||
    isBooleanType(typeNode) ||
    isStringType(typeNode)
  ) {
    return typeMapping[typeNode.getText()];
  }
  if (isInterfaceType(typeNode)) {
    const typeNodeSchemaInterface =
      checkTypeNodeInSelectedSchemaInterfaces(typeNode);

    return (
      typeNodeSchemaInterface &&
      generateQraphQLSchemaName(
        typeNodeSchemaInterface.interfaceName,
        typeNodeSchemaInterface.intendedSchemaTyping
      )
    );
  }
  return undefined;
}
