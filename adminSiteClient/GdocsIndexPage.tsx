import React, { useContext, useEffect } from "react"
import { AdminLayout } from "./AdminLayout.js"
import { FieldsRow, Modal, SearchField } from "./Forms.js"
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons/faCirclePlus"
import { faCloudArrowUp } from "@fortawesome/free-solid-svg-icons/faCloudArrowUp"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome/index.js"
import { AdminAppContext } from "./AdminAppContext.js"
import { Gdoc } from "../clientUtils/owidTypes.js"

export const GdocsIndexPage = () => {
    const [showModal, setShowModal] = React.useState(false)
    const [responseSuccess, setResponseSuccess] = React.useState(false)
    const [documentTitle, setDocumentTitle] = React.useState(false)
    const [documentUrl, setDocumentUrl] = React.useState("")
    const [gdocs, setGdocs] = React.useState<Gdoc[]>([])

    const { admin } = useContext(AdminAppContext)

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const regex = /https:\/\/docs\.google\.com\/document\/d\/([^\/]+)\/edit/

        const match = documentUrl.match(regex)

        // handled by HTML5 validation below
        if (!match) return

        const documentId = match[1]
        const json = await admin.requestJSON(
            `/api/gdocs/${documentId}`,
            {},
            "POST"
        )

        // todo: handle error
        if (!json.success) return

        setDocumentTitle(json.gdoc.content.title)
        setResponseSuccess(true)
    }

    const validate = async (id: number) => {
        const json = await admin.getJSON(`/api/gdocs/${id}/validate`)

        // todo
        console.log(json)
    }

    useEffect(() => {
        const fetchGodcs = async () => {
            const json = await admin.getJSON("/api/gdocs")
            setGdocs(json.gdocs)
        }
        fetchGodcs()
    }, [admin, responseSuccess])

    return (
        <AdminLayout title="Google Docs Articles">
            <main>
                <FieldsRow>
                    <span>
                        {/* Showing {postsToShow.length} of {numTotalRows} posts */}
                    </span>
                    {/* <SearchField
                            placeholder="Search all posts..."
                            value={searchInput}
                            onValue={this.onSearchInput}
                            autofocus
                        /> */}
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        <FontAwesomeIcon icon={faCirclePlus} /> Add document
                    </button>
                </FieldsRow>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Authors</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Tags</th>
                            <th>Last Updated</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {gdocs.map((gdoc) => (
                            <tr key={gdoc.slug}>
                                <td>
                                    {gdoc.slug}
                                    <button onClick={() => validate(gdoc.id)}>
                                        <FontAwesomeIcon
                                            icon={faCloudArrowUp}
                                        />
                                        Publish
                                    </button>
                                </td>
                                <td>Authors</td>
                                <td>Type</td>
                                <td>Status</td>
                                <td>Tags</td>
                                <td>Last Updated</td>
                                <td></td>
                            </tr>
                        ))}
                        {/* {postsToShow.map((post) => (
                                <PostRow
                                    key={post.id}
                                    post={post}
                                    highlight={highlight}
                                    availableTags={this.availableTags}
                                />
                            ))} */}
                    </tbody>
                </table>
                {/* {!searchInput && (
                        <button
                            className="btn btn-secondary"
                            onClick={this.onShowMore}
                        >
                            Show more posts...
                        </button>
                    )} */}
            </main>
            {showModal && (
                <Modal
                    onClose={() => setShowModal(false)}
                    className="ModalAddGdoc"
                >
                    <form onSubmit={onSubmit}>
                        <div className="modal-header">
                            <h5 className="modal-title">Add a document</h5>
                        </div>
                        <div className="modal-body">
                            <ol>
                                <li>Make a copy of this Google Doc.</li>
                                <li>Edit the title</li>
                                <li>
                                    Add xxx@yy.iam.gserviceaccount.com as an
                                    editor
                                </li>
                                <li>
                                    Fill in the URL of your Doc in the field
                                    below 👇
                                </li>
                            </ol>
                            <div className="form-group">
                                <input
                                    type="string"
                                    className="form-control"
                                    onChange={(e) =>
                                        setDocumentUrl(e.target.value)
                                    }
                                    value={documentUrl}
                                    required
                                    placeholder="https://docs.google.com/document/d/****/edit"
                                    pattern="https:\/\/docs\.google\.com\/document\/d\/([^\/]+)\/edit"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <input
                                type="submit"
                                className="btn btn-primary"
                                value="Add document"
                            />
                        </div>
                        {responseSuccess && (
                            <div className="alert alert-success" role="alert">
                                {`Document '${documentTitle}' added successfully!`}
                            </div>
                        )}
                    </form>
                </Modal>
            )}
        </AdminLayout>
    )
}
