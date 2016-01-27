# component-slider
组件名称：图片滑动<br>
组件功能：支持图片无缝播放，支持自动播放，支持分页点和title显示或隐藏<br>
组件参数：

$.slider({

            //是否连续滑动
            loop: true,

            //动画执行速度
            speed: 400,

            //初始位置
            index: 0,

            //是否显示分页点
            dots: true,

            //内部结构选择器定义
            selector: {
                // 容器的选择器
                slider: '#slider',
                container: '.ui-slider-group',
                dots: '.ui-slider-dots'
            },

            //是否阻止事件冒泡
            stopPropagation: false,

            //是否阻止滚动
            disableScroll: false,

            //是否开启自动播放
            autoPlay: true,

            //自动播放的间隔时间（毫秒）
            interval: 4000
        });
