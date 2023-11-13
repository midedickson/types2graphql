import path from "path";
import { generateGraphQLSchema } from "../src/types2graphql";

generateGraphQLSchema(path.join(__dirname, "interfaces"), "sample");
