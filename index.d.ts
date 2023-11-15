import { typing } from "./src/typing-enum";

declare module types2graphqql {
  function generateGraphQLSchema(
    interfaceFoderPath: string,
    appName: string
  ): void;
  type typing = typing.TYPE | typing.INPUT;
}
