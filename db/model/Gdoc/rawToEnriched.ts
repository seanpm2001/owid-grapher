import {
    BlockPositionChoice,
    ChartPositionChoice,
    ChartControlKeyword,
    ChartTabKeyword,
    compact,
    EnrichedBlockAside,
    EnrichedBlockCallout,
    EnrichedBlockChart,
    EnrichedBlockChartStory,
    EnrichedBlockGraySection,
    EnrichedBlockHeading,
    EnrichedBlockHorizontalRule,
    EnrichedBlockHtml,
    EnrichedBlockImage,
    EnrichedBlockKeyInsights,
    EnrichedBlockList,
    EnrichedBlockNumberedList,
    EnrichedBlockMissingData,
    EnrichedBlockProminentLink,
    EnrichedBlockPullQuote,
    EnrichedBlockRecirc,
    EnrichedBlockScroller,
    EnrichedBlockSDGGrid,
    EnrichedBlockSDGToc,
    EnrichedBlockAdditionalCharts,
    EnrichedBlockSideBySideContainer,
    EnrichedBlockStickyLeftContainer,
    EnrichedBlockStickyRightContainer,
    EnrichedBlockText,
    EnrichedChartStoryItem,
    EnrichedRecircLink,
    EnrichedScrollerItem,
    EnrichedSDGGridItem,
    isArray,
    OwidEnrichedGdocBlock,
    OwidRawGdocBlock,
    OwidGdocErrorMessage,
    ParseError,
    partition,
    RawBlockAdditionalCharts,
    RawBlockAside,
    RawBlockCallout,
    RawBlockChart,
    RawBlockChartStory,
    RawBlockGraySection,
    RawBlockHeading,
    RawBlockHtml,
    RawBlockImage,
    RawBlockKeyInsights,
    RawBlockList,
    RawBlockNumberedList,
    RawBlockProminentLink,
    RawBlockPullQuote,
    RawBlockRecirc,
    RawBlockScroller,
    RawBlockSDGGrid,
    RawBlockSideBySideContainer,
    RawBlockStickyLeftContainer,
    RawBlockStickyRightContainer,
    RawBlockText,
    Span,
    SpanSimpleText,
    omitUndefinedValues,
    EnrichedBlockSimpleText,
    checkIsInternalLink,
    BlockImageSize,
    checkIsBlockImageSize,
    RawBlockTopicPageIntro,
    EnrichedBlockTopicPageIntro,
    Url,
    EnrichedTopicPageIntroRelatedTopic,
    DetailDictionary,
    EnrichedDetail,
    checkIsPlainObjectWithGuard,
    EnrichedBlockKeyInsightsSlide,
    keyBy,
    filterValidStringValues,
    uniq,
    RawBlockResearchAndWriting,
    RawBlockResearchAndWritingLink,
    EnrichedBlockResearchAndWriting,
    EnrichedBlockResearchAndWritingLink,
    EnrichedBlockResearchAndWritingRow,
    EnrichedBlockExpandableParagraph,
    RawBlockExpandableParagraph,
    RawBlockAllCharts,
    EnrichedBlockAllCharts,
    RefDictionary,
    OwidGdocErrorMessageType,
    excludeNullish,
    RawBlockResearchAndWritingRow,
    EnrichedBlockAlign,
    HorizontalAlign,
    RawBlockAlign,
    FaqDictionary,
    EnrichedFaq,
} from "@ourworldindata/utils"
import {
    extractUrl,
    getTitleSupertitleFromHeadingText,
    parseAuthors,
} from "./gdocUtils.js"
import {
    htmlToEnrichedTextBlock,
    htmlToSimpleTextBlock,
    htmlToSpans,
} from "./htmlToEnriched.js"
import { P, match } from "ts-pattern"
import { isObject, parseInt } from "lodash"
import { GDOCS_DETAILS_ON_DEMAND_ID } from "../../../settings/serverSettings.js"

export function parseRawBlocksToEnrichedBlocks(
    block: OwidRawGdocBlock
): OwidEnrichedGdocBlock | null {
    return match(block)
        .with({ type: "all-charts" }, parseAllCharts)
        .with({ type: "additional-charts" }, parseAdditionalCharts)
        .with({ type: "aside" }, parseAside)
        .with({ type: "callout" }, parseCallout)
        .with({ type: "chart" }, parseChart)
        .with({ type: "scroller" }, parseScroller)
        .with({ type: "chart-story" }, parseChartStory)
        .with({ type: "image" }, parseImage)
        .with({ type: "list" }, parseList)
        .with({ type: "numbered-list" }, parseNumberedList)
        .with({ type: "pull-quote" }, parsePullQuote)
        .with(
            { type: "horizontal-rule" },
            (b): EnrichedBlockHorizontalRule => ({
                type: "horizontal-rule",
                value: b.value,
                parseErrors: [],
            })
        )
        .with({ type: "recirc" }, parseRecirc)
        .with({ type: "text" }, parseText)
        .with(
            { type: "html" },
            (block: RawBlockHtml): EnrichedBlockHtml => ({
                type: "html",
                value: block.value,
                parseErrors: [],
            })
        )
        .with({ type: "url" }, () => null) // url blocks should only occur inside of chart stories etc
        .with({ type: "position" }, () => null) // position blocks should only occur inside of chart stories etc
        .with({ type: "heading" }, parseHeading)
        .with({ type: "sdg-grid" }, parseSdgGrid)
        .with({ type: "sticky-left" }, parseStickyLeft)
        .with({ type: "sticky-right" }, parseStickyRight)
        .with({ type: "side-by-side" }, parseSideBySide)
        .with({ type: "gray-section" }, parseGraySection)
        .with({ type: "prominent-link" }, parseProminentLink)
        .with({ type: "topic-page-intro" }, parseTopicPageIntro)
        .with({ type: "key-insights" }, parseKeyInsights)
        .with({ type: "research-and-writing" }, parseResearchAndWritingBlock)
        .with(
            { type: "sdg-toc" },
            (b): EnrichedBlockSDGToc => ({
                type: "sdg-toc",
                value: b.value,
                parseErrors: [],
            })
        )
        .with(
            { type: "missing-data" },
            (b): EnrichedBlockMissingData => ({
                type: "missing-data",
                value: b.value,
                parseErrors: [],
            })
        )
        .with({ type: "expandable-paragraph" }, parseExpandableParagraph)
        .with({ type: "align" }, parseAlign)
        .exhaustive()
}

function parseAllCharts(raw: RawBlockAllCharts): EnrichedBlockAllCharts {
    const createError = (error: ParseError): EnrichedBlockAllCharts => ({
        type: "all-charts",
        heading: "",
        top: [],
        parseErrors: [error],
    })

    if (!raw.value.heading)
        return createError({ message: "all-charts block missing heading" })

    const top = raw.value.top
    if (top) {
        if (!isArray(top)) {
            return createError({
                message: `all-charts malformed "top" property: ${typeof raw
                    .value.top}`,
            })
        }

        for (const item of top) {
            if (!isObject(item)) {
                return createError({
                    message: `all-charts invalid top item: ${item}`,
                })
            }

            if (!("url" in item)) {
                return createError({
                    message: `all-charts top item missing "url" property: ${item}`,
                })
            }
        }
    }

    return {
        type: "all-charts",
        heading: raw.value.heading,
        top: top?.map((item) => ({ url: extractUrl(item.url) })) || [],
        parseErrors: [],
    }
}

function parseAdditionalCharts(
    raw: RawBlockAdditionalCharts
): EnrichedBlockAdditionalCharts {
    const createError = (error: ParseError): EnrichedBlockAdditionalCharts => ({
        type: "additional-charts",
        items: [],
        parseErrors: [error],
    })

    if (isArray(raw.value))
        return createError({
            message: `additional-charts block is using an array tag (e.g. [.additional-charts]). Please update it to use curly braces (e.g. {.additional-charts})`,
        })

    if (!isArray(raw.value.list))
        return createError({ message: "Block does not contain a list" })

    for (const item of raw.value.list) {
        if (typeof item !== "string")
            return createError({
                message: `Item in list with value "${JSON.stringify(
                    item
                )}" isn't a plain string.`,
            })
    }

    const items = raw.value.list.map(htmlToSpans)

    return {
        type: "additional-charts",
        items,
        parseErrors: [],
    }
}

const parseAside = (raw: RawBlockAside): EnrichedBlockAside => {
    const createError = (
        error: ParseError,
        caption: Span[] = [],
        position: BlockPositionChoice | undefined = undefined
    ): EnrichedBlockAside => ({
        type: "aside",
        caption,
        position,
        parseErrors: [error],
    })

    if (typeof raw.value === "string")
        return createError({
            message: "Value is a string, not an object with properties",
        })

    if (!raw.value.caption)
        return createError({
            message: "Caption property is missing",
        })

    const position =
        raw.value.position === "left" || raw.value.position === "right"
            ? raw.value.position
            : undefined
    const caption = htmlToSpans(raw.value.caption)

    return {
        type: "aside",
        caption,
        position,
        parseErrors: [],
    }
}

const parseChart = (raw: RawBlockChart): EnrichedBlockChart => {
    const createError = (
        error: ParseError,
        url: string,
        caption: Span[] = []
    ): EnrichedBlockChart => ({
        type: "chart",
        url,
        caption,
        parseErrors: [error],
    })

    const val = raw.value

    if (typeof val === "string") {
        return {
            type: "chart",
            url: val,
            parseErrors: [],
        }
    } else {
        if (!val.url)
            return createError(
                {
                    message: "url property is missing",
                },
                ""
            )

        const url = extractUrl(val.url)

        const warnings: ParseError[] = []

        const height = val.height
        const row = val.row
        const column = val.column
        // This property is currently unused, a holdover from @mathisonian's gdocs demo.
        // We will decide soon™️ if we want to use it for something
        let position: ChartPositionChoice | undefined = undefined
        if (val.position)
            if (val.position === "featured") position = val.position
            else {
                warnings.push({
                    message: "position must be 'featured' or unset",
                })
            }
        const caption = val.caption ? htmlToSpans(val.caption) : []
        const title = val.title
        const subtitle = val.subtitle

        const validControlKeywords = Object.values(ChartControlKeyword)
        const controls = uniq(
            filterValidStringValues(
                val.controls?.flatMap((d: { list: string[] }) => d.list) || [],
                validControlKeywords,
                (invalidKeyword: string) => {
                    warnings.push({
                        message: `Keyword '${invalidKeyword}' in 'controls' is not valid. Must be one of: ${validControlKeywords}`,
                    })
                }
            )
        )

        const validTabKeywords = Object.values(ChartTabKeyword)
        const tabs = uniq(
            filterValidStringValues(
                val.tabs?.flatMap((d: { list: string[] }) => d.list) || [],
                validTabKeywords,
                (invalidKeyword: string) => {
                    warnings.push({
                        message: `Keyword '${invalidKeyword}' in 'tabs' is not valid. Must be one of: ${validTabKeywords}.`,
                    })
                }
            )
        )

        return omitUndefinedValues({
            type: "chart",
            url,
            height,
            row,
            column,
            position,
            caption: caption.length > 0 ? caption : undefined,
            title,
            subtitle,
            controls: controls.length > 0 ? controls : undefined,
            tabs: tabs.length > 0 ? tabs : undefined,
            parseErrors: [],
        }) as EnrichedBlockChart
    }
}

const parseScroller = (raw: RawBlockScroller): EnrichedBlockScroller => {
    const createError = (
        error: ParseError,
        blocks: EnrichedScrollerItem[] = []
    ): EnrichedBlockScroller => ({
        type: "scroller",
        blocks,
        parseErrors: [error],
    })

    if (typeof raw.value === "string")
        return createError({
            message: "Value is a string, not an object with properties",
        })

    const blocks: EnrichedScrollerItem[] = []
    let currentBlock: EnrichedScrollerItem = {
        url: "",
        type: "enriched-scroller-item",
        text: { type: "text", value: [], parseErrors: [] },
    }
    const warnings: ParseError[] = []
    for (const block of raw.value) {
        match(block)
            .with({ type: "url" }, (url) => {
                if (currentBlock.url !== "") {
                    blocks.push(currentBlock)
                    currentBlock = {
                        type: "enriched-scroller-item",
                        url: "",
                        text: {
                            type: "text",
                            value: [],
                            parseErrors: [],
                        },
                    }
                }
                currentBlock.url = url.value
            })
            .with({ type: "text" }, (text) => {
                currentBlock.text = htmlToEnrichedTextBlock(text.value)
            })
            .otherwise(() =>
                warnings.push({
                    message: "scroller items must be of type 'url' or 'text'",
                    isWarning: true,
                })
            )
    }
    if (currentBlock.url !== "") {
        blocks.push(currentBlock)
    }

    return {
        type: "scroller",
        blocks,
        parseErrors: [],
    }
}

const parseChartStory = (raw: RawBlockChartStory): EnrichedBlockChartStory => {
    const createError = (
        error: ParseError,
        items: EnrichedChartStoryItem[] = []
    ): EnrichedBlockChartStory => ({
        type: "chart-story",
        items,
        parseErrors: [error],
    })

    if (typeof raw.value === "string")
        return createError({
            message: "Value is a string, not an object with properties",
        })

    const items: (EnrichedChartStoryItem | ParseError)[] = raw.value.map(
        (item): EnrichedChartStoryItem | ParseError => {
            const chart = item?.chart
            if (typeof item?.narrative !== "string" || item?.narrative === "")
                return {
                    message:
                        "Item is missing narrative property or it is not a string value",
                }
            if (typeof chart !== "string" || item?.chart === "")
                return {
                    message:
                        "Item is missing chart property or it is not a string value",
                }
            if (isArray(item?.technical))
                return {
                    message: `Item's technical tag is an array (e.g. "[.technical]"). Please update this tag to use curly braces (e.g. {.technical})`,
                }
            return {
                narrative: htmlToEnrichedTextBlock(item.narrative),
                chart: { type: "chart", url: chart, parseErrors: [] },
                technical: item.technical?.list
                    ? item.technical.list.map(htmlToEnrichedTextBlock)
                    : [],
            }
        }
    )

    const [errors, enrichedItems] = partition(
        items,
        (item): item is ParseError => "message" in item
    )

    return {
        type: "chart-story",
        items: enrichedItems,
        parseErrors: errors,
    }
}

const parseImage = (image: RawBlockImage): EnrichedBlockImage => {
    const createError = (
        error: ParseError,
        filename: string = "",
        alt: string = "",
        caption?: Span[],
        size: BlockImageSize = BlockImageSize.Wide
    ): EnrichedBlockImage => ({
        type: "image",
        filename,
        alt,
        caption,
        size,
        originalWidth: undefined,
        parseErrors: [error],
    })

    const filename = image.value.filename
    if (!filename) {
        return createError({
            message: "filename property is missing or empty",
        })
    }

    // Default to wide
    const size = image.value.size ?? BlockImageSize.Wide
    if (!checkIsBlockImageSize(size)) {
        return createError({
            message: `Invalid size property: ${size}`,
        })
    }

    const caption = image.value.caption
        ? htmlToSpans(image.value.caption)
        : undefined

    return {
        type: "image",
        filename,
        alt: image.value.alt,
        caption,
        size,
        originalWidth: undefined,
        parseErrors: [],
    }
}

const parseNumberedList = (
    raw: RawBlockNumberedList
): EnrichedBlockNumberedList => {
    const createError = (
        error: ParseError,
        items: EnrichedBlockText[] = []
    ): EnrichedBlockNumberedList => ({
        type: "numbered-list",
        items,
        parseErrors: [error],
    })

    if (typeof raw.value === "string")
        return createError({
            message: "Value is a string, not a list of strings",
        })

    // ArchieML only has lists, not numbered lists. By convention,
    const valuesWithoutLeadingNumbers = raw.value.map((val) =>
        val.replace(/^\s*\d+\.\s*/, "")
    )
    const items = valuesWithoutLeadingNumbers.map(htmlToEnrichedTextBlock)

    return {
        type: "numbered-list",
        items,
        parseErrors: [],
    }
}

const parseList = (raw: RawBlockList): EnrichedBlockList => {
    const createError = (
        error: ParseError,
        items: EnrichedBlockText[] = []
    ): EnrichedBlockList => ({
        type: "list",
        items,
        parseErrors: [error],
    })

    if (typeof raw.value === "string")
        return createError({
            message: "Value is a string, not a list of strings",
        })

    const items = raw.value.map(htmlToEnrichedTextBlock)

    return {
        type: "list",
        items,
        parseErrors: [],
    }
}

// const parseSimpleTextsWithErrors = (
//     raw: string[]
// ): { errors: ParseError[]; texts: SpanSimpleText[] } => {
//     const parsedAsBlocks = raw.map(htmlToSimpleTextBlock)
//     const errors = parsedAsBlocks.flatMap((block) => block.parseErrors)
//     const texts = parsedAsBlocks.map((block) => block.value)
//     return { errors, texts }
// }

const parsePullQuote = (raw: RawBlockPullQuote): EnrichedBlockPullQuote => {
    const createError = (
        error: ParseError,
        text: SpanSimpleText[] = []
    ): EnrichedBlockPullQuote => ({
        type: "pull-quote",
        text,
        parseErrors: [error],
    })

    if (typeof raw.value === "string")
        return createError({
            message: "Value is a string, not a list of strings",
        })

    const textResults = compact(raw.value.map(parseRawBlocksToEnrichedBlocks))

    const [textBlocks, otherBlocks] = partition(
        textResults,
        (item): item is EnrichedBlockText => item.type === "text"
    )

    const otherBlockErrors = otherBlocks
        .map((block) => block.parseErrors)
        .flat()
    const textBlockErrors = textBlocks.map((block) => block.parseErrors).flat()

    const simpleTextSpans: SpanSimpleText[] = []
    const unexpectedTextSpanErrors: ParseError[] = []

    for (const textBlock of textBlocks)
        for (const span of textBlock.value) {
            if (span.spanType === "span-simple-text") {
                simpleTextSpans.push(span)
            } else {
                unexpectedTextSpanErrors.push({
                    message:
                        "Unexpected span type in pull-quote. Note: formatting is not supported inside pull-quotes ATM.",
                })
            }
        }

    return {
        type: "pull-quote",
        text: simpleTextSpans,
        parseErrors: [
            ...otherBlockErrors,
            ...textBlockErrors,
            ...unexpectedTextSpanErrors,
        ],
    }
}

const parseRecirc = (raw: RawBlockRecirc): EnrichedBlockRecirc => {
    const createError = (
        error: ParseError,
        title: SpanSimpleText = { spanType: "span-simple-text", text: "" },
        links: EnrichedRecircLink[] = []
    ): EnrichedBlockRecirc => ({
        type: "recirc",
        title,
        links,
        parseErrors: [error],
    })

    if (!raw.value?.title) {
        return createError({
            message: "Recirc must have a title",
        })
    }

    if (!raw.value?.links || !raw.value?.links.length) {
        return createError({
            message: "Recirc must have at least one link",
        })
    }

    const linkErrors: ParseError[] = []
    for (const link of raw.value.links) {
        if (!link.url) {
            linkErrors.push({
                message: "Recirc link missing url property",
            })
        } else if (!Url.fromURL(link.url).isGoogleDoc) {
            linkErrors.push({
                message: "External urls are not supported in recirc blocks",
                isWarning: true,
            })
        }
    }

    const parsedTitle = htmlToSimpleTextBlock(raw.value.title)

    return {
        type: "recirc",
        title: parsedTitle.value,
        links: raw.value.links.map((link) => ({
            type: "recirc-link",
            url: link.url!,
        })),
        parseErrors: [...linkErrors],
    }
}

export const parseText = (raw: RawBlockText): EnrichedBlockText => {
    const createError = (
        error: ParseError,
        value: Span[] = []
    ): EnrichedBlockText => ({
        type: "text",
        value,
        parseErrors: [error],
    })

    if (typeof raw.value !== "string")
        return createError({
            message: "Value is a not a string",
        })

    const value = htmlToSpans(raw.value)

    return {
        type: "text",
        value,
        parseErrors: [],
    }
}

/** Note that this function is not automatically called from parseRawBlocksToEnrichedBlocks as all
    the others are. SimpleTexts only exist on the Enriched level, not on the raw level, and they
    only make sense when the code requesting a block to be parsed wants to exclude formatting.
    Use this function if you have a RawBlockText and want to try to parse it to a SimpleText.
*/
export const parseSimpleText = (raw: RawBlockText): EnrichedBlockSimpleText => {
    const createError = (
        error: ParseError,
        value: SpanSimpleText = { spanType: "span-simple-text", text: "" }
    ): EnrichedBlockSimpleText => ({
        type: "simple-text",
        value,
        parseErrors: [error],
    })

    if (typeof raw.value !== "string")
        return createError({
            message: "Value is a not a string but a " + typeof raw.value,
        })

    return htmlToSimpleTextBlock(raw.value)
}

const parseHeading = (raw: RawBlockHeading): EnrichedBlockHeading => {
    const createError = (
        error: ParseError,
        text: Span[] = [{ spanType: "span-simple-text", text: "" }],
        level: number = 1
    ): EnrichedBlockHeading => ({
        type: "heading",
        text,
        level,
        parseErrors: [error],
    })

    if (typeof raw.value === "string")
        return createError({
            message: "Value is a string, not an object with properties",
        })

    const headingText = raw.value.text
    if (!headingText)
        return createError({
            message: "Text property is missing",
        })
    // TODO: switch headings to not use a vertical tab character.
    // In the SDG pages we use the vertical tab character to separate the title
    // from the supertitle. The spans can be nested and then the correct way of
    // dealing with this would be to first parse the HTML into spans and then
    // check if somewhere in the nested tree there is a vertical tab character,
    // and if so to create two trees where the second mirrors the nesting of
    // the first. For now here we just assume that the vertical tab character
    // is used on the top level only (i.e. not inside an italic span or similar)
    const [title, supertitle] = getTitleSupertitleFromHeadingText(headingText)
    const titleSpans = htmlToSpans(title)
    const superTitleSpans = supertitle ? htmlToSpans(supertitle) : undefined

    if (!raw.value.level)
        return createError({
            message: "Header level property is missing",
        })
    const level = parseInt(raw.value.level, 10)
    if (level < 1 || level > 5)
        return createError({
            message:
                "Header level property is outside the valid range between 1 and 5",
        })

    return {
        type: "heading",
        text: titleSpans,
        supertitle: superTitleSpans,
        level: level,
        parseErrors: [],
    }
}

const parseSdgGrid = (raw: RawBlockSDGGrid): EnrichedBlockSDGGrid => {
    const createError = (
        error: ParseError,
        items: EnrichedSDGGridItem[] = []
    ): EnrichedBlockSDGGrid => ({
        type: "sdg-grid",
        items,
        parseErrors: [error],
    })

    if (typeof raw.value === "string")
        return createError({
            message: "Value is a string, not an object with properties",
        })

    if (raw.value.length === 0)
        return createError({
            message: "SDG Grid must have at least one item",
        })

    if (!raw.value)
        return createError({
            message: "SDG Grid must have at least one entry",
        })

    const items: (EnrichedSDGGridItem | ParseError[])[] = raw.value.map(
        (item): EnrichedSDGGridItem | ParseError[] => {
            if (typeof item?.goal !== "string")
                return [
                    {
                        message:
                            "Item is missing goal property or it is not a string value",
                    },
                ]
            if (typeof item?.link !== "string")
                return [
                    {
                        message:
                            "Item is missing link property or it is not a string value",
                    },
                ]
            // TODO: make the type not just a string and then parse spans here
            const goal = item.goal!
            const link = item.link!

            //const errors = goal.parseErrors.concat(link.parseErrors)

            //if (errors.length > 0) return errors

            return {
                goal,
                link,
            }
        }
    )

    const [errors, enrichedItems] = partition(
        items,
        (item: EnrichedSDGGridItem | ParseError[]): item is ParseError[] =>
            isArray(item)
    )

    const flattenedErrors = errors.flat()

    return {
        type: "sdg-grid",
        items: enrichedItems,
        parseErrors: [...flattenedErrors],
    }
}

function parseStickyRight(
    raw: RawBlockStickyRightContainer
): EnrichedBlockStickyRightContainer {
    const { left = [], right = [] } = raw.value
    const enrichedLeft = compact(left.map(parseRawBlocksToEnrichedBlocks))
    const enrichedRight = compact(right.map(parseRawBlocksToEnrichedBlocks))
    return {
        type: "sticky-right",
        left: enrichedLeft,
        right: enrichedRight,
        parseErrors: [],
    }
}

function parseStickyLeft(
    raw: RawBlockStickyLeftContainer
): EnrichedBlockStickyLeftContainer {
    const { left = [], right = [] } = raw.value
    const enrichedLeft = compact(left.map(parseRawBlocksToEnrichedBlocks))
    const enrichedRight = compact(right.map(parseRawBlocksToEnrichedBlocks))
    return {
        type: "sticky-left",
        left: enrichedLeft,
        right: enrichedRight,
        parseErrors: [],
    }
}

function parseSideBySide(
    raw: RawBlockSideBySideContainer
): EnrichedBlockSideBySideContainer {
    const { left = [], right = [] } = raw.value
    const enrichedLeft = compact(left.map(parseRawBlocksToEnrichedBlocks))
    const enrichedRight = compact(right.map(parseRawBlocksToEnrichedBlocks))
    return {
        type: "side-by-side",
        left: enrichedLeft,
        right: enrichedRight,
        parseErrors: [],
    }
}

function parseGraySection(raw: RawBlockGraySection): EnrichedBlockGraySection {
    return {
        type: "gray-section",
        items: compact(raw.value.map(parseRawBlocksToEnrichedBlocks)),
        parseErrors: [],
    }
}

function parseProminentLink(
    raw: RawBlockProminentLink
): EnrichedBlockProminentLink {
    const createError = (error: ParseError): EnrichedBlockProminentLink => ({
        type: "prominent-link",
        parseErrors: [error],
        title: "",
        url: "",
        description: "",
    })

    const url = extractUrl(raw.value.url)

    if (!url) {
        return createError({ message: "No url given for the prominent link" })
    }

    if (!checkIsInternalLink(url) && !raw.value.title) {
        return createError({
            message:
                "No title given for the prominent link. If the link points to an external source, it must have a title.",
        })
    }

    return {
        type: "prominent-link",
        parseErrors: [],
        title: raw.value.title,
        url,
        description: raw.value.description,
        thumbnail: raw.value.thumbnail,
    }
}

function parseCallout(raw: RawBlockCallout): EnrichedBlockCallout {
    const createError = (error: ParseError): EnrichedBlockCallout => ({
        type: "callout",
        parseErrors: [error],
        title: "",
        text: [],
    })

    if (!raw.value.text) {
        return createError({ message: "No text provided for callout block" })
    }

    if (!isArray(raw.value.text)) {
        return createError({
            message:
                "Text must be provided as an array e.g. inside a [.+text] block",
        })
    }
    for (const block of raw.value.text) {
        if (!["text", "list", "heading"].includes(block.type)) {
            return createError({
                message:
                    "Callout blocks can only contain text, lists, and headings",
            })
        }
    }

    const enrichedTextBlocks = raw.value.text.map(
        parseRawBlocksToEnrichedBlocks
    ) as (EnrichedBlockText | EnrichedBlockList | EnrichedBlockHeading | null)[]

    return {
        type: "callout",
        parseErrors: [],
        text: excludeNullish(enrichedTextBlocks),
        title: raw.value.title,
    }
}

function parseTopicPageIntro(
    raw: RawBlockTopicPageIntro
): EnrichedBlockTopicPageIntro {
    const createError = (error: ParseError): EnrichedBlockTopicPageIntro => ({
        type: "topic-page-intro",
        parseErrors: [error],
        content: [],
    })

    if (!raw.value.content) {
        return createError({
            message: "Missing content",
        })
    }

    const contentErrors: ParseError[] = []
    const textOnlyContent = raw.value.content.filter(
        (element) => element.type === "text"
    )
    if (raw.value.content.length !== textOnlyContent.length) {
        contentErrors.push({
            message:
                "Only paragraphs are supported in topic-page-intro blocks.",
            isWarning: true,
        })
    }

    const downloadButton = raw.value["download-button"]
    if (downloadButton) {
        if (!downloadButton.text) {
            return createError({
                message: "Download button specified but missing text value",
            })
        }

        if (!downloadButton.url) {
            return createError({
                message: "Download button specified but missing url value",
            })
        }
    }

    const enrichedDownloadButton: EnrichedBlockTopicPageIntro["downloadButton"] =
        downloadButton
            ? {
                  ...downloadButton,
                  type: "topic-page-intro-download-button",
              }
            : undefined

    const relatedTopics = raw.value["related-topics"]
    const enrichedRelatedTopics: EnrichedTopicPageIntroRelatedTopic[] = []
    if (relatedTopics) {
        for (const relatedTopic of relatedTopics) {
            if (!relatedTopic.url) {
                return createError({
                    message: "A related topic is missing a url",
                })
            }

            const url = extractUrl(relatedTopic.url)
            const { isGoogleDoc } = Url.fromURL(relatedTopic.url)
            if (!isGoogleDoc && !relatedTopic.text) {
                return createError({
                    message:
                        "A title must be provided for related topics that aren't linked via Gdocs",
                })
            }

            // If we've validated that it's a Gdoc link without a title,
            // or a regular link *with* a title, then we're good to go
            const enrichedRelatedTopic: EnrichedTopicPageIntroRelatedTopic = {
                type: "topic-page-intro-related-topic",
                url,
                text: relatedTopic.text,
            }

            enrichedRelatedTopics.push(enrichedRelatedTopic)
        }
    }

    return {
        type: "topic-page-intro",
        downloadButton: enrichedDownloadButton,
        relatedTopics: enrichedRelatedTopics,
        content: textOnlyContent.map((rawText) =>
            htmlToEnrichedTextBlock(rawText.value)
        ),
        parseErrors: [...contentErrors],
    }
}

function parseKeyInsights(raw: RawBlockKeyInsights): EnrichedBlockKeyInsights {
    const createError = (error: ParseError): EnrichedBlockKeyInsights => ({
        type: "key-insights",
        parseErrors: [error],
        heading: "",
        insights: [],
    })

    if (!raw.value.insights?.length) {
        return createError({ message: "No insights included" })
    }

    if (!raw.value.heading) {
        return createError({ message: "No heading for key insights block" })
    }

    if (typeof raw.value.heading !== "string") {
        return createError({
            message: "Heading for key insights block must be a string",
        })
    }

    const enrichedInsights: EnrichedBlockKeyInsightsSlide[] = []
    const enrichedInsightParseErrors: ParseError[] = []
    for (const rawInsight of raw.value.insights) {
        const parseErrors: ParseError[] = []
        if (!rawInsight.title) {
            parseErrors.push({ message: "Key insight is missing a title" })
        }
        if (!rawInsight.url && !rawInsight.filename) {
            parseErrors.push({
                message:
                    "Key insight is missing a url or filename. One of these two fields must be specified.",
            })
        }
        if (rawInsight.url && rawInsight.filename) {
            parseErrors.push({
                message:
                    "Key insight has both a url and a filename. Only one of these two fields can be specified.",
            })
        }
        const url = Url.fromURL(extractUrl(rawInsight.url))
        if (url.fullUrl) {
            if (!url.isExplorer && !url.isGrapher) {
                parseErrors.push({
                    message:
                        "Key insight has url that isn't an explorer or grapher",
                })
            }
        }
        const enrichedContent: OwidEnrichedGdocBlock[] = []
        if (!rawInsight.content) {
            parseErrors.push({ message: "Key insight is missing content" })
        } else {
            for (const rawContent of compact(rawInsight.content)) {
                const enrichedBlock = parseRawBlocksToEnrichedBlocks(rawContent)
                if (enrichedBlock) enrichedContent.push(enrichedBlock)
            }
        }
        enrichedInsightParseErrors.push(...parseErrors)
        if (rawInsight.title) {
            const enrichedInsight: EnrichedBlockKeyInsightsSlide = {
                type: "key-insight-slide",
                title: rawInsight.title,
                content: enrichedContent,
            }
            if (url.fullUrl) {
                enrichedInsight.url = url.fullUrl
            }
            if (rawInsight.filename) {
                enrichedInsight.filename = rawInsight.filename
            }
            enrichedInsights.push(enrichedInsight)
        }
    }

    return {
        type: "key-insights",
        heading: raw.value.heading,
        insights: enrichedInsights,
        parseErrors: [...enrichedInsightParseErrors],
    }
}

export function parseFaqs(
    faqs: unknown,
    gdocId: string
): {
    faqs: FaqDictionary
    parseErrors: ParseError[]
} {
    if (!Array.isArray(faqs))
        return {
            faqs: {},
            parseErrors: [
                {
                    message: `No faqs defined in document with id "${gdocId}"`,
                },
            ],
        }

    function parseFaq(faq: unknown): EnrichedFaq {
        const createError = (
            error: ParseError,
            id: string = "",
            content: OwidEnrichedGdocBlock[] = []
        ): EnrichedFaq => ({
            id,
            content,
            parseErrors: [error],
        })

        if (!checkIsPlainObjectWithGuard(faq))
            return createError({
                message: "Faq is not a plain-object and cannot be parsed",
            })
        if (typeof faq.id !== "string")
            return createError({
                message: "Faq does not have an id",
            })
        if (!Array.isArray(faq.content) || !faq.content.length)
            return createError({
                message: `Faq with id "${faq.id}" does not have any blocks`,
            })

        const enrichedText = compact(
            faq.content.map(parseRawBlocksToEnrichedBlocks)
        )

        return {
            id: faq.id,
            content: enrichedText,
            parseErrors: compact([
                ...enrichedText.flatMap((block) =>
                    block?.parseErrors.map((parseError) => ({
                        ...parseError,
                        message: `Block parse error in faq with id "${faq.id}": ${parseError.message}`,
                    }))
                ),
            ]),
        }
    }

    const [enrichedFaqs, faqsWithErrors] = partition(
        faqs.map(parseFaq),
        (detail) => !detail.parseErrors.length
    )

    return {
        faqs: keyBy(enrichedFaqs, "id"),
        parseErrors: faqsWithErrors.flatMap((faq) => faq.parseErrors),
    }
}

export function parseDetails(details: unknown): {
    details: DetailDictionary
    parseErrors: ParseError[]
} {
    if (!Array.isArray(details))
        return {
            details: {},
            parseErrors: [
                {
                    message: `No details defined in document with id "${GDOCS_DETAILS_ON_DEMAND_ID}"`,
                },
            ],
        }

    function parseDetail(detail: unknown): EnrichedDetail {
        const createError = (
            error: ParseError,
            id: string = "",
            text: EnrichedBlockText[] = []
        ): EnrichedDetail => ({
            id,
            text,
            parseErrors: [error],
        })

        if (!checkIsPlainObjectWithGuard(detail))
            return createError({
                message: "Detail is not a plain-object and cannot be parsed",
            })
        if (typeof detail.id !== "string")
            return createError({
                message: "Detail does not have an id",
            })
        if (!Array.isArray(detail.text) || !detail.text.length)
            return createError({
                message: `Detail with id "${detail.id}" does not have any text`,
            })

        const enrichedText = detail.text.map(parseText)

        return {
            id: detail.id,
            text: enrichedText,
            parseErrors: [
                ...enrichedText.flatMap((text) =>
                    text.parseErrors.map((parseError) => ({
                        ...parseError,
                        message: `Text parse error in detail with id "${detail.id}": ${parseError.message}`,
                    }))
                ),
            ],
        }
    }

    const [enrichedDetails, detailsWithErrors] = partition(
        details.map(parseDetail),
        (detail) => !detail.parseErrors.length
    )

    return {
        details: keyBy(enrichedDetails, "id"),
        parseErrors: detailsWithErrors.flatMap((detail) => detail.parseErrors),
    }
}

function parseExpandableParagraph(
    raw: RawBlockExpandableParagraph
): EnrichedBlockExpandableParagraph {
    const createError = (
        error: ParseError
    ): EnrichedBlockExpandableParagraph => ({
        type: "expandable-paragraph",
        items: [],
        parseErrors: [error],
    })

    if (!Array.isArray(raw.value) || !raw.value.length) {
        return createError({
            message:
                "The block should be defined as an array, and have some content in it",
        })
    }
    return {
        type: "expandable-paragraph",
        items: compact(raw.value.map(parseRawBlocksToEnrichedBlocks)),
        parseErrors: [],
    }
}

function parseResearchAndWritingBlock(
    raw: RawBlockResearchAndWriting
): EnrichedBlockResearchAndWriting {
    const createError = (
        error: ParseError,
        primary = {
            value: { url: "" },
        },
        secondary = {
            value: { url: "" },
        },
        more: EnrichedBlockResearchAndWritingRow = {
            heading: "",
            articles: [],
        },
        rows: EnrichedBlockResearchAndWritingRow[] = []
    ): EnrichedBlockResearchAndWriting => ({
        type: "research-and-writing",
        primary,
        secondary,
        more,
        rows,
        parseErrors: [error],
    })
    const parseErrors: ParseError[] = []

    function enrichLink(
        rawLink?: RawBlockResearchAndWritingLink,
        skipFilenameValidation: boolean = false
    ): EnrichedBlockResearchAndWritingLink {
        function createLinkError(
            message: string
        ): EnrichedBlockResearchAndWritingLink {
            parseErrors.push({ message })
            return {
                value: {
                    url: "",
                },
            }
        }

        if (checkIsPlainObjectWithGuard(rawLink)) {
            const { url, authors, filename, title, subtitle } = rawLink
            if (!url) return createLinkError("Link missing url")
            const enrichedUrl = extractUrl(url)
            const { isGoogleDoc } = Url.fromURL(enrichedUrl)
            if (!isGoogleDoc) {
                if (!authors) {
                    return createLinkError(
                        `Research and writing link with URL "${enrichedUrl}" missing authors`
                    )
                }
                if (!title) {
                    return createLinkError(
                        `Research and writing link with URL "${enrichedUrl}" missing title`
                    )
                }
                if (!skipFilenameValidation && !filename) {
                    return createLinkError(
                        `Research and writing link with URL "${enrichedUrl}" missing filename`
                    )
                }
            }
            const enriched: EnrichedBlockResearchAndWritingLink = {
                value: { url: enrichedUrl },
            }
            if (authors) enriched.value.authors = parseAuthors(authors)
            if (title) enriched.value.title = title
            if (filename) enriched.value.filename = filename
            if (subtitle) enriched.value.subtitle = subtitle
            return enriched
        } else return createLinkError(`Malformed link data: ${typeof rawLink}`)
    }

    if (!raw.value.primary)
        return createError({ message: "Missing primary link" })
    const primary = enrichLink(raw.value.primary)

    if (!raw.value.secondary)
        return createError({ message: "Missing secondary link" })
    const secondary = enrichLink(raw.value.secondary)

    if (!raw.value.more)
        return createError({ message: "No 'more' section defined" })

    function parseRow(
        rawRow: RawBlockResearchAndWritingRow,
        skipFilenameValidation: boolean = false
    ): EnrichedBlockResearchAndWritingRow {
        if (!rawRow.heading) {
            parseErrors.push({ message: `Row missing "heading" value` })
        } else if (typeof rawRow.heading !== "string") {
            parseErrors.push({ message: `Row "heading" must be a string` })
        } else if (!rawRow.articles) {
            parseErrors.push({
                message: `Row with heading ${rawRow.heading} no articles defined. Be sure to use a "[.articles]" tag`,
            })
        } else {
            return {
                heading: rawRow.heading,
                articles: rawRow.articles.map((rawLink) =>
                    enrichLink(rawLink, skipFilenameValidation)
                ),
            }
        }

        return { heading: "", articles: [] }
    }

    const more = parseRow(raw.value.more, true)
    const rows = raw.value.rows?.map((row) => parseRow(row)) || []

    return {
        type: "research-and-writing",
        primary,
        secondary,
        more,
        rows,
        parseErrors,
    }
}

function parseAlign(b: RawBlockAlign): EnrichedBlockAlign {
    const createError = (error: ParseError): EnrichedBlockAlign => ({
        type: "align",
        alignment: HorizontalAlign.left,
        content: [],
        parseErrors: [error],
    })

    const possibleAlignValues = Object.values(HorizontalAlign) as string[]
    const possibleAlignValuesString = possibleAlignValues
        .map((v) => `"${v}"`)
        .join(", ")

    if (!b.value.alignment)
        return createError({
            message: `Missing alignment property (allowed: one of ${possibleAlignValuesString})`,
        })

    if (!possibleAlignValues.includes(b.value.alignment))
        return createError({
            message: `Invalid alignment property (allowed: one of ${possibleAlignValuesString})`,
        })

    if (!b.value.content) return createError({ message: "Missing content" })

    return {
        type: "align",
        alignment: b.value.alignment as HorizontalAlign,
        content: compact(b.value.content.map(parseRawBlocksToEnrichedBlocks)),
        parseErrors: [],
    }
}

export function parseRefs({
    refs,
    refsByFirstAppearance,
}: {
    refs: unknown
    refsByFirstAppearance: Set<string>
}): { definitions: RefDictionary; errors: OwidGdocErrorMessage[] } {
    const parsedRefs: RefDictionary = {}
    const refErrors: OwidGdocErrorMessage[] = []

    const pushRefError = (message: string): void => {
        refErrors.push({
            message,
            property: "refs",
            type: OwidGdocErrorMessageType.Error,
        })
    }
    if (isArray(refs)) {
        for (const ref of refs) {
            if (typeof ref.id === "string") {
                const enrichedBlocks: OwidEnrichedGdocBlock[] = []
                const parseErrors: ParseError[] = []
                if (!refsByFirstAppearance.has(ref.id)) {
                    // index will be -1 in this case
                    pushRefError(
                        `A ref with ID "${ref.id}" has been defined but isn't used in this document`
                    )
                }
                if (!isArray(ref.content) || !ref.content.length) {
                    pushRefError(
                        `Ref with ID ${ref.id} has no content. Make sure the ID is defined and it has a [.+content] block`
                    )
                } else {
                    ref.content.forEach((block: OwidRawGdocBlock) => {
                        match(block)
                            .with(
                                {
                                    type: P.union(
                                        "text",
                                        "numbered-list",
                                        "list"
                                    ),
                                },
                                (block) => {
                                    const enrichedBlock =
                                        parseRawBlocksToEnrichedBlocks(block)
                                    if (enrichedBlock)
                                        enrichedBlocks.push(enrichedBlock)
                                }
                            )
                            .otherwise((block) => {
                                pushRefError(
                                    `Unsupported block type "${block.type}" in ref with ID "${ref.id}"`
                                )
                            })
                    })
                }

                const index = [...refsByFirstAppearance].indexOf(ref.id)

                parsedRefs[ref.id] = {
                    id: ref.id,
                    index,
                    content: enrichedBlocks,
                    parseErrors,
                }
            }
        }
    }

    refErrors.push(
        ...[...refsByFirstAppearance]
            .filter((ref) => !parsedRefs[ref])
            .map(
                (undefinedRef): OwidGdocErrorMessage => ({
                    message: `"${undefinedRef}" is used as a ref ID but no definition for this ref has been written.`,
                    property: "refs",
                    type: OwidGdocErrorMessageType.Error,
                })
            )
    )

    return { definitions: parsedRefs, errors: refErrors }
}
