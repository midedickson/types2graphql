import { typing } from "./typing-enum";
import ts from "typescript";

// IValidSchemaInterface holds information about a valid schema interface found in the source code and its high-levl schema description.

export interface IValidSchemaInterface {
  interfaceName: string;
  intendedSchemaTyping: typing.TYPE | typing.INPUT;
  interfaceDeclarationText: string;
  interfaceDeclaration: ts.InterfaceDeclaration;
  sourceFile: ts.SourceFile;
}
