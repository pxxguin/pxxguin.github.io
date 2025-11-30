import { visit } from "unist-util-visit";

export default function rehypeMark() {
	return transformer;

	function transformer(tree) {
		visit(tree, "text", (node, index, parent) => {
			if (!node || typeof node.value !== "string") return;
			const value = node.value;

			// 정규식 확장: ==(노랑), !!(빨강), ++(초록), ??(파랑)
			const regex = /==([^=]+)==|!!([^!]+)!!|\+\+([^+]+)\+\+|\?\?([^?]+)\?\?/g;

			if (!regex.test(value)) return;

			const parts = [];
			let lastIndex = 0;

			// replace 콜백 인자가 늘어납니다 (매칭 그룹이 4개이므로)
			value.replace(regex, (match, cYellow, cRed, cGreen, cBlue, offset) => {
				// 1. 매칭되지 않은 앞부분 텍스트 추가
				if (offset > lastIndex) {
					parts.push({ type: "text", value: value.slice(lastIndex, offset) });
				}

				// 2. 색상 결정 및 내용 추출
				let className = ""; // 기본(노랑)은 클래스 없음
				if (cRed) className = "red";
				else if (cGreen) className = "green";
				else if (cBlue) className = "blue";

				const content = cYellow || cRed || cGreen || cBlue;

				// 3. <mark> 태그 생성
				parts.push({
					type: "element",
					tagName: "mark",
					properties: className ? { className: [className] } : {},
					children: [{ type: "text", value: content }],
				});

				lastIndex = offset + match.length;
			});

			// 4. 남은 뒷부분 텍스트 추가
			if (lastIndex < value.length) {
				parts.push({ type: "text", value: value.slice(lastIndex) });
			}

			// 5. 노드 교체
			if (parent && Array.isArray(parent.children)) {
				parent.children.splice(index, 1, ...parts);
			}
		});
	}
}
