import calustraRouter from './router'
import {routerCache} from './cache'

const getConnectionFromCache= (selector) => routerCache.getConnection(selector)
const getModelFromCache= (selector, tablename) => routerCache.getModel(selector, tablename)

export {calustraRouter as default, getConnectionFromCache, getModelFromCache}