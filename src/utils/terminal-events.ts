// DOM CustomEvent name used to open the terminal popup from anywhere on the
// site (e.g. the manual button next to PixelCat). CampaignPopup and PixelCat
// live in separate Astro islands with no shared import graph, so a window
// event is the simplest way to let one trigger the other.
export const TERMINAL_OPEN_EVENT = "terminal:open";
