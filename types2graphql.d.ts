import { generateGraphQLSchema } from "./src/types2graphql";
import { typing } from "./src/typing-enum";

declare module types2graphqql {
  generateGraphQLSchema;
  typing;
}
