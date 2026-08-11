# pxxguin.github.io — 프로젝트 참조 문서

Astro 5 + Svelte 5 기반 개인 기술 블로그 (Fuwari 테마 커스터마이징). 패키지 매니저는 pnpm 고정(`preinstall`에서 `only-allow pnpm`으로 강제).

## 명령어

| 목적 | 명령 |
|------|------|
| 개발 서버 | `pnpm dev` (포트 4321, `astro dev`) |
| 빌드 | `pnpm build` (postId 부여 → 그래프 데이터 생성 → `astro build` → `pagefind --site dist`) |
| 린트 | `pnpm lint` (`biome check --write ./src`) |
| 포맷 | `pnpm format` (`biome format --write ./src`) |
| 타입체크(빠름) | `pnpm type-check` (`tsc --noEmit --isolatedDeclarations`) |
| 타입체크(전체, 느림) | `pnpm check` (`astro check`) |
| 새 포스트 생성 | `pnpm new-post` |

## 배포 파이프라인

`.github/workflows/deploy.yml` — `master` 브랜치 push 시 자동 실행 (workflow_dispatch로 수동 트리거도 가능).

1. **check** job: Biome lint(`biome ci`) + `astro check` — Node 22
2. **build** job: `pnpm build` → `dist/`를 GitHub Pages 아티팩트 + 재사용용 일반 아티팩트(`dist`)로 업로드 (check job 결과와 무관하게 병렬 진행됨 — PR에서 check 실패 여부를 별도로 확인해야 함)
3. **lighthouse** job (`needs: build`, `continue-on-error: true`): 재빌드 없이 아티팩트를 받아 Lighthouse CI로 성능 회귀만 점검, 배포는 막지 않음
4. **smoke-test** job (`needs: build`, `continue-on-error: true`): `dist/`를 정적 서빙 후 `scripts/smoke-check.mjs`(Playwright)로 핵심 페이지의 콘솔/네트워크 에러 확인, 배포는 막지 않음
5. **deploy** job: `dist/` 아티팩트를 GitHub Pages에 배포 (build만 기다림 — lighthouse/smoke-test 실패로 배포가 막히지 않음)

별도로 `.github/workflows/link-check.yml`이 매주 월요일 `src/content/**/*.md`의 외부 링크를 점검(lychee)하고, 깨진 링크가 있으면 issue를 자동 생성한다.

배포 대상은 `astro.config.mjs`의 `site: "https://pxxguin.github.io"`. `vercel.json`은 저장소에 남아 있지만 실제로는 사용하지 않음(GitHub Pages가 배포처).

## Content Collections (`src/content/config.ts`)

- **posts**: `title`, `published`(date), `updated?`, `draft?`(기본 false), `description?`, `image?`, `tags?`(string[]), `category?`, `lang?`, `postId?`(Tistory 스타일 지속 번호), `series?`/`seriesOrder?`, `github?`, `prevTitle/prevSlug/nextTitle/nextSlug`(이전/다음 글 네비게이션용 내부 필드)
- **series**: `title`, `description?`, `image?`, `status`(`ongoing`|`completed`, 기본 ongoing), `tags?`
- **spec**: 빈 스키마

새 frontmatter 필드를 추가할 때는 `.optional()`/`.default(...)`를 붙여야 기존 포스트들의 빌드가 깨지지 않는다.

## 경로 별칭 (`tsconfig.json`)

`@components/*` `@assets/*` `@constants/*` `@utils/*` `@i18n/*` `@layouts/*` `@/*`(→`src/*`)

## 코딩 컨벤션 (`biome.json`)

- 들여쓰기: 탭 / 문자열: 큰따옴표 / import 자동 정리(`organizeImports: on`)
- `.astro`/`.svelte` 파일은 `useConst`, `useImportType`, `noUnusedVariables`, `noUnusedImports` 규칙이 꺼져 있음(일반 `.ts`와 다름)

## 디렉토리 관례 (`src/components/`)

- 루트: 레이아웃급 핵심 컴포넌트 (Navbar, Footer, PostCard 등)
- `misc/`: 이스터에그·부가 위젯 (TrophyShelf, LoginTerminal, PixelCat 등)
- `widget/`: 사이드바·포스트 관련 위젯 (TOC, Categories, RelatedPosts 등)
- `control/`: 재사용 UI 컨트롤 (버튼, 페이지네이션 등)

## 테마 시스템

`siteConfig.themeColor.hue`(`src/config.ts`) → `ConfigCarrier.astro`가 `data-hue`로 DOM에 주입 → 클라이언트 JS가 `:root`의 `--hue` CSS 변수로 설정 → `src/styles/variables.styl`의 모든 색상 변수가 `oklch(L C var(--hue))` 형태로 이 값을 참조해 파생됨. 새 색은 하드코딩 대신 이 패턴을 따른다.

다크모드는 Tailwind `darkMode: "class"` 전략(`<html class="dark">` 토글, `LightDarkSwitch.svelte`가 제어). `variables.styl`의 `define({...})` 헬퍼는 각 변수에 `라이트값 다크값` 두 값을 받아 `:root`/`:root.dark`에 각각 적용하므로, 새 변수 추가 시 두 값을 함께 정의해야 한다.

## i18n — 다국어 지원 안 함 (실제로는 한국어 고정)

`siteConfig.lang`(`src/config.ts`)이 `"ko"`로 고정되어 있고 언어 스위처 UI도 없어서, 실제 화면에는 `src/i18n/languages/ko.ts` 값만 쓰인다(`translation.ts`의 `i18n()`이 `siteConfig.lang` 기준으로 조회). 포스트 본문 번역도 하지 않는다 — 다국어 지원은 이 프로젝트의 목표가 아니다.

다만 각 언어 파일이 전부 `Translation` 타입(`{[K in I18nKey]: string}`)으로 엄격하게 타입 지정되어 있어서, `src/i18n/i18nKey.ts`에 새 키를 추가하면 `src/i18n/languages/`의 10개 파일(`ko`, `en`, `zh_CN`, `zh_TW`, `ja`, `es`, `th`, `vi`, `tr`, `id`) **전부**에 값을 채워야 `astro check`/`tsc`가 통과한다 — 하나라도 비면 타입체크 자체가 실패한다. 실제 렌더링에는 `ko.ts`만 영향을 주므로, 나머지 9개는 정확히 번역할 필요 없이 `ko.ts`나 `en.ts` 값을 그대로 복사해 채워도 무방하다(타입체크 통과가 목적).
