import Admin from './Admin'
import * as React from 'react'
import {observer} from 'mobx-react'
import {observable, computed, action, runInAction, reaction, IReactionDisposer} from 'mobx'
import { LoadingBlocker, TextField, BindString, Toggle } from './Forms'
import Link from './Link'
import AdminSidebar from './AdminSidebar'
import FuzzySearch from '../charts/FuzzySearch'
import { uniq } from '../charts/Util'
const timeago = require('timeago.js')()
import { UserIndexMeta } from '../../src/admin/api'
import { Redirect } from 'react-router-dom'

@observer
export default class UserEditPage extends React.Component<{ userId: number }> {
    context!: { admin: Admin }
    @observable user?: UserIndexMeta
    @observable isSaved: boolean = false

    render() {
        const {user, isSaved} = this
        if (!user)
            return null
        else if (isSaved)
            return <Redirect to="/users"/>


        return <main className="UserEditPage">
            <BindString label="Full Name" field="fullName" store={user}/>
            <Toggle label="User is active" value={user.isActive} onValue={v => user.isActive = v}/>
            <button className="btn btn-success" onClick={_ => this.save()}>Update user</button>
        </main>
    }

    async save() {
        await this.context.admin.requestJSON(`/api/users/${this.props.userId}`, this.user, "PUT")
        this.isSaved = true
    }

    async getData() {
        const {admin} = this.context

        const json = await admin.getJSON(`/api/users/${this.props.userId}.json`)
        runInAction(() => {
            this.user = json.user
        })
    }

    componentDidMount() {
        this.getData()
    }
}
