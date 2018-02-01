let routerConfig = {}
let menuData = {}

routerConfig.menu = function (type, level, state, title) {
  let e = {
    type: type,
    level: level,
    state: state,
    title: title
  }

  let menu = menuData[type]
  if (menu == null) {
    menuData[type] = []
  }

  menuData[type].push(e)
}

routerConfig.getMenu = function (type) {
  let out = {
    child: []
  }
  let map = {}
  let menus = menuData[type]

  for (let i in menus) {
    let arr = []
    let menu = menus[i]
    menu.child = []
    map[menu.level.join()] = menu

    let supe = map[menu.level.slice(0,-1).join()]
    if (supe) {
      arr = supe.child
    } else {
      arr = out.child
    }
    arr.push(menu)
  }

  return out.child

  function trim () {
  }

}

export default routerConfig

