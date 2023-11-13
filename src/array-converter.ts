import ts from "typescript";
import { getText } from "./text-printer";
import { typeMapping } from "./interface-scanner";

interface ArrayDescription {
  element: string;
  elementGraphQLType?: string;
  nested: number;
}

export const describeArray = (
  node: ts.TypeNode,
  sourceFile: ts.SourceFile
): ArrayDescription => {
  let nodetext = getText(node, sourceFile);
  let arrayPopCount = 0;
  while (nodetext.includes("[]")) {
    nodetext = nodetext.slice(0, nodetext.length - 2);
    arrayPopCount++;
  }
  return {
    element: nodetext,
    elementGraphQLType: typeMapping[nodetext],
    nested: arrayPopCount,
  };
};

export const getGraphQLArrayFromArrayDescription = (
  arrayDescription: ArrayDescription
): string | undefined => {
  let baseTypeName = arrayDescription.elementGraphQLType;
  for (let i = 0; i < arrayDescription.nested; i++) {
    baseTypeName = `[${baseTypeName}]`;
  }
  return baseTypeName;
};
