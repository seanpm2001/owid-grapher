// For use in the sticky nav and the component implementation

export const ALL_CHARTS_ID = "all-charts"
export const KEY_INSIGHTS_ID = "key-insights"
export const LICENSE_ID = "article-licence"
export const CITATION_ID = "article-citation"
export const ENDNOTES_ID = "article-endnotes"
export const RESEARCH_AND_WRITING_ID = "research-writing"

export const IMAGES_DIRECTORY = "/images/published/"
// Works for:
// https://docs.google.com/document/d/abcd1234
// https://docs.google.com/document/d/abcd1234/
// https://docs.google.com/document/d/abcd1234/edit
// https://docs.google.com/document/d/abcd-1234/edit
// https://docs.google.com/document/u/0/d/abcd-1234/edit
// https://docs.google.com/document/u/0/d/abcd-1234/edit?usp=sharing

export const gdocUrlRegex =
    /https:\/\/docs\.google\.com\/.+?\/d\/([-\w]+)\/?(edit)?#?/
export const gdocIdRegex = /^[0-9A-Za-z\-_]{44}$/
// Works for:
// #dod:text
// #dod:text-hyphenated
// #dod:text_underscored
// #dod:text_underscored-and-hyphenated
// Duplicated in parser.ts

export const detailOnDemandRegex = /#dod:([\w\-_]+)/
