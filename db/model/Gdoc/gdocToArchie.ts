// Original work from https://github.com/rdmurphy/doc-to-archieml
// Forked and expanded in https://github.com/owid/doc-to-archieml
import { docs_v1 } from "googleapis"
import {
    Span,
    RawBlockHorizontalRule,
    RawBlockHeading,
    isNil,
} from "@ourworldindata/utils"
import { spanToHtmlString } from "./gdocUtils.js"
import { OwidRawGdocBlockToArchieMLString } from "./rawToArchie.js"
import { match, P } from "ts-pattern"

export async function gdocToArchie(
    document: docs_v1.Schema$Document
): Promise<{ text: string }> {
    // prepare the text holder
    let text = ""
    let isInList = false

    // check if the body key and content key exists, and give up if not
    if (!document.body) return { text }
    if (!document.body.content) return { text }

    // loop through each content element in the body

    for (const element of document.body.content) {
        if (element.paragraph) {
            // get the paragraph within the element
            const paragraph: docs_v1.Schema$Paragraph = element.paragraph

            // this is a list
            const needsBullet = !isNil(paragraph.bullet)
            if (needsBullet && !isInList) {
                isInList = true
                text += `\n[.list]\n`
            } else if (!needsBullet && isInList) {
                isInList = false
                text += `[]\n`
            }

            if (paragraph.elements) {
                // all values in the element
                const values: docs_v1.Schema$ParagraphElement[] =
                    paragraph.elements

                let idx = 0

                const taggedText = function (text: string): string {
                    if (
                        paragraph.paragraphStyle?.namedStyleType?.includes(
                            "HEADING"
                        )
                    ) {
                        const headingLevel =
                            paragraph.paragraphStyle.namedStyleType.replace(
                                "HEADING_",
                                ""
                            )

                        const heading: RawBlockHeading = {
                            type: "heading",
                            value: {
                                text: text.trim(),
                                level: headingLevel,
                            },
                        }
                        return `\n${OwidRawGdocBlockToArchieMLString(heading)}`
                    }
                    return text
                }
                let elementText = ""
                for (const value of values) {
                    // we only need to add a bullet to the first value, so we check
                    const isFirstValue = idx === 0

                    // prepend an asterisk if this is a list item
                    const prefix = needsBullet && isFirstValue ? "* " : ""

                    // concat the text
                    const parsedParagraph = parseParagraph(value)
                    const fragmentText = match(parsedParagraph)
                        .with(
                            { type: P.union("horizontal-rule") },
                            OwidRawGdocBlockToArchieMLString
                        )
                        .with({ spanType: P.any }, (s) => spanToHtmlString(s))
                        .with(P.nullish, () => "")
                        .exhaustive()
                    elementText += `${prefix}${fragmentText}`
                    idx++
                }
                text += taggedText(elementText)
            }
        }
    }

    return { text }
}

function parseParagraph(
    element: docs_v1.Schema$ParagraphElement
): Span | RawBlockHorizontalRule | null {
    // pull out the text

    const textRun = element.textRun

    // sometimes it's not there, skip this all if so
    if (textRun) {
        // sometimes the content isn't there, and if so, make it an empty string
        const content = textRun.content || ""

        let span: Span = { spanType: "span-simple-text", text: content }

        // If there's no URL, or other styling, or the content is just a newline, return without wrapping in anything else
        if (!textRun.textStyle || content === "\n") return span

        if (textRun.textStyle.link?.url)
            span = {
                spanType: "span-link",
                url: textRun.textStyle.link!.url!,
                children: [span],
            }

        if (textRun.textStyle.italic) {
            span = { spanType: "span-italic", children: [span] }
        }
        if (textRun.textStyle.bold) {
            span = { spanType: "span-bold", children: [span] }
        }
        if (textRun.textStyle.baselineOffset === "SUPERSCRIPT") {
            span = { spanType: "span-superscript", children: [span] }
        }
        if (textRun.textStyle.baselineOffset === "SUBSCRIPT") {
            span = { spanType: "span-subscript", children: [span] }
        }

        return span
    } else if (element.horizontalRule) {
        return { type: "horizontal-rule" }
    } else {
        return null
    }
}
