import ts from "typescript";
import { IValidSchemaInterface } from "./IValidSchemaInterface";
import {
  convertNodeTypeGraphQLType,
  scanInterfaceProperties,
} from "./interface-scanner";
import { typing } from "./typing-enum";
import { getText } from "./text-printer";

export function convertInterfaceToGraphQLSchema(
  validSchemaInterface: IValidSchemaInterface
): string {
  return handleGrahQLConversion(validSchemaInterface);
}

export function generateGraphQLSchemaName(
  interfaceName: string,
  type: typing.TYPE | typing.INPUT
): string {
  // gnenrate the schema name based on the graph typing type
  return `${interfaceName}${type === typing.TYPE ? "Type" : "Input"}`;
}

function handleGrahQLConversion(
  validSchemaInterface: IValidSchemaInterface
): string {
  const graphQLSchemaName = generateGraphQLSchemaName(
    validSchemaInterface.interfaceName,
    validSchemaInterface.intendedSchemaTyping
  );
  const graphQLSchemaDeclaration = `${
    validSchemaInterface.intendedSchemaTyping === typing.TYPE ? "type" : "input"
  } ${graphQLSchemaName}`;
  const properties = scanInterfaceProperties(
    validSchemaInterface.interfaceDeclaration
  );
  const graphQLSchemaBody = generateGraphQLSchemaBody(
    properties,
    validSchemaInterface.sourceFile
  );
  return `${graphQLSchemaDeclaration} {\n${graphQLSchemaBody}\n}`;
}

function generateGraphQLSchemaBody(
  properties: ts.PropertySignature[],
  sourceFile: ts.SourceFile
) {
  var validGraphQLPairs: string[] = [];
  properties.forEach((property) => {
    // check that property type is not undefined
    if (property.type) {
      const optional = property.questionToken;
      const conversionResult = convertNodeTypeGraphQLType(
        property.type,
        sourceFile
      );
      // check that we can convert the required TypeNode
      conversionResult &&
        validGraphQLPairs.push(
          `  ${getText(property.name, sourceFile)}: ${conversionResult}${
            optional ? "" : "!"
          }`
        );
    }
  });

  return validGraphQLPairs.join("\n");
}
