import calustraRouter from './router'
import {routerCache} from './cache'

const getDb= (selector) => routerCache.getDb(selector)
const getModel= (selector, tablename) => routerCache.getModel(selector, tablename)

export {calustraRouter as default, getDb, getModel}