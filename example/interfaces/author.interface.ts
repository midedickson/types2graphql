import { typing } from "../../typing-enum";

export interface Author {
  __kind: typing.TYPE;
  id: string;
  name: string;
  age?: number;
}
