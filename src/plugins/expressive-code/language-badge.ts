/**
 * Based on the discussion at https://github.com/expressive-code/expressive-code/issues/153#issuecomment-2282218684
 */
import { definePlugin } from "@expressive-code/core";

export function pluginLanguageBadge() {
	return definePlugin({
		name: "Language Badge",
		// @ts-expect-error
		baseStyles: ({ _cssVar }) => `
      [data-language]::before {
        position: absolute;
        z-index: 2;
        right: 0.75rem;
        top: 0.75rem;
        padding: 0.25rem 0.6rem;
        content: attr(data-language);
        font-family: inherit;
        font-size: 0.75rem;
        line-height: 1;
        font-weight: 600;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.85);
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 0.375rem;
        pointer-events: none;
        transition: all 0.2s ease-in-out;
        opacity: 0;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      .frame:not(.has-title):not(.is-terminal) {
        @media (hover: none) {
          & [data-language]::before {
            opacity: 1;
            margin-right: 3rem;
          }
          & [data-language]:active::before {
            opacity: 0;
          }
        }
        @media (hover: hover) {
          & [data-language]::before {
            opacity: 1;
          }
          &:hover [data-language]::before {
            opacity: 0;
          }
        }
      }
    `,
	});
}
