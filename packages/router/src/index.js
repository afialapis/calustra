import calustraRouter from './router'
import {routerCache} from './cache'

const getDbFromCache= (selector) => routerCache.getDb(selector)
const getModelFromCache= (selector, tablename) => routerCache.getModel(selector, tablename)

export {calustraRouter as default, getDbFromCache, getModelFromCache}