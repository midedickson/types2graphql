import ts from "typescript";
import { IValidSchemaInterface } from "./IValidSchemaInterface";
import {
  convertNodeTypeGraphQLType,
  scanInterfaceProperties,
} from "./interface-scanner";
import { typing } from "./typing-enum";

export function convertInterfaceToGraphQLSchema(
  validSchemaInterface: IValidSchemaInterface
): string {
  return handleGrahQlConversion(validSchemaInterface);
}

export function generateQraphQLSchemaName(
  interfaceName: string,
  type: typing.TYPE | typing.INPUT
): string {
  // gnenrate the schema name based on the graph typing type
  return `${interfaceName}${type === typing.TYPE ? "Type" : "Input"}`;
}

function handleGrahQlConversion(
  validSchemaInterface: IValidSchemaInterface
): string {
  const graphQLSchemaName = generateQraphQLSchemaName(
    validSchemaInterface.interfaceName,
    validSchemaInterface.intendedSchemaTyping
  );
  const graphQLSchemaDeclaration = `${
    validSchemaInterface.intendedSchemaTyping === typing.TYPE ? "type" : "input"
  } ${graphQLSchemaName}`;
  const properties = scanInterfaceProperties(
    validSchemaInterface.interfaceDeclaration
  );
  const graphQLSchemaBody = generateQraphQLSchemaBody(properties);
  return `${graphQLSchemaDeclaration} ${graphQLSchemaBody}`;
}

function generateQraphQLSchemaBody(properties: ts.PropertySignature[]) {
  var validGraphQLPairs: string[] = [];
  properties.forEach((property) => {
    // check that property type is not undefined
    if (property.type) {
      const conversionResult = convertNodeTypeGraphQLType(property.type);
      // check that we can convert the required TypeNode
      conversionResult &&
        validGraphQLPairs.push(`
        ${property.name.getText()}: ${convertNodeTypeGraphQLType(property.type)}
        `);
    }
  });

  return validGraphQLPairs.join("\n");
}
