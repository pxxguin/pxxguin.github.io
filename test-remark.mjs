import { remark } from "remark";
import { remarkNotionCallout } from "./src/plugins/remark-notion-callout.mjs";

const md = `
1. SSH로 직접 접속의 한계: 
   => 여기에 콜아웃 내용을 적어주세요! (이 부분은 수정하셔도 됩니다)
`;

remark()
	.use(remarkNotionCallout)
	.process(md)
	.then((file) => console.log(String(file)))
	.catch((err) => console.error(err));
