import React from "react"
import { ChartEditor } from "./ChartEditor.js"
import { action, makeObservable } from "mobx"
import { observer } from "mobx-react"

export const SaveButtons = observer(
    class SaveButtons extends React.Component<{ editor: ChartEditor }> {
        constructor(props: { editor: ChartEditor }) {
            super(props)

            makeObservable(this, {
                onSaveChart: action.bound,
                onSaveAsNew: action.bound,
                onPublishToggle: action.bound,
            })
        }

        onSaveChart() {
            this.props.editor.saveGrapher()
        }

        onSaveAsNew() {
            this.props.editor.saveAsNewGrapher()
        }

        onPublishToggle() {
            if (this.props.editor.grapher.isPublished)
                this.props.editor.unpublishGrapher()
            else this.props.editor.publishGrapher()
        }

        render() {
            const { editor } = this.props
            const { grapher } = editor

            return (
                <div className="SaveButtons">
                    <button
                        className="btn btn-success"
                        onClick={this.onSaveChart}
                        disabled={grapher.hasFatalErrors}
                    >
                        {grapher.isPublished
                            ? "Update chart"
                            : grapher.id
                            ? "Save draft"
                            : "Create draft"}
                    </button>{" "}
                    <button
                        className="btn btn-secondary"
                        onClick={this.onSaveAsNew}
                        disabled={grapher.hasFatalErrors}
                    >
                        Save as new
                    </button>{" "}
                    <button
                        className="btn btn-danger"
                        onClick={this.onPublishToggle}
                        disabled={grapher.hasFatalErrors}
                    >
                        {grapher.isPublished ? "Unpublish" : "Publish"}
                    </button>
                </div>
            )

            /*return <section className="form-section-submit">
            <button type="button" className="btn btn-lg btn-success btn-primary" onClick={this.onSaveChart}>
                {editor.isSaved ? "Saved" :
                    chart.isPublished ? "Update chart" : "Save draft"}
            </button>
            {" "}<button type="button" className="btn btn-lg btn-primary" onClick={this.onSaveAsNew}>Save as new</button>
            {" "}<button type="button" className="btn btn-lg btn-danger" onClick={this.onPublishToggle}>{chart.isPublished ? "Unpublish" : "Publish"}</button>
        </section>*/
        }
    }
)
