import React from "react"
import { TextWrap } from "../text/TextWrap.js"
import { computed, makeObservable } from "mobx";
import { observer } from "mobx-react"
import { Logo } from "../captionedChart/Logos.js"
import { HeaderManager } from "./HeaderManager.js"
import { BASE_FONT_SIZE } from "../core/GrapherConstants.js"
import { DEFAULT_BOUNDS } from "../../clientUtils/Bounds.js"
import { MarkdownTextWrap } from "../text/MarkdownTextWrap.js"

export const Header = observer(class Header extends React.Component<{
    manager: HeaderManager
    maxWidth?: number
}> {
    constructor(
        props: {
            manager: HeaderManager
            maxWidth?: number
        }
    ) {
        super(props);

        makeObservable<Header, "manager" | "fontSize" | "maxWidth" | "titleText" | "subtitleText" | "logoWidth" | "logoHeight">(this, {
            manager: computed,
            fontSize: computed,
            maxWidth: computed,
            titleText: computed,
            subtitleText: computed,
            logo: computed,
            logoWidth: computed,
            logoHeight: computed,
            title: computed,
            subtitleWidth: computed,
            subtitle: computed,
            height: computed
        });
    }

    private get manager(): HeaderManager {
        return this.props.manager
    }

    private get fontSize(): number {
        return this.manager.fontSize ?? BASE_FONT_SIZE
    }

    private get maxWidth(): number {
        return this.props.maxWidth ?? DEFAULT_BOUNDS.width
    }

    private get titleText(): string {
        return this.manager.currentTitle ?? ""
    }

    private get subtitleText(): string {
        return this.manager.subtitle ?? ""
    }

    get logo(): Logo | undefined {
        const { manager } = this
        if (manager.hideLogo) return undefined

        return new Logo({
            logo: manager.logo as any,
            isLink: !!manager.shouldLinkToOwid,
            fontSize: this.fontSize,
        })
    }

    private get logoWidth(): number {
        return this.logo ? this.logo.width : 0
    }
    private get logoHeight(): number {
        return this.logo ? this.logo.height : 0
    }

    get title(): TextWrap {
        const { logoWidth } = this
        const maxWidth = this.maxWidth - logoWidth - 20

        // Try to fit the title into a single line if possible-- but not if it would make the text super small
        let title: TextWrap
        let fontScale = 1.4
        while (true) {
            title = new TextWrap({
                maxWidth,
                fontSize: fontScale * this.fontSize,
                text: this.titleText,
                lineHeight: 1,
            })
            if (fontScale <= 1.2 || title.lines.length <= 1) break
            fontScale -= 0.05
        }

        return new TextWrap({
            maxWidth,
            fontSize: fontScale * this.fontSize,
            text: this.titleText,
            lineHeight: 1,
        })
    }

    titleMarginBottom = 4

    get subtitleWidth(): number {
        // If the subtitle is entirely below the logo, we can go underneath it
        return this.title.height > this.logoHeight
            ? this.maxWidth
            : this.maxWidth - this.logoWidth - 10
    }

    get subtitle(): MarkdownTextWrap {
        return new MarkdownTextWrap({
            maxWidth: this.subtitleWidth,
            fontSize: 0.8 * this.fontSize,
            text: this.subtitleText,
            lineHeight: 1.2,
            detailsOrderedByReference: this.manager.detailsOrderedByReference,
        })
    }

    get height(): number {
        if (this.manager.isMediaCard) return 0

        return Math.max(
            this.title.height + this.subtitle.height + this.titleMarginBottom,
            this.logoHeight
        )
    }

    renderStatic(x: number, y: number): JSX.Element | null {
        const { title, logo, subtitle, manager, maxWidth } = this

        if (manager.isMediaCard) return null

        return (
            <g className="HeaderView">
                {logo &&
                    logo.height > 0 &&
                    logo.renderSVG(x + maxWidth - logo.width, y)}
                <a
                    href={manager.canonicalUrl}
                    style={{
                        fontFamily:
                            '"Playfair Display", Georgia, "Times New Roman", serif',
                    }}
                    target="_blank"
                    rel="noopener"
                >
                    {title.render(x, y, { fill: "#555" })}
                </a>
                {subtitle.renderSVG(
                    x,
                    y + title.height + this.titleMarginBottom,
                    {
                        fill: "#666",
                    }
                )}
            </g>
        )
    }

    render(): JSX.Element {
        const { manager } = this

        const titleStyle = {
            ...this.title.htmlStyle,
            marginBottom: this.titleMarginBottom,
        }

        const subtitleStyle = {
            ...this.subtitle.style,
            // make sure there are no scrollbars on subtitle
            overflowY: "hidden",
        }

        return (
            <div className="HeaderHTML">
                {this.logo && this.logo.renderHTML()}
                <a
                    href={manager.canonicalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <h1 style={titleStyle}>{this.title.renderHTML()}</h1>
                </a>
                <p style={subtitleStyle}>{this.subtitle.renderHTML()}</p>
            </div>
        )
    }
});
