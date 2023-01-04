import { initDB } from './utils/dbReader'
import { IRecord } from './models/record'
import { IRecordUser } from './models/record_user'
import { IUser } from './models/user'
import groupBy from 'lodash/groupBy'

initDB('./assets/db').then((db) => {
  const users = db.Users as IUser[]
  const records = db.Records as IRecord[]

  const groupedRecords = groupBy(records, 'id')

  const recordsUsers = Object.keys(groupedRecords).map<IRecordUser>(
    (groupedRecordKey) => {
      const records = groupedRecords[groupedRecordKey]
      const initialRecordUser: IRecordUser = {
        record_id: -1,
        users: [],
      }

      return records.reduce<IRecordUser>((accum, record, idx) => {
        if (idx === 0) {
          accum.record_id = record.id
        }

        const user = users.find((user) => user.id === record.user_id)

        if (user) {
          accum.users.push(user)
        }

        return accum
      }, initialRecordUser)
    }
  )

  console.dir(recordsUsers, { depth: Infinity })
})
