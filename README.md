# types2graphql - A minimal Typescript to GraphQL Converter

This lightweight library converts TypeScript interfaces into GraphQL types and inputs based on the `__kind` field specified in the interfaces. It's designed to be a simple solution for automatically generating GraphQL schemas from TypeScript interfaces.

## Installation

Install the library using npm:

```bash
npm install types2graphql
```

## Usage

### 1. Import the Library

```ts
import { typing, generateGraphQLSchema } from "types2graphql";
```

### 2. Define Your TypeScript Interfaces in a dedicated folder e.g. "interfaces/book.interface.ts"

```ts
interface Book {
  __kind: typing.TYPE;
  id: string;
  name: string;
  rating: number;
  authors: Author[];
}

interface Author {
  __kind: typing.TYPE;
  id: string;
  name: string;
  age?: number;
}

interface Filter {
  __kind: typing.INPUT;
  rating?: number;
}

interface Response {
  __kind: typing.TYPE;
  books: Book[];
}
```

### 3. Using generateGraphQLSchema() Function

```ts
// Provide the path to the folder containing the interfaces and a name for your graphQL app

generateGraphQLSchema(path.join(process.cwd(), "interfaces"), "sample");
```

- This creates a file `sample.graphql` file where all the schemas found in the `interfaces` folder.

### 4. Manually Create Resolver File

Create a resolver.graphql file manually:

```graphql
type Query {
  book(input: FilterInput): ResponseType
}
```

### 5. GraphQL Server Setup

```ts
import { ApolloServer } from 'apollo-server';
import fs from 'fs';

// Read the manually created resolver file
const graphqlSchema = fs.readFileSync('interfaces/sample.graphql', 'utf-8');
const resolverFile = fs.readFileSync('resolver.graphql', 'utf-8');

// Concatenate generated schema and resolver file
const schema = graphqlSchema + '\n' + resolverFile;

// In-memory array of 5 book objects (replace with your actual data)
const books = [...];

// GraphQL Query Resolver
const resolvers = {
  Query: {
    book: (_: any, { input }: any) => {
      // Implement your filter logic here
      // Return filtered books based on input
      return { books };
    },
  },
};

// Create an Apollo Server
const server = new ApolloServer({ typeDefs: schema, resolvers });

// Start the server
server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
```

## Video Presentation

[Link to Video Presentation](http://your-vimeo-link)

## Demo Project

[Link to Demo Project](https://github.com/Double-DOS/types2graphql-demo)

## License

This library is licensed under the MIT License - see the [LICENSE](LICENSE.txt) file for details.
