import { ImageMetadata } from "./image.js"
import { Static, Type } from "@sinclair/typebox"
import { gdocUrlRegex } from "./GdocsConstants.js"
import { OwidOrigin } from "./OwidOrigin.js"
import { OwidSource } from "./OwidSource.js"

// todo: remove when we ditch Year and YearIsDay
export const EPOCH_DATE = "2020-01-21"

/** The "plot" is a chart without any header, footer or controls */
export const IDEAL_PLOT_ASPECT_RATIO = 1.8

export interface Box {
    x: number
    y: number
    width: number
    height: number
}

export type Integer = number
// TODO: remove duplicate definition, also available in CoreTable
export enum SortOrder {
    asc = "asc",
    desc = "desc",
}

export enum SortBy {
    custom = "custom",
    entityName = "entityName",
    column = "column",
    total = "total",
}

export interface SortConfig {
    sortBy?: SortBy
    sortOrder?: SortOrder
    sortColumnSlug?: string
}

export type Year = Integer
export type Color = string

/**
 * A concrete point in time (year or date). It's always supposed to be a finite number, but we
 * cannot enforce this in TypeScript.
 */
export type Time = Integer
export type TimeRange = [Time, Time]

export type PrimitiveType = number | string | boolean
export type ValueRange = [number, number]

export enum ScaleType {
    linear = "linear",
    log = "log",
}

export interface BasicChartInformation {
    title: string
    slug: string
    variantName?: string | null
}

export interface RelatedChart extends BasicChartInformation {
    keyChartLevel?: KeyChartLevel
}

export type OwidVariableId = Integer // remove.

export const BLOCK_WRAPPER_DATATYPE = "block-wrapper"

export interface FormattedPost extends FullPost {
    supertitle?: string
    stickyNavLinks?: { text: string; target: string }[]
    lastUpdated?: string
    byline?: string
    info?: string
    html: string
    style?: string
    footnotes: string[]
    tocHeadings: TocHeading[]
    pageDesc: string
}

export enum SubNavId {
    about = "about",
    biodiversity = "biodiversity",
    coronavirus = "coronavirus",
    co2 = "co2",
    energy = "energy",
    forests = "forests",
    water = "water",
    explorers = "explorers",
}

export interface FormattingOptions {
    toc?: boolean
    hideAuthors?: boolean
    bodyClassName?: string
    subnavId?: SubNavId
    subnavCurrentId?: string
    raw?: boolean
    hideDonateFooter?: boolean
    footnotes?: boolean
}

export interface BreadcrumbItem {
    label: string
    href?: string
}

export interface KeyValueProps {
    [key: string]: string | boolean | undefined
}

export interface DataValueQueryArgs {
    variableId?: number
    entityId?: number
    chartId?: number
    year?: number
}

export interface DataValueConfiguration {
    queryArgs: DataValueQueryArgs
    template: string
}

export interface DataValueResult {
    value: number
    year: number
    unit?: string
    entityName: string
}

export interface DataValueProps extends DataValueResult {
    formattedValue?: string
    template: string
}

export interface GitCommit {
    author_email: string
    author_name: string
    body: string
    date: string
    hash: string
    message: string
}

export interface SerializedGridProgram {
    slug: string
    program: string
    lastCommit?: GitCommit
}

export interface TocHeading {
    text: string
    html?: string // used by SectionHeading toc. Excluded from LongFormPage toc.
    slug: string
    isSubheading: boolean
}

export interface TocHeadingWithTitleSupertitle extends TocHeading {
    title: string
    supertitle?: string
}

// todo; remove
export interface PostRow {
    id: number
    title: string
    slug: string
    type: WP_PostType
    status: string
    content: string
    published_at: Date | null
    updated_at: Date | null
    updated_at_in_wordpress: Date | null
    archieml: string
    archieml_update_statistics: string
    gdocSuccessorId: string | null
    authors: string
    excerpt: string
    created_at_in_wordpress: Date | null
}

export interface PostRowWithGdocPublishStatus extends PostRow {
    isGdocPublished: boolean
}

export enum KeyChartLevel {
    None = 0, // not a key chart, will not show in the all charts block of the related topic page
    Bottom = 1, // chart will show at the bottom of the all charts block
    Middle = 2, // chart will show in the middle of the all charts block
    Top = 3, // chart will show at the top of the all charts block
}

export interface Tag {
    id: number
    name: string
    keyChartLevel?: KeyChartLevel
    isApproved?: boolean
}

export enum TaggableType {
    Charts = "charts",
}

export interface EntryMeta {
    slug: string
    title: string
    excerpt: string
    kpi: string
}

export interface CategoryWithEntries {
    name: string
    slug: string
    entries: EntryMeta[]
    subcategories: CategoryWithEntries[]
}

export enum WP_PostType {
    Post = "post",
    Page = "page",
}

export interface EntryNode {
    slug: string
    title: string
    // in some edge cases (entry alone in a subcategory), WPGraphQL returns
    // null instead of an empty string)
    excerpt: string | null
    kpi: string
}

export type TopicId = number

export enum GraphDocumentType {
    Topic = "topic",
    Article = "article",
}

export interface AlgoliaRecord {
    id: number
    title: string
    type: GraphType | GraphDocumentType
    image?: string
}

export interface DocumentNode {
    id: number
    title: string
    slug: string
    content: string | null // if content is empty
    type: GraphDocumentType
    image: string | null
    parentTopics: Array<TopicId>
}

export interface CategoryNode {
    name: string
    slug: string
    pages: any
    children: any
}

export enum GraphType {
    Document = "document",
    Chart = "chart",
}

export interface ChartRecord {
    id: number
    title: string
    slug: string
    type: GraphType.Chart
    parentTopics: Array<TopicId>
}

export interface PostReference {
    id: number | string
    title: string
    slug: string
}

export type FilterFnPostRestApi = (post: PostRestApi) => boolean

export interface PostRestApi {
    slug: string
    meta: {
        owid_publication_context_meta_field?: {
            immediate_newsletter?: boolean
            homepage?: boolean
            latest?: boolean
        }
    }
}

export interface KeyInsight {
    title: string
    isTitleHidden?: boolean
    content: string
    slug: string
}

export interface IndexPost {
    title: string
    slug: string
    type?: WP_PostType | OwidGdocType
    date: Date
    modifiedDate: Date
    authors: string[]
    excerpt?: string
    imageUrl?: string
}

export interface FullPost extends IndexPost {
    id: number
    path: string
    content: string
    thumbnailUrl?: string
    imageId?: number
    postId?: number
    relatedCharts?: RelatedChart[]
}

export enum WP_ColumnStyle {
    StickyRight = "sticky-right",
    StickyLeft = "sticky-left",
    SideBySide = "side-by-side",
}

export enum WP_BlockClass {
    FullContentWidth = "wp-block-full-content-width", // not an actual WP block yet
}

export enum WP_BlockType {
    AllCharts = "all-charts",
}

export enum SuggestedChartRevisionStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected",
    flagged = "flagged",
}

// Exception format that can be easily given as an API error
export class JsonError extends Error {
    status: number
    constructor(message: string, status?: number) {
        super(message)
        this.status = status || 400
    }
}

export enum DeployStatus {
    queued = "queued",
    pending = "pending",
    // done = "done"
}

export interface DeployChange {
    timeISOString?: string
    authorName?: string
    authorEmail?: string
    message?: string
    slug?: string
}

export interface Deploy {
    status: DeployStatus
    changes: DeployChange[]
}

export interface Annotation {
    entityName?: string
    year?: number
}

export enum DimensionProperty {
    y = "y",
    x = "x",
    size = "size",
    color = "color",
    table = "table",
}

// see CoreTableConstants.ts
export type ColumnSlug = string // a url friendly name for a column in a table. cannot have spaces

export enum Position {
    top = "top",
    right = "right",
    bottom = "bottom",
    left = "left",
}

export type PositionMap<Value> = {
    [key in Position]?: Value
}

export enum HorizontalAlign {
    left = "left",
    center = "center",
    right = "right",
}

export enum VerticalAlign {
    top = "top",
    middle = "middle",
    bottom = "bottom",
}

export enum AxisAlign {
    start = "start",
    middle = "middle",
    end = "end",
}

export interface GridParameters {
    rows: number
    columns: number
}

export type SpanSimpleText = {
    spanType: "span-simple-text"
    text: string
}

export type SpanFallback = {
    spanType: "span-fallback"
    children: Span[]
}

export type SpanLink = {
    spanType: "span-link"
    children: Span[]
    url: string
}

export type SpanRef = {
    spanType: "span-ref"
    children: Span[]
    url: string
}

export type SpanDod = {
    spanType: "span-dod"
    children: Span[]
    id: string
}

export type SpanNewline = {
    spanType: "span-newline"
}

export type SpanItalic = {
    spanType: "span-italic"
    children: Span[]
}

export type SpanBold = {
    spanType: "span-bold"
    children: Span[]
}

export type SpanUnderline = {
    spanType: "span-underline"
    children: Span[]
}

export type SpanSubscript = {
    spanType: "span-subscript"
    children: Span[]
}

export type SpanSuperscript = {
    spanType: "span-superscript"
    children: Span[]
}

export type SpanQuote = {
    spanType: "span-quote"
    children: Span[]
}
export type UnformattedSpan = SpanSimpleText | SpanNewline

export type Span =
    | SpanSimpleText
    | SpanDod
    | SpanLink
    | SpanRef
    | SpanNewline
    | SpanItalic
    | SpanBold
    | SpanUnderline
    | SpanSubscript
    | SpanSuperscript
    | SpanQuote
    | SpanFallback

export type BlockPositionChoice = "right" | "left"
export type ChartPositionChoice = "featured"

type ArchieMLUnexpectedNonObjectValue = string

export type ParseError = {
    message: string
    isWarning?: boolean
}

export type EnrichedBlockWithParseErrors = {
    parseErrors: ParseError[]
}

export type RawBlockAsideValue = {
    position?: string // use BlockPositionChoice in matching Enriched block
    caption?: string
}

export type RawBlockAside = {
    type: "aside"
    value: RawBlockAsideValue | ArchieMLUnexpectedNonObjectValue
}

export type EnrichedBlockAside = {
    type: "aside"
    position?: BlockPositionChoice
    caption: Span[]
} & EnrichedBlockWithParseErrors

export enum ChartControlKeyword {
    all = "all",
    relativeToggle = "relativeToggle",
    timeline = "timeline",
    facetControl = "facetControl",
    entitySelector = "entitySelector",
    zoomToggle = "zoomToggle",
    noDataAreaToggle = "noDataAreaToggle",
    alignAxisScalesToggle = "alignAxisScalesToggle",
    xLogLinearSelector = "xLogLinearSelector",
    yLogLinearSelector = "yLogLinearSelector",
}

export enum ChartTabKeyword {
    all = "all",
    chart = "chart",
    map = "map",
    table = "table",
    download = "download",
}

export type RawBlockChartValue = {
    url?: string
    height?: string
    row?: string
    column?: string
    // TODO: position is used as a classname apparently? Should be renamed or split
    position?: string
    caption?: string
    title?: string
    subtitle?: string
    controls?: { list: string[] }[]
    tabs?: { list: string[] }[]
}

export type RawBlockChart = {
    type: "chart"
    value: RawBlockChartValue | string
}

export type EnrichedBlockChart = {
    type: "chart"
    url: string
    height?: string
    row?: string
    column?: string
    position?: ChartPositionChoice
    caption?: Span[]
    title?: string
    subtitle?: string
    controls?: ChartControlKeyword[]
    tabs?: ChartTabKeyword[]
} & EnrichedBlockWithParseErrors

export type RawBlockScroller = {
    type: "scroller"
    value: OwidRawGdocBlock[] | ArchieMLUnexpectedNonObjectValue
}

export type EnrichedScrollerItem = {
    type: "enriched-scroller-item"
    url: string
    text: EnrichedBlockText
}

export type EnrichedBlockScroller = {
    type: "scroller"
    blocks: EnrichedScrollerItem[]
} & EnrichedBlockWithParseErrors

export type RawChartStoryValue = {
    narrative?: string
    chart?: string
    technical?: { list?: string[] }
}

export type RawBlockChartStory = {
    type: "chart-story"
    value: RawChartStoryValue[] | ArchieMLUnexpectedNonObjectValue
}

export type EnrichedChartStoryItem = {
    narrative: EnrichedBlockText
    chart: EnrichedBlockChart
    technical: EnrichedBlockText[]
}

export type EnrichedBlockChartStory = {
    type: "chart-story"
    items: EnrichedChartStoryItem[]
} & EnrichedBlockWithParseErrors

export enum BlockImageSize {
    Narrow = "narrow",
    Wide = "wide",
}

export function checkIsBlockImageSize(size: unknown): size is BlockImageSize {
    if (typeof size !== "string") return false
    return Object.values(BlockImageSize).includes(size as any)
}

export type RawBlockImage = {
    type: "image"
    value: {
        filename?: string
        alt?: string
        caption?: string
        size?: BlockImageSize
    }
}

export type EnrichedBlockImage = {
    type: "image"
    filename: string
    alt?: string // optional as we can use the default alt from the file
    caption?: Span[]
    originalWidth?: number
    size: BlockImageSize
} & EnrichedBlockWithParseErrors

// TODO: This is what lists staring with * are converted to in archieToEnriched
// It might also be what is used inside recirc elements but there it's not a simple
// string IIRC - check this
export type RawBlockList = {
    type: "list"
    value: string[] | ArchieMLUnexpectedNonObjectValue
}

export type EnrichedBlockList = {
    type: "list"
    items: EnrichedBlockText[]
} & EnrichedBlockWithParseErrors

export type RawBlockNumberedList = {
    type: "numbered-list"
    value: string[] | ArchieMLUnexpectedNonObjectValue
}

export type EnrichedBlockNumberedList = {
    type: "numbered-list"
    items: EnrichedBlockText[]
} & EnrichedBlockWithParseErrors

export type RawBlockPullQuote = {
    type: "pull-quote"
    value: OwidRawGdocBlock[] | ArchieMLUnexpectedNonObjectValue
}

export type EnrichedBlockPullQuote = {
    type: "pull-quote"
    text: SpanSimpleText[]
} & EnrichedBlockWithParseErrors

export type RawBlockHorizontalRule = {
    type: "horizontal-rule"
    value?: Record<string, never> // dummy value to unify block shapes
}

export type EnrichedBlockHorizontalRule = {
    type: "horizontal-rule"
    value?: Record<string, never> // dummy value to unify block shapes
} & EnrichedBlockWithParseErrors

export type RawRecircLink = {
    url?: string
}

export type RawBlockRecirc = {
    type: "recirc"
    value?: {
        title?: string
        links?: RawRecircLink[]
    }
}

export type EnrichedRecircLink = {
    url: string
    type: "recirc-link"
}

export type EnrichedBlockRecirc = {
    type: "recirc"
    title: SpanSimpleText
    links: EnrichedRecircLink[]
} & EnrichedBlockWithParseErrors

export type RawBlockText = {
    type: "text"
    value: string
}

export type EnrichedBlockText = {
    type: "text"
    value: Span[]
} & EnrichedBlockWithParseErrors

export type EnrichedBlockSimpleText = {
    type: "simple-text"
    value: SpanSimpleText
} & EnrichedBlockWithParseErrors
export type RawBlockHtml = {
    type: "html"
    value: string
}

export type EnrichedBlockHtml = {
    type: "html"
    value: string
} & EnrichedBlockWithParseErrors
export type RawBlockUrl = {
    type: "url"
    value: string
}
// There is no EnrichedBlockUrl because Url blocks only exist inside Sliders;
// they are subsumed into Slider blocks during enrichment
export type RawBlockPosition = {
    type: "position"
    value: string
}

export type RawBlockHeadingValue = {
    text?: string
    level?: string
}
export type RawBlockHeading = {
    type: "heading"
    value: RawBlockHeadingValue | ArchieMLUnexpectedNonObjectValue
}

export type EnrichedBlockHeading = {
    type: "heading"
    text: Span[]
    supertitle?: Span[]
    level: number
} & EnrichedBlockWithParseErrors

export type RawSDGGridItem = {
    goal?: string
    link?: string
}

export type RawBlockSDGGrid = {
    type: "sdg-grid"
    value: RawSDGGridItem[] | ArchieMLUnexpectedNonObjectValue
}

export type EnrichedSDGGridItem = {
    goal: string
    link: string
}

export type EnrichedBlockSDGGrid = {
    type: "sdg-grid"
    items: EnrichedSDGGridItem[]
} & EnrichedBlockWithParseErrors

export type RawBlockStickyRightContainer = {
    type: "sticky-right"
    value: {
        left: OwidRawGdocBlock[]
        right: OwidRawGdocBlock[]
    }
}

export type EnrichedBlockStickyRightContainer = {
    type: "sticky-right"
    left: OwidEnrichedGdocBlock[]
    right: OwidEnrichedGdocBlock[]
} & EnrichedBlockWithParseErrors

export type RawBlockStickyLeftContainer = {
    type: "sticky-left"
    value: {
        left: OwidRawGdocBlock[]
        right: OwidRawGdocBlock[]
    }
}

export type EnrichedBlockStickyLeftContainer = {
    type: "sticky-left"
    left: OwidEnrichedGdocBlock[]
    right: OwidEnrichedGdocBlock[]
} & EnrichedBlockWithParseErrors

export type RawBlockSideBySideContainer = {
    type: "side-by-side"
    value: {
        left: OwidRawGdocBlock[]
        right: OwidRawGdocBlock[]
    }
}

export type EnrichedBlockSideBySideContainer = {
    type: "side-by-side"
    left: OwidEnrichedGdocBlock[]
    right: OwidEnrichedGdocBlock[]
} & EnrichedBlockWithParseErrors

export type RawBlockAllCharts = {
    type: "all-charts"
    value: {
        heading?: string
        top?: { url: string }[]
    }
}

export type EnrichedBlockAllCharts = {
    type: "all-charts"
    heading: string
    top: { url: string }[]
} & EnrichedBlockWithParseErrors

export type RawBlockGraySection = {
    type: "gray-section"
    value: OwidRawGdocBlock[]
}

export type EnrichedBlockGraySection = {
    type: "gray-section"
    items: OwidEnrichedGdocBlock[]
} & EnrichedBlockWithParseErrors

export type ProminentLinkValue = {
    url?: string
    title?: string
    description?: string
    thumbnail?: string
}

export type RawBlockProminentLink = {
    type: "prominent-link"
    value: ProminentLinkValue
}

export type EnrichedBlockProminentLink = {
    type: "prominent-link"
    url: string
    title?: string
    description?: string
    thumbnail?: string
} & EnrichedBlockWithParseErrors

export type RawBlockCallout = {
    type: "callout"
    value: {
        title?: string
        text: (RawBlockText | RawBlockHeading | RawBlockList)[]
    }
}

export type EnrichedBlockCallout = {
    type: "callout"
    title?: string
    text: (EnrichedBlockText | EnrichedBlockHeading | EnrichedBlockList)[]
} & EnrichedBlockWithParseErrors

export type RawBlockTopicPageIntro = {
    type: "topic-page-intro"
    value: {
        "download-button":
            | {
                  text: string
                  url: string
              }
            | undefined
        "related-topics":
            | {
                  text?: string
                  url: string
              }[]
            | undefined
        content: RawBlockText[]
    }
}

export type EnrichedTopicPageIntroRelatedTopic = {
    text?: string
    url: string
    type: "topic-page-intro-related-topic"
}

export type EnrichedTopicPageIntroDownloadButton = {
    text: string
    url: string
    type: "topic-page-intro-download-button"
}

export type EnrichedBlockTopicPageIntro = {
    type: "topic-page-intro"
    downloadButton?: EnrichedTopicPageIntroDownloadButton
    relatedTopics?: EnrichedTopicPageIntroRelatedTopic[]
    content: EnrichedBlockText[]
} & EnrichedBlockWithParseErrors

export type RawBlockKeyInsightsSlide = {
    title?: string
    filename?: string
    url?: string
    content?: OwidRawGdocBlock[]
}

export type RawBlockKeyInsights = {
    type: "key-insights"
    value: {
        heading?: string
        insights?: RawBlockKeyInsightsSlide[]
    }
}

export type EnrichedBlockKeyInsightsSlide = {
    type: "key-insight-slide"
    title: string
    filename?: string
    url?: string
    content: OwidEnrichedGdocBlock[]
}

export type EnrichedBlockKeyInsights = {
    type: "key-insights"
    heading: string
    insights: EnrichedBlockKeyInsightsSlide[]
} & EnrichedBlockWithParseErrors

export type RawBlockResearchAndWritingLink = {
    url?: string
    authors?: string
    title?: string
    subtitle?: string
    filename?: string
}

export type RawBlockResearchAndWritingRow = {
    heading?: string
    articles?: RawBlockResearchAndWritingLink[]
}

export type RawBlockResearchAndWriting = {
    type: "research-and-writing"
    value: {
        primary?: RawBlockResearchAndWritingLink
        secondary?: RawBlockResearchAndWritingLink
        more?: RawBlockResearchAndWritingRow
        rows?: RawBlockResearchAndWritingRow[]
    }
}

export type EnrichedBlockResearchAndWritingLink = {
    value: {
        url: string
        authors?: string[]
        title?: string
        subtitle?: string
        filename?: string
    }
}

export type EnrichedBlockResearchAndWritingRow = {
    heading: string
    articles: EnrichedBlockResearchAndWritingLink[]
}

export type EnrichedBlockResearchAndWriting = {
    type: "research-and-writing"
    primary: EnrichedBlockResearchAndWritingLink
    secondary: EnrichedBlockResearchAndWritingLink
    more: EnrichedBlockResearchAndWritingRow
    rows: EnrichedBlockResearchAndWritingRow[]
} & EnrichedBlockWithParseErrors

export type RawBlockSDGToc = {
    type: "sdg-toc"
    value?: Record<string, never>
}

export type EnrichedBlockSDGToc = {
    type: "sdg-toc"
    value?: Record<string, never>
} & EnrichedBlockWithParseErrors

export type RawBlockMissingData = {
    type: "missing-data"
    value?: Record<string, never>
}

export type EnrichedBlockMissingData = {
    type: "missing-data"
    value?: Record<string, never>
} & EnrichedBlockWithParseErrors

export type RawBlockAdditionalCharts = {
    type: "additional-charts"
    value: {
        list?: string[]
    }
}

export type EnrichedBlockAdditionalCharts = {
    type: "additional-charts"
    items: Span[][]
} & EnrichedBlockWithParseErrors

export type RawBlockExpandableParagraph = {
    type: "expandable-paragraph"
    value: OwidRawGdocBlock[]
}

export type EnrichedBlockExpandableParagraph = {
    type: "expandable-paragraph"
    items: OwidEnrichedGdocBlock[]
} & EnrichedBlockWithParseErrors

export type RawBlockAlign = {
    type: "align"
    value: {
        alignment: string
        content: OwidRawGdocBlock[]
    }
}

export type EnrichedBlockAlign = {
    type: "align"
    alignment: HorizontalAlign
    content: OwidEnrichedGdocBlock[]
} & EnrichedBlockWithParseErrors

export type Ref = {
    id: string
    // Can be -1
    index: number
    content: OwidEnrichedGdocBlock[]
    parseErrors: ParseError[]
}

export type RefDictionary = {
    [refId: string]: Ref
}

export type OwidRawGdocBlock =
    | RawBlockAllCharts
    | RawBlockAside
    | RawBlockCallout
    | RawBlockChart
    | RawBlockScroller
    | RawBlockChartStory
    | RawBlockImage
    | RawBlockList
    | RawBlockPullQuote
    | RawBlockRecirc
    | RawBlockResearchAndWriting
    | RawBlockText
    | RawBlockUrl
    | RawBlockPosition
    | RawBlockHeading
    | RawBlockHtml
    | RawBlockHorizontalRule
    | RawBlockSDGGrid
    | RawBlockStickyRightContainer
    | RawBlockStickyLeftContainer
    | RawBlockSideBySideContainer
    | RawBlockGraySection
    | RawBlockProminentLink
    | RawBlockSDGToc
    | RawBlockMissingData
    | RawBlockAdditionalCharts
    | RawBlockNumberedList
    | RawBlockExpandableParagraph
    | RawBlockTopicPageIntro
    | RawBlockKeyInsights
    | RawBlockAlign

export type OwidEnrichedGdocBlock =
    | EnrichedBlockAllCharts
    | EnrichedBlockText
    | EnrichedBlockAside
    | EnrichedBlockCallout
    | EnrichedBlockChart
    | EnrichedBlockScroller
    | EnrichedBlockChartStory
    | EnrichedBlockImage
    | EnrichedBlockList
    | EnrichedBlockPullQuote
    | EnrichedBlockRecirc
    | EnrichedBlockResearchAndWriting
    | EnrichedBlockHeading
    | EnrichedBlockHtml
    | EnrichedBlockHorizontalRule
    | EnrichedBlockSDGGrid
    | EnrichedBlockStickyRightContainer
    | EnrichedBlockStickyLeftContainer
    | EnrichedBlockSideBySideContainer
    | EnrichedBlockGraySection
    | EnrichedBlockProminentLink
    | EnrichedBlockSDGToc
    | EnrichedBlockMissingData
    | EnrichedBlockAdditionalCharts
    | EnrichedBlockNumberedList
    | EnrichedBlockSimpleText
    | EnrichedBlockExpandableParagraph
    | EnrichedBlockTopicPageIntro
    | EnrichedBlockKeyInsights
    | EnrichedBlockResearchAndWriting
    | EnrichedBlockAlign

export enum OwidGdocPublicationContext {
    unlisted = "unlisted",
    listed = "listed",
}

export interface OwidGdocTag {
    id: number
    name: string
    createdAt: Date
    updatedAt: Date
    parentId: number
    isBulkImport: boolean
    specialType: string
}

// A minimal object containing metadata needed for rendering prominent links etc in the client
export interface LinkedChart {
    originalSlug: string
    resolvedUrl: string
    title: string
    thumbnail?: string
}

export enum OwidGdocType {
    Article = "article",
    TopicPage = "topic-page",
    Fragment = "fragment",
}

export interface OwidGdocInterface {
    id: string
    slug: string
    content: OwidGdocContent
    published: boolean
    createdAt: Date
    publishedAt: Date | null
    updatedAt: Date | null
    publicationContext: OwidGdocPublicationContext
    revisionId: string | null
    breadcrumbs?: BreadcrumbItem[] | null
    linkedCharts?: Record<string, LinkedChart>
    linkedDocuments?: Record<string, OwidGdocInterface>
    relatedCharts?: RelatedChart[]
    imageMetadata?: Record<string, ImageMetadata>
    errors?: OwidGdocErrorMessage[]
    tags?: OwidGdocTag[]
}

export enum OwidGdocErrorMessageType {
    Error = "error",
    Warning = "warning",
}

export type OwidGdocProperty = keyof OwidGdocInterface | keyof OwidGdocContent
export type OwidGdocErrorMessageProperty =
    | OwidGdocProperty
    | `${OwidGdocProperty}${string}` // also allows for nesting, like `breadcrumbs[0].label`
export interface OwidGdocErrorMessage {
    property: OwidGdocErrorMessageProperty
    type: OwidGdocErrorMessageType
    message: string
}

// see also: getOwidGdocFromJSON()
export interface OwidGdocJSON
    extends Omit<OwidGdocInterface, "createdAt" | "publishedAt" | "updatedAt"> {
    createdAt: string
    publishedAt: string | null
    updatedAt: string | null
}

export interface OwidGdocLinkJSON {
    source: OwidGdocInterface
    linkType: "gdoc" | "url" | "grapher" | "explorer"
    target: string
    componentType: string
    text: string
}

/**
 * See ../adminSiteClient/gdocsValidation/getErrors() where these existence
 * constraints are surfaced at runtime on the draft article
 */
export interface OwidGdocPublished extends OwidGdocInterface {
    publishedAt: Date
    updatedAt: Date
    content: OwidGdocContentPublished
}

export interface OwidArticleBackportingStatistics {
    errors: { name: string; details: string }[]
    numErrors: number
    numBlocks: number
    htmlTagCounts: Record<string, number>
    wpTagCounts: Record<string, number>
}

export interface OwidGdocContent {
    body?: OwidEnrichedGdocBlock[]
    type?: OwidGdocType
    title?: string
    supertitle?: string
    subtitle?: string
    authors: string[]
    dateline?: string
    excerpt?: string
    refs?: { definitions: RefDictionary; errors: OwidGdocErrorMessage[] }
    summary?: EnrichedBlockText[]
    citation?: EnrichedBlockSimpleText[]
    toc?: TocHeadingWithTitleSupertitle[]
    "cover-image"?: string
    "featured-image"?: string
    "atom-title"?: string
    "atom-excerpt"?: string
    "cover-color"?:
        | "sdg-color-1"
        | "sdg-color-2"
        | "sdg-color-3"
        | "sdg-color-4"
        | "sdg-color-5"
        | "sdg-color-6"
        | "sdg-color-7"
        | "sdg-color-8"
        | "sdg-color-9"
        | "sdg-color-10"
        | "sdg-color-11"
        | "sdg-color-12"
        | "sdg-color-13"
        | "sdg-color-14"
        | "sdg-color-15"
        | "sdg-color-16"
        | "sdg-color-17"
        | "amber"
    "sticky-nav"?: []
    details?: DetailDictionary
    // TODO: having both the unparsed and parsed variant on the same type is pretty crude
    // Consider moving faqs into body or splitting the types and creating
    // a parsed and an unparsed gdoc variant.
    faqs?: RawFaq[]
    parsedFaqs?: FaqDictionary
}

export type OwidGdocStickyNavItem = { target: string; text: string }

export interface OwidGdocContentPublished extends OwidGdocContent {
    body: OwidEnrichedGdocBlock[]
    title: string
    excerpt: string
}

export type GdocsPatch = Partial<OwidGdocInterface>

export enum GdocsContentSource {
    Internal = "internal",
    Gdocs = "gdocs",
}

export enum SiteFooterContext {
    gdocsDocument = "gdocsDocument", // the rendered version (on the site)
    grapherPage = "grapherPage",
    dataPage = "dataPage",
    dataPageV2 = "dataPageV2",
    explorerPage = "explorerPage",
    default = "default",
}

export type RawDetail = {
    id: string
    text: RawBlockText[]
}

export type EnrichedDetail = {
    id: string
    text: EnrichedBlockText[]
} & EnrichedBlockWithParseErrors

export type DetailDictionary = Record<string, EnrichedDetail>

export type RawFaq = {
    id: string
    content: OwidRawGdocBlock[]
}
export type EnrichedFaq = {
    id: string
    content: OwidEnrichedGdocBlock[]
} & EnrichedBlockWithParseErrors

export type FaqDictionary = Record<string, EnrichedFaq>

/**
 * An unbounded value (±Infinity) or a concrete point in time (year or date).
 */
export type TimeBound = number

export type TimeBounds = [TimeBound, TimeBound]

/**
 * The two special TimeBound values: unbounded left & unbounded right.
 */
export enum TimeBoundValue {
    negativeInfinity = -Infinity,
    positiveInfinity = Infinity,
}

/**
 * Time tolerance strategy used for maps
 */
export enum ToleranceStrategy {
    closest = "closest",
    backwards = "backwards",
    forwards = "forwards",
}

/**
 * Pageview information about a single URL
 */
export interface RawPageview {
    day: Date
    url: string
    views_7d: number
    views_14d: number
    views_365d: number
}

export const AllowedDataPageGdocFields = [
    "keyInfoText",
    "faqs",
    "descriptionFromSource",
    "variableProcessingInfo",
    // This is a hacky way of handling sourceDescription fields, entered in the
    // gdoc as sourceDescription1, sourceDescription2, etc... The 10 limit is
    // arbitrary and should be plenty, but could be increased if needed.
    "sourceDescription1",
    "sourceDescription2",
    "sourceDescription3",
    "sourceDescription4",
    "sourceDescription5",
    "sourceDescription6",
    "sourceDescription7",
    "sourceDescription8",
    "sourceDescription9",
    "sourceDescription10",
] as const

export type DataPageGdocContent = Record<
    (typeof AllowedDataPageGdocFields)[number],
    OwidEnrichedGdocBlock[]
>

export interface FaqLink {
    gdocId: string
    fragmentId: string
}

export interface DataPageDataV2 {
    status: "published" | "draft"
    title: string
    titleVariant?: string
    attributionShort?: string
    topicTagsLinks?: string[]
    attribution: string
    descriptionShort?: string
    descriptionFromProducer?: string
    faqs: FaqLink[] // Todo: resolve these at this level to the point where we can preview them
    descriptionKey: string[]
    descriptionProcessing?: string
    owidProcessingLevel: "minor" | "major"
    dateRange: string
    lastUpdated: string
    nextUpdate?: string
    relatedResearch: DataPageRelatedResearch[]
    relatedData: DataPageRelatedData[]
    allCharts: RelatedChart[] // Chart slugs
    source: OwidSource | undefined
    origins: OwidOrigin[]
    chartConfig: Record<string, unknown>
}

export interface DataPageRelatedResearch {
    title: string
    url: string
    authors: string[]
    imageUrl: string
}

export interface DataPageRelatedData {
    type?: string
    title: string
    source?: string
    url: string
    content?: string
    featured?: boolean
}

// This gives us a typed object we can use to validate datapage JSON files at runtime (see
// Value.Check() and Value.Errors() below), as well as a type that we can use
// for typechecking at compile time (see "type DataPageJson" below).
export const DataPageJsonTypeObject = Type.Object(
    {
        showDataPageOnChartIds: Type.Array(Type.Number()),
        status: Type.Union([Type.Literal("published"), Type.Literal("draft")]),
        title: Type.String(),
        googleDocEditLink: Type.Optional(Type.RegEx(gdocUrlRegex)),
        topicTagsLinks: Type.Array(
            Type.Object({ title: Type.String(), url: Type.String() })
        ),
        variantSource: Type.Optional(Type.String()),
        variantMethods: Type.Optional(Type.String()),
        nameOfSource: Type.String(),
        owidProcessingLevel: Type.String(),
        dateRange: Type.String(),
        lastUpdated: Type.String(),
        nextUpdate: Type.String(),
        subtitle: Type.Optional(Type.String()),
        descriptionFromSource: Type.Optional(
            Type.Object({
                title: Type.String(),
            })
        ),
        relatedResearch: Type.Optional(
            Type.Array(
                Type.Object({
                    title: Type.String(),
                    url: Type.String(),
                    authors: Type.Array(Type.String()),
                    imageUrl: Type.String(),
                })
            )
        ),
        relatedData: Type.Optional(
            Type.Array(
                Type.Object({
                    type: Type.Optional(Type.String()),
                    title: Type.String(),
                    source: Type.Optional(Type.String()),
                    url: Type.String(),
                    content: Type.Optional(Type.String()),
                    featured: Type.Optional(Type.Boolean()),
                })
            )
        ),
        allCharts: Type.Optional(
            Type.Array(
                Type.Object({
                    title: Type.String(),
                    slug: Type.String(),
                })
            )
        ),
        sources: Type.Array(
            Type.Object({
                sourceName: Type.String(),
                sourceRetrievedOn: Type.Optional(Type.String()),
                sourceRetrievedFromUrl: Type.Optional(Type.String()),
                sourceCitation: Type.Optional(Type.String()),
            })
        ),
        citationDataInline: Type.Optional(Type.String()),
        citationDataFull: Type.Optional(Type.String()),
        citationDatapage: Type.Optional(Type.String()),
    },
    // We are not allowing to have any additional properties in the JSON file,
    // in part because the JSON is added as-is to the page source for hydration,
    // and we don't want to risk exposing unwanted draft or internal content.

    // Todo: this doesn't to work for nested objects, even when adding
    // "additionalProperties" keys to each individual ones.
    { additionalProperties: false }
)
export type DataPageJson = Static<typeof DataPageJsonTypeObject>

export type DataPageParseError = { message: string; path?: string }

export interface DataPageContentFields {
    datapageJson: DataPageJson
    datapageGdoc?: OwidGdocInterface | null
    datapageGdocContent?: DataPageGdocContent | null
    isPreviewing?: boolean
}

export type FaqEntryData = Pick<
    OwidGdocInterface,
    "linkedCharts" | "linkedDocuments" | "relatedCharts" | "imageMetadata"
> & {
    faqs: OwidEnrichedGdocBlock[]
}

export interface DataPageV2ContentFields {
    datapageData: DataPageDataV2
    faqEntries: FaqEntryData | undefined
    // TODO: add gdocs for FAQs
    isPreviewing?: boolean
}

export interface UserCountryInformation {
    code: string
    name: string
    short_code: string
    slug: string
    regions: string[] | null
}
