import { typing } from "../../src/typing-enum";
import { Author } from "./author.interface";

// import { typing } from "types2graphql";

export interface Book {
  __kind: typing.TYPE;
  id: string;
  name: string;
  rating: number;
  authors: Author[];
}

interface Filter {
  __kind: typing.INPUT;
  rating?: number;
}

interface Response {
  __kind: typing.TYPE;
  books: Book[];
}
