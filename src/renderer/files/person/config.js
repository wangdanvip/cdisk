import router from '@/portal/routerConfig'

let i18n = router.i18n
router.menu('main', ['person'], {name: 'home'}, i18n.home)
router.menu('main', ['person', 'video'], {name: 'video'}, i18n.video)
router.menu('main', ['person', 'music'], {name: 'music'}, i18n.music)
router.menu('main', ['person', 'doc'], {name: 'doc'}, i18n.doc)
router.menu('main', ['person', 'pic'], {name: 'pic'}, i18n.pic)
