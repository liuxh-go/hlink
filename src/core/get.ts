import lsirf from "./lsirf.js"
import parseFilePath from "./parseFilePath.js"
import parseLs from "./parseLsirf.js"


export function getInodes(dest: string) {
  let inodes: string[] = []
  lsirf(dest, true)
    .split('\n')
    .forEach(file => {
      if (Boolean(file) && !file.endsWith('/') && !file.endsWith(':')) {
        const [inode] = parseFilePath(file)
        inodes.push(inode)
      }
    })
  return inodes
}

export function getList(dir: string) {
  const files: string[] = []
  const inodes: string[] = []
  const inodeAndFileMap: Record<string, string> = {}
  parseLs(dir, (inode, fullPath) => {
    files.push(fullPath)
    inodes.push(inode)
    inodeAndFileMap[inode] = fullPath
  })
  return { files, inodeAndFileMap, inodes }
}
