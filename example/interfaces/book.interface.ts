import { typing } from "../../typing-enum";
import { Author } from "./author.interface";

interface Book {
  __kind: typing.TYPE;
  title: string;
  author: Author;
  pages: number;
  read: boolean;
}
