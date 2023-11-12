import { typing } from "../../typing-enum";
import { Book } from "./book.interface";

interface Publisher {
  __kind: typing.TYPE;
  name?: string;
  book: Book;
}
