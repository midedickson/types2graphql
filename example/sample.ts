import path from "path";
import { generateGraphQLSchema } from "../types2graphql";

generateGraphQLSchema(path.join(__dirname, "interfaces"), "sample");
