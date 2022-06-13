import micromatch from 'micromatch'
import path from 'node:path'
import parseLsirfl, { getInodes } from '../core/parseLsirfl.js'
import { cacheRecord } from '../utils/cacheHelp.js'
import { makeOnly } from '../utils/index.js'
import { TOptions as PruneOptions } from './index'

type TOptions = {
  sourceArr: string[]
  destArr: string[]
  include: string[]
  exclude: string[]
} & Pick<PruneOptions, 'rmDir' | 'reverse'>

const getRmFiles = (options: TOptions) => {
  let { sourceArr, destArr, include, exclude, rmDir, reverse } = options
  include = include.length ? include : ['**']
  if (reverse) {
    const tmp = sourceArr
    sourceArr = destArr
    destArr = tmp
  }
  const inodes = makeOnly(
    sourceArr.reduce<string[]>(
      (result, source) => result.concat(getInodes(source)),
      []
    )
  )
  const cached = (reverse && cacheRecord.read()) || []
  let filesNeedDelete = makeOnly(
    destArr.reduce<string[]>(
      (result, dest) =>
        result.concat(
          parseLsirfl(dest, true)
            .filter((item) => {
              return !inodes.includes(item.inode)
            })
            .filter((item) => {
              let isSupported = micromatch.isMatch(item.fullPath, include, {
                ignore: exclude,
              })
              if (reverse && isSupported) {
                isSupported = !cached.includes(item.fullPath)
              }
              return isSupported
            })
            .map((item) => {
              return rmDir
                ? path.join(path.dirname(item.fullPath), '/')
                : item.fullPath
            })
        ),
      []
    )
  )
  if (rmDir) {
    // 如果是删除目录，则直接过滤掉二级目录
    filesNeedDelete = filesNeedDelete.filter((p1) =>
      filesNeedDelete.every((p2) => !(p1.indexOf(p2) === 0 && p1 !== p2))
    )
  }
  return filesNeedDelete
}

export default getRmFiles
