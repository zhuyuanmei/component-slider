seajs.config({
    // 映射,添加版本号
    map: [
        [ /^(.*\.(?:css|js))$/i, '$1?v=1.0.1' ]
    ],
    // 别名配置
    alias: {
        'slider':'lib/slider/js/slider.js'  //新增项--图片滑动组件  (其他需要项保留哈)
    },
    // 文件编码
    charset: 'utf-8'
});
