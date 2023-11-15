import { typing } from "./src/typing-enum";

declare module types2graphql {
  function generateGraphQLSchema(
    interfaceFoderPath: string,
    appName: string
  ): void;
  type typing = typing.TYPE | typing.INPUT;
}
