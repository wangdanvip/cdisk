import router from '@/portal/routerConfig'

let i18n = router.i18n
router.menu('main', ['share'], {name: 'share'}, i18n.share)
router.menu('main', ['share', 'send'], {name: 'send'}, i18n.send)
router.menu('main', ['share', 'reception'], {name: 'reception'}, i18n.reception)
