import React from "react"
import { observer } from "mobx-react"

import { AdminLayout } from "./AdminLayout.js"
import { Link } from "./Link.js"
import { AdminAppContext, AdminAppContextType } from "./AdminAppContext.js"

export const TestIndexPage = observer(
    class TestIndexPage extends React.Component {
        static contextType = AdminAppContext
        context!: AdminAppContextType

        render() {
            return (
                <AdminLayout title="Test">
                    <main className="TestIndexPage">
                        <h2>Test Embeds</h2>
                        <ul>
                            <li>
                                <Link native target="_blank" to="/test/embeds">
                                    All Charts
                                </Link>
                            </li>
                            <li>
                                <Link
                                    native
                                    target="_blank"
                                    to={`/test/embeds?random=true`}
                                >
                                    Random Page of Charts
                                </Link>
                            </li>
                            <li>
                                <Link
                                    native
                                    target="_blank"
                                    to="/test/embeds?type=WorldMap"
                                >
                                    Choropleth Map
                                </Link>
                            </li>
                            <li>
                                <Link
                                    native
                                    target="_blank"
                                    to="/test/embeds?type=LineChart"
                                >
                                    Line Chart
                                </Link>
                            </li>
                            <li>
                                <Link
                                    native
                                    target="_blank"
                                    to="/test/embeds?type=SlopeChart"
                                >
                                    Slope Chart
                                </Link>
                            </li>
                            <li>
                                <Link
                                    native
                                    target="_blank"
                                    to="/test/embeds?type=DiscreteBar"
                                >
                                    Discrete Bar
                                </Link>
                            </li>
                            <li>
                                <Link
                                    native
                                    target="_blank"
                                    to="/test/embeds?type=ScatterPlot"
                                >
                                    Scatter Plot
                                </Link>
                            </li>
                            <li>
                                <Link
                                    native
                                    target="_blank"
                                    to="/test/embeds?type=StackedArea"
                                >
                                    Stacked Area
                                </Link>
                            </li>
                            <li>
                                <Link
                                    native
                                    target="_blank"
                                    to="/test/embeds?type=StackedBar"
                                >
                                    Stacked Bar
                                </Link>
                            </li>
                            <li>
                                <Link
                                    native
                                    target="_blank"
                                    to="/test/embeds?type=Marimekko"
                                >
                                    Marimekko
                                </Link>
                            </li>
                            <li>
                                <Link
                                    native
                                    target="_blank"
                                    to="/test/embeds?type=StackedDiscreteBar"
                                >
                                    Stacked Discrete Bar
                                </Link>
                            </li>

                            <li>
                                <Link
                                    native
                                    target="_blank"
                                    to="/test/embeds?logLinear=true"
                                >
                                    All charts with log scale switches
                                </Link>
                            </li>

                            <li>
                                <Link
                                    native
                                    target="_blank"
                                    to="/test/embeds?comparisonLines=true"
                                >
                                    All charts with comparison lines
                                </Link>
                            </li>

                            <li>
                                <Link
                                    native
                                    target="_blank"
                                    to="/test/embeds?categoricalLegend=true"
                                >
                                    All charts with categorical legends
                                </Link>
                            </li>

                            <li>
                                <Link
                                    native
                                    target="_blank"
                                    to="/test/embeds?stackMode=true"
                                >
                                    All charts with relative stack mode
                                </Link>
                            </li>

                            <li>
                                <Link
                                    native
                                    target="_blank"
                                    to="/test/embeds?relativeToggle=true"
                                >
                                    All charts with relative toggles
                                </Link>
                            </li>

                            <li>
                                <Link
                                    native
                                    target="_blank"
                                    to="/test/embedVariants"
                                >
                                    Embed Variants
                                </Link>
                            </li>
                            <li>
                                <Link native to="/test/compareSvgs">
                                    View changed SVGs
                                </Link>
                            </li>
                        </ul>
                    </main>
                </AdminLayout>
            )
        }
    }
)
