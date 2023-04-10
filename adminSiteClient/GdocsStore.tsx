import React, { useContext, createContext, useState } from "react"
import { observable } from "mobx"
import {
    getDocumentFromJSON,
    OwidDocument,
    OwidDocumentJSON,
} from "@ourworldindata/utils"
import { AdminAppContext } from "./AdminAppContext.js"
import { Admin } from "./Admin.js"

/**
 * This was originally a MobX data domain store (see
 * https://mobx.js.org/defining-data-stores.html) used to store the state of the
 * Google Docs index page. However, this index page currently only refreshes its
 * state on mount so keeping gdocs updated through mutations is unnecessary.
 * Today, this store acts as CRUD proxy for requests to API endpoints.
 */
export class GdocsStore {
    @observable gdocs: OwidDocument[] = []
    admin: Admin

    constructor(admin: Admin) {
        this.admin = admin
    }

    async create(id: string) {
        await this.admin.requestJSON(`/api/gdocs/${id}`, {}, "PUT")
    }

    async update(gdoc: OwidDocument): Promise<OwidDocument> {
        return this.admin
            .requestJSON<OwidDocumentJSON>(`/api/gdocs/${gdoc.id}`, gdoc, "PUT")
            .then(getDocumentFromJSON)
    }

    async publish(gdoc: OwidDocument): Promise<OwidDocument> {
        const publishedGdoc = await this.update({ ...gdoc, published: true })
        return publishedGdoc
    }

    async unpublish(gdoc: OwidDocument): Promise<OwidDocument> {
        const unpublishedGdoc = await this.update({
            ...gdoc,
            publishedAt: null,
            published: false,
        })

        return unpublishedGdoc
    }

    async delete(gdoc: OwidDocument) {
        await this.admin.requestJSON(`/api/gdocs/${gdoc.id}`, {}, "DELETE")
    }
}

const GdocsStoreContext = createContext<GdocsStore | undefined>(undefined)

export const GdocsStoreProvider = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const { admin } = useContext(AdminAppContext)
    const [store] = useState(() => new GdocsStore(admin))

    return (
        <GdocsStoreContext.Provider value={store}>
            {children}
        </GdocsStoreContext.Provider>
    )
}

export const useGdocsStore = () => {
    const context = React.useContext(GdocsStoreContext)
    if (context === undefined) {
        throw new Error(
            "useGdocsStore must be used within a GdocsStoreProvider"
        )
    }
    return context
}
