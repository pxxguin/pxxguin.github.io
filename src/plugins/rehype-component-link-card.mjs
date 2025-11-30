/// <reference types="mdast" />
import { h } from "hastscript";

/**
 * Creates a Link Preview Card component.
 * Uses Microlink API to fetch Open Graph data.
 *
 * @param {Object} properties - The properties of the component.
 * @param {string} properties.url - The URL to preview.
 * @param {import('mdast').RootContent[]} children - The children elements of the component.
 * @returns {import('mdast').Parent} The created Link Card component.
 */
export function LinkCardComponent(properties, children) {
	if (Array.isArray(children) && children.length !== 0)
		return h("div", { class: "hidden" }, [
			'Invalid directive. ("link" directive must be leaf type "::link{url="https://example.com"}")',
		]);

	if (!properties.url)
		return h(
			"div",
			{ class: "hidden" },
			'Invalid URL. ("url" attribute is required)',
		);

	const url = properties.url;
	const cardUuid = `LC${Math.random().toString(36).slice(-6)}`;

	// 카드 내부 구조 생성
	const nImage = h(`div#${cardUuid}-image`, { class: "lc-image" });

	const nTitle = h(
		`div#${cardUuid}-title`,
		{ class: "lc-title" },
		"Loading...",
	);

	const nDescription = h(
		`div#${cardUuid}-description`,
		{ class: "lc-description" },
		url, // 로딩 중엔 URL 표시
	);

	const nDomain = h(`div#${cardUuid}-domain`, { class: "lc-domain" }, [
		h(`img#${cardUuid}-favicon`, { class: "lc-favicon", src: "", alt: "" }),
		h(`span#${cardUuid}-site-name`, {}, new URL(url).hostname),
	]);

	const nTextContent = h("div", { class: "lc-content" }, [
		nTitle,
		nDescription,
		nDomain,
	]);

	// 클라이언트 사이드 스크립트 주입
	const nScript = h(
		`script#${cardUuid}-script`,
		{ type: "text/javascript", defer: true },
		`
      // Microlink 무료 API를 사용하여 메타 데이터 가져오기
      fetch('https://api.microlink.io?url=${encodeURIComponent(url)}&palette=true')
        .then(response => response.json())
        .then(json => {
            const data = json.data;
            if (!data) throw new Error("No data");

            // 제목 설정
            document.getElementById('${cardUuid}-title').innerText = data.title || "${url}";
            
            // 설명 설정
            document.getElementById('${cardUuid}-description').innerText = data.description || "No description available.";
            
            // 이미지 설정
            const imgEl = document.getElementById('${cardUuid}-image');
            if (data.image?.url) {
                imgEl.style.backgroundImage = 'url(' + data.image.url + ')';
            } else {
                imgEl.style.display = 'none'; // 이미지가 없으면 숨김
            }

            // 파비콘 설정
            const favEl = document.getElementById('${cardUuid}-favicon');
            if (data.logo?.url) {
                favEl.src = data.logo.url;
            } else {
                favEl.style.display = 'none';
            }

            // 사이트 이름 설정 (있으면)
            if (data.publisher) {
                document.getElementById('${cardUuid}-site-name').innerText = data.publisher;
            }

            // 로딩 완료 스타일 처리
            document.getElementById('${cardUuid}-card').classList.remove("fetch-waiting");
            console.log("[LINK-CARD] Loaded card for ${url}.");
        })
        .catch(err => {
            const c = document.getElementById('${cardUuid}-card');
            c?.classList.add("fetch-error");
            // 에러 시 제목에 원본 URL이라도 보여줌
            document.getElementById('${cardUuid}-title').innerText = "${url}";
            console.warn("[LINK-CARD] (Error) Loading card for ${url}.");
        })
    `,
	);

	return h(
		`a#${cardUuid}-card`,
		{
			class: "card-link fetch-waiting no-styling",
			href: url,
			target: "_blank",
			rel: "noopener noreferrer",
		},
		[nTextContent, nImage, nScript],
	);
}
