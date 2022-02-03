import {epoch_now} from 'intre'

export default {
  useDates: {
    use: false,
    fieldnames: {
      created_at: 'created_at', 
      last_update_at: 'last_update_at'
    },
    now: () => epoch_now()
  }
}
