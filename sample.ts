import { generateGraphQLSchema } from "./old-approach";

console.log(
  generateGraphQLSchema(`
    interface Node {
      __kind: typing.TYPE;
      id: string;
    }

    interface Edge {
      __kind: typing.TYPE;
      cursor: string;
    }

    type PageInfo {
      __kind: typing.TYPE;
      hasNextPage: boolean;
      endCursor: string;
    }
    
    type Query {
      pageInfo: PageInfo
    }
  `)
);
